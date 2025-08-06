import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { feeds } from "@/feeds";

const parser = new Parser();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const source = searchParams.get("source"); // e.g., "Truthout"
  const limit = searchParams.get("limit");   // e.g., "10"

  let allItems: any[] = [];

  for (const feed of feeds) {
    if (source && feed.name !== source) continue; // filter by feed name

    try {
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items.map(item => ({
        ...item,
        source: feed.name,
      }));
      allItems.push(...items);
    } catch (err) {
      console.error(`Failed to parse feed: ${feed.url}`, err);
    }
  }

  allItems.sort((a, b) => new Date(b.pubDate || b.isoDate).getTime() - new Date(a.pubDate || a.isoDate).getTime());

  if (limit) {
    allItems = allItems.slice(0, parseInt(limit));
  }

  return NextResponse.json(allItems);
}