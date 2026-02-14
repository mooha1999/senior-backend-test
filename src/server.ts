import { config } from "./config";
import { StructuredLogger } from "./infra/logger";
import { createApp } from "./app";

const logger = new StructuredLogger();
const { app, eventBus } = createApp();

// Start server
const server = app.listen(config.port, () => {
  logger.info({ message: "Server started", port: config.port });
});

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
  logger.info({ message: `${signal} received, shutting down gracefully` });
  eventBus.removeAllListeners();
  server.close(() => {
    logger.info({ message: "Server closed" });
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
