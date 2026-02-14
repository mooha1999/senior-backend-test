import { Router } from "express";
import { asyncHandler } from "@middleware/error-handler";
import { loginSchema } from "./auth.validation";
import type { IAuthService } from "./interfaces/auth-service.interface";
import PATHS from "./paths";

interface AuthRouteDeps {
  authService: IAuthService;
}

function createAuthRoutes({ authService }: AuthRouteDeps): Router {
  const router = Router();

  router.post(
    PATHS.LOGIN,
    asyncHandler(async (req, res) => {
      const body = loginSchema.parse(req.body);
      const result = await authService.login(body);
      res.status(200).json(result);
    }),
  );

  return router;
}

export { createAuthRoutes };
export type { AuthRouteDeps };
