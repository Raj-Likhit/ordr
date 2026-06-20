"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export function TopProductsChart({ data }: { data: { name: string; sales: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 h-[300px] flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">No product sales data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
      <h3 className="font-display text-[var(--text-title)] mb-6">Top Selling Products</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip 
              formatter={(value: any) => [value, 'Units Sold']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
            />
            <Bar dataKey="sales" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
