-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE POLICY "Users can only view their own orders" ON orders
    FOR SELECT
    USING (auth.uid() = buyer_id);

CREATE POLICY "Users can only insert their own orders" ON orders
    FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can only update their own orders" ON orders
    FOR UPDATE
    USING (auth.uid() = buyer_id);

-- User Addresses
CREATE POLICY "Users can only view their own addresses" ON user_addresses
    FOR SELECT
    USING (auth.uid() = buyer_id);

CREATE POLICY "Users can only insert their own addresses" ON user_addresses
    FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can only update their own addresses" ON user_addresses
    FOR UPDATE
    USING (auth.uid() = buyer_id);

CREATE POLICY "Users can only delete their own addresses" ON user_addresses
    FOR DELETE
    USING (auth.uid() = buyer_id);

-- Cart Items
CREATE POLICY "Users can only manage their own cart" ON cart_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.buyer_id = auth.uid()
        )
    );
