import { createClient } from "@supabase/supabase-js";
import { IAuthRepository } from "./auth.repository.interface";

export class AuthRepository implements IAuthRepository {
  private getAdminClient() {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Server misconfigured: missing service role key");
    }

    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }

  async createUser(email: string, password: string, fullName: string): Promise<string> {
    const adminClient = this.getAdminClient();
    const { data: userData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) throw authError;
    return userData.user.id;
  }

  async createProfile(userId: string, fullName: string, role: string): Promise<void> {
    const adminClient = this.getAdminClient();
    const { error } = await adminClient.from("profiles").insert({
      id: userId,
      role,
      full_name: fullName,
    });
    if (error) throw error;
  }

  async createVendorProfile(userId: string, businessName: string): Promise<void> {
    const adminClient = this.getAdminClient();
    const { error } = await adminClient.from("vendor_profiles").insert({
      id: userId,
      business_name: businessName,
      status: "approved",
    });
    if (error) throw error;
  }

  async deleteUser(userId: string): Promise<void> {
    const adminClient = this.getAdminClient();
    await adminClient.auth.admin.deleteUser(userId);
  }
}
