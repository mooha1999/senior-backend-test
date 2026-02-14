import type { Request, Response, NextFunction } from "express";
import type { ITokenProvider } from "@infra/interfaces/token-provider.interface";

type IAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

function createAuthMiddleware(
  tokenProvider: ITokenProvider,
): IAuthMiddleware {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Authentication required",
        code: "NO_TOKEN",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = tokenProvider.verify(token);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({
        error: "Invalid or expired token",
        code: "INVALID_TOKEN",
      });
    }
  };
}

export { createAuthMiddleware };
export type { IAuthMiddleware };
