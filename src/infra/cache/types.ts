interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export type { CacheEntry };
