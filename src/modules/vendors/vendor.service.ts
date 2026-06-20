import { IVendorRepository, VendorProfile } from './vendor.repository.interface';
import { dispatchCommunication } from '@/lib/services/commService';
import Razorpay from 'razorpay';

export class VendorService {
  constructor(private readonly vendorRepository: IVendorRepository) {}

  async getVendorProfile(userId: string): Promise<VendorProfile | null> {
    return this.vendorRepository.findByUserId(userId);
  }

  async submitOnboarding(userId: string, payload: any) {
    const dbEncryptionKey = process.env.DATABASE_ENCRYPTION_KEY || 'default_secret_key_123';
    let encryptedBankAccount: string | undefined = undefined;

    if (payload.bank_account_no) {
      encryptedBankAccount = await this.vendorRepository.encryptValue(payload.bank_account_no, dbEncryptionKey);
    }

    const updatePayload: Partial<VendorProfile> = {
      gstin: payload.gstin,
      bank_account_number: encryptedBankAccount,
      bank_ifsc: payload.bank_ifsc,
      bank_account_holder: payload.account_holder,
      upi_id: payload.upi_id || undefined,
      status: 'under_review',
      submitted_at: new Date().toISOString()
    };

    return this.vendorRepository.update(userId, updatePayload);
  }

  async onboardWithRazorpay(userId: string, email: string, payload: any) {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_fallback',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_fallback',
    });

    const accountPayload = {
      name: payload.bank_account_holder,
      email: payload.email || email,
      tnc_accepted: true,
      account_details: {
        business_name: payload.business_name || "Vendor Store",
        business_type: "individual"
      },
      bank_account: {
        ifsc_code: payload.bank_ifsc,
        account_number: payload.bank_account_number,
        beneficiary_name: payload.bank_account_holder
      }
    };

    const account = await razorpay.accounts.create(accountPayload as any);

    if (!account || !account.id) {
      throw new Error("Failed to create Razorpay account");
    }

    await this.vendorRepository.update(userId, {
      razorpay_account_id: account.id,
      bank_account_number: payload.bank_account_number,
      bank_ifsc: payload.bank_ifsc,
      bank_account_holder: payload.bank_account_holder
    });

    return account.id;
  }

  async getAllVendorsWithProfiles() {
    return this.vendorRepository.findAllWithProfiles();
  }

  async updateVendorStatus(vendorId: string, status: string, reason?: string) {
    const updated = await this.vendorRepository.updateVendorStatus(vendorId, status, reason);

    const eventMap: Record<string, string> = {
      'approved': 'vendor_approved',
      'rejected': 'vendor_rejected',
      'suspended': 'vendor_suspended'
    };

    const eventId = eventMap[status];
    if (eventId) {
      dispatchCommunication({
        eventId: eventId as any,
        subOrderId: 'N/A',
        recipientId: vendorId,
        email: (updated.profiles as any)?.email,
        phone_wa: (updated.profiles as any)?.phone
      }).catch(console.error);
    }

    return updated;
  }
}
