import { logger } from '../logger';
import type { CacheEntry, ICache } from './types';

class InMemoryCache implements ICache {
  private store: Map<string, CacheEntry<unknown>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      logger.debug({ message: 'Cache miss', key });
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      logger.debug({ message: 'Cache miss', key });
      return null;
    }

    logger.info({ message: 'Cache hit', key });
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
    logger.info({ message: 'Cache set', key, ttl: ttlSeconds });
  }

  invalidate(key: string): void {
    this.store.delete(key);
    logger.info({ message: 'Cache invalidated', key });
  }

  has(key: string): boolean {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return false;
    }

    return true;
  }
}

const cache = new InMemoryCache();

export { InMemoryCache, cache };
