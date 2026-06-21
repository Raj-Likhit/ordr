-- Diagnostic Queries for Checkout Issue
-- Run these queries in Supabase SQL Editor to diagnose the problem

-- ==========================================
-- 1. CHECK TABLE STRUCTURES
-- ==========================================

-- Check if both address tables exist
SELECT 
    'addresses' as table_name,
    COUNT(*) as row_count
FROM addresses
UNION ALL
SELECT 
    'user_addresses' as table_name,
    COUNT(*) as row_count
FROM user_addresses;

-- ==========================================
-- 2. CHECK FOREIGN KEY CONSTRAINTS
-- ==========================================

-- Check what table the orders.address_id foreign key points to
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'orders'
    AND kcu.column_name = 'address_id';

-- Expected result: Should point to 'user_addresses', not 'addresses'

-- ==========================================
-- 3. CHECK RPC FUNCTIONS
-- ==========================================

-- Check if required RPC functions exist
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments,
    prokind as kind,
    CASE 
        WHEN prokind = 'f' THEN 'function'
        WHEN prokind = 'p' THEN 'procedure'
        ELSE 'other'
    END as type
FROM pg_proc 
WHERE proname IN (
    'create_pending_checkout', 
    'confirm_checkout', 
    'process_checkout',
    'cancel_expired_orders'
)
ORDER BY proname;

-- Expected: Should see at least create_pending_checkout and confirm_checkout

-- ==========================================
-- 4. CHECK USER DATA
-- ==========================================

-- Replace <USER_EMAIL> with your test user's email
DO $$
DECLARE
    v_user_id uuid;
    v_cart_id uuid;
    v_address_count int;
    v_cart_item_count int;
BEGIN
    -- Get user ID by email (change this to your test user's email)
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'YOUR_EMAIL_HERE@example.com'
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ User not found';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ User ID: %', v_user_id;
    
    -- Check if profile exists
    IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
        RAISE NOTICE '✅ Profile exists';
    ELSE
        RAISE NOTICE '❌ Profile does NOT exist - this will cause issues!';
    END IF;
    
    -- Check addresses
    SELECT COUNT(*) INTO v_address_count
    FROM user_addresses 
    WHERE user_id = v_user_id;
    
    RAISE NOTICE 'Addresses: %', v_address_count;
    
    IF v_address_count = 0 THEN
        RAISE NOTICE '⚠️ No addresses found for user';
    END IF;
    
    -- Check cart
    SELECT id INTO v_cart_id 
    FROM carts 
    WHERE buyer_id = v_user_id 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF v_cart_id IS NULL THEN
        RAISE NOTICE '⚠️ No cart found for user';
    ELSE
        RAISE NOTICE '✅ Cart ID: %', v_cart_id;
        
        -- Check cart items
        SELECT COUNT(*) INTO v_cart_item_count
        FROM cart_items
        WHERE cart_id = v_cart_id;
        
        RAISE NOTICE 'Cart items: %', v_cart_item_count;
        
        IF v_cart_item_count = 0 THEN
            RAISE NOTICE '⚠️ Cart is empty';
        END IF;
    END IF;
END $$;

-- ==========================================
-- 5. VIEW CART DETAILS
-- ==========================================

-- View cart with full item details (replace with your user_id)
-- SELECT 
--     c.id as cart_id,
--     c.buyer_id,
--     ci.id as cart_item_id,
--     ci.quantity,
--     pv.id as variant_id,
--     pv.size,
--     pv.color,
--     pv.stock,
--     pv.price_override,
--     p.title,
--     p.base_price,
--     vp.business_name as vendor
-- FROM carts c
-- LEFT JOIN cart_items ci ON ci.cart_id = c.id
-- LEFT JOIN product_variants pv ON pv.id = ci.variant_id
-- LEFT JOIN products p ON p.id = pv.product_id
-- LEFT JOIN vendor_profiles vp ON vp.id = p.vendor_id
-- WHERE c.buyer_id = '<YOUR_USER_ID>';

-- ==========================================
-- 6. VIEW USER ADDRESSES
-- ==========================================

-- View all addresses for user (replace with your user_id)
-- SELECT 
--     id,
--     full_name,
--     phone,
--     address_line1,
--     city,
--     state,
--     pincode,
--     is_default_shipping,
--     created_at
-- FROM user_addresses
-- WHERE user_id = '<YOUR_USER_ID>'
-- ORDER BY created_at DESC;

-- ==========================================
-- 7. CHECK RLS POLICIES
-- ==========================================

-- Check RLS policies on critical tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('carts', 'cart_items', 'user_addresses', 'orders')
ORDER BY tablename, policyname;

-- ==========================================
-- 8. CHECK PRODUCT STOCK
-- ==========================================

-- Check if products have adequate stock
SELECT 
    p.id,
    p.title,
    p.vendor_id,
    pv.id as variant_id,
    pv.size,
    pv.color,
    pv.stock,
    CASE 
        WHEN pv.stock = 0 THEN '❌ Out of stock'
        WHEN pv.stock < 5 THEN '⚠️ Low stock'
        ELSE '✅ In stock'
    END as status
FROM products p
JOIN product_variants pv ON pv.product_id = p.id
WHERE p.is_active = true
ORDER BY pv.stock ASC
LIMIT 20;

-- ==========================================
-- 9. TEST RPC FUNCTIONS (Optional - Advanced)
-- ==========================================

-- Test if create_pending_checkout function can be called
-- DON'T RUN THIS unless you want to create a test order
-- SELECT create_pending_checkout(
--     '<YOUR_USER_ID>'::uuid,
--     '<VALID_ADDRESS_ID>'::uuid,
--     1000.00
-- );

-- ==========================================
-- 10. SUMMARY REPORT
-- ==========================================

-- Generate a summary report
WITH user_check AS (
    SELECT 
        COUNT(*) as user_count
    FROM auth.users
),
profile_check AS (
    SELECT 
        COUNT(*) as profile_count
    FROM profiles
),
address_check AS (
    SELECT 
        COUNT(*) as address_count
    FROM user_addresses
),
cart_check AS (
    SELECT 
        COUNT(DISTINCT c.id) as cart_count,
        COUNT(ci.id) as cart_item_count
    FROM carts c
    LEFT JOIN cart_items ci ON ci.cart_id = c.id
),
product_check AS (
    SELECT 
        COUNT(*) as product_count,
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_products
    FROM products
),
variant_check AS (
    SELECT 
        COUNT(*) as variant_count,
        SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock_variants
    FROM product_variants
),
function_check AS (
    SELECT 
        COUNT(*) as function_count
    FROM pg_proc 
    WHERE proname IN ('create_pending_checkout', 'confirm_checkout')
)
SELECT 
    'System Health Check' as report_title,
    u.user_count,
    p.profile_count,
    a.address_count,
    c.cart_count,
    c.cart_item_count,
    pr.product_count,
    pr.active_products,
    v.variant_count,
    v.in_stock_variants,
    f.function_count as required_functions,
    CASE 
        WHEN f.function_count >= 2 THEN '✅ Functions OK'
        ELSE '❌ Missing functions'
    END as function_status
FROM user_check u, profile_check p, address_check a, 
     cart_check c, product_check pr, variant_check v, function_check f;

-- ==========================================
-- INSTRUCTIONS
-- ==========================================

/*
STEP 1: Run sections 1-3 first to check database structure

STEP 2: Update section 4 with your actual email address and run it

STEP 3: Run section 5-6 after updating with your user_id (get it from section 4 output)

STEP 4: Run sections 7-10 for detailed diagnostics

STEP 5: Review all outputs and compare with expected results in comments

If you find issues:
- Missing functions → Run create_checkout_functions.sql
- Wrong foreign key → Run fix_address_tables.sql
- Empty cart → Check browser console and app logs
- No addresses → Add address through UI or SQL
*/
