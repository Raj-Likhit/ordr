-- Fix for address table mismatch issue
-- The orders table references "addresses" table but the app uses "user_addresses"
-- This script consolidates to use "user_addresses" consistently

-- Step 1: Drop the old foreign key constraint on orders table
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_address_id_fkey;

-- Step 2: Add new foreign key constraint pointing to user_addresses
ALTER TABLE public.orders
ADD CONSTRAINT orders_address_id_fkey 
FOREIGN KEY (address_id) 
REFERENCES public.user_addresses(id) 
ON DELETE RESTRICT;

-- Step 3: Drop the old addresses table if it exists and is empty
-- (Only run this if you're sure there's no data in it)
-- DROP TABLE IF EXISTS public.addresses CASCADE;

-- Step 4: Update RLS policies for user_addresses if needed
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own addresses
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.user_addresses;
CREATE POLICY "Users can view their own addresses" 
ON public.user_addresses
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own addresses
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.user_addresses;
CREATE POLICY "Users can insert their own addresses" 
ON public.user_addresses
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own addresses
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.user_addresses;
CREATE POLICY "Users can update their own addresses" 
ON public.user_addresses
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own addresses
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.user_addresses;
CREATE POLICY "Users can delete their own addresses" 
ON public.user_addresses
FOR DELETE 
USING (auth.uid() = user_id);

-- Step 5: Ensure orders can be read with address data (for order details page)
-- Add policy to allow users to read addresses used in their orders
DROP POLICY IF EXISTS "Users can view addresses from their orders" ON public.user_addresses;
CREATE POLICY "Users can view addresses from their orders" 
ON public.user_addresses
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  id IN (
    SELECT address_id FROM public.orders WHERE buyer_id = auth.uid()
  )
);

-- Step 6: If you have data in the old addresses table that needs to be migrated
-- Uncomment and modify this section:
/*
INSERT INTO public.user_addresses (
  id, 
  user_id, 
  full_name, 
  phone, 
  address_line1, 
  address_line2, 
  city, 
  state, 
  pincode,
  is_default_shipping,
  created_at
)
SELECT 
  a.id,
  a.buyer_id,
  COALESCE(p.full_name, 'Unknown'),
  COALESCE(a.phone, p.phone, 'N/A'),
  a.line1,
  a.line2,
  a.city,
  a.state,
  a.pincode,
  a.is_default,
  NOW()
FROM public.addresses a
LEFT JOIN public.profiles p ON p.id = a.buyer_id
ON CONFLICT (id) DO NOTHING;
*/

-- Verification Query: Check if there are any orphaned records
-- SELECT COUNT(*) FROM public.orders o 
-- WHERE NOT EXISTS (SELECT 1 FROM public.user_addresses ua WHERE ua.id = o.address_id);
