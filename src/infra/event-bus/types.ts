interface BaseEvent {
  eventId: string;
  orderId: string;
  timestamp: number;
  requestId?: string;
}

enum EVENT_NAMES {
  ORDER_CREATED = "order.created",
  PAYMENT_SUCCESS = "payment.success",
  PAYMENT_FAILED = "payment.failed",
  STOCK_UPDATED = "stock.updated",
  STOCK_FAILED = "stock.failed",
  DELIVERY_SCHEDULED = "delivery.scheduled",
}

interface OrderCreatedEvent extends BaseEvent {
  type: EVENT_NAMES.ORDER_CREATED;
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
}

interface PaymentSuccessEvent extends BaseEvent {
  type: EVENT_NAMES.PAYMENT_SUCCESS;
  amount: number;
}

interface PaymentFailedEvent extends BaseEvent {
  type: EVENT_NAMES.PAYMENT_FAILED;
  reason: string;
}

interface StockUpdatedEvent extends BaseEvent {
  type: EVENT_NAMES.STOCK_UPDATED;
}

interface StockFailedEvent extends BaseEvent {
  type: EVENT_NAMES.STOCK_FAILED;
  reason: string;
}

interface DeliveryScheduledEvent extends BaseEvent {
  type: EVENT_NAMES.DELIVERY_SCHEDULED;
  estimatedDelivery: string;
}

interface EventMap {
  [EVENT_NAMES.ORDER_CREATED]: OrderCreatedEvent;
  [EVENT_NAMES.PAYMENT_SUCCESS]: PaymentSuccessEvent;
  [EVENT_NAMES.PAYMENT_FAILED]: PaymentFailedEvent;
  [EVENT_NAMES.STOCK_UPDATED]: StockUpdatedEvent;
  [EVENT_NAMES.STOCK_FAILED]: StockFailedEvent;
  [EVENT_NAMES.DELIVERY_SCHEDULED]: DeliveryScheduledEvent;
}

type EventName = keyof EventMap;

type EventPayload<T extends EventName> = EventMap[T];

export { EVENT_NAMES };
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
