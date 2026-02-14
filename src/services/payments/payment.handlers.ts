import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { IPaymentService } from "./interfaces/payment-service.interface";
import { EVENT_NAMES } from "@infra/event-bus";

interface PaymentHandlerDeps {
  eventBus: IEventBus;
  paymentService: IPaymentService;
}

function registerPaymentHandlers({ eventBus, paymentService }: PaymentHandlerDeps): void {
  eventBus.on(EVENT_NAMES.ORDER_CREATED, async (event) => {
    await paymentService.handleOrderCreated(event);
  });
}

export { registerPaymentHandlers };
export type { PaymentHandlerDeps };
