import { z } from 'zod';

const createOrderSchema = z.object({
  customerId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'productId is required'),
        quantity: z.number().int().positive('quantity must be a positive integer'),
      })
    )
    .min(1, 'At least one item is required'),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

export { createOrderSchema };
export type { CreateOrderInput };
