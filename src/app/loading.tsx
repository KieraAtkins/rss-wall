export default function Loading() {
  // Simple skeleton grid matching the card layout
  const items = Array.from({ length: 9 });
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="align-with-nav">
        <div className="font-logo mb-6 h-8 w-52 rounded-md bg-brand-card skeleton-pulse" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((_, i) => (
            <div key={i} className="overflow-hidden rounded-brand border border-brand-border bg-brand-card shadow-brand">
              <div className="h-44 w-full bg-brand-header skeleton-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-brand-header skeleton-pulse" />
                <div className="h-3 w-1/3 rounded bg-brand-header skeleton-pulse" />
                <div className="h-3 w-full rounded bg-brand-header skeleton-pulse" />
                <div className="h-3 w-5/6 rounded bg-brand-header skeleton-pulse" />
                <div className="h-3 w-2/3 rounded bg-brand-header skeleton-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
