-- Supabase RPC for Vendor Dashboard Metrics with work_mem optimization

create or replace function get_vendor_dashboard_metrics()
returns json
language plpgsql
security invoker
as $$
declare
  v_revenue json;
  v_orders json;
  v_inventory json;
  v_payouts json;
  v_order_stats json;
  v_top_products json;
  v_vendor_id uuid;
begin
  -- Memory Optimization: explicitly set work_mem for heavy aggregations
  SET LOCAL work_mem = '32MB';

  -- Get current user ID (vendor)
  v_vendor_id := auth.uid();

  select json_agg(t) into v_revenue from (
    select * from vendor_revenue_summary order by day desc limit 30
  ) t;

  select json_agg(t) into v_orders from (
    select id, status, subtotal, tracking_id, created_at,
      (select json_build_object('buyer', json_build_object('full_name', p.full_name))
       from orders o join profiles p on o.buyer_id = p.id where o.id = so.order_id) as "order"
    from sub_orders so
    where vendor_id = v_vendor_id
    order by created_at desc limit 20
  ) t;

  select json_agg(t) into v_inventory from (
    select * from vendor_inventory_view order by stock_qty asc
  ) t;

  select json_agg(t) into v_payouts from (
    select * from payouts where vendor_id = v_vendor_id order by created_at desc limit 10
  ) t;

  select json_agg(t) into v_order_stats from (
    select status as name, count(*) as value
    from sub_orders
    where vendor_id = v_vendor_id
    group by status
  ) t;

  select json_agg(t) into v_top_products from (
    select p.title as name, sum(oi.quantity) as sales
    from order_items oi
    join sub_orders so on oi.sub_order_id = so.id
    join product_variants pv on oi.variant_id = pv.id
    join products p on pv.product_id = p.id
    where so.vendor_id = v_vendor_id
    group by p.title
    order by sales desc
    limit 5
  ) t;

  return json_build_object(
    'revenue', coalesce(v_revenue, '[]'::json),
    'orders', coalesce(v_orders, '[]'::json),
    'inventory', coalesce(v_inventory, '[]'::json),
    'payouts', coalesce(v_payouts, '[]'::json),
    'orderStats', coalesce(v_order_stats, '[]'::json),
    'topProducts', coalesce(v_top_products, '[]'::json)
  );
end;
$$;
