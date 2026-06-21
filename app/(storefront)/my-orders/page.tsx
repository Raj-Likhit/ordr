import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Package } from 'lucide-react';

export default async function MyOrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-12 text-center">Please login to view your orders.</div>;
  }

  // Fetch orders with their sub_orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, created_at, total_amount, payment_status,
      sub_orders(
        id, status, subtotal, tracking_id, vendor:vendor_profiles(business_name),
        order_items(quantity, variant:product_variants(product:products(title)))
      )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 animate-fade-in">
      <h1 className="font-display text-3xl font-light text-[var(--color-text-primary)] mb-8">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]">
          <Package size={48} className="mx-auto mb-4 text-[var(--color-border-strong)]" />
          <p className="text-[var(--color-text-secondary)]">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="mt-4 inline-block px-6 py-2 bg-[var(--color-accent)] text-white rounded-full">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
              <div className="bg-[var(--color-bg)] px-6 py-4 border-b border-[var(--color-border)] flex flex-wrap gap-4 justify-between items-center text-[var(--text-small)]">
                <div>
                  <p className="text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Order Placed</p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Total</p>
                  <p className="font-medium text-[var(--color-text-primary)]">₹{order.total_amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Order ID</p>
                  <p className="font-mono text-[var(--color-text-primary)]">{order.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-medium mb-4 text-[var(--color-text-secondary)]">Shipments</h4>
                <div className="space-y-4">
                  {order.sub_orders?.map((sub: any) => {
                    const vendor = Array.isArray(sub.vendor) ? sub.vendor[0] : sub.vendor;
                    return (
                      <div key={sub.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-[var(--color-border)] rounded-[var(--radius-md)] hover:bg-[var(--color-bg)] transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-[var(--color-text-primary)] mb-1">
                            Sold by: {vendor?.business_name || 'Vendor'}
                          </p>
                          <p className="text-[var(--text-small)] text-[var(--color-text-secondary)] mb-2">
                            Shipment ID: {sub.id.slice(0,8).toUpperCase()}
                          </p>
                          {sub.order_items && sub.order_items.length > 0 && (
                            <div className="text-[var(--text-small)] text-[var(--color-text-secondary)] bg-[var(--color-bg)] p-2 rounded border border-[var(--color-border)] mt-2">
                              {sub.order_items.map((item: any) => {
                                const variant = Array.isArray(item.variant) ? item.variant[0] : item.variant;
                                const product = Array.isArray(variant?.product) ? variant.product[0] : variant?.product;
                                return `${item.quantity}x ${product?.title || 'Product'}`;
                              }).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 rounded-[var(--radius-sm)] bg-gray-100 text-gray-800 text-[10px] font-semibold uppercase tracking-wider border border-gray-200">
                            {sub.status.replace('_', ' ')}
                          </span>
                          <Link href={`/orders/${sub.id}`} className="text-[var(--color-accent)] text-[var(--text-small)] font-medium hover:underline">
                            Track Shipment
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
