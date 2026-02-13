interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface ICache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  invalidate(key: string): void;
  has(key: string): boolean;
}

export type { CacheEntry, ICache };
