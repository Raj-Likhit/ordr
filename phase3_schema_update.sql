-- Phase 3: Analytics & Reviews Schema Updates

-- 1. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)
);

-- RLS for Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
CREATE POLICY "Authenticated users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 2. Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Page Views
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Page views are viewable by vendor" ON page_views;
CREATE POLICY "Page views are viewable by vendor" ON page_views FOR SELECT USING (vendor_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;
CREATE POLICY "Anyone can insert page views" ON page_views FOR INSERT WITH CHECK (true);

-- 3. Product Ratings Aggregation
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Trigger to update product rating_avg and rating_count
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE products
        SET rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id),
            rating_avg = (SELECT COALESCE(AVG(rating), 0.00) FROM reviews WHERE product_id = NEW.product_id)
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products
        SET rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = OLD.product_id),
            rating_avg = (SELECT COALESCE(AVG(rating), 0.00) FROM reviews WHERE product_id = OLD.product_id)
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_product_rating ON reviews;
CREATE TRIGGER trg_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- 4. Vendor Dashboard Metrics RPC
-- This safely aggregates metrics and returns a structured JSON object 
DROP FUNCTION IF EXISTS get_vendor_dashboard_metrics();

CREATE OR REPLACE FUNCTION get_vendor_dashboard_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vendor_id UUID := auth.uid();
  v_revenue JSONB;
  v_orders JSONB;
  v_inventory JSONB;
  v_order_stats JSONB;
  v_top_products JSONB;
  v_result JSONB;
BEGIN
  -- Revenue (last 30 days) grouped by date
  SELECT COALESCE(jsonb_agg(row_to_json(rev)), '[]'::jsonb) INTO v_revenue
  FROM (
    SELECT DATE(created_at) as date, SUM(total_amount) as gross_revenue
    FROM orders
    WHERE vendor_id = v_vendor_id AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  ) rev;

  -- Recent Orders
  SELECT COALESCE(jsonb_agg(row_to_json(ord)), '[]'::jsonb) INTO v_orders
  FROM (
    SELECT id, created_at, status, total_amount, shipping_address
    FROM orders
    WHERE vendor_id = v_vendor_id
    ORDER BY created_at DESC
    LIMIT 10
  ) ord;

  -- Inventory status
  SELECT COALESCE(jsonb_agg(row_to_json(inv)), '[]'::jsonb) INTO v_inventory
  FROM (
    SELECT id, title, 
           CASE WHEN stock_quantity <= 5 THEN 'low_stock' ELSE 'in_stock' END as stock_status,
           stock_quantity as stock
    FROM products
    WHERE vendor_id = v_vendor_id
  ) inv;

  -- Order Stats
  SELECT COALESCE(jsonb_agg(row_to_json(stat)), '[]'::jsonb) INTO v_order_stats
  FROM (
    SELECT status, COUNT(*) as count
    FROM orders
    WHERE vendor_id = v_vendor_id
    GROUP BY status
  ) stat;

  -- Top Products (Fallback to random sorting as orders don't strictly link products easily without order_items joins)
  SELECT COALESCE(jsonb_agg(row_to_json(tp)), '[]'::jsonb) INTO v_top_products
  FROM (
    SELECT id, title, rating_avg as rating
    FROM products
    WHERE vendor_id = v_vendor_id
    ORDER BY rating_avg DESC NULLS LAST
    LIMIT 5
  ) tp;

  -- Build final JSON
  v_result := jsonb_build_object(
    'revenue', v_revenue,
    'orders', v_orders,
    'inventory', v_inventory,
    'payouts', '[]'::jsonb,
    'orderStats', v_order_stats,
    'topProducts', v_top_products
  );

  RETURN v_result;
END;
$$;
