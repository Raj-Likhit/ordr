"use client";

import React from 'react';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  in_stock: { bg: '#DCFCE7', text: '#16A34A', label: 'In Stock' },
  low_stock: { bg: '#FEF9C3', text: '#CA8A04', label: 'Low Stock' },
  out_of_stock: { bg: '#FEE2E2', text: '#DC2626', label: 'Out of Stock' },
};

export function InventoryPanel({ items }: { items: any[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
        <h3 className="font-display text-[var(--text-title)] mb-6">Inventory Alerts</h3>
        <p className="text-[var(--color-text-secondary)]">No inventory items found.</p>
      </div>
    );
  }

  // Only show low stock and out of stock
  const alerts = items.filter(i => i.stock_status !== 'in_stock').slice(0, 5);

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 overflow-hidden">
      <h3 className="font-display text-[var(--text-title)] mb-6">Inventory Alerts</h3>
      
      {alerts.length === 0 ? (
        <p className="text-[#16A34A] bg-[#DCFCE7] p-3 rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium">All items are sufficiently stocked.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-[var(--text-small)] font-medium">
                <th className="pb-3 pr-4 font-medium">Product</th>
                <th className="pb-3 pr-4 font-medium">SKU</th>
                <th className="pb-3 pr-4 font-medium">Stock</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-small)]">
              {alerts.map((item, idx) => {
                const c = STATUS_COLORS[item.stock_status] || STATUS_COLORS.in_stock;
                return (
                  <tr key={idx} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-3 pr-4 font-medium truncate max-w-[150px]">{item.name}</td>
                    <td className="py-3 pr-4 text-[var(--color-text-secondary)]">{item.sku || 'N/A'}</td>
                    <td className="py-3 pr-4 font-medium">{item.stock_qty}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: c.bg, color: c.text }}>
                        {c.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
