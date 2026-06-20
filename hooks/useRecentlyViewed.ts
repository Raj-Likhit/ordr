"use client";

import { useState, useEffect } from "react";

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  category?: { name: string };
}

const STORAGE_KEY = "ordr_recently_viewed";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recently viewed products", e);
    }
  }, []);

  const addViewedProduct = (product: RecentlyViewedProduct) => {
    setRecentlyViewed((prev) => {
      // Remove if it already exists to move it to the front
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recently viewed products", e);
      }
      
      return updated;
    });
  };

  return { recentlyViewed, addViewedProduct };
}
