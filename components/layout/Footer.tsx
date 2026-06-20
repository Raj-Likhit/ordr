import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)] pt-16 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1 */}
          <div>
            <Link href="/" className="font-display text-3xl font-semibold tracking-widest uppercase block mb-4">
              Ordr
            </Link>
            <p className="text-[var(--color-text-muted)] text-[var(--text-small)] mb-6 max-w-xs">
              A multi-vendor marketplace built for India — where independent sellers and discerning buyers meet in a space that feels worth their time.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-accent text-[var(--text-label)] uppercase tracking-wider font-semibold mb-4 text-[#C4BAB0]">
              For Buyers
            </h4>
            <ul className="space-y-3 text-[var(--text-small)] text-[var(--color-text-muted)]">
              <li><Link href="/shop" className="hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Orders & Tracking</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-accent text-[var(--text-label)] uppercase tracking-wider font-semibold mb-4 text-[#C4BAB0]">
              For Sellers
            </h4>
            <ul className="space-y-3 text-[var(--text-small)] text-[var(--color-text-muted)]">
              <li><Link href="/auth/vendor-apply" className="hover:text-white transition-colors">Become a Vendor</Link></li>
              <li><Link href="/vendor" className="hover:text-white transition-colors">Vendor Dashboard</Link></li>
              <li><Link href="/vendor-help" className="hover:text-white transition-colors">Seller Help Center</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-accent text-[var(--text-label)] uppercase tracking-wider font-semibold mb-4 text-[#C4BAB0]">
              Company
            </h4>
            <ul className="space-y-3 text-[var(--text-small)] text-[var(--color-text-muted)]">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-bg-dark-alt)] flex flex-col md:flex-row justify-between items-center text-[var(--text-micro)] text-[var(--color-text-muted)] font-accent uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Ordr</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span>Secured by Razorpay</span>
            <span>·</span>
            <span>Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
