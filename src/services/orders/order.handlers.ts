import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { IOrderService } from "./interfaces/order-service.interface";
import { EVENT_NAMES } from "@infra/event-bus";
import { OrderStatus } from "./order.types";

interface OrderHandlerDeps {
  eventBus: IEventBus;
  orderService: IOrderService;
}

function registerOrderHandlers({ eventBus, orderService }: OrderHandlerDeps): void {
  eventBus.on(EVENT_NAMES.PAYMENT_SUCCESS, async (event) => {
    orderService.updateOrderStatus(event.orderId, OrderStatus.PAID);
  });

  eventBus.on(EVENT_NAMES.PAYMENT_FAILED, async (event) => {
    orderService.updateOrderStatus(event.orderId, OrderStatus.PAYMENT_FAILED);
  });

  eventBus.on(EVENT_NAMES.STOCK_UPDATED, async (event) => {
    orderService.updateOrderStatus(event.orderId, OrderStatus.STOCK_CONFIRMED);
  });

  eventBus.on(EVENT_NAMES.STOCK_FAILED, async (event) => {
    orderService.updateOrderStatus(event.orderId, OrderStatus.STOCK_FAILED);
  });

  eventBus.on(EVENT_NAMES.DELIVERY_SCHEDULED, async (event) => {
    orderService.updateOrderStatus(event.orderId, OrderStatus.COMPLETED);
  });
}

export { registerOrderHandlers };
export type { OrderHandlerDeps };
