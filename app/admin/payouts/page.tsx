import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

async function processPayout(formData: FormData) {
  'use server';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return;

  const payoutId = formData.get('payoutId') as string;
  const reference = formData.get('reference') as string;

  await supabase
    .from('payouts')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      reference: reference || null
    })
    .eq('id', payoutId);

  redirect('/admin/payouts');
}

export default async function AdminPayoutsPage() {
  const supabase = createClient();
  
  const { data: payouts } = await supabase
    .from('payouts')
    .select(`
      *,
      vendor_profiles (
        business_name,
        bank_account_holder,
        bank_ifsc,
        upi_id
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Payout Management</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Process and record vendor earnings distributions.</p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor / Account</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(!payouts || payouts.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No payouts found.
                  </td>
                </tr>
              ) : (
                payouts.map((payout: any) => (
                  <tr key={payout.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payout.vendor_profiles?.business_name}</div>
                      <div className="text-xs text-gray-500">Holder: {payout.vendor_profiles?.bank_account_holder}</div>
                      {payout.vendor_profiles?.upi_id && <div className="text-xs text-gray-500">UPI: {payout.vendor_profiles?.upi_id}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payout.period_start} to {payout.period_end}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{payout.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase
                        ${payout.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      `}>
                        {payout.status}
                      </span>
                      {payout.paid_at && <div className="text-xs text-gray-500 mt-1">{new Date(payout.paid_at).toLocaleDateString()}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payout.status === 'pending' || payout.status === 'processing' ? (
                        <form action={processPayout} className="flex flex-col items-end gap-2">
                          <input type="hidden" name="payoutId" value={payout.id} />
                          <input type="text" name="reference" placeholder="Txn Ref ID" className="border border-gray-300 rounded p-1 text-xs w-32" required />
                          <Button type="submit" size="sm" className="bg-black text-white hover:bg-gray-800 flex items-center gap-1 h-7 text-xs">
                            <CheckCircle2 size={12} /> Mark Paid
                          </Button>
                        </form>
                      ) : (
                        <span className="text-sm text-gray-500">Ref: {payout.reference || 'N/A'}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
