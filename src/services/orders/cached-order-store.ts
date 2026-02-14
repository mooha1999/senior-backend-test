import type { IOrderStore } from "./interfaces/order-store.interface";
import type { ICache } from "@infra/interfaces/cache.interface";
import type { ILogger } from "@infra/interfaces/logger.interface";
import type { Order } from "./order.types";
import type { OrderStatus } from "./order.types";

class CachedOrderStore implements IOrderStore {
  constructor(
    private readonly store: IOrderStore,
    private readonly cache: ICache,
    private readonly logger: ILogger,
    private readonly ttlSeconds: number,
  ) {}

  save(order: Order): void {
    this.store.save(order);
    this.cache.set(this.cacheKey(order.id), order, this.ttlSeconds);
  }

  findById(id: string): Order | undefined {
    const cached = this.cache.get<Order>(this.cacheKey(id));
    if (cached) {
      this.logger.info({ message: "Response served from cache", orderId: id });
      return cached;
    }

    const order = this.store.findById(id);
    if (order) {
      this.logger.info({ message: "Response served from memory store", orderId: id });
      this.cache.set(this.cacheKey(id), order, this.ttlSeconds);
    }
    return order;
  }

  findAll(): Order[] {
    return this.store.findAll();
  }

  findByCustomerId(customerId: string): Order[] {
    return this.store.findByCustomerId(customerId);
  }

  updateStatus(id: string, status: OrderStatus): Order | undefined {
    const order = this.store.updateStatus(id, status);
    if (order) {
      this.cache.invalidate(this.cacheKey(id));
    }
    return order;
  }

  private cacheKey(id: string): string {
    return `order:${id}`;
  }
}

export { CachedOrderStore };
