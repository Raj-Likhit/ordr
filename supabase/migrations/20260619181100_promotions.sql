CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, code)
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage their own promotions" ON promotions
  FOR ALL USING (vendor_id = auth.uid());

CREATE POLICY "Anyone can read active promotions" ON promotions
  FOR SELECT USING (is_active = true);
