import type { Order } from "../order.types";
import type { OrderStatus } from "../order.types";

interface IOrderStore {
  save(order: Order): void;
  findById(id: string): Order | undefined;
  findAll(): Order[];
  findByCustomerId(customerId: string): Order[];
  updateStatus(id: string, status: OrderStatus): Order | undefined;
}

export type { IOrderStore };
