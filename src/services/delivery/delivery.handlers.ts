import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { IDeliveryService } from "./interfaces/delivery-service.interface";
import { EVENT_NAMES } from "@infra/event-bus";

interface DeliveryHandlerDeps {
  eventBus: IEventBus;
  deliveryService: IDeliveryService;
}

function registerDeliveryHandlers({ eventBus, deliveryService }: DeliveryHandlerDeps): void {
  eventBus.on(EVENT_NAMES.STOCK_UPDATED, async (event) => {
    await deliveryService.handleStockUpdated(event);
  });
}

export { registerDeliveryHandlers };
export type { DeliveryHandlerDeps };
