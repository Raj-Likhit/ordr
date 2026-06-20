import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/src/common/errors/AppError";
import { CreateAddressDTO, UpdateAddressDTO, UpdateProfileDTO } from "./user.dto";

export class UserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new AppError(`Failed to fetch profile: ${error.message}`, 500);
    }
    return data;
  }

  async updateProfile(userId: string, updates: UpdateProfileDTO) {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to update profile: ${error.message}`, 500);
    }
    return data;
  }

  async getAddresses(userId: string) {
    const { data, error } = await this.supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(`Failed to fetch addresses: ${error.message}`, 500);
    }
    return data || [];
  }

  async createAddress(userId: string, data: CreateAddressDTO) {
    // If setting as default, we might need to unset others. 
    // The unique index handles it but we should unset manually before insert to avoid constraint errors.
    if (data.is_default_shipping) {
      await this.supabase.from("user_addresses").update({ is_default_shipping: false }).eq("user_id", userId);
    }
    if (data.is_default_billing) {
      await this.supabase.from("user_addresses").update({ is_default_billing: false }).eq("user_id", userId);
    }

    const { data: address, error } = await this.supabase
      .from("user_addresses")
      .insert({ ...data, user_id: userId })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create address: ${error.message}`, 500);
    }
    return address;
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressDTO) {
    if (data.is_default_shipping) {
      await this.supabase.from("user_addresses").update({ is_default_shipping: false }).eq("user_id", userId);
    }
    if (data.is_default_billing) {
      await this.supabase.from("user_addresses").update({ is_default_billing: false }).eq("user_id", userId);
    }

    const { data: address, error } = await this.supabase
      .from("user_addresses")
      .update(data)
      .eq("id", addressId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to update address: ${error.message}`, 500);
    }
    return address;
  }

  async deleteAddress(userId: string, addressId: string) {
    const { error } = await this.supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", userId);

    if (error) {
      throw new AppError(`Failed to delete address: ${error.message}`, 500);
    }
  }

  async getPaymentMethods(userId: string) {
    const { data, error } = await this.supabase
      .from("user_payment_methods")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(`Failed to fetch payment methods: ${error.message}`, 500);
    }
    return data || [];
  }

  async createPaymentMethod(userId: string, data: any) {
    const { data: pm, error } = await this.supabase
      .from("user_payment_methods")
      .insert({ ...data, user_id: userId })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to save payment method: ${error.message}`, 500);
    }
    return pm;
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    const { error } = await this.supabase
      .from("user_payment_methods")
      .delete()
      .eq("id", paymentMethodId)
      .eq("user_id", userId);

    if (error) {
      throw new AppError(`Failed to delete payment method: ${error.message}`, 500);
    }
  }
}
