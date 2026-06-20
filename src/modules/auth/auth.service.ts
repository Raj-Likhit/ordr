import { IAuthRepository } from "./auth.repository.interface";

export class AuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async signupVendor(payload: { email: string; password: string; fullName: string; businessName?: string }) {
    const userId = await this.authRepository.createUser(payload.email, payload.password, payload.fullName);

    try {
      await this.authRepository.createProfile(userId, payload.fullName, "vendor");
    } catch (error) {
      await this.authRepository.deleteUser(userId);
      throw new Error("Failed to create user profile");
    }

    try {
      const businessName = payload.businessName || `${payload.fullName}'s Studio`;
      await this.authRepository.createVendorProfile(userId, businessName);
    } catch (error) {
      await this.authRepository.deleteUser(userId);
      throw new Error("Failed to create vendor profile");
    }

    return userId;
  }
}
