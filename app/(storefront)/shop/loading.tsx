import React from 'react';

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8 min-h-screen">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-8 animate-pulse">
        <div className="h-6 w-32 bg-[var(--color-border)] rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-[var(--color-border)]/50 rounded"></div>
          ))}
        </div>
        <div className="h-6 w-32 bg-[var(--color-border)] rounded mb-4 mt-8"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-[var(--color-border)]/50 rounded"></div>
          ))}
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <section className="flex-1">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-pulse">
          <div className="h-10 w-48 bg-[var(--color-border)] rounded"></div>
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-[var(--color-border)] rounded"></div>
            <div className="h-10 w-32 bg-[var(--color-border)] rounded"></div>
          </div>
        </header>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-border)]/70"></div>
              <div>
                <div className="h-5 w-3/4 bg-[var(--color-border)] rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-[var(--color-border)]/50 rounded mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-5 w-16 bg-[var(--color-border)] rounded"></div>
                  <div className="h-4 w-12 bg-[var(--color-border)]/50 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
