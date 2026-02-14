import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { IStockService } from "./interfaces/stock-service.interface";
import { EVENT_NAMES } from "@infra/event-bus";

interface StockHandlerDeps {
  eventBus: IEventBus;
  stockService: IStockService;
}

function registerStockHandlers({ eventBus, stockService }: StockHandlerDeps): void {
  eventBus.on(EVENT_NAMES.PAYMENT_SUCCESS, async (event) => {
    await stockService.handlePaymentSuccess(event);
  });
}

export { registerStockHandlers };
export type { StockHandlerDeps };
