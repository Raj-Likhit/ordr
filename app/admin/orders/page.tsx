'use client';

import { useState, useEffect } from 'react';

type SubOrder = {
  id: string;
  status: string;
  subtotal: number;
  vendor_id: string;
  vendor_profiles: {
    business_name: string;
  };
};

type Order = {
  id: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
  sub_orders: SubOrder[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (subOrderId: string) => {
    // This assumes there's a refund API for sub-orders. We can alert for now if it doesn't exist
    alert(`Refund flow for sub-order ${subOrderId} would trigger here.`);
  };

  if (loading) return <div className="p-8">Loading platform orders...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Platform Orders</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">View all transactions and multi-vendor splits.</p>
      </div>
      
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white shadow rounded-lg border border-gray-100 p-8 text-center text-gray-500">
            No orders found on the platform.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Order ID: {order.id.split('-')[0]}</h3>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{order.profiles?.full_name || 'Unknown Buyer'} ({order.profiles?.phone})</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">Total: ₹{order.total_amount}</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1
                      ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    `}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Vendor Sub-Orders</h4>
                <div className="space-y-4">
                  {order.sub_orders?.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-md border border-gray-100">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sub.vendor_profiles?.business_name}</div>
                        <div className="text-sm text-gray-500 mt-1">Status: {sub.status}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-900">₹{sub.subtotal}</div>
                        {order.payment_status === 'paid' && (
                          <button
                            onClick={() => handleRefund(sub.id)}
                            className="text-xs text-[var(--color-destructive)] hover:underline border border-[var(--color-destructive)] px-2 py-1 rounded"
                          >
                            Issue Refund
                          </button>
                        )}
                        {sub.status === 'delivered' && (
                          <a 
                            href={`/api/invoice/${sub.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline border border-blue-600 px-2 py-1 rounded"
                          >
                            Download Invoice
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
