import type { Request, Response, NextFunction } from "express";
import type { ILogger } from "@infra/interfaces/logger.interface";

function createRequestLogger(
  logger: ILogger,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    logger.info({
      message: "Incoming request",
      method: req.method,
      path: req.path,
      requestId: req.requestId,
    });

    res.on("finish", () => {
      const durationMs = Date.now() - start;
      logger.info({
        message: "Request completed",
        method: req.method,
        path: req.path,
        requestId: req.requestId,
        statusCode: res.statusCode,
        durationMs,
      });
    });

    next();
  };
}

export { createRequestLogger };
