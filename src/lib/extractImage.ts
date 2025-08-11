// Lightweight HTML image extraction without extra deps.
// Attempts og:image, twitter:image, itemprop=image, icons, and first <img>.

const abs = (url: string, baseUrl: string): string | undefined => {
  try { return new URL(url, baseUrl).toString(); } catch { return undefined; }
};

export type ExtractResult = { url?: string; kind?: "og" | "twitter" | "itemprop" | "icon" | "img" };

export function extractImageFromHtml(html: string, pageUrl: string): ExtractResult {
  const originBase = (() => { try { return new URL(pageUrl).origin + "/"; } catch { return pageUrl; } })();

  // og:image
  let m = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i.exec(html)
    || /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i.exec(html);
  if (m?.[1]) {
    const u = abs(m[1], originBase);
    if (u) return { url: u, kind: "og" };
  }

  // twitter:image (or :image:src)
  m = /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i.exec(html)
    || /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i.exec(html);
  if (m?.[1]) {
    const u = abs(m[1], originBase);
    if (u) return { url: u, kind: "twitter" };
  }

  // itemprop=image
  m = /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["'][^>]*>/i.exec(html)
    || /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']image["'][^>]*>/i.exec(html);
  if (m?.[1]) {
    const u = abs(m[1], originBase);
    if (u) return { url: u, kind: "itemprop" };
  }

  // Icons: prefer apple-touch-icon with biggest size, then icon, then svg
  const iconRe = /<link[^>]*rel=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let r: RegExpExecArray | null;
  type Cand = { url: string; score: number };
  const cands: Cand[] = [];
  while ((r = iconRe.exec(html))) {
    const rel = r[1]?.toLowerCase() ?? "";
    const href = r[2];
    if (!rel.includes("icon") && !rel.includes("apple-touch-icon")) continue;
    const u = abs(href, originBase);
    if (!u) continue;
    let score = 0;
    if (rel.includes("apple-touch-icon")) score += 5;
    if (u.endsWith(".svg")) score += 2;
    const tag = r[0];
    const sm = /sizes=["'](\d+)x(\d+)["']/i.exec(tag);
    if (sm) {
      const w = parseInt(sm[1] || "0", 10);
      const h = parseInt(sm[2] || "0", 10);
      score += Math.max(w, h) / 32;
    }
    cands.push({ url: u, score });
  }
  if (cands.length) {
    cands.sort((a, b) => b.score - a.score);
    return { url: cands[0].url, kind: "icon" };
  }

  // First <img>
  const img = /<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["'][^>]*>/i.exec(html)
    || /<img[^>]+srcset=["']([^"']+)["'][^>]*>/i.exec(html);
  if (img?.[1]) {
    const srcset = img[0].includes("srcset") ? img[1].split(",")[0]?.trim().split(" ")[0] : img[1];
    const u = abs(srcset || img[1], originBase);
    if (u) return { url: u, kind: "img" };
  }

  return {};
}

export async function extractImageFromUrl(pageUrl: string, timeoutMs = 8000): Promise<ExtractResult> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(pageUrl, { redirect: "follow", signal: ctrl.signal });
    const html = await res.text();
    return extractImageFromHtml(html, pageUrl);
  } finally {
    clearTimeout(t);
  }
}
