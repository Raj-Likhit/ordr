-- Verification Script
-- Run this AFTER applying the fixes to verify everything is working

-- ==========================================
-- TEST 1: Foreign Key Points to Correct Table
-- ==========================================

DO $$
DECLARE
    v_foreign_table text;
BEGIN
    SELECT ccu.table_name INTO v_foreign_table
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'orders'
        AND kcu.column_name = 'address_id';
    
    IF v_foreign_table = 'user_addresses' THEN
        RAISE NOTICE '✅ TEST 1 PASS: orders.address_id correctly references user_addresses';
    ELSE
        RAISE NOTICE '❌ TEST 1 FAIL: orders.address_id references % (should be user_addresses)', v_foreign_table;
    END IF;
END $$;

-- ==========================================
-- TEST 2: Required Functions Exist
-- ==========================================

DO $$
DECLARE
    v_function_count int;
BEGIN
    SELECT COUNT(*) INTO v_function_count
    FROM pg_proc
    WHERE proname IN ('create_pending_checkout', 'confirm_checkout');
    
    IF v_function_count >= 2 THEN
        RAISE NOTICE '✅ TEST 2 PASS: Both required functions exist (create_pending_checkout, confirm_checkout)';
    ELSE
        RAISE NOTICE '❌ TEST 2 FAIL: Only % of 2 required functions exist', v_function_count;
        
        -- Show which ones are missing
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_pending_checkout') THEN
            RAISE NOTICE '   Missing: create_pending_checkout';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'confirm_checkout') THEN
            RAISE NOTICE '   Missing: confirm_checkout';
        END IF;
    END IF;
END $$;

-- ==========================================
-- TEST 3: RLS Policies Exist
-- ==========================================

DO $$
DECLARE
    v_policy_count int;
BEGIN
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE tablename = 'user_addresses';
    
    IF v_policy_count > 0 THEN
        RAISE NOTICE '✅ TEST 3 PASS: RLS policies exist on user_addresses (% policies)', v_policy_count;
    ELSE
        RAISE NOTICE '❌ TEST 3 FAIL: No RLS policies found on user_addresses';
    END IF;
END $$;

-- ==========================================
-- TEST 4: Tables Exist
-- ==========================================

DO $$
DECLARE
    v_missing_tables text[] := ARRAY[]::text[];
BEGIN
    -- Check critical tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_addresses') THEN
        v_missing_tables := array_append(v_missing_tables, 'user_addresses');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carts') THEN
        v_missing_tables := array_append(v_missing_tables, 'carts');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        v_missing_tables := array_append(v_missing_tables, 'cart_items');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        v_missing_tables := array_append(v_missing_tables, 'orders');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sub_orders') THEN
        v_missing_tables := array_append(v_missing_tables, 'sub_orders');
    END IF;
    
    IF array_length(v_missing_tables, 1) IS NULL THEN
        RAISE NOTICE '✅ TEST 4 PASS: All critical tables exist';
    ELSE
        RAISE NOTICE '❌ TEST 4 FAIL: Missing tables: %', array_to_string(v_missing_tables, ', ');
    END IF;
END $$;

-- ==========================================
-- TEST 5: Sample Data Check
-- ==========================================

DO $$
DECLARE
    v_user_count int;
    v_product_count int;
    v_variant_count int;
BEGIN
    SELECT COUNT(*) INTO v_user_count FROM profiles;
    SELECT COUNT(*) INTO v_product_count FROM products WHERE is_active = true;
    SELECT COUNT(*) INTO v_variant_count FROM product_variants WHERE stock > 0;
    
    IF v_user_count > 0 AND v_product_count > 0 AND v_variant_count > 0 THEN
        RAISE NOTICE '✅ TEST 5 PASS: System has data (% users, % products, % in-stock variants)', 
            v_user_count, v_product_count, v_variant_count;
    ELSE
        RAISE NOTICE '⚠️  TEST 5 WARNING: Limited data (% users, % products, % in-stock variants)', 
            v_user_count, v_product_count, v_variant_count;
        
        IF v_user_count = 0 THEN
            RAISE NOTICE '   No users found - create a test account';
        END IF;
        
        IF v_product_count = 0 THEN
            RAISE NOTICE '   No active products - add products or run seed script';
        END IF;
        
        IF v_variant_count = 0 THEN
            RAISE NOTICE '   No variants with stock - update stock levels';
        END IF;
    END IF;
END $$;

-- ==========================================
-- TEST 6: Function Can Be Called (Dry Run)
-- ==========================================

DO $$
DECLARE
    v_test_user_id uuid;
    v_test_address_id uuid;
    v_can_call_function boolean := false;
BEGIN
    -- Try to find a test user and address
    SELECT p.id INTO v_test_user_id
    FROM profiles p
    WHERE p.role = 'buyer'
    LIMIT 1;
    
    IF v_test_user_id IS NOT NULL THEN
        SELECT ua.id INTO v_test_address_id
        FROM user_addresses ua
        WHERE ua.user_id = v_test_user_id
        LIMIT 1;
        
        IF v_test_address_id IS NOT NULL THEN
            -- We have both user and address, function SHOULD be callable
            -- (We won't actually call it to avoid creating test orders)
            v_can_call_function := true;
        END IF;
    END IF;
    
    IF v_can_call_function THEN
        RAISE NOTICE '✅ TEST 6 PASS: System ready for checkout (found test user with address)';
    ELSE
        RAISE NOTICE '⚠️  TEST 6 WARNING: Cannot test function - no user with address found';
        RAISE NOTICE '   Create a test account and add an address to fully verify';
    END IF;
END $$;

-- ==========================================
-- SUMMARY REPORT
-- ==========================================

SELECT '==================== VERIFICATION SUMMARY ====================' as report;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = 'orders'
                AND kcu.column_name = 'address_id'
                AND ccu.table_name = 'user_addresses'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as "Foreign Key",
    
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('create_pending_checkout', 'confirm_checkout')) >= 2
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as "Functions",
    
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_addresses') > 0
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as "RLS Policies",
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_addresses')
            AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carts')
            AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders')
        THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as "Tables",
    
    CASE 
        WHEN (SELECT COUNT(*) FROM profiles) > 0
            AND (SELECT COUNT(*) FROM products WHERE is_active = true) > 0
        THEN '✅ PASS'
        ELSE '⚠️ WARNING'
    END as "Data";

-- ==========================================
-- DETAILED STATUS
-- ==========================================

SELECT '==================== DETAILED STATUS ====================' as report;

-- Show all foreign keys on orders table
SELECT 
    'Foreign Keys on orders table:' as info,
    kcu.column_name,
    ccu.table_name as references_table,
    ccu.column_name as references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'orders';

-- Show available functions
SELECT 
    'Available Checkout Functions:' as info,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as parameters
FROM pg_proc 
WHERE proname LIKE '%checkout%'
    OR proname LIKE '%order%'
ORDER BY proname;

-- Show RLS status
SELECT 
    'RLS Status:' as info,
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Protected'
        ELSE '⚠️ No policies'
    END as status
FROM pg_policies
WHERE tablename IN ('user_addresses', 'carts', 'cart_items', 'orders', 'sub_orders')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ==========================================
-- NEXT STEPS
-- ==========================================

DO $$
DECLARE
    v_all_pass boolean;
    v_fk_ok boolean;
    v_functions_ok boolean;
BEGIN
    -- Check if all critical tests pass
    SELECT 
        EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_name = 'orders'
                AND kcu.column_name = 'address_id'
                AND ccu.table_name = 'user_addresses'
        ) INTO v_fk_ok;
    
    SELECT 
        (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('create_pending_checkout', 'confirm_checkout')) >= 2
        INTO v_functions_ok;
    
    v_all_pass := v_fk_ok AND v_functions_ok;
    
    RAISE NOTICE '';
    RAISE NOTICE '==================== NEXT STEPS ====================';
    
    IF v_all_pass THEN
        RAISE NOTICE '✅ All critical tests PASSED!';
        RAISE NOTICE '';
        RAISE NOTICE 'Your database is ready for checkout. Next steps:';
        RAISE NOTICE '1. Clear your browser cache and localStorage';
        RAISE NOTICE '2. Log out and log back in to your app';
        RAISE NOTICE '3. Add items to cart';
        RAISE NOTICE '4. Try the checkout flow';
        RAISE NOTICE '';
        RAISE NOTICE 'If checkout still fails, check:';
        RAISE NOTICE '- Browser console for errors (F12)';
        RAISE NOTICE '- Network tab for failed API requests';
        RAISE NOTICE '- Supabase logs for database errors';
    ELSE
        RAISE NOTICE '❌ Some tests FAILED!';
        RAISE NOTICE '';
        
        IF NOT v_fk_ok THEN
            RAISE NOTICE '❌ Foreign key issue:';
            RAISE NOTICE '   Run: fix_address_tables.sql';
        END IF;
        
        IF NOT v_functions_ok THEN
            RAISE NOTICE '❌ Missing functions:';
            RAISE NOTICE '   Run: create_checkout_functions.sql';
        END IF;
        
        RAISE NOTICE '';
        RAISE NOTICE 'After fixing, run this script again to verify.';
    END IF;
    
    RAISE NOTICE '====================================================';
END $$;
