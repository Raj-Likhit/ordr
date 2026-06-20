import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { qa_id, answer_text } = await request.json();
    
    if (!qa_id || !answer_text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('product_qa')
      .update({
        answer_text,
        answered_by_vendor_id: user.id,
        answered_at: new Date().toISOString()
      })
      .eq('id', qa_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ qa: data });
  } catch (error: any) {
    console.error('Error answering question:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
