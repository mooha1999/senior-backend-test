import { Router } from "express";
import { asyncHandler } from "@middleware/error-handler";
import type { IOrderService } from "./interfaces/order-service.interface";
import type { IAuthMiddleware } from "@middleware/auth.middleware";
import type { AuthorizeMiddleware } from "@middleware/rbac.middleware";
import { createOrderSchema } from "./order.validation";
import { UserRole } from "types/auth.types";

interface OrderRouteDeps {
  orderService: IOrderService;
  authMiddleware: IAuthMiddleware;
  authorize: AuthorizeMiddleware;
}

function createOrderRoutes({
  orderService,
  authMiddleware,
  authorize,
}: OrderRouteDeps): Router {
  const router = Router();

  router.use(authMiddleware);

  router.post(
    "/",
    authorize(UserRole.CUSTOMER),
    asyncHandler(async (req, res) => {
      const body = createOrderSchema.parse(req.body);
      const order = orderService.createOrder(
        body,
        req.user!.userId,
        req.requestId,
      );
      res.status(201).json(order);
    }),
  );

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const orders = orderService.getOrders(req.user!);
      res.status(200).json(orders);
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const id = req.params.id as string;
      const order = orderService.getOrderById(id, req.user!);

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      res.status(200).json(order);
    }),
  );

  return router;
}

export { createOrderRoutes };
export type { OrderRouteDeps };
