import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlatformRevenueChart } from '@/components/admin/PlatformRevenueChart';
import { OrderStatusChart } from '@/components/admin/OrderStatusChart';

export default async function AdminDashboardPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile?.role !== 'admin') redirect('/dashboard');

  // Fetch metrics
  // Total GMV & Revenue Chart Data
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false });
    
  const totalGmv = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  
  // Aggregate revenue by day for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const revenueMap = new Map();
  orders?.forEach(order => {
    const orderDate = new Date(order.created_at);
    if (orderDate >= thirtyDaysAgo) {
      const day = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      revenueMap.set(day, (revenueMap.get(day) || 0) + Number(order.total_amount));
    }
  });
  
  const revenueData = Array.from(revenueMap, ([day, revenue]) => ({ day, revenue })).reverse();
  
  // Order Status Distribution
  const { data: subOrders } = await supabase
    .from('sub_orders')
    .select('status');
    
  const statusMap = new Map();
  subOrders?.forEach(so => {
    statusMap.set(so.status, (statusMap.get(so.status) || 0) + 1);
  });
  
  const orderStatusData = Array.from(statusMap, ([name, value]) => ({ name, value }));

  // Active vendors
  const { count: activeVendors } = await supabase
    .from('vendor_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');
    
  // Pending vendors
  const { count: pendingVendors } = await supabase
    .from('vendor_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Platform Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Overview of Saasum multi-vendor operations.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <dt className="text-sm font-medium text-gray-500 truncate">Total GMV</dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">₹{totalGmv.toLocaleString()}</dd>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Platform-wide paid orders
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <dt className="text-sm font-medium text-gray-500 truncate">Active Vendors</dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">{activeVendors || 0}</dd>
          </div>
          <Link href="/admin/vendors" className="mt-4 text-sm text-[var(--color-primary)] hover:underline font-medium">
            View all vendors &rarr;
          </Link>
        </div>
        
        <div className="bg-[#FDFAF5] overflow-hidden shadow rounded-lg border border-[#C84B0F]/20 p-6 flex flex-col justify-between">
          <div>
            <dt className="text-sm font-medium text-[#C84B0F] truncate">Pending Approvals</dt>
            <dd className="mt-2 text-3xl font-semibold text-gray-900">{pendingVendors || 0}</dd>
          </div>
          <Link href="/admin/vendors" className="mt-4 text-sm text-[#C84B0F] hover:underline font-medium">
            Review pending vendors &rarr;
          </Link>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <PlatformRevenueChart data={revenueData} />
        </div>
        <div>
          <OrderStatusChart data={orderStatusData} />
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg border border-gray-100 p-6 mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/orders" className="block p-4 border rounded hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-gray-900">Manage Orders</h3>
            <p className="text-sm text-gray-500 mt-1">View all platform orders and process refunds.</p>
          </Link>
          <Link href="/admin/vendors" className="block p-4 border rounded hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-gray-900">Vendor Queue</h3>
            <p className="text-sm text-gray-500 mt-1">Approve or suspend vendor accounts.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
