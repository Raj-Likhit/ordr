"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  'placed': '#60A5FA', // Blue
  'confirmed': '#FBBF24', // Yellow
  'shipped': '#A78BFA', // Purple
  'delivered': '#34D399', // Green
  'cancelled': '#F87171', // Red
  'returned': '#9CA3AF', // Gray
};

export function OrderStatusChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 shadow rounded-lg p-6 h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No order data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 shadow rounded-lg p-6 flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Order Status Distribution</h3>
      <div className="flex-1 min-h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#CBD5E1'} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [value, 'Orders']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textTransform: 'capitalize' }}
            />
            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ textTransform: 'capitalize' }}>{value}</span>}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
