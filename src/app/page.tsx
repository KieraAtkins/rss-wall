// src/app/page.tsx
import NewsCard from "@/components/NewsCard";

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/rss`, { cache: "no-store" });
  return res.json();
}

export default async function Home() {
  const news: NewsItem[] = await getNews();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-wide">Latest Updates</h1>
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