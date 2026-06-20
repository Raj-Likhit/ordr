import { z } from "zod";

export const createWishlistGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name is too long"),
});

export type CreateWishlistGroupDTO = z.infer<typeof createWishlistGroupSchema>;

export const addWishlistItemSchema = z.object({
  group_id: z.string().uuid("Invalid group ID"),
  product_id: z.string().uuid("Invalid product ID"),
});

export type AddWishlistItemDTO = z.infer<typeof addWishlistItemSchema>;
