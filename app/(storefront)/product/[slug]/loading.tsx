import React from 'react';

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-screen">
      {/* Breadcrumb Skeleton */}
      <div className="flex gap-2 mb-8 animate-pulse">
        <div className="h-4 w-12 bg-[var(--color-border)]/50 rounded"></div>
        <div className="h-4 w-4 bg-[var(--color-border)]/50 rounded"></div>
        <div className="h-4 w-12 bg-[var(--color-border)]/50 rounded"></div>
        <div className="h-4 w-4 bg-[var(--color-border)]/50 rounded"></div>
        <div className="h-4 w-32 bg-[var(--color-border)] rounded"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Gallery Skeleton */}
        <section className="w-full lg:w-3/5 flex flex-col md:flex-row gap-4 animate-pulse">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible order-2 md:order-1 w-full md:w-24 shrink-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative aspect-[3/4] w-20 md:w-full shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-border)]/50"></div>
            ))}
          </div>
          <div className="relative aspect-[3/4] md:aspect-[4/5] w-full order-1 md:order-2 rounded-[var(--radius-lg)] bg-[var(--color-border)]/70"></div>
        </section>

        {/* Product Details Skeleton */}
        <section className="w-full lg:w-2/5 flex flex-col gap-6 animate-pulse">
          <div>
            <div className="h-10 w-3/4 bg-[var(--color-border)] rounded mb-3"></div>
            <div className="h-5 w-1/3 bg-[var(--color-border)]/50 rounded"></div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-24 bg-[var(--color-border)] rounded"></div>
            <div className="h-6 w-32 bg-[var(--color-border)]/50 rounded"></div>
          </div>

          <div className="space-y-2 mt-2">
            <div className="h-4 w-full bg-[var(--color-border)]/50 rounded"></div>
            <div className="h-4 w-full bg-[var(--color-border)]/50 rounded"></div>
            <div className="h-4 w-5/6 bg-[var(--color-border)]/50 rounded"></div>
            <div className="h-4 w-4/5 bg-[var(--color-border)]/50 rounded"></div>
          </div>

          <hr className="border-[var(--color-border)] my-2" />

          {/* Size Skeleton */}
          <div>
            <div className="h-5 w-24 bg-[var(--color-border)] rounded mb-3"></div>
            <div className="flex gap-3">
              <div className="h-10 w-20 bg-[var(--color-border)] rounded"></div>
              <div className="h-10 w-20 bg-[var(--color-border)] rounded"></div>
              <div className="h-10 w-20 bg-[var(--color-border)] rounded"></div>
            </div>
          </div>

          {/* Add to Cart Skeleton */}
          <div className="flex gap-4 mt-4">
            <div className="h-12 w-32 bg-[var(--color-border)] rounded"></div>
            <div className="h-12 flex-1 bg-[var(--color-border)] rounded"></div>
            <div className="h-12 w-12 bg-[var(--color-border)] rounded"></div>
          </div>

          {/* Accordion Skeleton */}
          <div className="mt-8 flex flex-col divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
            <div className="py-4 flex justify-between">
              <div className="h-5 w-32 bg-[var(--color-border)] rounded"></div>
              <div className="h-5 w-5 bg-[var(--color-border)]/50 rounded"></div>
            </div>
            <div className="py-4 flex justify-between">
              <div className="h-5 w-40 bg-[var(--color-border)] rounded"></div>
              <div className="h-5 w-5 bg-[var(--color-border)]/50 rounded"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
