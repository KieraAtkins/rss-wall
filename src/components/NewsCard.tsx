// src/components/NewsCard.tsx
import React from "react";

type NewsCardProps = {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  source: string;
  image?: string;
};

export default function NewsCard({ title, link, pubDate, contentSnippet, source, image }: NewsCardProps) {
  return (
  <article className="group overflow-hidden rounded-brand border border-brand-border bg-brand-card shadow-brand flex flex-col transition-transform duration-200 hover:-translate-y-0.5">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" className="h-44 w-full object-cover" />
      ) : (
      <div className="h-44 w-full bg-brand-header" />
      )}
      <div className="p-4 flex flex-col gap-2">
  <a href={link}
  className="font-logo text-[15px] font-semibold leading-snug text-brand-text hover:text-brand-accent">
          {title}
        </a>
        <div className="text-xs text-brand-muted">
          {source} • {new Date(pubDate).toLocaleDateString()}
        </div>
      {contentSnippet && <p className="text-sm text-brand-muted line-clamp-3">{contentSnippet}</p>}
  <a href={link}
        className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-brand-link hover:underline">
       Read more →
        </a>
      </div>
    </article>
  )
}

//export default NewsCard;