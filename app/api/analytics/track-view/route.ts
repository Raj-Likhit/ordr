import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { product_id, vendor_id, session_id } = await request.json();
    
    if (!product_id || !vendor_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();
    
    // We can generate a generic session_id if not provided, though the frontend should provide one
    const sid = session_id || uuidv4();

    const { error } = await supabase
      .from('page_views')
      .insert({
        product_id,
        vendor_id,
        session_id: sid
      });

    if (error) {
      console.error("Error inserting page view:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
