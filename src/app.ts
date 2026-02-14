import express, { type Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { swaggerOptions } from "./config/swagger";
import PATHS from "./paths";

// Infra
import { StructuredLogger } from "./infra/logger";
import { EventBus } from "./infra/event-bus";
import { InMemoryCache } from "./infra/cache";
import { JwtTokenProvider } from "./infra/token-provider";

// Middleware
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { createRequestLogger } from "./middleware/request-logger";
import { createAuthMiddleware } from "./middleware/auth.middleware";
import { authorize } from "./middleware/rbac.middleware";
import { createErrorHandler } from "./middleware/error-handler";

// Stores
import { AuthStore } from "./services/auth";
import { OrderStore, CachedOrderStore } from "./services/orders";

// Services
import { AuthService } from "./services/auth";
import { OrderService } from "./services/orders";
import { PaymentService } from "./services/payments";
import { StockService } from "./services/stock";
import { DeliveryService } from "./services/delivery";

// Event handlers
import { registerOrderHandlers } from "./services/orders";
import { registerPaymentHandlers } from "./services/payments";
import { registerStockHandlers } from "./services/stock";
import { registerDeliveryHandlers } from "./services/delivery";

// Route factories
import { createAuthRoutes } from "./services/auth";
import { createOrderRoutes } from "./services/orders";

import type { IEventBus } from "./infra/event-bus";

interface AppContext {
  app: Express;
  eventBus: IEventBus;
}

function createApp(): AppContext {
  const app = express();

  // Infra instantiation
  const logger = new StructuredLogger();
  const eventBus = new EventBus(logger);
  const cache = new InMemoryCache(logger);
  const tokenProvider = new JwtTokenProvider(
    config.jwtSecret,
    config.jwtExpiresIn,
  );

  // Stores
  const authStore = new AuthStore();
  const orderStore = new CachedOrderStore(
    new OrderStore(logger),
    cache,
    config.cacheTtlSeconds,
  );

  // Services
  const authService = new AuthService(authStore, tokenProvider, logger);
  const orderService = new OrderService(
    orderStore,
    eventBus,
    logger,
  );
  const paymentService = new PaymentService(eventBus, logger, {
    successRate: config.paymentSuccessRate,
    maxRetries: config.paymentMaxRetries,
    retryBaseDelayMs: config.paymentRetryBaseDelayMs,
  });
  const stockService = new StockService(eventBus, logger, {
    successRate: config.stockSuccessRate,
  });
  const deliveryService = new DeliveryService(eventBus, logger);

  // Register event handlers
  registerOrderHandlers({ eventBus, orderService });
  registerPaymentHandlers({ eventBus, paymentService });
  registerStockHandlers({ eventBus, stockService });
  registerDeliveryHandlers({ eventBus, deliveryService });

  // Middleware
  const authMiddleware = createAuthMiddleware(tokenProvider);

  // Body parsing
  app.use(express.json());

  // Swagger docs
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use(PATHS.API_DOCS, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get(PATHS.API_DOCS_JSON, (_req, res) => {
    res.json(swaggerSpec);
  });

  // Request ID generation/propagation
  app.use(requestIdMiddleware);

  // Request logging
  app.use(createRequestLogger(logger));

  // Routes
  app.use(PATHS.AUTH, createAuthRoutes({ authService }));
  app.use(
    PATHS.ORDERS,
    createOrderRoutes({ orderService, authMiddleware, authorize }),
  );

  // Health check
  app.get(PATHS.HEALTH, (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler (must be last)
  app.use(createErrorHandler(logger));

  return { app, eventBus };
}

export { createApp };
export type { AppContext };
