-- Modifying the profiles table if it exists, otherwise creating it
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        role TEXT NOT NULL DEFAULT 'buyer',
        full_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        phone TEXT,
        date_of_birth DATE,
        gender TEXT
    );
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Create user_addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default_shipping BOOLEAN DEFAULT FALSE,
    is_default_billing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default address per type per user
CREATE UNIQUE INDEX IF NOT EXISTS one_default_shipping_per_user ON user_addresses(user_id) WHERE is_default_shipping = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS one_default_billing_per_user ON user_addresses(user_id) WHERE is_default_billing = TRUE;

-- Create wishlist_groups
CREATE TABLE IF NOT EXISTS wishlist_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wishlist_items
CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES wishlist_groups(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, product_id)
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_addresses_updated_at ON user_addresses;
CREATE TRIGGER user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS wishlist_groups_updated_at ON wishlist_groups;
CREATE TRIGGER wishlist_groups_updated_at
BEFORE UPDATE ON wishlist_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Policies for user_addresses
DROP POLICY IF EXISTS "Users can manage their own addresses" ON user_addresses;
CREATE POLICY "Users can manage their own addresses" ON user_addresses
FOR ALL USING (auth.uid() = user_id);

-- Policies for wishlist_groups
DROP POLICY IF EXISTS "Users can manage their own wishlist groups" ON wishlist_groups;
CREATE POLICY "Users can manage their own wishlist groups" ON wishlist_groups
FOR ALL USING (auth.uid() = user_id);

-- Policies for wishlist_items
DROP POLICY IF EXISTS "Users can manage items in their wishlists" ON wishlist_items;
CREATE POLICY "Users can manage items in their wishlists" ON wishlist_items
FOR ALL USING (
    group_id IN (SELECT id FROM wishlist_groups WHERE user_id = auth.uid())
);
