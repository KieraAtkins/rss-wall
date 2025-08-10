import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs"; // ensure Node.js runtime for rss-parser
export const dynamic = "force-dynamic"; // no static caching
import Parser from "rss-parser";
import { feeds, FeedConfig } from "@/feeds";

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const source = searchParams.get("source"); // e.g., "Truthout"
  const limit = searchParams.get("limit"); // e.g., "10"

  const allItems: NewsItem[] = [];

  for (const feed of feeds as FeedConfig[]) {
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