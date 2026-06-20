"use client";

import React from 'react';
import { useVendorDashboard } from '@/hooks/useVendorDashboard';
import { RevenueChart } from '@/components/vendor/RevenueChart';
import { OrdersTable } from '@/components/vendor/OrdersTable';
import { InventoryPanel } from '@/components/vendor/InventoryPanel';
import { PayoutsPanel } from '@/components/vendor/PayoutsPanel';
import { TopProductsChart } from '@/components/vendor/TopProductsChart';
import { VendorOrderStatusChart } from '@/components/vendor/VendorOrderStatusChart';
import { Loader2, TrendingUp, Package, AlertCircle, Wallet } from 'lucide-react';

export default function VendorDashboard() {
  const { revenue, orders, inventory, payouts, topProducts, orderStats, pageViews, loading } = useVendorDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={40} />
      </div>
    );
  }

  // KPI calculations
  const totalRevenue = revenue.reduce((s, r) => s + Number(r.gross_revenue), 0);
  const pendingOrders = orders.filter(o => ['placed', 'confirmed'].includes(o.status)).length;
  const lowStock = inventory.filter(i => i.stock_status !== 'in_stock').length;
  
  const pendingPayout = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.payout_amount), 0);
  const conversionRate = pageViews > 0 ? ((orders.length / pageViews) * 100).toFixed(2) : "0.00";

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-[var(--color-text-primary)] mb-2">Dashboard Overview</h1>
        <p className="text-[var(--color-text-secondary)]">Monitor your sales, traffic, inventory, and recent activity.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard 
          label="30-Day Revenue" 
          value={fmt(totalRevenue)} 
          icon={<TrendingUp size={24} className="text-[var(--color-accent)]" />}
        />
        <KPICard 
          label="Store Views (30d)" 
          value={pageViews.toLocaleString()} 
          icon={<TrendingUp size={24} className="text-[#3B82F6]" />}
        />
        <KPICard 
          label="Conversion Rate" 
          value={`${conversionRate}%`} 
          icon={<Package size={24} className="text-[#8B5CF6]" />}
        />
        <KPICard 
          label="Pending Orders" 
          value={pendingOrders} 
          alert={pendingOrders > 0} 
          icon={<Package size={24} className="text-[#CA8A04]" />}
        />
        <KPICard 
          label="Low Stock Items" 
          value={lowStock} 
          alert={lowStock > 0} 
          icon={<AlertCircle size={24} className="text-[#DC2626]" />}
        />
        <KPICard 
          label="Pending Payouts" 
          value={fmt(pendingPayout)} 
          icon={<Wallet size={24} className="text-[#16A34A]" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full">
          <RevenueChart data={revenue} />
        </div>
        <div className="w-full">
          <TopProductsChart data={topProducts} />
        </div>
        <div className="w-full lg:col-span-2">
          <VendorOrderStatusChart data={orderStats} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OrdersTable orders={orders} />
        <div className="space-y-8">
          <InventoryPanel items={inventory} />
          <PayoutsPanel payouts={payouts} />
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, alert, icon }: { label: string, value: string | number, alert?: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 relative overflow-hidden group hover:border-[var(--color-border-strong)] transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--color-text-secondary)] text-[var(--text-small)] font-medium mb-1 uppercase tracking-wider">{label}</p>
          <h4 className={`text-3xl font-display font-medium ${alert ? 'text-[#DC2626]' : 'text-[var(--color-text-primary)]'}`}>
            {value}
          </h4>
        </div>
        <div className="p-3 bg-[var(--color-bg)] rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}
