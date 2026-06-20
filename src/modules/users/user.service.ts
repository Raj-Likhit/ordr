import { UserRepository } from "./user.repository";
import { CreateAddressDTO, UpdateAddressDTO, UpdateProfileDTO, createAddressSchema, updateProfileSchema, createPaymentMethodSchema } from "./user.dto";
import { AppError } from "@/src/common/errors/AppError";

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async getProfile(userId: string) {
    return this.repository.getProfile(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const validated = updateProfileSchema.safeParse(data);
    if (!validated.success) {
      throw new AppError("Invalid profile data", 400);
    }
    return this.repository.updateProfile(userId, validated.data);
  }

  async getAddresses(userId: string) {
    return this.repository.getAddresses(userId);
  }

  async createAddress(userId: string, data: CreateAddressDTO) {
    const validated = createAddressSchema.safeParse(data);
    if (!validated.success) {
      throw new AppError("Invalid address data", 400);
    }
    return this.repository.createAddress(userId, validated.data);
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressDTO) {
    // Basic validation could be added here
    return this.repository.updateAddress(userId, addressId, data);
  }

  async deleteAddress(userId: string, addressId: string) {
    await this.repository.deleteAddress(userId, addressId);
  }

  async getPaymentMethods(userId: string) {
    return this.repository.getPaymentMethods(userId);
  }

  async createPaymentMethod(userId: string, data: any) {
    // Validate
    const validated = createPaymentMethodSchema.safeParse(data);
    if (!validated.success) {
      throw new AppError("Invalid payment method data", 400);
    }
    return this.repository.createPaymentMethod(userId, validated.data);
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    await this.repository.deletePaymentMethod(userId, paymentMethodId);
  }
}
