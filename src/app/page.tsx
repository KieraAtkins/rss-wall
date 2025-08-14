// src/app/page.tsx
import { Suspense } from "react";
import GridSkeleton from "@/components/GridSkeleton";
import NewsList from "./NewsList";

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="align-with-nav">
        <h1 className="font-logo mb-6 text-3xl font-semibold tracking-wide">Latest News</h1>
        <Suspense fallback={<GridSkeleton count={9} />}>
          {/* Stream the news list separately so the shell paints immediately */}
          <NewsList />
        </Suspense>
      </div>
    </section>
  );
}