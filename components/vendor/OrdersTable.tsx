"use client";

import React from 'react';
import Link from 'next/link';

export function OrdersTable({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 h-full">
        <h3 className="font-display text-[var(--text-title)] mb-6">Recent Orders</h3>
        <p className="text-[var(--color-text-secondary)]">No orders found.</p>
      </div>
    );
  }

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 overflow-hidden h-full flex flex-col">
      <h3 className="font-display text-[var(--text-title)] mb-6 shrink-0">Recent Orders</h3>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-[var(--text-small)] font-medium">
              <th className="pb-3 pr-4 font-medium">Order ID</th>
              <th className="pb-3 pr-4 font-medium">Buyer</th>
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Total</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-small)]">
            {orders.map((o) => {
              const b: any = Array.isArray(o.order?.buyer) ? o.order.buyer[0] : o.order?.buyer;
              return (
                <tr key={o.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)] transition-colors">
                  <td className="py-3 pr-4 font-medium">
                    <Link href={`/vendor/orders/${o.id}`} className="text-[var(--color-accent)] hover:underline">
                      {o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-text-primary)]">{b?.full_name || 'Guest'}</td>
                  <td className="py-3 pr-4 text-[var(--color-text-secondary)]">
                    {new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 pr-4 font-medium">{fmt(o.subtotal)}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-[var(--radius-sm)] text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap bg-gray-100 text-gray-800 border border-gray-200">
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pt-4 mt-4 border-t border-[var(--color-border)] text-center shrink-0">
        <Link href="/vendor/orders" className="text-[var(--text-small)] font-medium text-[var(--color-accent)] hover:underline">
          View All Orders
        </Link>
      </div>
    </div>
  );
}
