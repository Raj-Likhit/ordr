"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, ToggleLeft, ToggleRight, Edit3, Trash2, Package, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  title: string;
  base_price: number;
  is_active: boolean;
  category: string;
  stock: number;
  rating_avg: number;
  image?: string;
  created_at: string;
}



export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all" | "active" | "draft">("all");
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) {
        setProducts(data.map((d: any) => ({ ...d, category: d.category_id || 'Uncategorized' })));
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let list = [...products];
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
    if (filter === "active") list = list.filter(p => p.is_active);
    if (filter === "draft")  list = list.filter(p => !p.is_active);
    setFiltered(list);
  }, [products, search, filter]);

  const toggleStatus = useCallback(async (id: string, current: boolean) => {
    setToggling(id);
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    setToggling(null);
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    setDeleting(id);
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }, []);

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)]">My Products</h1>
          <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">
            {products.filter(p => p.is_active).length} active &middot; {products.filter(p => !p.is_active).length} draft
          </p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] font-body text-[var(--text-small)] font-medium hover:bg-[var(--color-accent-hover)] hover:-translate-y-[1px] transition-all duration-200 shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] self-start whitespace-nowrap"
        >
          <Plus size={16} /> Add Product
        </Link>
      </header>

      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="search"
            placeholder="Search products or categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-small)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-[var(--radius-md)] text-[var(--text-small)] font-medium capitalize transition-all duration-200 ${filter === f ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-secondary)]"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-sm)]">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 w-full rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={44} className="mx-auto text-[var(--color-border)] mb-3" />
            <p className="text-[var(--color-text-secondary)] font-medium">No products found</p>
            <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">
              {search ? "Try a different search term" : "Add your first product to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--color-bg-surface)]">
                  {["Product", "Category", "Price", "Stock", "Rating", "Status", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-[var(--text-label)] font-accent font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-[var(--color-bg-surface)] transition-colors duration-150 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] flex items-center justify-center flex-shrink-0 border border-[var(--color-border)]">
                          <Package size={16} className="text-[var(--color-text-muted)]" />
                        </div>
                        <span className="font-medium text-[var(--text-small)] text-[var(--color-text-primary)] line-clamp-1">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-small)] text-[var(--color-text-secondary)]">{product.category}</td>
                    <td className="px-6 py-4 text-[var(--text-small)] font-medium text-[var(--color-text-primary)] whitespace-nowrap">{fmtCurrency(product.base_price)}</td>
                    <td className="px-6 py-4">
                      <span className="text-[var(--text-small)] font-medium">
                        {product.stock === 0 ? (
                          <span className="flex items-center gap-1 text-[var(--color-error)]"><AlertCircle size={12} /> Out of stock</span>
                        ) : product.stock <= 5 ? (
                          <span className="flex items-center gap-1 text-[var(--color-warning)]"><AlertCircle size={12} /> {product.stock} left</span>
                        ) : (
                          <span className="text-[var(--color-success)]">{product.stock} in stock</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-small)] text-[var(--color-text-secondary)]">
                      {product.rating_avg > 0 ? (
                        <span className="flex items-center gap-1">
                          <span className="text-[var(--color-warning)]">★</span>
                          {product.rating_avg.toFixed(1)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(product.id, product.is_active)}
                        disabled={toggling === product.id}
                        aria-label={product.is_active ? "Deactivate product" : "Activate product"}
                        className="flex items-center gap-2 group/toggle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-[var(--radius-sm)] transition-opacity disabled:opacity-50"
                      >
                        {product.is_active ? (
                          <ToggleRight size={22} className="text-[var(--color-success)] transition-transform group-hover/toggle:scale-110" />
                        ) : (
                          <ToggleLeft size={22} className="text-[var(--color-text-muted)] transition-transform group-hover/toggle:scale-110" />
                        )}
                        <span className={`text-[var(--text-label)] font-semibold uppercase tracking-[0.06em] ${product.is_active ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`}>
                          {product.is_active ? "Active" : "Draft"}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/vendor/products/${product.id}/edit`}
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                          aria-label="Edit product"
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          disabled={deleting === product.id}
                          aria-label="Delete product"
                          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[#FDEDED] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)] disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
