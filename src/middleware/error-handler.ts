import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ILogger } from "@infra/interfaces/logger.interface";

class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

function createErrorHandler(
  logger: ILogger,
): (err: Error, req: Request, res: Response, _next: NextFunction) => void {
  return (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    logger.error({
      message: "Error occurred",
      error: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
      requestId: req.requestId,
    });

    if (err instanceof z.ZodError) {
      const details = err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details,
      });
      return;
    }

    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: err.message,
        code: err.code,
      });
      return;
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  };
}

export { AppError, asyncHandler, createErrorHandler };
