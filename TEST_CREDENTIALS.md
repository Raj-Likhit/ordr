# Ordr Test Credentials

Use these credentials to test the authentication system and verify different user roles and features.

## Test Accounts

### 👤 Buyer Account (Customer)
**Purpose**: Browse products, add to cart, checkout, view orders

```
Email: buyer@ordr.com
Password: buyer123456
Full Name: Arjun Kumar
Role: buyer
```

**What to test:**
- Browse homepage and product catalog
- Search for products
- Add items to cart (grouped by vendor)
- Checkout process with Razorpay (test mode)
- View order history at `/account/orders`
- Manage wishlist at `/account/wishlist`
- Update profile at `/account/settings`

---

### 🏪 Vendor Account 1 (Seller)
**Purpose**: Manage products, fulfill orders, view analytics

```
Email: vendor@ordr.com
Password: vendor123456
Full Name: Priya Sharma
Business Name: Studio Aella
Role: vendor
Status: approved
```

**What to test:**
- Access vendor dashboard at `/vendor/dashboard`
- View incoming orders at `/vendor/orders`
- Manage product listings at `/vendor/products`
- Add new products with variants (size/color)
- Update order statuses (placed → confirmed → shipped → delivered)
- View sales analytics at `/vendor/analytics`
- Manage payout settings at `/vendor/payouts`

---

### 🏪 Vendor Account 2 (Seller)
**Purpose**: Test multi-vendor order splitting

```
Email: vendor2@ordr.com
Password: vendor123456
Full Name: Rahul Mehta
Business Name: Artisan Hands
Role: vendor
Status: approved
```

**What to test:**
- Add products from this vendor to cart alongside Studio Aella products
- Complete checkout to verify orders are split by vendor
- Each vendor sees only their sub-orders

---

### 🛡️ Admin Account (Platform Manager)
**Purpose**: Platform oversight, vendor approvals, refund processing

```
Email: admin@ordr.com
Password: admin123456
Full Name: Admin User
Role: admin
```

**What to test:**
- Access admin dashboard at `/admin/dashboard`
- View platform metrics (GMV, active vendors, pending approvals)
- Manage all orders at `/admin/orders`
- Process refunds at `/admin/refunds`
- Approve/reject vendor applications at `/admin/vendors`
- View all products at `/admin/products`
- System notifications at `/admin/notifications`
- Platform settings at `/admin/settings`

---

## Setting Up Test Accounts

### Option 1: Sign Up Manually
1. Navigate to `/auth/buyer` or `/auth/vendor`
2. Click "Sign Up" / "Create Account"
3. Fill in the credentials above
4. Check console for Supabase auth confirmation (email verification disabled in dev)

### Option 2: Database Seeding (Recommended)

Run the seed script to automatically create all test accounts:

```bash
cd ordr
npm run seed
# or
node scripts/seed.ts
```

This will:
- Create all user accounts in Supabase Auth
- Set up profiles with correct roles
- Create vendor profiles with "approved" status
- Add sample products for each vendor
- Populate categories and sample data

---

## Test Workflows

### 🛒 Complete Purchase Flow
1. **Sign in as Buyer**: `buyer@ordr.com`
2. **Browse products** from multiple vendors
3. **Add to cart**: Items automatically group by vendor
4. **Proceed to checkout**: Add shipping address
5. **Payment**: Use Razorpay test card
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
6. **Verify order**: Check order confirmation email
7. **Track order**: Visit `/account/orders/[id]`

### 📦 Vendor Order Fulfillment
1. **Sign in as Vendor**: `vendor@ordr.com`
2. **View orders**: Navigate to `/vendor/orders`
3. **Update status**: Move order through stages
   - placed → confirmed → shipped → delivered
4. **Add tracking**: Include tracking ID when shipped
5. **Buyer notification**: Email sent automatically

### 🎯 Multi-Vendor Split Order
1. **Sign in as Buyer**: `buyer@ordr.com`
2. **Add products** from both `Studio Aella` and `Artisan Hands`
3. **Checkout**: Single payment, single order created
4. **Verify split**: 
   - Sign in as `vendor@ordr.com` → see only Studio Aella items
   - Sign in as `vendor2@ordr.com` → see only Artisan Hands items
   - Sign in as `admin@ordr.com` → see complete order

### 🛡️ Admin Vendor Approval
1. **Sign up as new vendor**: `/auth/vendor-apply`
2. **Status**: Set to "pending" by default
3. **Sign in as Admin**: `admin@ordr.com`
4. **Navigate to**: `/admin/vendors`
5. **Review application**: Approve or reject
6. **Vendor access**: Once approved, vendor can access portal

### 💰 Refund Processing
1. **Sign in as Admin**: `admin@ordr.com`
2. **Navigate to**: `/admin/refunds`
3. **Select sub-order**: Choose order to refund
4. **Process refund**: Enter amount and reason
5. **Notification**: Buyer receives refund confirmation

---

## Razorpay Test Mode

Use these test cards for payment testing:

### Success Scenarios
- **Domestic (India)**: `4111 1111 1111 1111`
- **International**: `5104 0600 0000 0008`
- **Rupay**: `6076 6000 0000 3409`

### Failure Scenarios
- **Insufficient funds**: `4000 0000 0000 9995`
- **Card declined**: `4000 0000 0000 0002`

**Note**: All test cards work with any:
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: `123456` (for test mode)

---

## Environment Setup

Ensure your `.env.local` has test mode credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_test_xxxxx

RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@ordr.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Quick Access Links

After signing in:

**Buyer**
- Home: `http://localhost:3000`
- Shop: `http://localhost:3000/shop`
- Cart: `http://localhost:3000/cart`
- Orders: `http://localhost:3000/account/orders`

**Vendor**
- Dashboard: `http://localhost:3000/vendor/dashboard`
- Products: `http://localhost:3000/vendor/products`
- Orders: `http://localhost:3000/vendor/orders`

**Admin**
- Dashboard: `http://localhost:3000/admin/dashboard`
- Vendors: `http://localhost:3000/admin/vendors`
- Orders: `http://localhost:3000/admin/orders`

---

## Troubleshooting

### Can't sign in?
- Verify Supabase project is running
- Check `.env.local` has correct credentials
- Clear browser cookies and try again
- Check browser console for errors

### Email verification required?
- In development, email verification is typically disabled
- Check Supabase Auth settings: Disable "Email confirmations"
- Or use the Supabase dashboard to manually verify users

### Payment fails?
- Ensure Razorpay is in test mode
- Use test cards listed above
- Check browser console for Razorpay errors
- Verify webhook signature secret matches

### Orders not splitting?
- Check `process_checkout` RPC function exists
- Verify multiple vendors have products in cart
- Check database `sub_orders` table after checkout

---

## Notes

- All passwords should be at least 6 characters for Supabase
- Email verification is disabled in test/dev environments
- Vendors are auto-approved on signup for testing (change in production)
- Test mode Razorpay requires no actual payment
- Resend emails may not send in dev; check logs instead
