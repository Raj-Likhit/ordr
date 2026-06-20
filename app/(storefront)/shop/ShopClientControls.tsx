"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Search } from 'lucide-react';

export function ShopSidebar({ 
  categories, 
  vendors,
  facets,
  currentCategory, 
  currentPrice,
  currentRating,
  currentVendor,
  currentMaterial,
  currentColor
}: { 
  categories: any[], 
  vendors: any[],
  facets?: { materials: string[], colors: string[] },
  currentCategory: string, 
  currentPrice: string,
  currentRating: string,
  currentVendor: string,
  currentMaterial?: string,
  currentColor?: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handlePriceChange = (priceValue: string) => {
    updateParam('price', currentPrice === priceValue ? '' : priceValue);
  };

  const handleRatingChange = (ratingValue: string) => {
    updateParam('rating', currentRating === ratingValue ? '' : ratingValue);
  };

  const priceRanges = [
    { label: 'Under ₹1000', value: 'under-1000' },
    { label: '₹1000 - ₹5000', value: '1000-5000' },
    { label: '₹5000 - ₹10000', value: '5000-10000' },
    { label: 'Over ₹10000', value: 'over-10000' },
  ];

  const ratings = [
    { label: '4 Stars & Up', value: '4' },
    { label: '3 Stars & Up', value: '3' },
    { label: '2 Stars & Up', value: '2' },
  ];

  return (
    <>
      <div>
        <h2 className="font-display text-[var(--text-title)] mb-4 border-b border-[var(--color-border)] pb-2">Filters</h2>
        <div className="flex flex-col gap-6 mt-6">
          
          {/* Vendor Filter */}
          <div>
            <h3 className="font-medium text-[var(--text-body-lg)] mb-3">Maker / Vendor</h3>
            <select 
              value={currentVendor || 'all'}
              onChange={(e) => updateParam('vendor', e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
            >
              <option value="all">All Vendors</option>
              {vendors?.map((v: any) => (
                <option key={v.id} value={v.id}>{v.business_name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="font-medium text-[var(--text-body-lg)] mb-3">Categories</h3>
            <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <Link href={`/shop?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), category: 'all' }).toString()}`} className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={currentCategory === 'all' || !currentCategory} readOnly className="w-4 h-4 rounded-full border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer" />
                <span className={`text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors ${currentCategory === 'all' || !currentCategory ? 'font-medium text-[var(--color-text-primary)]' : ''}`}>All</span>
              </Link>
              {categories?.map((cat: any) => {
                const isActive = currentCategory === cat.slug;
                const params = new URLSearchParams(searchParams.toString());
                params.set('category', cat.slug);
                return (
                  <Link key={cat.id} href={`/shop?${params.toString()}`} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" checked={isActive} readOnly className="w-4 h-4 rounded-full border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer" />
                    <span className={`text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors ${isActive ? 'font-medium text-[var(--color-text-primary)]' : ''}`}>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="font-medium text-[var(--text-body-lg)] mb-3">Price Range</h3>
            <div className="flex flex-col gap-3">
              {priceRanges.map((price) => (
                <label key={price.value} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={currentPrice === price.value}
                    onChange={() => handlePriceChange(price.value)}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer" 
                  />
                  <span className={`text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors ${currentPrice === price.value ? 'font-medium text-[var(--color-text-primary)]' : ''}`}>{price.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="font-medium text-[var(--text-body-lg)] mb-3">Customer Rating</h3>
            <div className="flex flex-col gap-3">
              {ratings.map((rating) => (
                <label key={rating.value} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={currentRating === rating.value}
                    onChange={() => handleRatingChange(rating.value)}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer" 
                  />
                  <span className={`text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors ${currentRating === rating.value ? 'font-medium text-[var(--color-text-primary)]' : ''}`}>{rating.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Material Filter */}
          {facets?.materials && facets.materials.length > 0 && (
            <div>
              <h3 className="font-medium text-[var(--text-body-lg)] mb-3">Material</h3>
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {facets.materials.map((material) => (
                  <label key={material} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={currentMaterial === material}
                      onChange={() => updateParam('material', currentMaterial === material ? '' : material)}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer" 
                    />
                    <span className={`text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors ${currentMaterial === material ? 'font-medium text-[var(--color-text-primary)]' : ''}`}>{material}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Color Filter */}
          {facets?.colors && facets.colors.length > 0 && (
            <div>
              <h3 className="font-medium text-[var(--text-body-lg)] mb-3">Color</h3>
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {facets.colors.map((color) => (
                  <label key={color} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={currentColor === color}
                      onChange={() => updateParam('color', currentColor === color ? '' : color)}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer" 
                    />
                    <span className={`text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors ${currentColor === color ? 'font-medium text-[var(--color-text-primary)]' : ''}`}>{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export function ShopSearch({ currentSearch }: { currentSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(currentSearch || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
      <input 
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search pieces..."
        className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-full)] text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
      />
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
    </form>
  );
}

export function ShopSort({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select 
      value={currentSort}
      onChange={handleSortChange}
      className="border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text-primary)] text-[var(--text-small)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer"
    >
      <option value="featured">Sort by: Featured</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="newest">Newest Arrivals</option>
    </select>
  );
}

export function MobileFilterDrawer({ 
  categories, vendors, facets, currentCategory, currentPrice, currentRating, currentVendor, currentMaterial, currentColor
}: { 
  categories: any[], vendors: any[], facets?: { materials: string[], colors: string[] }, currentCategory: string, currentPrice: string, currentRating: string, currentVendor: string, currentMaterial?: string, currentColor?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center gap-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] px-4 py-2 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-black/5 transition-colors"
      >
        <Filter size={18} /> Filters
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div 
        className={`fixed inset-y-0 right-0 w-[300px] bg-[var(--color-bg-surface)] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <span className="font-display text-xl font-medium">Filters</span>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-md transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <ShopSidebar 
            categories={categories} 
            vendors={vendors}
            facets={facets}
            currentCategory={currentCategory} 
            currentPrice={currentPrice} 
            currentRating={currentRating}
            currentVendor={currentVendor}
            currentMaterial={currentMaterial}
            currentColor={currentColor}
          />
        </div>
        <div className="p-6 border-t border-[var(--color-border)]">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}
