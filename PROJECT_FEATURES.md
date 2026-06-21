# Ordr - Multi-Vendor E-Commerce Platform
## Project Feature Documentation

---

## 📋 Executive Summary

**Ordr** is a full-stack, multi-vendor e-commerce platform built with **Next.js 14**, **Supabase**, **TypeScript**, and **Tailwind CSS**. The platform connects independent artisans and sellers with customers, enabling them to sell handcrafted and curated products through a modern, secure, and scalable marketplace.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Storage + RLS)
- **Payment Gateway**: Razorpay (UPI, Cards, Netbanking, Wallets, COD)
- **State Management**: Zustand with persistence
- **Email**: Resend
- **PDF Generation**: React-PDF, jsPDF
- **Charts**: Recharts
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions, Husky, Commitlint, Lint-staged

---

## 🎯 Core Platform Roles

### 1. **Buyer (Customer)**
End users who browse, purchase, and review products.

### 2. **Vendor (Seller)**
Independent sellers/artisans who list products, manage inventory, fulfill orders, and track revenue.

### 3. **Admin (Platform Manager)**
Platform administrators who oversee vendors, orders, refunds, analytics, and marketplace operations.

---

## 🛍️ Buyer Features

### 🏠 Storefront & Discovery
- **Homepage**
  - Hero section with parallax animation
  - Featured product carousel
  - Category tiles (Handcrafted, Home Decor, Jewelry, Wellness, Tech, Apparel)
  - Trending products section
  - Trust bar (Authentic Artisans, Secure Payments, Curated Quality)
  - Vendor spotlight
  - Recently viewed products

- **Shop Page**
  - Advanced filtering system:
    - Filter by category
    - Filter by vendor
    - Filter by price range
    - Filter by rating (1-5 stars)
    - Filter by material
    - Filter by color
  - Sort options (Featured, Price: Low to High, High to Low, Newest, Top Rated)
  - Real-time search functionality
  - Mobile filter drawer
  - Responsive product grid
  - Product card with quick view
  - Lazy loading and image optimization

- **Product Detail Page**
  - Image gallery with lightbox
  - Product variants (size, color) selector
  - Price display
  - Vendor information tab
  - Add to cart / Quick add
  - Sticky add-to-cart on scroll
  - Product reviews and ratings
  - Review summary bar with rating breakdown
  - Frequently bought together suggestions
  - Product Q&A section
  - Pincode checker for delivery availability
  - Product specifications and description

### 🛒 Shopping Cart
- **Guest Cart Support**: Cart persists locally before login
- **Authenticated Cart**: Syncs with database after authentication
- **Cart Features**:
  - View all cart items grouped by vendor
  - Update item quantities
  - Remove items
  - Apply coupon/promo codes
  - Real-time price calculations
  - Shipping cost estimation
  - GST (18%) calculation
  - Free shipping threshold indicator (₹5000+)
  - Cart drawer (mobile-friendly)
  - Save for later functionality

### 💳 Checkout & Payment
- **Address Management**:
  - Add multiple shipping addresses
  - Set default shipping/billing addresses
  - Address validation
  - Phone number input with country code
  
- **Payment Options**:
  - **Razorpay Integration**:
    - UPI payments
    - Credit/Debit cards
    - Netbanking
    - Wallets (PayTM, PhonePe, etc.)
  - **Cash on Delivery (COD)**

- **Order Processing**:
  - Multi-vendor order splitting (orders split into sub-orders per vendor)
  - Promo code validation and application
  - Real-time payment verification
  - Secure payment signature validation
  - Order confirmation page with order details
  - Email notifications (order confirmation, shipping updates)

### 📦 Order Management
- **My Orders Page**:
  - View all orders (past and current)
  - Order status tracking (Placed → Confirmed → Shipped → Delivered)
  - Order timeline with status updates
  - Sub-order details (grouped by vendor)
  - Order details (items, pricing, address, payment method)
  - Reorder functionality
  - Download invoice (PDF)
  - Track shipment

- **Order Confirmation**:
  - Order summary with items
  - Estimated delivery date
  - Payment status
  - Shipping address
  - Order ID and invoice number

### 👤 Account Features
- **Profile Management**:
  - Update personal information (name, email, phone)
  - Update avatar
  - Update date of birth and gender
  - Change password

- **Wishlist**:
  - Create multiple wishlist groups
  - Add/remove products from wishlist
  - Move items to cart
  - Share wishlist

- **Settings**:
  - Notification preferences
  - Email subscription management
  - Account security settings

### ⭐ Reviews & Ratings
- **Product Reviews**:
  - Write product reviews (1-5 star rating)
  - Upload review images
  - Edit/delete own reviews
  - View all reviews with filtering (Most Recent, Highest Rated, Lowest Rated)
  - Verified purchase badge
  - Helpful votes on reviews

### 🔍 Search & Navigation
- **Global Search**:
  - Real-time search across products
  - Search suggestions
  - Search by product name, category, vendor

- **Navigation**:
  - Sticky header with cart count
  - Bottom navigation (mobile)
  - Breadcrumb navigation
  - Page transitions with animations

### 🎨 User Experience
- **Onboarding**:
  - Interactive product tour for new users
  - Name capture modal for personalization
  - Feature highlights and tooltips
  
- **UI/UX Features**:
  - Responsive design (mobile-first)
  - Dark mode support (CSS variables)
  - Toast notifications for feedback
  - Skeleton loaders for better perceived performance
  - Smooth page transitions with Framer Motion
  - Parallax scrolling effects
  - Animated grid layouts
  - Progressive image loading

---

## 🏪 Vendor Features

### 📊 Vendor Dashboard
- **KPI Metrics**:
  - 30-day revenue
  - Store views (last 30 days)
  - Conversion rate (orders/views)
  - Pending orders count
  - Low stock alerts
  - Pending payouts

- **Analytics & Charts**:
  - Revenue chart (daily breakdown for 30 days)
  - Top-selling products chart
  - Order status distribution chart
  - Product performance metrics

- **Quick Actions**:
  - View recent orders
  - Update inventory
  - Check pending payouts
  - Respond to product questions

### 📦 Order Management (Vendor)
- **Orders Dashboard**:
  - View all vendor orders
  - Filter by status (Placed, Confirmed, Shipped, Delivered, Cancelled)
  - Order search functionality
  - Order pipeline visualization
  
- **Order Details Panel**:
  - View customer details
  - View order items
  - Update order status
  - Bulk fulfillment modal (mark multiple orders as shipped)
  - Generate packing slips
  - Print shipping labels

- **Order Status Updates**:
  - Confirm order
  - Mark as shipped (with tracking details)
  - Mark as delivered
  - Cancel order (with reason)
  - Process returns/refunds

### 📦 Product Management
- **Product Listing**:
  - Add new products
  - Edit existing products
  - Delete products
  - Bulk product actions
  - Product table with sorting and filtering

- **Product Details**:
  - Title, description, specifications
  - Base price
  - Category assignment
  - Product images (multiple uploads)
  - Image drag-and-drop zone
  - Image preview and reordering

- **Product Variants**:
  - Add multiple variants (size, color combinations)
  - Variant-specific pricing
  - Variant-specific SKU
  - Variant stock levels
  - Variant editor interface

### 📊 Inventory Management
- **Inventory Panel**:
  - View all product variants
  - Stock status indicators (In Stock, Low Stock, Out of Stock)
  - Low stock alerts
  - Update stock quantities
  - Bulk inventory updates

### 💰 Payouts & Revenue
- **Payouts Panel**:
  - View payout history
  - Pending payouts
  - Completed payouts
  - Payout amount breakdown
  - Razorpay payout integration
  - Request payout

- **Revenue Tracking**:
  - Gross revenue
  - Net revenue (after platform fees)
  - Platform commission calculation
  - Revenue trends over time

### ❓ Product Q&A
- **Questions Dashboard**:
  - View all customer questions on products
  - Answer questions
  - Edit answers
  - Delete inappropriate questions

### 🎯 Promotions
- **Promo Codes**:
  - Create discount codes
  - Set discount type (percentage/fixed)
  - Set discount value
  - Set validity period
  - Set usage limits
  - Track promo usage

### ⚙️ Vendor Settings
- **Business Profile**:
  - Business name
  - Business description
  - Business logo
  - Contact information
  - Business address

- **Razorpay Onboarding**:
  - Connect Razorpay account
  - Verify bank details
  - Enable payouts

### 📝 Vendor Onboarding
- **Application Process**:
  - Vendor application form
  - Business verification
  - Document upload (GST, PAN, Business license)
  - Admin approval workflow
  - Pending approval status page

---

## 👨‍💼 Admin Features

### 📊 Platform Dashboard
- **Platform Metrics**:
  - Total GMV (Gross Merchandise Value)
  - Active vendors count
  - Pending vendor approvals
  - Total orders
  - Platform revenue

- **Analytics**:
  - Platform-wide revenue chart (30-day trend)
  - Order status distribution chart
  - Vendor performance metrics

### 🏪 Vendor Management
- **Vendor Approval Queue**:
  - View pending vendor applications
  - Approve/reject vendors
  - View vendor details and documents
  - Vendor status badges (Pending, Approved, Suspended)

- **Vendor Actions**:
  - Suspend vendor accounts
  - Reactivate vendors
  - View vendor sales history
  - Manage vendor commissions

### 📦 Order Management (Admin)
- **Orders Dashboard**:
  - View all platform orders
  - Filter by vendor, status, date
  - Search orders
  - Order analytics

- **Order Actions**:
  - View order details
  - Process refunds
  - Cancel orders
  - Override order status

### 💸 Refunds & Returns
- **Refunds Panel**:
  - View all refund requests
  - Approve/reject refunds
  - Initiate refunds via Razorpay
  - Refund history

- **Returns Management**:
  - View return requests
  - Approve/reject returns
  - Track return shipments

### 📦 Product Management (Admin)
- **Product Moderation**:
  - View all products across vendors
  - Edit product details
  - Remove inappropriate products
  - Feature products on homepage

### 📂 Category Management
- **Categories**:
  - Create new categories
  - Edit categories
  - Delete categories
  - Assign products to categories

### 💰 Payouts Management
- **Platform Payouts**:
  - View pending payouts
  - Approve/reject payout requests
  - Payout history
  - Vendor earnings breakdown

### 📧 Communications
- **Notifications Panel**:
  - Send platform-wide announcements
  - Send vendor-specific messages
  - Email campaign management

### ⚙️ Settings
- **Platform Settings**:
  - Platform commission rate
  - Shipping fee configuration
  - Free shipping threshold
  - Tax settings (GST rate)
  - Payment gateway configuration

---

## 🔐 Authentication & Authorization

### 🔑 Authentication System
- **Supabase Auth Integration**:
  - Email/password authentication
  - Magic link login
  - OAuth providers (Google, GitHub - configurable)
  - JWT-based session management
  - Server-side and client-side auth

- **User Flows**:
  - Buyer signup/login
  - Vendor signup/login
  - Password reset
  - Email verification
  - Session persistence

### 🛡️ Authorization & RLS
- **Row Level Security (RLS)**:
  - Fine-grained access control on database tables
  - Users can only access their own data
  - Vendors can only manage their own products/orders
  - Admins have elevated permissions

- **Role-Based Access Control**:
  - Buyer role: Access to storefront, cart, orders, wishlist
  - Vendor role: Access to vendor dashboard, products, orders, payouts
  - Admin role: Access to admin dashboard, all orders, vendors, products

- **Protected Routes**:
  - `/account/*` - Requires buyer authentication
  - `/vendor/*` - Requires vendor role
  - `/admin/*` - Requires admin role
  - Automatic redirects for unauthorized access

---

## 🔔 Notifications & Communications

### 📧 Email Notifications
- **Transactional Emails** (via Resend):
  - Order confirmation
  - Order shipped notification
  - Order delivered notification
  - Payment confirmation
  - Vendor application status
  - Payout confirmation

### 🔔 In-App Notifications
- **Notification System**:
  - Real-time notifications
  - Notification badge count
  - Mark as read/unread
  - Notification preferences

---

## 📊 Analytics & Tracking

### 📈 Product Analytics
- **Page Views Tracking**:
  - Track product page views
  - Visitor analytics
  - Conversion tracking (views → orders)

### 📊 Vendor Analytics
- **Performance Metrics**:
  - Sales trends
  - Revenue breakdown
  - Top-selling products
  - Order volume
  - Customer acquisition

### 📊 Platform Analytics (Admin)
- **GMV Tracking**:
  - Total platform revenue
  - Revenue by vendor
  - Revenue trends
  - Commission earnings

---

## 💾 Data Models & Database

### Core Tables
1. **profiles**: User profiles (buyers, vendors, admins)
2. **vendor_profiles**: Vendor-specific data (business info, status, documents)
3. **products**: Product catalog
4. **product_variants**: Product variations (size, color, SKU, price)
5. **cart**: Shopping carts
6. **cart_items**: Cart line items
7. **orders**: Customer orders
8. **sub_orders**: Vendor-specific order splits
9. **user_addresses**: Shipping/billing addresses
10. **reviews**: Product reviews and ratings
11. **wishlist_groups**: User wishlist collections
12. **wishlist_items**: Products in wishlists
13. **promotions**: Discount codes and coupons
14. **page_views**: Product view analytics
15. **notifications**: In-app notifications
16. **vendor_documents**: Uploaded vendor verification docs

---

## 💳 Payment Integration

### Razorpay Integration
- **Payment Gateway Features**:
  - Secure payment processing
  - Multiple payment methods (UPI, Cards, Netbanking, Wallets)
  - Payment signature verification
  - Webhook support for payment events
  - Refund processing
  - Test mode and production mode support

- **Order Creation Flow**:
  1. Create order on backend
  2. Generate Razorpay order ID
  3. Open Razorpay checkout widget
  4. User completes payment
  5. Verify payment signature
  6. Update order status
  7. Send confirmation email

- **Vendor Payouts**:
  - Razorpay X integration
  - Automated payout disbursement
  - Vendor bank account linking
  - Payout scheduling

---

## 📱 Mobile Responsiveness

### Mobile-First Design
- **Responsive Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

- **Mobile-Specific Features**:
  - Bottom navigation bar
  - Mobile filter drawer
  - Touch-friendly UI elements
  - Swipe gestures
  - Mobile-optimized checkout

---

## 🎨 UI/UX Features

### Design System
- **CSS Variables** for theming:
  - Color palette (primary, accent, text, background)
  - Typography scale
  - Spacing system
  - Border radius
  - Shadows

- **Animations**:
  - Framer Motion page transitions
  - Parallax scrolling
  - Animated grid reveals
  - Skeleton loaders
  - Smooth hover effects

- **Components Library**:
  - Button variants
  - Input fields (text, phone, select, textarea)
  - Modal/Dialog
  - Drawer (side panel)
  - Toast notifications
  - Badge
  - Skeleton loaders
  - Spinner
  - Star rating
  - Range slider
  - Tabs
  - Checkbox
  - Toggle
  - Empty states

---

## 🚀 Performance Optimizations

### Next.js Optimizations
- **Incremental Static Regeneration (ISR)**:
  - Homepage revalidates every hour
  - Product pages with on-demand revalidation

- **Image Optimization**:
  - Next.js Image component
  - Automatic WebP conversion
  - Lazy loading
  - Blur placeholders

- **Code Splitting**:
  - Automatic route-based code splitting
  - Dynamic imports for heavy components

- **Caching**:
  - Redis for session management
  - Zustand with localStorage persistence

### Database Optimizations
- **Indexing**:
  - Indexed columns for faster queries
  - Composite indexes for common queries

- **Query Optimization**:
  - Selective field fetching
  - Paginated results
  - Efficient joins

---

## 🔒 Security Features

### Application Security
- **Input Validation**:
  - Zod schema validation
  - Server-side validation for all inputs
  - SQL injection prevention (Supabase parameterized queries)

- **CSRF Protection**:
  - SameSite cookie attributes
  - CSRF tokens for sensitive operations

- **XSS Prevention**:
  - React's built-in XSS protection
  - Content Security Policy headers

- **Authentication Security**:
  - JWT token validation
  - HTTP-only cookies
  - Secure session management
  - Rate limiting on auth endpoints

- **Payment Security**:
  - PCI-compliant payment handling (via Razorpay)
  - Payment signature verification
  - Encrypted payment data

### Row Level Security (RLS)
- **Supabase RLS Policies**:
  - Users can only view/edit their own profiles
  - Vendors can only manage their own products
  - Buyers can only view their own orders
  - Admins have elevated but controlled access

---

## 🧪 Testing & Quality Assurance

### Testing Infrastructure
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Testing utilities** for DOM assertions

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** pre-commit hooks
- **Commitlint** for conventional commits
- **Lint-staged** for staged file linting

---

## 🔄 CI/CD & DevOps

### GitHub Actions
- **Continuous Integration**:
  - Automated testing on push
  - Linting checks
  - Build verification

### Deployment
- **Hosting**: Vercel (recommended) or self-hosted
- **Database**: Supabase managed PostgreSQL
- **Environment Management**:
  - Development
  - Staging
  - Production

---

## 📦 Key Dependencies

### Production Dependencies
- `next@14.2.3` - React framework
- `react@18` - UI library
- `@supabase/supabase-js@^2.108.2` - Database & Auth
- `@supabase/ssr@^0.12.0` - SSR support
- `razorpay@^2.9.6` - Payment gateway
- `zustand@^5.0.14` - State management
- `framer-motion@^12.40.0` - Animations
- `recharts@^3.8.1` - Charts
- `resend@^3.2.0` - Email service
- `zod@^4.4.3` - Schema validation
- `date-fns@^4.4.0` - Date utilities
- `lucide-react@^0.378.0` - Icon library
- `@react-pdf/renderer@^3.4.4` - PDF generation
- `tailwindcss@^4.3.1` - Styling

### Development Dependencies
- `typescript@^5` - Type checking
- `eslint@^8` - Linting
- `prettier@^3.5.1` - Formatting
- `jest@^30.4.2` - Testing
- `@testing-library/react@^16.3.2` - Testing utilities
- `husky@^9.1.7` - Git hooks

---

## 🌟 Unique Selling Points

1. **Multi-Vendor Architecture**: Seamless vendor onboarding and management
2. **Order Splitting**: Automatic order splitting by vendor
3. **Comprehensive Analytics**: Deep insights for vendors and admins
4. **Mobile-First Design**: Optimized for mobile commerce
5. **Secure Payments**: Razorpay integration with multiple payment options
6. **Real-Time Sync**: Cart and inventory sync across devices
7. **Modern Tech Stack**: Built with latest Next.js 14 App Router
8. **Scalable Database**: Supabase with RLS for security
9. **Rich UI/UX**: Animations, transitions, and delightful interactions
10. **SEO Optimized**: Server-side rendering and ISR for better SEO

---

## 📈 Future Enhancements (Roadmap Ideas)

- [ ] Real-time chat support (buyer-vendor)
- [ ] Advanced recommendation engine
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Subscription products
- [ ] Affiliate marketing program
- [ ] Social media integration (Instagram shopping)
- [ ] Mobile app (React Native)
- [ ] AR/VR product preview
- [ ] Loyalty program and rewards
- [ ] Gift cards and vouchers
- [ ] Advanced inventory forecasting
- [ ] Dropshipping support
- [ ] Bulk order discounts
- [ ] Auction/bidding system

---

## 📞 Support & Documentation

### For Developers
- Well-documented codebase with TypeScript types
- Modular component architecture
- Service layer abstraction for business logic
- API route documentation

### For Users
- Onboarding tour for new users
- Contextual help tooltips
- FAQ sections
- Contact support page

---

## 🏆 Conclusion

**Ordr** is a production-ready, feature-rich multi-vendor e-commerce platform designed to empower independent sellers and provide customers with a seamless shopping experience. With its modern tech stack, robust security, and comprehensive feature set, it's built to scale and adapt to evolving business needs.

---

**Generated on**: ${new Date().toLocaleDateString('en-IN')}
**Project Name**: Ordr
**Version**: 0.1.0
**Tech Stack**: Next.js 14, Supabase, TypeScript, Tailwind CSS, Razorpay
