"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Trash2 } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const isEmpty = cart.items.length === 0;

  const handleCheckout = () => {
    onClose();
    if (!user) {
      router.push("/auth?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Cart (${cartCount})`} side="right">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <p className="text-[var(--color-text-secondary)] font-body mb-6">
            Your cart is quiet. Let&apos;s make some noise.
          </p>
          <Button variant="primary" onClick={() => { onClose(); router.push('/shop'); }}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          <div className="flex-1 overflow-y-auto pr-1">
            {cart.items.map((item) => {
              const price = item.variant?.price_override ?? item.variant?.product?.base_price ?? 0;
              const imgUrl = item.variant?.product?.images?.[0]?.url || "/assets/product-card-placeholder.png";

              return (
                <div key={item.id} className="mb-6 border-b-[1.5px] border-[var(--color-border)] pb-4 flex gap-4">
                  <div className="w-20 h-24 relative overflow-hidden bg-[var(--color-bg-surface)] rounded-[var(--radius-sm)] shrink-0">
                      <Image
                        src={imgUrl}
                        alt={item.variant?.product?.title || 'Product Image'}
                        fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-body text-[var(--text-body)] font-medium truncate">
                        {item.variant?.product?.title || 'Unknown Product'}
                      </h4>
                      <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-0.5">
                        {item.variant?.product?.vendor?.business_name || 'Unknown Vendor'}
                      </p>
                      {(item.variant.size || item.variant.color) && (
                        <p className="text-[var(--text-micro)] text-[var(--color-text-secondary)] mt-1">
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
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[var(--color-text-primary)]">
                          {fmt(price * item.quantity)}
                        </span>
                        <button
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors focus:outline-none"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t-[1.5px] border-[var(--color-border)] bg-[var(--color-bg)]">
            <div className="flex justify-between items-center mb-6">
              <span className="font-body text-[var(--text-body)] text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="font-semibold text-[var(--text-subtitle)] text-[var(--color-text-primary)]">
                {fmt(subtotal)}
              </span>
            </div>
            <Button variant="primary" className="w-full" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
