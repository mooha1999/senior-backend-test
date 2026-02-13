interface BaseEvent {
  eventId: string;
  orderId: string;
  timestamp: number;
  requestId?: string;
}

interface OrderCreatedEvent extends BaseEvent {
  type: 'order.created';
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
}

interface PaymentSuccessEvent extends BaseEvent {
  type: 'payment.success';
  amount: number;
}

interface PaymentFailedEvent extends BaseEvent {
  type: 'payment.failed';
  reason: string;
}

interface StockUpdatedEvent extends BaseEvent {
  type: 'stock.updated';
}

interface StockFailedEvent extends BaseEvent {
  type: 'stock.failed';
  reason: string;
}

interface DeliveryScheduledEvent extends BaseEvent {
  type: 'delivery.scheduled';
  estimatedDelivery: string;
}

interface EventMap {
  'order.created': OrderCreatedEvent;
  'payment.success': PaymentSuccessEvent;
  'payment.failed': PaymentFailedEvent;
  'stock.updated': StockUpdatedEvent;
  'stock.failed': StockFailedEvent;
  'delivery.scheduled': DeliveryScheduledEvent;
}

type EventName = keyof EventMap;

type EventPayload<T extends EventName> = EventMap[T];

export type {
  BaseEvent,
  OrderCreatedEvent,
  PaymentSuccessEvent,
  PaymentFailedEvent,
  StockUpdatedEvent,
  StockFailedEvent,
  DeliveryScheduledEvent,
  EventMap,
  EventName,
  EventPayload,
};
