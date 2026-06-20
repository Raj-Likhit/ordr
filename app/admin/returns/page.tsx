import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { dispatchCommunication } from '@/lib/services/commService';

async function processReturn(formData: FormData) {
  'use server';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return;

  const returnId = formData.get('returnId') as string;
  const action = formData.get('action') as string; // 'approve' | 'reject'
  const adminNote = formData.get('adminNote') as string;
  const refundAmountStr = formData.get('refundAmount') as string;

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const refundAmount = action === 'approve' ? parseFloat(refundAmountStr || '0') : 0;

  // 1. Update return record
  const { data: ret, error } = await supabase
    .from('returns')
    .update({
      status: newStatus,
      admin_note: adminNote || null,
      refund_amount: refundAmount
    })
    .eq('id', returnId)
    .select('*, sub_orders(id, orders(buyer_id, profiles(email, phone)))')
    .single();

  if (error || !ret) return;

  // 2. If approved, update sub_order status to 'returned'
  if (action === 'approve') {
    await supabase
      .from('sub_orders')
      .update({ status: 'returned' })
      .eq('id', ret.sub_order_id);

    // Mock Refund Gateway trigger
    console.log(`[PAYMENT GATEWAY] Initiated refund of ₹${refundAmount} for sub_order ${ret.sub_order_id}`);
    
    // Dispatch communication
    const buyerId = (ret.sub_orders as any)?.orders?.buyer_id;
    const buyerProfile = (ret.sub_orders as any)?.orders?.profiles;
    
    dispatchCommunication({
      eventId: 'order_returned',
      subOrderId: ret.sub_order_id,
      recipientId: buyerId,
      email: buyerProfile?.email,
      phone_wa: buyerProfile?.phone
    }).catch(console.error);
  }

  redirect('/admin/returns');
}

export default async function ReturnsQueuePage() {
  const supabase = createClient();
  
  const { data: returns } = await supabase
    .from('returns')
    .select(`
      *,
      sub_orders (
        id,
        subtotal,
        vendor_profiles(business_name),
        orders(
          profiles(full_name, email)
        )
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Returns Queue</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Manage customer return requests and issue refunds.</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {(!returns || returns.length === 0) ? (
          <div className="bg-white shadow rounded-lg border border-gray-100 p-8 text-center text-gray-500">
            No return requests found.
          </div>
        ) : (
          returns.map((ret: any) => (
            <div key={ret.id} className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Return ID: {ret.id.split('-')[0]}</h3>
                  <div className="mt-1 text-sm text-gray-500">
                    Requested on: {new Date(ret.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
                    ${ret.status === 'requested' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${ret.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                    ${ret.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {ret.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Order Information</h4>
                  <dl className="text-sm space-y-1 text-gray-600">
                    <div className="flex justify-between"><dt>Vendor:</dt><dd className="font-medium text-gray-900">{ret.sub_orders?.vendor_profiles?.business_name}</dd></div>
                    <div className="flex justify-between"><dt>Buyer:</dt><dd className="font-medium text-gray-900">{ret.sub_orders?.orders?.profiles?.full_name}</dd></div>
                    <div className="flex justify-between"><dt>Order Value:</dt><dd className="font-medium text-gray-900">₹{ret.sub_orders?.subtotal}</dd></div>
                  </dl>
                  
                  <h4 className="text-sm font-semibold mt-6 mb-2">Return Reason</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">{ret.reason}</p>
                </div>
                
                {ret.status === 'requested' ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold mb-4">Process Return</h4>
                    <form action={processReturn} className="space-y-4">
                      <input type="hidden" name="returnId" value={ret.id} />
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                        <input type="number" step="0.01" name="refundAmount" defaultValue={ret.sub_orders?.subtotal} className="w-full border border-gray-300 rounded p-2 text-sm" />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notes (Sent to buyer on rejection)</label>
                        <textarea name="adminNote" className="w-full border border-gray-300 rounded p-2 text-sm h-16" placeholder="Reason for rejection or notes..."></textarea>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button type="submit" name="action" value="approve" className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 border-0">
                          <CheckCircle2 size={16} /> Approve & Refund
                        </Button>
                        <Button type="submit" name="action" value="reject" variant="secondary" className="flex-1 text-red-600 border border-red-200 hover:bg-red-50 flex items-center justify-center gap-2">
                          <XCircle size={16} /> Reject Return
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div>
                     <h4 className="text-sm font-semibold mb-2">Processing Details</h4>
                     <dl className="text-sm space-y-1 text-gray-600">
                      <div className="flex justify-between"><dt>Refunded Amount:</dt><dd className="font-medium text-gray-900">₹{ret.refund_amount}</dd></div>
                      <div className="flex justify-between"><dt>Admin Note:</dt><dd className="font-medium text-gray-900">{ret.admin_note || 'None'}</dd></div>
                    </dl>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
