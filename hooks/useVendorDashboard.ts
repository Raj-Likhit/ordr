import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useVendorDashboard() {
  const [revenue, setRevenue] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState<any[]>([]);
  const [pageViews, setPageViews] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_vendor_dashboard_metrics');

      if (error || !data) {
        console.error("Error fetching vendor dashboard metrics:", error);
      } else {
        const metrics = data as any;
        setRevenue(metrics.revenue || []);
        setOrders(metrics.orders || []);
        setInventory(metrics.inventory || []);
        setPayouts(metrics.payouts || []);
        setOrderStats(metrics.orderStats || []);
        setTopProducts(metrics.topProducts || []);
      }
      
      // Fetch Page Views (Last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user.id)
        .gte('viewed_at', thirtyDaysAgo.toISOString());
        
      setPageViews(count || 0);

      setLoading(false);
    }
    fetchData();
  }, []);

  return { revenue, orders, inventory, payouts, topProducts, orderStats, pageViews, loading };
}
