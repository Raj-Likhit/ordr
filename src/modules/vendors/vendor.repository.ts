import { createClient } from '@/lib/supabase/server';
import { IVendorRepository, VendorProfile } from './vendor.repository.interface';

export class VendorRepository implements IVendorRepository {
  async findById(id: string): Promise<VendorProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('vendor_profiles').select('*').eq('id', id).single();
    if (error) return null;
    return data as VendorProfile;
  }

  async findAll(params?: Record<string, any>): Promise<VendorProfile[]> {
    const supabase = createClient();
    let query = supabase.from('vendor_profiles').select('*');
    if (params?.status) query = query.eq('status', params.status);
    const { data, error } = await query;
    if (error) return [];
    return data as VendorProfile[];
  }

  async create(data: Partial<VendorProfile>): Promise<VendorProfile> {
    const supabase = createClient();
    const { data: vendor, error } = await supabase.from('vendor_profiles').insert(data).select().single();
    if (error) throw error;
    return vendor as VendorProfile;
  }

  async update(id: string, data: Partial<VendorProfile>): Promise<VendorProfile> {
    const supabase = createClient();
    const { data: vendor, error } = await supabase.from('vendor_profiles').update(data).eq('id', id).select().single();
    if (error) throw error;
    return vendor as VendorProfile;
  }

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('vendor_profiles').delete().eq('id', id);
    if (error) throw error;
  }

  async findByUserId(userId: string): Promise<VendorProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('vendor_profiles').select('*').eq('id', userId).single();
    if (error) return null;
    return data as VendorProfile;
  }

  async findAllWithProfiles(): Promise<VendorProfile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select(`
        *,
        profiles (
          full_name,
          phone,
          email,
          created_at
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as VendorProfile[];
  }

  async updateVendorStatus(vendorId: string, status: string, reason?: string): Promise<VendorProfile> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('vendor_profiles')
      .update({ 
        status, 
        rejection_reason: reason || null,
        admin_notes: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .select('*, profiles(email, phone)')
      .single();

    if (error) throw error;
    return data as VendorProfile;
  }

  async encryptValue(value: string, secret: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('encrypt_value', {
      val: value,
      secret
    });
    if (error) throw error;
    return data as string;
  }
}
