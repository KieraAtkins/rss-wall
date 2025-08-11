// Tiny in-memory LRU cache with TTL for server runtime instances.
// Note: In-memory cache persists only while the serverless instance is warm.
// For persistent cross-instance caching, use Vercel KV/Redis or your Postgres DB.

export type CacheEntry<V> = { value: V; expiresAt: number };

export class LruCache<K, V> {
  private map: Map<K, CacheEntry<V>> = new Map();
  constructor(private capacity = 500) {}

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    // refresh recency
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V, ttlMs: number): void {
    const expiresAt = Date.now() + Math.max(0, ttlMs);
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { value, expiresAt });
    if (this.map.size > this.capacity) {
      // evict LRU (first item in Map iteration order)
      const firstKey = this.map.keys().next().value as K | undefined;
      if (firstKey !== undefined) this.map.delete(firstKey);
    }
  }

  delete(key: K): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

// Singleton caches for common uses
export const imageCache = new LruCache<string, { url: string; kind?: string }>(600);
