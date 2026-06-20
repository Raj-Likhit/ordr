"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  'placed': '#60A5FA',
  'confirmed': '#FBBF24',
  'shipped': '#A78BFA',
  'delivered': '#34D399',
  'cancelled': '#F87171',
  'returned': '#9CA3AF',
};

export function VendorOrderStatusChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 h-[300px] flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">No orders data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 h-full">
      <h3 className="font-display text-[var(--text-title)] mb-2">Orders by Status</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#CBD5E1'} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [value, 'Orders']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textTransform: 'capitalize' }}
            />
            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{value}</span>}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
