enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  STOCK_CONFIRMED = 'STOCK_CONFIRMED',
  STOCK_FAILED = 'STOCK_FAILED',
  COMPLETED = 'COMPLETED',
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export { OrderStatus };
export type { OrderItem, Order };
