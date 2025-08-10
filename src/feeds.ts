// src/feeds.ts
export type FeedConfig = {
  name: string;
  url: string;
  limit?: number;
  /**
   * Optional semicolon-separated keywords; when provided, only items that contain
   * at least one of these keywords in their title or content will be included.
   * Example: "policy; dc; sex work"
   */
  keywords?: string;
};

export const feeds: FeedConfig[] = [
  
   {
    name: "BIPOC SWWS",
    url: "https://www.bipocswws.org/blog/rss.xml",
  limit: 10,
   keywords: "Sex Worker;Sex Work",
  },
  {
    name: "Digital Exhibitions",
    url: "https://digitalexhibitions.arquives.ca/items/browse?output=rss2",
  limit: 10,
   keywords: "Sex Worker;Sex Work",
  },
  {
    name: "Washington Blade",
    url: "https://www.washingtonblade.com/feed/",
  limit: 10,
  keywords: "Sex Worker;Sex Work",
  },
//  {
//    name: "Truthout",
//    url: "https://truthout.org/feed/",
//  limit: 5,
  // keywords: "",
//  },
  {
    name: "BIPOC SWWS Substack",
    url: "https://bipocswws.substack.com/feed",
  limit: 10,
   keywords: "Sex Worker;Sex Work",
  },
  // Add more RSS feeds here!
];
