const fs = require('fs');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

// Read the markdown file
const markdown = fs.readFileSync('DEMO_SCRIPT_4MIN.md', 'utf-8');

// Create PDF
const doc = new jsPDF();

// Set up colors
const primaryColor = [0, 0, 0];
const accentColor = [200, 75, 15];
const grayColor = [100, 100, 100];

// Title page
doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
doc.rect(0, 0, 210, 40, 'F');

doc.setTextColor(255, 255, 255);
doc.setFontSize(32);
doc.setFont('helvetica', 'bold');
doc.text('Ordr', 105, 20, { align: 'center' });

doc.setFontSize(16);
doc.setFont('helvetica', 'normal');
doc.text('4-Minute Demo Script', 105, 30, { align: 'center' });

doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.setFontSize(12);
doc.text('Multi-Vendor E-Commerce Platform', 105, 50, { align: 'center' });

doc.setFontSize(10);
doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
doc.text('Duration: 4 minutes | Target: Stakeholders, Investors, Technical Reviewers', 105, 60, { align: 'center' });

// Add a new page for content
doc.addPage();

let yPosition = 20;
const pageHeight = 297;
const marginBottom = 20;

// Helper function to add text with wrapping
function addText(text, size = 10, style = 'normal', color = primaryColor) {
  doc.setFontSize(size);
  doc.setFont('helvetica', style);
  doc.setTextColor(color[0], color[1], color[2]);
  
  const lines = doc.splitTextToSize(text, 170);
  
  lines.forEach(line => {
    if (yPosition > pageHeight - marginBottom) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, 20, yPosition);
    yPosition += size * 0.5;
  });
  
  yPosition += 3;
}

// Helper function to add section header
function addSection(title, emoji = '') {
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }
  
  yPosition += 5;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPosition - 5, 180, 10, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`${emoji} ${title}`, 20, yPosition + 2);
  yPosition += 10;
}

// Helper function to add bullet point
function addBullet(text) {
  if (yPosition > pageHeight - marginBottom) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  
  doc.circle(22, yPosition - 1.5, 0.8, 'F');
  
  const lines = doc.splitTextToSize(text, 160);
  lines.forEach((line, index) => {
    doc.text(line, 26, yPosition);
    yPosition += 5;
  });
}

// Parse and add content
addSection('OPENING (0:00 - 0:30)', '🎬');
addText('Visual Cue: Landing Page', 11, 'bold');
addText('Screen: Homepage with hero section and product grid');
yPosition += 2;

addText('Script:', 11, 'bold');
addText('"Welcome to Ordr - a modern multi-vendor e-commerce platform connecting independent artisans with customers. Built with Next.js 14, Supabase, and TypeScript, Ordr provides a complete marketplace solution with three distinct user roles: Buyers, Vendors, and Admins."', 10, 'italic');
yPosition += 3;

addText('Visual Highlights:', 10, 'bold');
addBullet('Parallax hero section');
addBullet('Category tiles (Handcrafted, Jewelry, Tech, etc.)');
addBullet('Featured products grid');
addBullet('Responsive mobile-first design');

// BUYER EXPERIENCE
addSection('BUYER EXPERIENCE (0:30 - 1:30)', '🛍️');
addText('Visual Cue: Product Discovery', 11, 'bold');
addText('Screen: Shop page with filters | Action: Apply filters, search products');
yPosition += 2;

addText('Script:', 11, 'bold');
addText('"Buyers enjoy a seamless shopping experience. Let\'s explore the shop - we have advanced filtering by category, price range, vendor, and ratings. Real-time search helps find products instantly."', 10, 'italic');
yPosition += 3;

addText('Actions to Show:', 10, 'bold');
addBullet('Click filter options (expand/collapse)');
addBullet('Search for "handcrafted"');
addBullet('Sort by "Price: Low to High"');
yPosition += 2;

addText('Visual Cue: Product Detail Page', 11, 'bold');
addText('Screen: Individual product page | Action: Interact with image gallery, variants, add to cart');
yPosition += 2;

addText('Script:', 11, 'bold');
addText('"Each product page features an image gallery with lightbox, variant selection for size and color, vendor information, and customer reviews. The pincode checker lets buyers confirm delivery availability."', 10, 'italic');
yPosition += 3;

addText('Visual Cue: Cart & Checkout', 11, 'bold');
addText('Script:', 11, 'bold');
addText('"The cart intelligently groups items by vendor, applies promo codes, and calculates GST. Checkout supports multiple payment methods - Razorpay for UPI, cards, and netbanking, plus Cash on Delivery."', 10, 'italic');

// VENDOR DASHBOARD
doc.addPage();
yPosition = 20;

addSection('VENDOR DASHBOARD (1:30 - 2:30)', '🏪');
addText('Script:', 11, 'bold');
addText('"Now let\'s see the vendor side. Vendors get a comprehensive dashboard with real-time analytics, order management, and inventory control."', 10, 'italic');
yPosition += 3;

addText('Dashboard Features:', 10, 'bold');
addBullet('30-day revenue tracking');
addBullet('Store views and conversion rate');
addBullet('Pending orders and low stock alerts');
addBullet('Revenue trends and top-selling products charts');
yPosition += 2;

addText('Product Management:', 10, 'bold');
addBullet('Add products with multiple images');
addBullet('Create variants (size, color, price)');
addBullet('Manage stock levels');
addBullet('Set pricing and commissions');
yPosition += 2;

addText('Order Management:', 10, 'bold');
addBullet('View and filter orders');
addBullet('Update order status (placed → shipped → delivered)');
addBullet('Bulk fulfillment actions');
addBullet('Generate invoices and packing slips');

// ADMIN CONTROL
addSection('ADMIN CONTROL (2:30 - 3:20)', '👨‍💼');
addText('Script:', 11, 'bold');
addText('"Finally, the admin dashboard provides platform-wide oversight. Admins can see total GMV, active vendors, pending approvals, and platform revenue trends."', 10, 'italic');
yPosition += 3;

addText('Admin Capabilities:', 10, 'bold');
addBullet('Vendor approval workflow with document verification');
addBullet('Platform-wide order management');
addBullet('Refund and return processing');
addBullet('Revenue and performance analytics');
addBullet('Category and product moderation');

// TECHNICAL HIGHLIGHTS
doc.addPage();
yPosition = 20;

addSection('TECHNICAL HIGHLIGHTS (3:20 - 3:50)', '🔐');
addText('Script:', 11, 'bold');
addText('"Under the hood, Ordr leverages cutting-edge technology: Next.js 14 with App Router for server-side rendering, Supabase for real-time database with Row Level Security, Razorpay for secure payments, and Zustand for state management."', 10, 'italic');
yPosition += 5;

// Tech Stack Table
doc.autoTable({
  startY: yPosition,
  head: [['Technology', 'Purpose']],
  body: [
    ['Next.js 14', 'App Router, SSR, ISR'],
    ['TypeScript', 'Type-safe development'],
    ['Supabase', 'Database, Auth, RLS'],
    ['Razorpay', 'Payment processing'],
    ['Zustand', 'State management'],
    ['Tailwind CSS', 'Styling'],
    ['Framer Motion', 'Animations'],
  ],
  theme: 'grid',
  headStyles: { fillColor: accentColor },
  margin: { left: 20, right: 20 },
});

yPosition = doc.lastAutoTable.finalY + 10;

addText('Mobile Experience:', 10, 'bold');
addBullet('Touch-friendly interfaces');
addBullet('Mobile filter drawers');
addBullet('Optimized checkout flow');
addBullet('Bottom navigation');

// CLOSING
addSection('CLOSING (3:50 - 4:00)', '🎯');
addText('Script:', 11, 'bold');
addText('"Ordr delivers a complete marketplace solution - intuitive for buyers, powerful for vendors, and comprehensive for admins. With 100+ features including wishlists, reviews, real-time inventory, multi-vendor order splitting, and automated payouts, it\'s ready to scale your marketplace business today."', 10, 'italic');

// PREPARATION CHECKLIST
doc.addPage();
yPosition = 20;

addSection('DEMO PREPARATION CHECKLIST', '📋');

addText('Database Setup:', 10, 'bold');
addBullet('Ensure 3-5 products with images');
addBullet('Create test accounts (buyer, vendor, admin)');
addBullet('Verify product variants have stock > 0');
addBullet('Set up sample orders and transactions');
yPosition += 2;

addText('Test Accounts:', 10, 'bold');
addBullet('Buyer: buyer@demo.com / demo123');
addBullet('Vendor: vendor@demo.com / demo123');
addBullet('Admin: admin@demo.com / demo123');
yPosition += 2;

addText('Browser Setup:', 10, 'bold');
addBullet('Clear cache and cookies');
addBullet('Full screen mode (F11)');
addBullet('Disable notifications');
addBullet('Test internet connection');
addBullet('1920x1080 resolution recommended');
yPosition += 2;

addText('Practice:', 10, 'bold');
addBullet('Complete dry run (4 minutes)');
addBullet('Check transitions between accounts');
addBullet('Verify all features working');
addBullet('Test backup scenarios');

// KEY TALKING POINTS
addSection('KEY TALKING POINTS', '💡');

addText('Unique Selling Points:', 10, 'bold');
addBullet('Multi-vendor order splitting - Automatic sub-order creation');
addBullet('Real-time inventory sync - Prevents overselling');
addBullet('Vendor onboarding workflow - Document verification');
addBullet('Flexible payment options - Razorpay + COD');
addBullet('Comprehensive analytics - Vendor and platform level');
addBullet('Mobile-first design - Progressive Web App ready');
addBullet('Row Level Security - Database-level authorization');

// Q&A PREPARATION
doc.addPage();
yPosition = 20;

addSection('Q&A PREPARATION', '📞');

// Q&A Table
doc.autoTable({
  startY: yPosition,
  head: [['Question', 'Answer']],
  body: [
    [
      'How do you handle vendor payouts?',
      'Razorpay X integration with automated split payments. Vendors receive funds directly after platform commission deduction.'
    ],
    [
      'What about product returns?',
      'Complete returns management with admin approval, refund processing, and vendor notifications.'
    ],
    [
      'How scalable is this?',
      'Built on Supabase with horizontal scaling. Handles millions of rows with optimized queries and indexing.'
    ],
    [
      'Is it production-ready?',
      'Yes - includes error handling, logging, authentication, authorization, payment processing, and testing.'
    ],
  ],
  theme: 'striped',
  headStyles: { fillColor: accentColor },
  margin: { left: 20, right: 20 },
  columnStyles: {
    0: { cellWidth: 60, fontStyle: 'bold' },
    1: { cellWidth: 110 }
  },
  styles: {
    fontSize: 9,
    cellPadding: 3,
  }
});

yPosition = doc.lastAutoTable.finalY + 10;

// SUCCESS CRITERIA
addSection('DEMO SUCCESS CRITERIA', '✅');

addText('Audience Should See:', 10, 'bold');
addBullet('Smooth, intuitive user experience');
addBullet('Professional design and animations');
addBullet('Comprehensive feature set');
addBullet('Robust admin controls');
addBullet('Production-ready quality');
yPosition += 2;

addText('Audience Should Understand:', 10, 'bold');
addBullet('Multi-vendor marketplace capabilities');
addBullet('Complete e-commerce workflow');
addBullet('Vendor empowerment tools');
addBullet('Platform management features');
addBullet('Business value proposition');

// Footer on last page
doc.setFontSize(8);
doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
doc.text('Ordr - Multi-Vendor E-Commerce Platform | Demo Script', 105, 285, { align: 'center' });
doc.text('Built with Next.js 14, Supabase, TypeScript, and Razorpay', 105, 290, { align: 'center' });

// Save the PDF
doc.save('Ordr-Demo-Script-4Min.pdf');

console.log('✅ PDF generated successfully: Ordr-Demo-Script-4Min.pdf');
