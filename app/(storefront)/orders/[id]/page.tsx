import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { InvoiceDownload } from '@/components/orders/InvoiceDownload';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-12 text-center">Please login to view.</div>;

  const { data: subOrder } = await supabase
    .from('sub_orders')
    .select(`
      *,
      vendor:vendor_profiles ( business_name, email, phone ),
      order:orders ( buyer_id, address:user_addresses(line1:address_line1, line2:address_line2, city, state, pincode) )
    `)
    .eq('id', params.id)
    .single();

  if (!subOrder) notFound();

  // Guard: Ensure user owns this order
  const order: any = Array.isArray(subOrder.order) ? subOrder.order[0] : subOrder.order;
  if (order?.buyer_id !== user.id) notFound();

  const vendor: any = Array.isArray(subOrder.vendor) ? subOrder.vendor[0] : subOrder.vendor;
  const address: any = Array.isArray(order?.address) ? order.address[0] : order?.address;

  // Fetch items
  const { data: items } = await supabase
    .from('order_items')
    .select('*, variant:product_variants(size, product:products(title))')
    .eq('sub_order_id', subOrder.id);

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 animate-fade-in">
      <Link href="/my-orders" className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-[var(--color-text-primary)] mb-2">Shipment Details</h1>
          <p className="text-[var(--color-text-secondary)] font-mono">ID: {subOrder.id}</p>
        </div>
        <InvoiceDownload subOrderId={subOrder.id} status={subOrder.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Tracking */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
            <OrderTimeline subOrderId={subOrder.id} />
          </div>

          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
            <h3 className="font-medium text-[var(--color-text-primary)] mb-4">Shipping Address</h3>
            {address ? (
              <address className="text-[var(--text-small)] text-[var(--color-text-secondary)] not-italic leading-relaxed">
                {address.line1}<br />
                {address.line2 && <>{address.line2}<br/></>}
                {address.city}, {address.state} {address.pincode}
              </address>
            ) : (
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">Address not found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-border)]">
              <h3 className="font-medium text-[var(--color-text-primary)]">Items from {vendor?.business_name || 'Vendor'}</h3>
            </div>
            <div className="p-0">
              {items?.map(item => {
                const variant: any = Array.isArray(item.variant) ? item.variant[0] : item.variant;
                const product: any = Array.isArray(variant?.product) ? variant.product[0] : variant?.product;
                return (
                  <div key={item.id} className="flex gap-4 p-6 border-b border-[var(--color-border)] last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">{product?.title || 'Product'}</p>
                      <p className="text-[var(--text-small)] text-[var(--color-text-secondary)] mt-1">Qty: {item.quantity}</p>
                      {variant?.size && <p className="text-[var(--text-small)] text-[var(--color-text-secondary)]">Size: {variant.size}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[var(--color-text-primary)]">{fmt(item.price_at_time)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-[var(--color-bg)] p-6 flex justify-between items-center border-t border-[var(--color-border)]">
              <span className="font-medium text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="font-display text-xl font-medium text-[var(--color-text-primary)]">{fmt(subOrder.subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
