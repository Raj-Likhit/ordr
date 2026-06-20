"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export function RevenueChart({ data }: { data: any[] }) {
  const chartData = [...data].reverse().map(d => ({
    day: new Date(d.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    revenue: Number(d.gross_revenue),
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 h-[300px] flex items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">No revenue data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
      <h3 className="font-display text-[var(--text-title)] mb-6">Revenue – Last 30 Days</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => `₹${Number(v).toFixed(2)}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-accent)" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
