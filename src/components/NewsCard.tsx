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

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  link,
  pubDate,
  contentSnippet,
  source,
  image,
}) => (
  <div className="bg-zinc-900 rounded-xl shadow-md p-4 flex flex-col h-full">
    {image && (
      <img
        src={image}
        alt={title}
        className="mb-4 rounded-lg object-cover w-full h-40"
        style={{ objectFit: "cover" }}
      />
    )}
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:underline text-white">
      {title}
    </a>
    <div className="text-xs text-zinc-400 mt-1">{source} &middot; {new Date(pubDate).toLocaleDateString()}</div>
    <p className="mt-2 text-zinc-200 text-sm line-clamp-4">{contentSnippet}</p>
  </div>
);

export default NewsCard;