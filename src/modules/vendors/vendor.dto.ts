import { z } from 'zod';

export const submitVendorOnboardingSchema = z.object({
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  pan_number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional(),
  bank_ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format'),
  bank_account_no: z.string().min(8, 'Bank account number too short').max(20, 'Bank account number too long'),
  account_holder: z.string().min(2, 'Account holder name required'),
  upi_id: z.string().optional().nullable(),
});

export const razorpayOnboardSchema = z.object({
  bank_account_number: z.string().min(8).max(20),
  bank_ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format'),
  bank_account_holder: z.string().min(2),
  business_name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export const adminVendorUpdateSchema = z.object({
  vendorId: z.string().uuid(),
  status: z.enum(['approved', 'rejected', 'suspended']),
  reason: z.string().optional(),
});
