import { NextResponse } from 'next/server';
import { generateInvoice } from '@/lib/services/invoiceService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await generateInvoice(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to generate invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
