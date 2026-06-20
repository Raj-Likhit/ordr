"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Truck, Loader2 } from 'lucide-react';

export function BulkFulfillModal({ isOpen, onClose, orders, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  orders: any[];
  onSuccess: () => void;
}) {
  // Only allow shipping orders that are in "confirmed" status
  const fulfillableOrders = orders.filter(o => o.status === 'confirmed');
  const [trackingMap, setTrackingMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Collect updates for orders where tracking was entered or they are checked
    // For simplicity, any order with a tracking number gets fulfilled
    const updates = Object.entries(trackingMap)
      .filter(([id, tracking]) => tracking.trim() !== '')
      .map(([id, tracking]) => ({
        subOrderId: id,
        status: 'shipped',
        tracking_id: tracking.trim()
      }));

    if (updates.length === 0) {
      alert("Please enter tracking numbers for at least one order to fulfill.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/vendor/orders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (res.ok) {
        onSuccess();
        onClose();
        setTrackingMap({});
      } else {
        const data = await res.json();
        alert(data.error || "Failed to bulk fulfill");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
          <h2 className="font-display text-xl font-medium flex items-center gap-2">
            <Truck className="text-[var(--color-accent)]" /> Bulk Fulfill Orders
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {fulfillableOrders.length === 0 ? (
            <p className="text-center text-[var(--color-text-secondary)] py-8">
              You have no confirmed orders ready to be shipped.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-[var(--text-small)] text-[var(--color-text-secondary)] mb-4">
                Enter tracking numbers for the orders you have shipped. Leave blank to skip.
              </p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-[var(--text-micro)] uppercase tracking-wider">
                    <th className="pb-3 pl-2">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Tracking Number</th>
                  </tr>
                </thead>
                <tbody>
                  {fulfillableOrders.map(o => (
                    <tr key={o.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-dark-alt)] transition-colors">
                      <td className="py-3 pl-2 font-mono text-[var(--text-small)]">{o.order?.id?.slice(0, 8).toUpperCase()}</td>
                      <td className="py-3 text-[var(--text-small)] text-[var(--color-text-secondary)]">{o.order?.buyer?.full_name || 'Anonymous'}</td>
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          placeholder="e.g. DTDC..."
                          value={trackingMap[o.id] || ''}
                          onChange={e => setTrackingMap({...trackingMap, [o.id]: e.target.value})}
                          className="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-1.5 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)] rounded-b-[var(--radius-lg)] flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading || fulfillableOrders.length === 0 || Object.values(trackingMap).filter(v => v.trim() !== '').length === 0}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : `Fulfill ${Object.values(trackingMap).filter(v => v.trim() !== '').length} Orders`}
          </Button>
        </div>
      </div>
    </div>
  );
}
