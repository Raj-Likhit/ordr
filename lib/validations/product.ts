import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().optional().nullable(),
  base_price: z.number().positive('Base price must be a positive number').or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
  category_id: z.string().uuid('Invalid category ID').optional().nullable(),
  is_active: z.boolean().default(true),
  stock: z.number().nonnegative('Stock cannot be negative').optional(),
  sku: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  variants: z.array(z.object({
    size: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    stock: z.number().nonnegative(),
    sku: z.string().optional().nullable(),
    price_override: z.number().positive().optional().nullable()
  })).optional()
});

export type ProductInput = z.infer<typeof productSchema>;
