import { IRepository } from '@/src/common/types/repository.interface';

export interface VendorProfile {
  id: string;
  business_name: string;
  status: string;
  gstin?: string;
  pan_number?: string;
  bank_ifsc?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  razorpay_account_id?: string;
  upi_id?: string;
  rejection_reason?: string;
  admin_notes?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  profiles?: any; // joined user profile
}

export interface IVendorRepository extends IRepository<VendorProfile> {
  findByUserId(userId: string): Promise<VendorProfile | null>;
  findAllWithProfiles(): Promise<VendorProfile[]>;
  updateVendorStatus(vendorId: string, status: string, reason?: string): Promise<VendorProfile>;
  encryptValue(value: string, secret: string): Promise<string>;
}
