'use client';

import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Landmark, AlertCircle } from 'lucide-react';

export default function PayoutsPage() {
  // Placeholder data
  const totalEarnings = 124500;
  const availablePayout = 28400;
  const pendingClearance = 14200;

  const transactions = [
    { id: 'TX-9482', date: '2026-06-20', amount: 28400, type: 'Payout', status: 'Processing' },
    { id: 'TX-9481', date: '2026-06-18', amount: 12000, type: 'Sale', status: 'Cleared' },
    { id: 'TX-9480', date: '2026-06-15', amount: 45000, type: 'Payout', status: 'Completed' },
    { id: 'TX-9479', date: '2026-06-12', amount: 32000, type: 'Sale', status: 'Cleared' },
    { id: 'TX-9478', date: '2026-06-10', amount: 14200, type: 'Sale', status: 'Pending' },
  ];

  const fmt = (n: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-[var(--color-text-primary)] mb-2">Payouts & Earnings</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your earnings, view transaction history, and track bank transfers.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--color-text-secondary)] font-medium">Total Earnings</h3>
            <div className="p-2 bg-[var(--color-bg)] rounded-lg">
              <Wallet size={20} className="text-[#3B82F6]" />
            </div>
          </div>
          <p className="font-display text-3xl text-[var(--color-text-primary)] font-semibold">{fmt(totalEarnings)}</p>
          <p className="text-sm text-[#16A34A] mt-2 flex items-center gap-1">
            <ArrowUpRight size={16} /> +12% from last month
          </p>
        </div>

        <div className="bg-[var(--color-bg-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm border-l-4 border-l-[var(--color-accent)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--color-text-secondary)] font-medium">Available for Payout</h3>
            <div className="p-2 bg-[var(--color-bg)] rounded-lg">
              <CheckCircle size={20} className="text-[var(--color-accent)]" />
            </div>
          </div>
          <p className="font-display text-3xl text-[var(--color-text-primary)] font-semibold">{fmt(availablePayout)}</p>
          <button className="mt-4 w-full py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            Request Payout
          </button>
        </div>

        <div className="bg-[var(--color-bg-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--color-text-secondary)] font-medium">Pending Clearance</h3>
            <div className="p-2 bg-[var(--color-bg)] rounded-lg">
              <Clock size={20} className="text-[#CA8A04]" />
            </div>
          </div>
          <p className="font-display text-3xl text-[var(--color-text-primary)] font-semibold">{fmt(pendingClearance)}</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 flex items-center gap-1">
            <AlertCircle size={16} /> Clears in 2-3 business days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border)]">
            <h2 className="font-display text-xl text-[var(--color-text-primary)]">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg)] text-[var(--text-micro)] text-[var(--color-text-muted)] uppercase tracking-wider">
                  <th className="p-4 font-medium">Transaction ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--text-small)]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--color-bg)]/50 transition-colors">
                    <td className="p-4 font-mono text-[var(--color-text-secondary)]">{tx.id}</td>
                    <td className="p-4 text-[var(--color-text-primary)]">{tx.date}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 ${tx.type === 'Payout' ? 'text-[#3B82F6]' : 'text-[#16A34A]'}`}>
                        {tx.type === 'Payout' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-[var(--color-text-primary)]">{fmt(tx.amount)}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'Completed' || tx.status === 'Cleared' ? 'bg-green-100 text-green-700' :
                        tx.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bank Account Info */}
        <div className="space-y-6">
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--color-bg)] rounded-lg">
                <Landmark size={24} className="text-[var(--color-text-primary)]" />
              </div>
              <h2 className="font-display text-xl text-[var(--color-text-primary)]">Payout Method</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[var(--text-micro)] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Bank Name</p>
                <p className="text-[var(--text-small)] text-[var(--color-text-primary)] font-medium">HDFC Bank Ltd.</p>
              </div>
              <div>
                <p className="text-[var(--text-micro)] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Account Number</p>
                <p className="text-[var(--text-small)] text-[var(--color-text-primary)] font-medium">•••• •••• 9382</p>
              </div>
              <div>
                <p className="text-[var(--text-micro)] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">IFSC Code</p>
                <p className="text-[var(--text-small)] text-[var(--color-text-primary)] font-medium">HDFC0001234</p>
              </div>
              <div>
                <p className="text-[var(--text-micro)] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Account Holder Name</p>
                <p className="text-[var(--text-small)] text-[var(--color-text-primary)] font-medium">Artisan Hands Pvt Ltd</p>
              </div>
            </div>
            
            <button className="mt-6 w-full py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium rounded-lg hover:bg-[var(--color-bg)] transition-colors">
              Update Bank Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
