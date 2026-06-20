import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { updates } = await request.json(); // Array of { subOrderId, status, tracking_id }
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real production app, we would use a stored procedure to update multiple rows atomically
    // For MVP, we will run the updates in a promise all
    const results = await Promise.all(updates.map(async (u: any) => {
      // 1. Ensure the sub_order belongs to this vendor
      const { data: so } = await supabase
        .from('sub_orders')
        .select('id')
        .eq('id', u.subOrderId)
        .eq('vendor_id', user.id)
        .single();
        
      if (!so) return { id: u.subOrderId, success: false, error: 'Not found or unauthorized' };

      // 2. Update sub_order
      const { error: updErr } = await supabase
        .from('sub_orders')
        .update({
          status: u.status,
          tracking_id: u.tracking_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', u.subOrderId);

      if (updErr) return { id: u.subOrderId, success: false, error: updErr.message };

      // 3. Add to history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: null,
          sub_order_id: u.subOrderId,
          status: u.status,
          notes: u.tracking_id ? `Bulk shipped via tracking: ${u.tracking_id}` : 'Bulk updated'
        });

      return { id: u.subOrderId, success: true };
    }));

    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      return NextResponse.json({ error: 'Some updates failed', details: failures }, { status: 207 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in bulk update:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
