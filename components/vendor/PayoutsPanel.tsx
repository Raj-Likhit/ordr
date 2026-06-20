"use client";

import React from 'react';

const PAYOUT_COLORS: Record<string, string> = {
  pending: '#FEF9C3', 
  processing: '#DBEAFE',
  paid: '#DCFCE7', 
  failed: '#FEE2E2',
};

const PAYOUT_TEXT: Record<string, string> = {
  pending: '#CA8A04', 
  processing: '#2563EB',
  paid: '#16A34A', 
  failed: '#DC2626',
};

export function PayoutsPanel({ payouts }: { payouts: any[] }) {
  if (!payouts || payouts.length === 0) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
        <h3 className="font-display text-[var(--text-title)] mb-6">Payout History</h3>
        <p className="text-[var(--color-text-secondary)]">No payouts yet.</p>
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
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 overflow-hidden">
      <h3 className="font-display text-[var(--text-title)] mb-6">Payout History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-[var(--text-small)] font-medium">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Amount</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-small)]">
            {payouts.map((p, idx) => (
              <tr key={p.id || idx} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)] transition-colors">
                <td className="py-4 pr-4">
                  {p.status === 'paid' 
                    ? new Date(p.created_at).toLocaleDateString('en-IN') // fallback to created_at if no paid_at
                    : 'Pending'
                  }
                </td>
                <td className="py-4 pr-4 font-medium">{fmt(p.payout_amount)}</td>
                <td className="py-4 pr-4">
                  <span 
                    className="px-2 py-1 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap capitalize" 
                    style={{ background: PAYOUT_COLORS[p.status], color: PAYOUT_TEXT[p.status] }}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-4 text-[var(--color-text-secondary)]">
                  {p.id ? p.id.split('-')[0].toUpperCase() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
