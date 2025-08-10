// src/app/page.tsx
import NewsCard from "@/components/NewsCard";
import { headers } from "next/headers";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  source: string;
  enclosure?: { url: string };
  media?: { content?: { url?: string } };
};

async function getNews() {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "localhost:3000";
    const baseUrl = `${proto}://${host}`;
    const res = await fetch(`${baseUrl}/api/rss`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load RSS: ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("Failed to fetch /api/rss", err);
    return [] as NewsItem[];
  }
}

export default async function Home() {
  const news: NewsItem[] = await getNews();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
  <h1 className="font-logo mb-6 text-3xl font-semibold tracking-wide">Latest News</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item, idx) => (
          <NewsCard
            key={idx}
            title={item.title}
            link={item.link}
            pubDate={item.pubDate}
            contentSnippet={item.contentSnippet || ""}
            source={item.source}
            image={
              item.enclosure?.url ||
              item.media?.content?.url ||
              undefined
            }
          />
        ))}
      </div>
  </section>
  );
}