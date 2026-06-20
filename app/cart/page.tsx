"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCart, CartItem } from "@/hooks/useCart";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { SavedForLaterList } from "@/components/ui/SavedForLaterList";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount, appliedPromo, applyPromo, discount } = useCart();
  const router = useRouter();

  const isEmpty = cart.items.length === 0;

  // Group items by vendor
  const groupedItems = cart.items.reduce<Record<string, { vendorName: string; items: CartItem[] }>>(
    (groups, item) => {
      const vendorId = item.variant.product.vendor.id;
      const vendorName = item.variant.product.vendor.business_name;
      if (!groups[vendorId]) {
        groups[vendorId] = { vendorName, items: [] };
      }
      groups[vendorId].items.push(item);
      return groups;
    },
    {}
  );

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 min-h-screen">
      <header className="mb-12">
        <h1 className="font-display text-[var(--text-display)] text-[var(--color-text-primary)]">
          Your Cart
        </h1>
        <p className="text-[var(--color-text-secondary)] font-body mt-2">
          {isEmpty
            ? "Your curated collection is currently empty."
            : `You have selected ${cartCount} unique piece${cartCount !== 1 ? "s" : ""} from independent creators.`}
        </p>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] text-center px-4">
          <ShoppingBag size={48} className="text-[var(--color-text-muted)] mb-6" strokeWidth={1.5} />
          <h2 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)] mb-2">
            No items in your cart
          </h2>
          <p className="text-[var(--color-text-secondary)] font-body max-w-md mb-8">
            Explore our curated bazaar to find extraordinary handcrafted items.
          </p>
          <Link href="/shop">
            <Button variant="primary">Return to Browse</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-8">
            {Object.entries(groupedItems).map(([vendorId, group]) => (
              <div
                key={vendorId}
                className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]"
              >
                <h3 className="font-accent text-[var(--text-label)] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-6 pb-2 border-b border-[var(--color-border)]">
                  Created by: {group.vendorName}
                </h3>
                <div className="divide-y divide-[var(--color-border)]">
                  {group.items.map((item) => {
                    const price = item.variant.price_override ?? item.variant.product.base_price;
                    const imgUrl = item.variant.product.images?.[0]?.url || "/assets/product-card-placeholder.png";

                    return (
                      <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex gap-4">
                        <div className="w-20 h-24 relative overflow-hidden bg-[var(--color-bg)] rounded-[var(--radius-sm)] shrink-0 border border-[var(--color-border)]">
                          <Image
                            src={imgUrl}
                            alt={item.variant.product.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="font-body text-[var(--text-body-lg)] font-medium text-[var(--color-text-primary)] truncate">
                                <Link
                                  href={`/product/${item.variant.product.slug}`}
                                  className="hover:text-[var(--color-accent)] transition-colors"
                                >
                                  {item.variant.product.title}
                                </Link>
                              </h4>
                              <span className="font-semibold text-[var(--color-text-primary)] shrink-0">
                                {fmt(price * item.quantity)}
                              </span>
                            </div>
                            {(item.variant.size || item.variant.color) && (
                              <p className="text-[var(--text-micro)] text-[var(--color-text-secondary)] mt-1 uppercase tracking-wider">
                                {item.variant.size && `Size: ${item.variant.size}`}
                                {item.variant.size && item.variant.color && " | "}
                                {item.variant.color && `Color: ${item.variant.color}`}
                              </p>
                            )}
                          </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3 border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-0.5 bg-[var(--color-bg)]">
                                <button
                                  className="text-[var(--color-text-secondary)] hover:text-black font-semibold px-1 focus:outline-none"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  −
                                </button>
                                <span className="text-[var(--text-small)] font-medium w-4 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  className="text-[var(--color-text-secondary)] hover:text-black font-semibold px-1 focus:outline-none"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                              <div className="flex items-center gap-4">
                                <button
                                  className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors focus:outline-none flex items-center gap-1.5 text-[var(--text-small)]"
                                  onClick={async () => {
                                    const { moveToSavedForLater } = await import('@/app/actions/wishlistActions');
                                    const res = await moveToSavedForLater(item.variant.product.id, item.id);
                                    if (res.success) {
                                      removeFromCart(item.id);
                                      // Optional: trigger a re-fetch of the SavedForLaterList
                                      window.dispatchEvent(new CustomEvent('wishlist-updated'));
                                    }
                                  }}
                                >
                                  Save for Later
                                </button>
                                <button
                                  className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors focus:outline-none flex items-center gap-1.5 text-[var(--text-small)]"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-[var(--text-small)] text-[var(--color-accent)] hover:underline font-semibold uppercase tracking-wider"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary Card */}
          <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm space-y-6">
            <h3 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3">
              Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between text-[var(--text-body)] text-[var(--color-text-secondary)]">
                <span>Items Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              
              {/* Promo Code Input */}
              <div className="pt-2">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const code = fd.get('promoCode') as string;
                    if (!code) return;
                    
                    try {
                      const res = await fetch('/api/checkout/apply-promo', {
                        method: 'POST',
                        body: JSON.stringify({ code })
                      });
                      const data = await res.json();
                      if (res.ok && data.promo) {
                        applyPromo(data.promo);
                      } else {
                        alert(data.error || 'Invalid code');
                      }
                    } catch(err) {
                      alert('Failed to apply promo code');
                    }
                  }} 
                  className="flex gap-2"
                >
                  <input 
                    name="promoCode" 
                    type="text" 
                    placeholder="Promo code" 
                    className="flex-1 border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-[var(--text-small)] bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  <Button type="submit" variant="outline" className="shrink-0 h-10 px-4">Apply</Button>
                </form>
              </div>

              {/* Discount Display */}
              {appliedPromo && (
                <div className="flex justify-between text-[var(--text-body)] text-[var(--color-success)]">
                  <div className="flex items-center gap-2">
                    <span>Discount ({appliedPromo.code})</span>
                    <button 
                      onClick={() => applyPromo(null)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] focus:outline-none"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <span>-{fmt(discount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--text-body)] text-[var(--color-text-secondary)]">
                <span>Shipping</span>
                <span className="text-[var(--color-success)] font-medium">Free</span>
              </div>
              <div className="border-t border-[var(--color-border)] pt-4 flex justify-between text-[var(--text-subtitle)] font-semibold text-[var(--color-text-primary)]">
                <span>Estimated Total</span>
                <span>{fmt(subtotal - (discount || 0))}</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full h-12 justify-center mt-6"
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}

      <SavedForLaterList />
    </div>
  );
}
