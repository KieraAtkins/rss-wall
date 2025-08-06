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
  const res = await fetch(`${baseUrl}/api/rss?limit=20`, { cache: "no-store" });
  return res.json();
}

export default async function Home() {
  const news: NewsItem[] = await getNews();

  return (
    <main className="min-h-screen bg-black p-6">
     
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    </main>
  );
}