"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export function PlatformRevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 shadow rounded-lg p-6 h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No revenue data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Platform Revenue (Last 30 Days)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => `₹${Number(v).toFixed(2)}`} contentStyle={{ borderRadius: '8px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="revenue" stroke="#C84B0F" strokeWidth={3} dot={{ r: 4, fill: "#C84B0F" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
