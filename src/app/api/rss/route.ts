import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs"; // ensure Node.js runtime for rss-parser
export const dynamic = "force-dynamic"; // no static caching
import Parser from "rss-parser";
import { sql } from "@/lib/db";
import { extractImageFromUrl } from "@/lib/extractImage";

const parser = new Parser();

// Force Node.js runtime for compatibility with rss-parser

// Minimal item types we care about from RSS feeds
type ParsedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string; // html
  "content:encoded"?: string; // html
  enclosure?: { url?: string };
  media?: { content?: { url?: string } };
  [key: string]: unknown;
};

type NewsItem = ParsedItem & { source: string; image?: string };

type DBFeedRow = {
  id: number;
  name: string;
  url: string;
  item_limit: number | null;
  keywords: string | null;
};

type FeedConfig = {
  name: string;
  url: string;
  limit?: number;
  keywords?: string;
};

async function getFeedsFromDB(): Promise<FeedConfig[]> {
  if (!sql) throw new Error("DATABASE_URL not configured");
  const rows = await sql<DBFeedRow[]>`
    SELECT id, name, url, item_limit, keywords
    FROM feeds
    ORDER BY id ASC
  `;
  return rows.map((r: DBFeedRow) => ({
    name: r.name,
    url: r.url,
    limit: r.item_limit ?? undefined,
    keywords: r.keywords ?? undefined,
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const source = searchParams.get("source"); // e.g., "Truthout"
  const limit = searchParams.get("limit"); // e.g., "10"
  const useOg = searchParams.get("og") === "1"; // optional heavier fallback
  const ogBudgetParam = searchParams.get("ogBudget");

  const allItems: NewsItem[] = [];

  const feedList = await getFeedsFromDB();
  // Debug: log feed names and urls retrieved from DB before processing
  try {
    console.log(
      "RSS feeds loaded:",
      feedList.map((f) => ({ name: f.name, url: f.url }))
    );
  } catch {}
  // helpers
  const extractFromHtml = (html: string | undefined): string | undefined => {
    if (!html) return undefined;
    // Try common patterns: img src, data-src, data-original
    const imgRe = /<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["'][^>]*>/i;
    const m = imgRe.exec(html);
    if (m && /^https?:\/\//i.test(m[1])) return m[1];
    // Fallback: srcset first URL
    const srcsetRe = /<img[^>]+srcset=["']([^"']+)["'][^>]*>/i;
    const ms = srcsetRe.exec(html);
    if (ms) {
      const first = ms[1].split(",")[0]?.trim().split(" ")[0];
      if (first && /^https?:\/\//i.test(first)) return first;
    }
    return undefined;
  };

  const extractImage = (item: ParsedItem): string | undefined => {
    const enc = item.enclosure?.url as string | undefined;
    if (enc) return enc;
    const anyItem = item as unknown as Record<string, unknown>;
    // Some feeds expose 'enclosures' array
    const enclosures = anyItem.enclosures as unknown;
    if (Array.isArray(enclosures) && enclosures[0] && typeof enclosures[0] === "object") {
      const first = enclosures[0] as { url?: unknown };
      if (typeof first.url === "string" && first.url) return first.url;
    }
    const mediaUrl = item.media?.content?.url as string | undefined;
    if (mediaUrl) return mediaUrl;
    // Handle 'media:content' with attribute bag
    const mcontent = (anyItem["media:content"] as unknown) ?? undefined; // could be object or array
    if (mcontent) {
      const mc = Array.isArray(mcontent) ? mcontent[0] : mcontent;
      if (mc && typeof mc === "object") {
        const bag = (mc as { $?: { url?: unknown }; url?: unknown });
        const url = (bag.$?.url as unknown) ?? bag.url;
        if (typeof url === "string") return url;
      }
    }
    // Some feeds provide 'image' or 'thumbnail'
    const imgField = (anyItem.image as unknown);
    if (typeof imgField === "string") return imgField;
    const thumbField = (anyItem.thumbnail as unknown);
    if (typeof thumbField === "string") return thumbField;
    const fromContent = extractFromHtml((item["content:encoded"] as string | undefined) ?? item.content);
    if (fromContent) return fromContent;
    return undefined;
  };

  let ogBudget = 5; // guard extra fetches per request
  if (ogBudgetParam) {
    const n = Number.parseInt(ogBudgetParam, 10);
    if (!Number.isNaN(n) && n >= 0) ogBudget = n;
  }

  for (const feed of feedList) {
  if (source && feed.name !== source) continue;
  try {
    const parsed = await parser.parseURL(feed.url);
      let items: NewsItem[] = (parsed.items as ParsedItem[]).map((item) => {
        const image = extractImage(item);
        return { ...(item as ParsedItem), source: feed.name, image } as NewsItem;
      });
      // Per-feed keyword filtering (semicolon-separated, case-insensitive)
      if (feed.keywords && feed.keywords.trim().length > 0) {
        const terms = feed.keywords
          .split(";")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => t.toLowerCase());
        if (terms.length > 0) {
          items = items.filter((it) => {
            const hay = `${it.title ?? ""} ${it.contentSnippet ?? ""}`.toLowerCase();
            return terms.some((term) => hay.includes(term));
          });
        }
      }
    if (feed.limit) {
      items = items.slice(0, feed.limit);
    }
    // Optional heavier fallback: fetch article page for og:image when missing
    if (useOg && ogBudget > 0) {
      for (const it of items) {
        if (ogBudget <= 0) break;
        if (!it.image && it.link) {
          try {
            const result = await extractImageFromUrl(it.link, 6000);
            if (result.url) {
              it.image = result.url;
              ogBudget--;
            }
          } catch {}
        }
      }
    }
    allItems.push(...items);
  } catch (err) {
    console.error(`Failed to parse feed: ${feed.url}`, err);
  }
}

  const toTime = (i: NewsItem) => {
    const raw = (i.pubDate ?? i.isoDate) as string | undefined;
    return raw ? new Date(raw).getTime() : 0;
  };
  allItems.sort((a, b) => toTime(b) - toTime(a));

  if (limit) {
    const n = Number.parseInt(limit, 10);
    if (!Number.isNaN(n)) {
      return NextResponse.json(allItems.slice(0, n));
    }
  }

  return NextResponse.json(allItems);
}