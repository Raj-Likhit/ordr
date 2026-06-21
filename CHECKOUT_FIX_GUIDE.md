# Checkout Error Fix Guide

## Problem Summary

You're encountering the error: **"insert or update on table 'orders' violates foreign key constraint 'orders_address_id_fkey'"**

This is caused by a mismatch between database tables:
- The `orders` table references the `addresses` table
- Your application uses the `user_addresses` table
- Cart data may not be properly synced between client and server

## Root Causes

1. **Address Table Mismatch**: Foreign key constraint points to wrong table
2. **Missing RPC Functions**: `create_pending_checkout` and `confirm_checkout` functions don't exist
3. **Cart Sync Issues**: Client-side cart may not be syncing with database properly

## Step-by-Step Fix

### Step 1: Run Database Migration Scripts

Execute these SQL files in your Supabase SQL Editor in this order:

#### 1.1 Fix Address Table Reference
```bash
# Run: fix_address_tables.sql
```

This script will:
- Drop the old foreign key constraint
- Add new constraint pointing to `user_addresses`
- Set up proper RLS policies
- Optionally migrate data from old `addresses` table

#### 1.2 Create Missing Checkout Functions
```bash
# Run: create_checkout_functions.sql
```

This script creates:
- `create_pending_checkout()` - Reserves stock and creates pending order
- `confirm_checkout()` - Confirms payment and finalizes order
- `cancel_expired_orders()` - Cleanup expired orders

### Step 2: Verify Database State

Run these diagnostic queries in Supabase SQL Editor:

```sql
-- Check if user_addresses table exists and has data
SELECT COUNT(*) as address_count FROM user_addresses;

-- Check if your user has addresses
SELECT * FROM user_addresses WHERE user_id = '<YOUR_USER_ID>';

-- Check if orders table constraint is correct
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS foreign_table_name
FROM pg_constraint
WHERE conname = 'orders_address_id_fkey';
-- Should show: user_addresses (not addresses)

-- Check if cart has items
SELECT 
    c.id as cart_id,
    c.buyer_id,
    COUNT(ci.id) as item_count
FROM carts c
LEFT JOIN cart_items ci ON ci.cart_id = c.id
WHERE c.buyer_id = '<YOUR_USER_ID>'
GROUP BY c.id, c.buyer_id;

-- Check if RPC functions exist
SELECT 
    proname as function_name,
    prokind as kind
FROM pg_proc 
WHERE proname IN ('create_pending_checkout', 'confirm_checkout', 'cancel_expired_orders');
-- Should return 3 rows
```

### Step 3: Test Cart Functionality

1. **Clear your browser's localStorage**:
   ```javascript
   // Open browser console and run:
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Log out and log back in**

3. **Add items to cart again**

4. **Check cart in database**:
   ```sql
   -- Replace with your user ID
   SELECT 
       c.id,
       ci.id as item_id,
       ci.quantity,
       pv.id as variant_id,
       p.title as product_title
   FROM carts c
   JOIN cart_items ci ON ci.cart_id = c.id
   JOIN product_variants pv ON pv.id = ci.variant_id
   JOIN products p ON p.id = pv.product_id
   WHERE c.buyer_id = '<YOUR_USER_ID>';
   ```

### Step 4: Test Checkout Flow

1. Add items to cart
2. Go to checkout page
3. Add a shipping address
4. Try to place order

If you still get errors, check browser console and network tab for detailed error messages.

## Common Issues and Solutions

### Issue 1: "Cart is empty" error

**Cause**: Cart data not syncing to database

**Solution**:
```javascript
// In browser console, check cart state:
const cartState = JSON.parse(localStorage.getItem('ordr-cart-storage'));
console.log('Cart state:', cartState);

// If cart has items locally but not in DB, the sync failed
// Check Network tab for failed /api/cart/items requests
```

**Fix**: Check these files for errors:
- `hooks/useCart.tsx` - syncWithDatabase function
- `app/api/cart/items/route.ts` - POST endpoint
- `src/modules/cart/cart.repository.ts` - addItem method

### Issue 2: "Invalid address_id" error

**Cause**: Address wasn't saved properly or belongs to different user

**Solution**:
```sql
-- Check if address exists and belongs to user
SELECT * FROM user_addresses 
WHERE id = '<ADDRESS_ID>' 
AND user_id = '<USER_ID>';
```

**Fix**: Ensure address is saved before checkout:
- Check `app/api/users/addresses/route.ts`
- Verify RLS policies allow users to insert addresses

### Issue 3: "Insufficient stock" error

**Cause**: Product variant stock is 0 or less than quantity

**Solution**:
```sql
-- Check variant stock
SELECT 
    pv.id,
    pv.size,
    pv.color,
    pv.stock,
    p.title
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.id = '<VARIANT_ID>';

-- Update stock if needed (as admin)
UPDATE product_variants 
SET stock = 100 
WHERE id = '<VARIANT_ID>';
```

### Issue 4: RLS Policy Blocking Queries

**Cause**: Row Level Security preventing user from accessing data

**Solution**: Check RLS policies:
```sql
-- Disable RLS temporarily for testing (DO NOT DO IN PRODUCTION)
ALTER TABLE user_addresses DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable it
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
```

## Additional Debugging

### Enable Detailed Logging

Add logging to `app/api/checkout/create-order/route.ts`:

```typescript
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('🔍 User ID:', user.id);

    const body = await request.json();
    console.log('📦 Request body:', body);

    const result = CreateCheckoutDto.safeParse(body);
    if (!result.success) {
      console.error('❌ Validation failed:', result.error);
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { address_id, payment_method, coupon_code } = result.data;
    console.log('✅ Validated data:', { address_id, payment_method, coupon_code });

    const cartService = new CartService(new CartRepository());
    const cart = await cartService.getCart(user.id);
    
    console.log('🛒 Cart data:', {
      cartId: cart?.id,
      itemCount: cart?.items?.length || 0,
      items: cart?.items?.map(i => ({
        id: i.id,
        variantId: i.variant_id,
        quantity: i.quantity
      }))
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      console.error('❌ Cart is empty or null');
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    console.log('💳 Processing checkout...');
    const paymentService = new PaymentService(new PaymentRepository());
    const response = await paymentService.processCheckout(
      user.id, 
      address_id, 
      cart.items, 
      payment_method, 
      coupon_code
    );
    
    console.log('✅ Checkout successful:', response);
    return NextResponse.json(response);
    
  } catch (err: any) {
    console.error("💥 Checkout error:", err);
    return NextResponse.json({ 
      error: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: err.status || 500 });
  }
}
```

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click on "Logs" in sidebar
3. Select "Postgres Logs"
4. Look for errors around the time you tried to checkout

### Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try checkout again
4. Look for failed requests (red)
5. Click on the failed request to see details

## Verification Checklist

After applying fixes, verify:

- [ ] `user_addresses` table exists and has RLS policies
- [ ] `orders.address_id` foreign key points to `user_addresses.id`
- [ ] `create_pending_checkout` function exists
- [ ] `confirm_checkout` function exists
- [ ] User can create addresses
- [ ] User can add items to cart
- [ ] Cart items appear in database
- [ ] Cart items show on cart page
- [ ] Checkout page loads without errors
- [ ] Can select/add shipping address
- [ ] Can proceed to payment
- [ ] Order is created successfully

## Need More Help?

If you're still having issues:

1. **Export your exact error**: Share the complete error from browser console
2. **Share logs**: Copy Supabase Postgres logs from the time of error
3. **Confirm user ID**: Share your test user's ID (UUID)
4. **Check data**: Run diagnostic queries and share results

## Prevention

To prevent future issues:

1. **Keep schema consistent**: Ensure all tables are created via migrations
2. **Test thoroughly**: Test checkout flow after any schema changes
3. **Use TypeScript**: Helps catch type mismatches early
4. **Monitor logs**: Regularly check Supabase logs for errors
5. **Version control migrations**: Always version control your SQL migration files

---

**Last Updated**: ${new Date().toLocaleDateString()}
**Status**: Ready for testing
