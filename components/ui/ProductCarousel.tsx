"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  category?: { name: string };
}

interface ProductCarouselProps {
  title?: string;
  products: Product[];
}

export function ProductCarousel({ title, products }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full my-12 relative group">
      {title && (
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-display">{title}</h2>
          <div className="hidden md:flex gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 border border-[var(--color-border)] rounded-full hover:bg-[var(--color-bg-dark)] hover:text-white transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 border border-[var(--color-border)] rounded-full hover:bg-[var(--color-bg-dark)] hover:text-white transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar relative"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-[240px] md:w-[280px] snap-start group/card cursor-pointer"
          >
            <Link href={`/shop/${product.id}`} className="block">
              <div className="aspect-[4/5] bg-[var(--color-bg-dark)]/5 rounded-md overflow-hidden relative mb-4">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover/card:scale-105 transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-[var(--text-small)]">
                    No image
                  </div>
                )}
                {/* Optional Quick Add button on hover can go here */}
              </div>
              <div>
                <p className="text-[var(--text-micro)] text-[var(--color-text-muted)] mb-1">
                  {product.category?.name || "Product"}
                </p>
                <h3 className="font-medium text-[var(--text-body)] truncate">
                  {product.name}
                </h3>
                <p className="text-[var(--text-small)] text-[var(--color-text-secondary)] mt-1">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
