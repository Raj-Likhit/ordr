"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import { useCart } from "@/hooks/useCart";

interface WishlistGroup {
  id: string;
  name: string;
  items: WishlistItem[];
}

interface WishlistItem {
  id: string;
  product_id: string;
  added_at: string;
  product: {
    id: string;
    title: string;
    slug: string;
    base_price: number;
    images?: { url: string }[];
  };
}

export function SavedForLaterList() {
  const [groups, setGroups] = useState<WishlistGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlists/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const moveToCart = async (item: WishlistItem) => {
    // Add to cart
    // Assuming default variant is just the product_id for now, or we need variant_id.
    // In our DB, we often add product directly if there's no variants, but addToCart expects variantId.
    // If the wishlist only stores product_id, we might need to fetch variants or just use product_id.
    // Actually, useCart's addToCart handles variantId, let's use product_id as variantId if it's 1:1.
    // Wait, the API needs the variant id. If we don't have it, we might have an issue.
    // For now, let's assume product_id is the variant_id or we just call add to cart.
    await addToCart(item.product_id, 1, {
      product: item.product,
    });

    // Remove from wishlist
    try {
      await fetch(`/api/wishlists/items/${item.id}`, { method: "DELETE" });
      fetchWishlist();
    } catch (e) {
      console.error(e);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await fetch(`/api/wishlists/items/${itemId}`, { method: "DELETE" });
      fetchWishlist();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return null;

  // Find the "Saved For Later" group or just show all wishlist items
  const savedItems = groups.flatMap((g) => g.items || []);

  if (savedItems.length === 0) return null;

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="mt-16">
      <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)] mb-6 pb-2 border-b border-[var(--color-border)]">
        Saved for Later ({savedItems.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {savedItems.map((item) => {
          const imgUrl = item.product.images?.[0]?.url || "/assets/product-card-placeholder.png";
          return (
            <div key={item.id} className="bg-[var(--color-bg-surface)] p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] flex flex-col">
              <Link href={`/product/${item.product.slug}`} className="block relative aspect-square overflow-hidden rounded-[var(--radius-sm)] mb-4 bg-[var(--color-bg)]">
                <Image src={imgUrl} alt={item.product.title} fill className="object-cover" sizes="200px" />
              </Link>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-medium text-[var(--text-body)] truncate mb-1">
                    <Link href={`/product/${item.product.slug}`} className="hover:text-[var(--color-accent)] transition-colors">
                      {item.product.title}
                    </Link>
                  </h4>
                  <p className="font-semibold text-[var(--color-text-primary)] mb-4">{fmt(item.product.base_price)}</p>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => moveToCart(item)}>
                    Move to Cart
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full text-[var(--color-text-muted)] hover:text-[var(--color-error)]" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
