import { z } from 'zod';

export const VerifyPaymentDto = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  db_order_id: z.string().uuid(),
});

export const CreateCheckoutDto = z.object({
  address_id: z.string().uuid('Invalid address ID'),
  payment_method: z.enum(['razorpay', 'cod']).optional().default('razorpay'),
  coupon_code: z.string().optional()
});
