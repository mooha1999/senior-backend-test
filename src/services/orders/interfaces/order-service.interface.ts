import type { Order } from "../order.types";
import type { OrderStatus } from "../order.types";
import type { CreateOrderInput } from "../order.validation";
import type { JwtPayload } from "@services/auth/auth.types";

interface IOrderService {
  createOrder(
    input: CreateOrderInput,
    userId: string,
    requestId: string,
  ): Order;
  getOrders(user: JwtPayload): Order[];
  getOrderById(id: string, user: JwtPayload): Order | null;
  updateOrderStatus(orderId: string, newStatus: OrderStatus): void;
}

export type { IOrderService };
