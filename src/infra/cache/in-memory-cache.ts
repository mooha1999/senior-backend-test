import type { ILogger } from "../interfaces/logger.interface";
import type { ICache } from "../interfaces/cache.interface";
import type { CacheEntry } from "./types";

class InMemoryCache implements ICache {
  private store: Map<string, CacheEntry<unknown>> = new Map();

  constructor(private readonly logger: ILogger) {}

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      this.logger.debug({ message: "Cache miss", key });
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.logger.debug({ message: "Cache miss", key });
      return null;
    }

    this.logger.info({ message: "Cache hit", key });
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
    this.logger.info({ message: "Cache set", key, ttl: ttlSeconds });
  }

  invalidate(key: string): void {
    this.store.delete(key);
    this.logger.info({ message: "Cache invalidated", key });
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

export { InMemoryCache };
