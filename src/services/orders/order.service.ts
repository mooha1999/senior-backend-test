import { v4 as uuidv4 } from "uuid";
import type { IOrderService } from "./interfaces/order-service.interface";
import type { IOrderStore } from "./interfaces/order-store.interface";
import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { ICache } from "@infra/interfaces/cache.interface";
import type { ILogger } from "@infra/interfaces/logger.interface";
import type { JwtPayload } from "@services/auth/auth.types";
import type { Order } from "./order.types";
import type { CreateOrderInput } from "./order.validation";
import { OrderStatus } from "./order.types";
import { UserRole } from "@services/auth/auth.types";
import { EVENT_NAMES } from "@infra/event-bus";

class OrderService implements IOrderService {
  constructor(
    private readonly orderStore: IOrderStore,
    private readonly eventBus: IEventBus,
    private readonly cache: ICache,
    private readonly logger: ILogger,
    private readonly cacheTtlSeconds: number,
  ) {}

  createOrder(
    input: CreateOrderInput,
    userId: string,
    requestId: string,
  ): Order {
    const now = new Date().toISOString();
    const order: Order = {
      id: uuidv4(),
      customerId: userId,
      items: input.items,
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    this.orderStore.save(order);

    this.logger.info({
      message: "Order created",
      orderId: order.id,
      status: order.status,
    });

    this.eventBus.emit(EVENT_NAMES.ORDER_CREATED, {
      type: EVENT_NAMES.ORDER_CREATED,
      eventId: uuidv4(),
      orderId: order.id,
      timestamp: Date.now(),
      requestId,
      customerId: order.customerId,
      items: order.items,
    });

    return order;
  }

  getOrders(user: JwtPayload): Order[] {
    if (user.role === UserRole.ADMIN) {
      return this.orderStore.findAll();
    }

    if (user.role === UserRole.BRAND) {
      return this.orderStore
        .findAll()
        .filter((order) =>
          order.items.some((item) =>
            item.productId.startsWith(user.brandId || ""),
          ),
        );
    }

    return this.orderStore.findByCustomerId(user.userId);
  }

  getOrderById(id: string, user: JwtPayload): Order | null {
    const cacheKey = `order:${id}`;

    const cached = this.cache.get<Order>(cacheKey);
    if (cached) {
      if (!this.canAccessOrder(user, cached)) {
        return null;
      }
      return cached;
    }

    const order = this.orderStore.findById(id);
    if (!order) {
      return null;
    }

    if (!this.canAccessOrder(user, order)) {
      return null;
    }

    this.cache.set(cacheKey, order, this.cacheTtlSeconds);
    return order;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    const previous = this.orderStore.findById(orderId);
    const order = this.orderStore.updateStatus(orderId, newStatus);
    if (order) {
      this.cache.invalidate(`order:${orderId}`);
      this.logger.info({
        message: "Order status updated",
        orderId,
        from: previous?.status,
        to: newStatus,
      });
    }
  }

  private canAccessOrder(user: JwtPayload, order: Order): boolean {
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    if (user.role === UserRole.BRAND) {
      return order.items.some((item) =>
        item.productId.startsWith(user.brandId || ""),
      );
    }
    return order.customerId === user.userId;
  }
}

export { OrderService };
