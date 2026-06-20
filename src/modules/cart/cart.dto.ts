import { z } from 'zod';

export const AddToCartDto = z.object({
  variant_id: z.string().uuid('Invalid variant ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const UpdateCartItemDto = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});
