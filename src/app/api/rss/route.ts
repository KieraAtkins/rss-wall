import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs"; // ensure Node.js runtime for rss-parser
export const dynamic = "force-dynamic"; // no static caching
import Parser from "rss-parser";
import { sql } from "@/lib/db";

const parser = new Parser();

// Force Node.js runtime for compatibility with rss-parser

// Minimal item types we care about from RSS feeds
type ParsedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  enclosure?: { url?: string };
  media?: { content?: { url?: string } };
  [key: string]: unknown;
};

type NewsItem = ParsedItem & { source: string };

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

  const allItems: NewsItem[] = [];

  const feedList = await getFeedsFromDB();
  // Debug: log feed names and urls retrieved from DB before processing
  try {
    console.log(
      "RSS feeds loaded:",
      feedList.map((f) => ({ name: f.name, url: f.url }))
    );
  } catch {}
  for (const feed of feedList) {
  if (source && feed.name !== source) continue;
  try {
    const parsed = await parser.parseURL(feed.url);
      let items: NewsItem[] = (parsed.items as ParsedItem[]).map((item) => ({
      ...(item as ParsedItem),
      source: feed.name,
    }));
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