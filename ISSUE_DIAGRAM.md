# Checkout Issue - Visual Breakdown

## The Problem Flow

```
User adds items to cart → Goes to checkout → Enters address → Clicks "Place Order"
                                                                       ↓
                                                            Backend creates order
                                                                       ↓
                                                         Tries to link to address
                                                                       ↓
                                                          ❌ ERROR OCCURS ❌
                                                                       ↓
                                "orders.address_id references addresses.id"
                                                   BUT
                                "address is in user_addresses table"
                                                   ↓
                                    Foreign Key Constraint Violation
```

## Current Database State (BROKEN)

```
┌─────────────────┐
│  user_addresses │  ← Your app stores addresses here
│  ─────────────  │
│  id (PK)        │
│  user_id        │
│  address_line1  │
│  city, state... │
└─────────────────┘
        ↑
        │ (No connection)
        │
        ↓
┌─────────────────┐       ┌─────────────────┐
│     orders      │   ✗   │    addresses    │  ← Old/unused table
│  ─────────────  │   →   │  ─────────────  │
│  id (PK)        │       │  id (PK)        │
│  buyer_id       │       │  buyer_id       │
│  address_id (FK)│───────│  line1          │
│  total_amount   │       │  city, state... │
│  payment_status │       └─────────────────┘
└─────────────────┘
      (Points to wrong table!)
```

## Fixed Database State (CORRECT)

```
┌─────────────────┐
│  user_addresses │  ← Your app stores addresses here
│  ─────────────  │
│  id (PK)        │◄─────────────┐
│  user_id        │              │
│  address_line1  │              │ Correct
│  city, state... │              │ Foreign Key
└─────────────────┘              │
                                 │
┌─────────────────┐              │
│     orders      │              │
│  ─────────────  │              │
│  id (PK)        │              │
│  buyer_id       │              │
│  address_id (FK)│──────────────┘
│  total_amount   │
│  payment_status │
└─────────────────┘
```

## Checkout Flow (Step by Step)

### Current Flow (BROKEN)

```
1. User clicks "Place Order"
   ↓
2. POST /api/checkout/create-order
   {
     address_id: "uuid-from-user_addresses-table",
     payment_method: "razorpay"
   }
   ↓
3. Backend gets cart items ✅
   - Fetches from carts + cart_items tables
   - Validates cart is not empty
   ↓
4. Backend calls create_pending_checkout() ❌
   - Function doesn't exist
   - OR function tries to insert into orders
   - address_id references user_addresses
   - BUT orders.address_id FK points to addresses table
   ↓
5. Database rejects INSERT ❌
   ERROR: foreign key constraint "orders_address_id_fkey" violated
   ↓
6. Error returns to user: "Cart is empty" or "Foreign key violation"
```

### Fixed Flow (WORKING)

```
1. User clicks "Place Order"
   ↓
2. POST /api/checkout/create-order
   {
     address_id: "uuid-from-user_addresses-table",
     payment_method: "razorpay"
   }
   ↓
3. Backend gets cart items ✅
   - Fetches from carts + cart_items tables
   - Validates cart is not empty
   ↓
4. Backend calls create_pending_checkout() ✅
   - Function EXISTS
   - Validates address belongs to user
   - Checks stock availability
   - Creates order in orders table
   - address_id correctly references user_addresses
   ↓
5. Database accepts INSERT ✅
   - Foreign key constraint satisfied
   - Order created with status: "pending"
   - Sub-orders created per vendor
   - Order items created
   ↓
6. Razorpay order created ✅
   ↓
7. User completes payment ✅
   ↓
8. confirm_checkout() called ✅
   - Updates order status to "paid"
   - Decrements stock
   - Clears cart
   ↓
9. Success! Order confirmed ✅
```

## Cart Sync Flow

### How Cart Should Work

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                           │
└──────────────────────────────────────────────────────────────┘
                              │
    User adds item            │
    to cart                   ↓
                     ┌─────────────────┐
                     │   Zustand Store │
                     │   (localStorage)│
                     │                 │
                     │ - items: []     │
                     │ - count: 0      │
                     └─────────────────┘
                              │
                              │ Sync via API
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                       SERVER SIDE                            │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
                    POST /api/cart/items
                              │
                              ↓
                    ┌──────────────────┐
                    │  CartService     │
                    │  addToCart()     │
                    └──────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │  CartRepository  │
                    │  - findCart()    │
                    │  - addItem()     │
                    └──────────────────┘
                              │
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                         DATABASE                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │   carts table    │
                    │   cart_items     │
                    └──────────────────┘
```

### Possible Cart Issues

```
Issue 1: Items only in localStorage, not in database
┌────────────────┐
│ localStorage   │  ✅ Has items
└────────────────┘
        ↓ (Sync failed)
┌────────────────┐
│   Database     │  ❌ Empty
└────────────────┘

Fix: Check /api/cart/items endpoint for errors


Issue 2: Items in database, but checkout can't read them
┌────────────────┐
│ localStorage   │  ✅ Has items
└────────────────┘
        ↓
┌────────────────┐
│   Database     │  ✅ Has items
└────────────────┘
        ↓ (Read failed)
┌────────────────┐
│   Checkout     │  ❌ Sees empty
└────────────────┘

Fix: Check RLS policies on carts and cart_items tables


Issue 3: User not authenticated properly
┌────────────────┐
│  User session  │  ❌ Invalid/expired
└────────────────┘
        ↓
┌────────────────┐
│   Database     │  ❌ Can't read cart (RLS blocks)
└────────────────┘

Fix: Log out and log back in
```

## Required Database Functions

### create_pending_checkout()

```sql
Purpose: Reserve stock and create pending order

Input:
  - buyer_id: UUID
  - address_id: UUID (from user_addresses!)
  - total_amount: number

Process:
  1. Find buyer's cart
  2. Validate cart has items
  3. Validate address belongs to user
  4. Check stock for all items
  5. Create order (status: pending)
  6. Create sub_orders (one per vendor)
  7. Create order_items
  8. Do NOT clear cart yet (in case payment fails)
  9. Do NOT decrement stock yet

Output:
  - order_id: UUID
```

### confirm_checkout()

```sql
Purpose: Finalize order after payment

Input:
  - order_id: UUID
  - razorpay_order_id: string
  - razorpay_payment_id: string

Process:
  1. Update order status to "paid"
  2. Decrement stock for all items
  3. Clear buyer's cart
  4. Update sub_order statuses
  5. Create status history entries

Output:
  - void (success or exception)
```

## Data Flow Summary

```
┌────────────┐    ┌───────────────┐    ┌──────────────┐
│   Browser  │───▶│  Next.js API  │───▶│   Supabase   │
│            │◀───│   Routes      │◀───│   Database   │
└────────────┘    └───────────────┘    └──────────────┘
     │                    │                    │
     │                    │                    │
  Zustand            CartService         carts table
localStorage        PaymentService      cart_items
  useCart           CartRepository      orders
                    PaymentRepo         sub_orders
                                       order_items
                                       user_addresses ✅
                                       (NOT addresses ❌)
```

## Testing Checklist

```
Pre-Test Setup:
□ Run fix_address_tables.sql
□ Run create_checkout_functions.sql
□ Clear browser localStorage
□ Log out and back in

Test Steps:
□ Add item to cart
□ Verify item shows on cart page
□ Run diagnostic query to check database
□ Go to checkout
□ Add/select shipping address
□ Click "Place Order"

Success Indicators:
✅ No errors in console
✅ Redirected to payment page OR order confirmation
✅ Order exists in database with status "paid" or "pending"
✅ Cart is cleared after successful checkout

Failure Indicators:
❌ "Cart is empty" error
❌ "Foreign key violation" error  
❌ "Address not found" error
❌ Console shows red errors
❌ Network tab shows 400/500 errors
```

## Summary

**The core issue**: Database schema mismatch - foreign key pointing to wrong table

**The fix**: Update foreign key + create missing functions

**Time to fix**: ~10 minutes

**Complexity**: Low (follow SQL scripts)

**Risk**: Low (fixes are non-destructive)

---

**Next Step**: Open `QUICK_FIX_SUMMARY.md` and follow the steps!
