import type { Order } from "./order.types";
import type { IOrderStore } from "./interfaces/order-store.interface";
import type { ILogger } from "@infra/interfaces/logger.interface";
import { OrderStatus } from "./order.types";

class OrderStore implements IOrderStore {
  private orders: Map<string, Order> = new Map();

  constructor(private readonly logger: ILogger) {}

  save(order: Order): void {
    this.orders.set(order.id, order);
  }

  findById(id: string): Order | undefined {
    const order = this.orders.get(id);
    if (order) {
      this.logger.info({ message: "Response served from memory store", orderId: id });
    }
    return order;
  }

  findAll(): Order[] {
    return Array.from(this.orders.values());
  }

  findByCustomerId(customerId: string): Order[] {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId,
    );
  }

  updateStatus(id: string, status: OrderStatus): Order | undefined {
    const order = this.orders.get(id);
    if (!order) {
      return undefined;
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.orders.set(id, order);
    return order;
  }
}

export { OrderStore };
