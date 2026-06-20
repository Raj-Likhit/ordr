import Link from 'next/link';
import Image from 'next/image';

export default function AuthPortal() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 bg-[var(--color-bg)]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display text-[var(--color-text-primary)] mb-4">
          Welcome to Ordr
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl mx-auto">
          Choose how you&apos;d like to continue
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Buyer Card */}
        <Link href="/auth/buyer" className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-all hover:shadow-[var(--shadow-md)] hover:border-[var(--color-accent)]/30 hover:-translate-y-1 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-subtle)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative p-8 md:p-10">
            <div className="mb-6">
              <div className="inline-flex p-4 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-[var(--color-text-primary)] mb-3">Browse & Shop</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Discover handcrafted treasures from independent artisans around the world.
              </p>
            </div>
            <div className="flex items-center text-[var(--color-accent)] font-medium group-hover:gap-3 gap-2 transition-all">
              Continue as Buyer
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Vendor Card */}
        <Link href="/auth/vendor" className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-all hover:shadow-[var(--shadow-md)] hover:border-[var(--color-text-secondary)]/40 hover:-translate-y-1 duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-text-secondary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative p-8 md:p-10">
            <div className="mb-6">
              <div className="inline-flex p-4 rounded-[var(--radius-md)] bg-[var(--color-text-primary)]/5 text-[var(--color-text-primary)] mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="font-display text-3xl text-[var(--color-text-primary)] mb-3">Sell Your Craft</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                Share your creations with buyers seeking authentic, handmade goods.
              </p>
            </div>
            <div className="flex items-center text-[var(--color-text-primary)] font-medium group-hover:gap-3 gap-2 transition-all">
              Continue as Vendor
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
