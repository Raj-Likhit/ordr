-- Phase 2: Operations & Finance Schema Updates

-- 2(a) Abandoned Carts
ALTER TABLE carts
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_abandoned_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add a trigger to automatically update the updated_at column on carts
CREATE OR REPLACE FUNCTION update_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS carts_updated_at_trigger ON carts;

CREATE TRIGGER carts_updated_at_trigger
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION update_carts_updated_at();

-- Add a trigger to update carts.updated_at when cart_items are changed
CREATE OR REPLACE FUNCTION update_parent_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE carts SET updated_at = NOW() WHERE id = OLD.cart_id;
        RETURN OLD;
    ELSE
        UPDATE carts SET updated_at = NOW() WHERE id = NEW.cart_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cart_items_changed_trigger ON cart_items;

CREATE TRIGGER cart_items_changed_trigger
AFTER INSERT OR UPDATE OR DELETE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_parent_cart_timestamp();

-- 2(b) Tax Calculations
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;

ALTER TABLE sub_orders
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;
