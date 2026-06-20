export interface IAuthRepository {
  createUser(email: string, password: string, fullName: string): Promise<string>;
  createProfile(userId: string, fullName: string, role: string): Promise<void>;
  createVendorProfile(userId: string, businessName: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}
