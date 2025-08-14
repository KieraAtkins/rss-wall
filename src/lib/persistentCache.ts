import type { NextRequest } from "next/server";
import { kv as vercelKv } from "@vercel/kv";

// Detect whether Vercel KV/Upstash env is configured
export function hasKV(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ) || Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export async function kvGetJSON<T>(key: string): Promise<T | undefined> {
  if (!hasKV()) return undefined;
  try {
    const val = await vercelKv.get<T | null>(key);
    return (val ?? undefined) as T | undefined;
  } catch {
    return undefined;
  }
}

export async function kvSetJSON<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (!hasKV()) return;
  try {
    await vercelKv.set(key, value as unknown as object, { ex: Math.max(1, Math.floor(ttlSeconds)) });
  } catch {
    // ignore
  }
}

// Utility to build a stable cache key for an API request
export function cacheKeyFromRequest(req: NextRequest): string {
  // Keep path + sorted search params (ignore protocol/host)
  const u = new URL(req.url);
  const params = new URLSearchParams(u.searchParams);
  const sorted: string[] = [];
  [...params.keys()].sort().forEach((k) => sorted.push(`${k}=${params.get(k) ?? ""}`));
  return `rss:${u.pathname}?${sorted.join("&")}`;
}
