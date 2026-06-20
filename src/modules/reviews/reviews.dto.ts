import { z } from 'zod';

export const SubmitReviewDto = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export type SubmitReviewInput = z.infer<typeof SubmitReviewDto>;
