import { z } from "zod";

const phoneRegex = /^\+\d{1,4}\s\d{6,14}$/;

export const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().regex(phoneRegex, "Invalid phone number format").optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

export const createAddressSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  is_default_shipping: z.boolean().optional().default(false),
  is_default_billing: z.boolean().optional().default(false),
});

export type CreateAddressDTO = z.infer<typeof createAddressSchema>;
export type UpdateAddressDTO = Partial<CreateAddressDTO>;

export const createPaymentMethodSchema = z.object({
  card_holder_name: z.string().min(1, "Card holder name is required"),
  card_brand: z.string().min(1, "Card brand is required"),
  last_digits: z.string().length(4, "Last 4 digits are required"),
  expiry_month: z.number().int().min(1).max(12),
  expiry_year: z.number().int().min(2024),
});

export type CreatePaymentMethodDTO = z.infer<typeof createPaymentMethodSchema>;

