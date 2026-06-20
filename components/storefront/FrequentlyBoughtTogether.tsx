"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";

interface FBTProduct {
  id: string;
  title: string;
  slug: string;
  base_price: number;
  images?: { url: string }[];
  variants?: { id: string; price_override?: number; size?: string; color?: string }[];
}

export function FrequentlyBoughtTogether({ mainProduct, crossSells }: { mainProduct: any, crossSells: FBTProduct[] }) {
  // Select all by default
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set([mainProduct.id, ...crossSells.map((p) => p.id)])
  );
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const bundleItems = [mainProduct, ...crossSells];

  const getPrice = (product: FBTProduct) => {
    // Basic logic for variant price
    const v = product.variants?.[0];
    return v?.price_override ?? product.base_price;
  };

  const totalPrice = bundleItems
    .filter((item) => selectedItemIds.has(item.id))
    .reduce((sum, item) => sum + getPrice(item), 0);

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const handleAddAllToCart = async () => {
    const itemsToAdd = bundleItems.filter((item) => selectedItemIds.has(item.id));
    if (itemsToAdd.length === 0) return;

    try {
      for (const item of itemsToAdd) {
        const variant = item.variants?.[0];
        if (variant) {
          await addToCart(variant.id, 1, {
            product: item,
            size: variant.size,
            color: variant.color,
            price_override: variant.price_override,
          });
        }
      }
      showToast({
        message: `Added ${itemsToAdd.length} items to cart!`,
        type: "success",
      });
    } catch (e) {
      showToast({
        message: "Failed to add some items to cart.",
        type: "error",
      });
    }
  };

  return (
    <div className="mt-16 border-t border-[var(--color-border)] pt-12">
      <h2 className="font-display text-[var(--text-subtitle)] mb-8">Frequently Bought Together</h2>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Images Row */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 max-w-full">
          {bundleItems.map((item, index) => {
            const isSelected = selectedItemIds.has(item.id);
            const imgUrl = item.images?.[0]?.url || "/assets/product-card-placeholder.png";

            return (
              <React.Fragment key={item.id}>
                {index > 0 && <Plus size={24} className="text-[var(--color-text-muted)] shrink-0" />}
                <Link href={`/product/${item.slug}`} className={`relative aspect-square w-24 md:w-32 shrink-0 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-all ${isSelected ? 'border-[var(--color-accent)]' : 'border-transparent opacity-60'}`}>
                  <Image src={imgUrl} alt={item.title} fill className="object-cover" sizes="128px" />
                </Link>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Panel */}
        <div className="flex flex-col flex-1 min-w-[280px] bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]">
          <div className="text-[var(--text-body)] mb-4">
            <span className="text-[var(--color-text-secondary)]">Total price: </span>
            <span className="font-semibold text-[var(--color-text-primary)] text-xl">{fmt(totalPrice)}</span>
          </div>
          
          <button
            onClick={handleAddAllToCart}
            disabled={selectedItemIds.size === 0}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white h-12 rounded-[var(--radius-sm)] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            Add {selectedItemIds.size > 1 ? "all " : ""}{selectedItemIds.size} to Cart
          </button>

          <div className="flex flex-col gap-3">
            {bundleItems.map((item) => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedItemIds.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
                  disabled={item.id === mainProduct.id && selectedItemIds.size === 1} // Prevent unchecking last item
                />
                <span className="text-[var(--text-small)] leading-tight">
                  <span className={item.id === mainProduct.id ? "font-semibold" : ""}>
                    {item.id === mainProduct.id ? "This item: " : ""}
                  </span>
                  <Link href={`/product/${item.slug}`} className="hover:text-[var(--color-accent)] transition-colors">
                    {item.title}
                  </Link>
                  <span className="ml-2 font-medium text-[var(--color-text-primary)]">
                    {fmt(getPrice(item))}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
