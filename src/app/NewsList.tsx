import NewsCard from "@/components/NewsCard";
import { headers } from "next/headers";

export default async function NewsList() {
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "localhost:3000";
    const baseUrl = `${proto}://${host}`;
    const res = await fetch(`${baseUrl}/api/rss`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load RSS: ${res.status}`);
    const news: Array<{
      title: string;
      link: string;
      pubDate: string;
      contentSnippet?: string;
      source: string;
      image?: string;
      enclosure?: { url?: string };
      media?: { content?: { url?: string } };
    }> = await res.json();

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item, idx) => (
          <div key={idx} className="card-fade-in" style={{ animationDelay: `${Math.min(idx * 90, 700)}ms` }}>
            <NewsCard
              title={item.title}
              link={item.link}
              pubDate={item.pubDate}
              contentSnippet={item.contentSnippet || ""}
              source={item.source}
              image={item.image || item.enclosure?.url || item.media?.content?.url}
            />
          </div>
        ))}
      </div>
    );
  } catch (err) {
    console.error("Failed to render NewsList", err);
    return null;
  }
}
