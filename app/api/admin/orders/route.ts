import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient();
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get orders with joined data
  // Admin queries all orders and sub-orders
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      payment_status,
      created_at,
      profiles!buyer_id (full_name, email, phone),
      sub_orders (
        id,
        status,
        subtotal,
        vendor_id,
        vendor_profiles (business_name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
