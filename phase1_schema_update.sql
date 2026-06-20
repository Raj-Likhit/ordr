-- Phase 1: Core Foundation Schema Updates

-- 1(d) SEO & Meta Tags
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 1(a) Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT,
    size TEXT,
    color TEXT,
    material TEXT,
    price_adjustment NUMERIC DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Product Variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Variants are viewable by everyone" ON product_variants;
CREATE POLICY "Variants are viewable by everyone" ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can manage their product variants" ON product_variants;
CREATE POLICY "Vendors can manage their product variants" ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.vendor_id = auth.uid())
);

-- 4(a) Wishlists & Favorites
CREATE TABLE IF NOT EXISTS wishlist_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    name TEXT DEFAULT 'My Wishlist',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES wishlist_groups(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, product_id)
);

-- RLS for Wishlists
ALTER TABLE wishlist_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own wishlist groups" ON wishlist_groups;
CREATE POLICY "Users can manage their own wishlist groups" ON wishlist_groups FOR ALL USING (user_id = auth.uid());

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own wishlist items" ON wishlist_items;
CREATE POLICY "Users can manage their own wishlist items" ON wishlist_items FOR ALL USING (
  EXISTS (SELECT 1 FROM wishlist_groups WHERE wishlist_groups.id = wishlist_items.group_id AND wishlist_groups.user_id = auth.uid())
);

-- 3(b) Discounts & Coupons
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active promotions are viewable by everyone" ON promotions;
CREATE POLICY "Active promotions are viewable by everyone" ON promotions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Vendors can manage their own promotions" ON promotions;
CREATE POLICY "Vendors can manage their own promotions" ON promotions FOR ALL USING (vendor_id = auth.uid());

-- Order integration for promotions
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS promo_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
