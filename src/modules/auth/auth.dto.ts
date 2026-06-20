import { z } from 'zod';

export const signupVendorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  businessName: z.string().optional(),
});
