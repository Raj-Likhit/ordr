import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { dispatchCommunication } from '@/lib/services/commService';

// Action for Server Action to approve/reject/suspend
async function reviewVendor(formData: FormData) {
  'use server';
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') return;

  const vendorId = formData.get('vendorId') as string;
  const action = formData.get('action') as string;
  const reason = formData.get('reason') as string;

  const newStatus = action === 'approve' || action === 'reinstate' ? 'approved' : 
                    action === 'reject' ? 'rejected' : 
                    action === 'suspend' ? 'suspended' : null;
                    
  if (!newStatus) return;

  const { data: updated, error } = await supabase
    .from('vendor_profiles')
    .update({
      status: newStatus,
      rejection_reason: reason || null,
      admin_notes: reason || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    .select('*, profiles(email, phone)')
    .single();

  if (!error && updated) {
    const eventMap: Record<string, string> = {
      'approved': 'vendor_approved',
      'rejected': 'vendor_rejected',
      'suspended': 'vendor_suspended'
    };

    const eventId = eventMap[newStatus];
    if (eventId) {
      dispatchCommunication({
        eventId: eventId as any,
        subOrderId: 'N/A',
        recipientId: vendorId,
        email: (updated.profiles as any)?.email,
        phone_wa: (updated.profiles as any)?.phone
      }).catch(console.error);
    }
  }

  redirect('/admin/vendors');
}

export default async function VendorDetailAdminPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const dbEncryptionKey = process.env.DATABASE_ENCRYPTION_KEY || 'default_secret_key_123';

  // Fetch Vendor Profile
  const { data: vendor } = await supabase
    .from('vendor_profiles')
    .select(`*, profiles(full_name, phone, email)`)
    .eq('id', params.id)
    .single();

  if (!vendor) {
    notFound();
  }

  // Fetch Documents
  const { data: documents } = await supabase
    .from('vendor_documents')
    .select('*')
    .eq('vendor_id', params.id);

  // Decrypt Bank Account
  let bankAccount = "Not Provided";
  if (vendor.bank_account_number) {
    const { data: decrypted } = await supabase.rpc('decrypt_value', {
      val: vendor.bank_account_number,
      secret: dbEncryptionKey
    });
    bankAccount = decrypted || "Error Decrypting";
  }

  // Generate Signed URLs for documents
  const signedDocs = await Promise.all((documents || []).map(async (doc) => {
    const { data } = await supabase.storage
      .from('vendor-docs')
      .createSignedUrl(doc.storage_path, 3600);
    return { ...doc, signedUrl: data?.signedUrl };
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/vendors" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-black">
        <ArrowLeft size={16} /> Back to Queue
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{vendor.business_name || 'Unnamed Business'}</h1>
            <p className="text-gray-500">Submitted: {new Date(vendor.submitted_at || vendor.created_at).toLocaleString()}</p>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider
              ${vendor.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
              ${vendor.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${vendor.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
              ${vendor.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
            `}>
              {vendor.status}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Business Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="grid grid-cols-3"><dt className="text-gray-500">Business Type</dt><dd className="col-span-2 capitalize">{vendor.business_type?.replace('_', ' ')}</dd></div>
                <div className="grid grid-cols-3"><dt className="text-gray-500">Category</dt><dd className="col-span-2">{vendor.category?.[0]}</dd></div>
                <div className="grid grid-cols-3"><dt className="text-gray-500">Address</dt><dd className="col-span-2">{vendor.address_line1}, {vendor.address_line2} <br/> {vendor.city}, {vendor.state} - {vendor.pincode}</dd></div>
              </dl>
            </section>

            <section>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Tax & Payout Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="grid grid-cols-3"><dt className="text-gray-500">GSTIN</dt><dd className="col-span-2">{vendor.gstin}</dd></div>
                <div className="grid grid-cols-3"><dt className="text-gray-500">Account Holder</dt><dd className="col-span-2">{vendor.bank_account_holder}</dd></div>
                <div className="grid grid-cols-3"><dt className="text-gray-500">Account No.</dt><dd className="col-span-2 font-mono bg-gray-100 px-1 py-0.5 rounded">{bankAccount}</dd></div>
                <div className="grid grid-cols-3"><dt className="text-gray-500">IFSC Code</dt><dd className="col-span-2 font-mono">{vendor.bank_ifsc}</dd></div>
                {vendor.upi_id && <div className="grid grid-cols-3"><dt className="text-gray-500">UPI ID</dt><dd className="col-span-2">{vendor.upi_id}</dd></div>}
              </dl>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Contact Info</h3>
              <dl className="space-y-2 text-sm">
                <div className="grid grid-cols-3"><dt className="text-gray-500">Owner Name</dt><dd className="col-span-2">{vendor.profiles?.full_name}</dd></div>
                <div className="grid grid-cols-3"><dt className="text-gray-500">Email</dt><dd className="col-span-2">{vendor.profiles?.email}</dd></div>
                <div className="grid grid-cols-3"><dt className="text-gray-500">Phone</dt><dd className="col-span-2">{vendor.phone || vendor.profiles?.phone}</dd></div>
              </dl>
            </section>

            <section>
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Uploaded Documents</h3>
              {signedDocs.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded.</p>
              ) : (
                <ul className="space-y-3">
                  {signedDocs.map(doc => (
                    <li key={doc.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-medium">{doc.doc_type.replace('_', ' ')}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{doc.file_name}</p>
                      </div>
                      <a href={doc.signedUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        View File
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        {vendor.status === 'under_review' && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Admin Action</h3>
            <form action={reviewVendor} className="space-y-4">
              <input type="hidden" name="vendorId" value={vendor.id} />
              
              <div>
                <label className="block text-sm font-medium mb-1">Rejection Reason (if rejecting)</label>
                <textarea 
                  name="reason" 
                  className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-black"
                  placeholder="Explain why the application is rejected..."
                ></textarea>
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" name="action" value="approve" className="bg-green-600 hover:bg-green-700 text-white border-0 flex-1 flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Approve Vendor
                </Button>
                <Button type="submit" name="action" value="reject" variant="secondary" className="text-red-600 border border-red-200 hover:bg-red-50 flex-1 flex items-center justify-center gap-2">
                  <XCircle size={18} /> Reject Application
                </Button>
              </div>
            </form>
          </div>
        )}

        {(vendor.status === 'approved' || vendor.status === 'suspended') && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Vendor Lifecycle</h3>
            <form action={reviewVendor} className="space-y-4">
              <input type="hidden" name="vendorId" value={vendor.id} />
              
              {vendor.status === 'approved' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Suspension Reason (Required)</label>
                    <textarea 
                      name="reason" 
                      required
                      className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-black"
                      placeholder="Explain why the vendor is being suspended..."
                    ></textarea>
                  </div>
                  <Button type="submit" name="action" value="suspend" variant="secondary" className="text-orange-600 border border-orange-200 hover:bg-orange-50 w-full flex items-center justify-center gap-2">
                    <AlertCircle size={18} /> Suspend Vendor
                  </Button>
                </>
              ) : (
                <Button type="submit" name="action" value="reinstate" className="bg-green-600 hover:bg-green-700 text-white border-0 w-full flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Reinstate Vendor
                </Button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
