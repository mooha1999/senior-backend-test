import type { Order } from './order.types';
import { OrderStatus } from './order.types';

class OrderStore {
  private orders: Map<string, Order> = new Map();

  save(order: Order): void {
    this.orders.set(order.id, order);
  }

  findById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  findAll(): Order[] {
    return Array.from(this.orders.values());
  }

  findByCustomerId(customerId: string): Order[] {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId
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

const orderStore = new OrderStore();

export { OrderStore, orderStore };
