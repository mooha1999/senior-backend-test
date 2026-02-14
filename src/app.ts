import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { requestLoggerMiddleware } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";
import { authRouter } from "./services/auth";
import { orderRouter } from "./services/orders";
import { swaggerOptions } from "./config/swagger";
import PATHS from "./paths";

const app = express();

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
app.use(requestLoggerMiddleware);

// Routes
app.use(PATHS.AUTH, authRouter);
app.use(PATHS.ORDERS, orderRouter);

// Health check
app.get(PATHS.HEALTH, (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export { app };
