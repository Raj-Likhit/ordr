import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // cart_item_id (temp local uuid or DB id)
  quantity: number;
  variant: {
    id: string;
    size: string | null;
    color: string | null;
    price_override: number | null;
    product: {
      id: string;
      title: string;
      slug: string;
      base_price: number;
      vendor: {
        id: string;
        business_name: string;
      };
      images?: { url: string }[];
    };
  };
}

interface CartState {
  cart: { id?: string; items: CartItem[] };
  productMap: Record<string, any>; // Normalized product lookup
  loading: boolean;
  appliedPromo: { code: string; discount_type: string; discount_value: number; vendor_id: string } | null;
  addToCart: (variantId: string, quantity: number, fallbackDetails?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithDatabase: (userId: string) => Promise<void>;
  fetchDBCart: () => Promise<void>;
  setCart: (cart: { id?: string; items: CartItem[] }) => void;
  applyPromo: (promo: { code: string; discount_type: string; discount_value: number; vendor_id: string } | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: { items: [] },
      productMap: {},
      loading: false,
      appliedPromo: null,

      setCart: (cart) => set({ cart }),
      applyPromo: (promo) => set({ appliedPromo: promo }),

      addToCart: async (variantId, quantity, fallbackDetails) => {
        const { cart, productMap } = get();
        // Check if item already in local cart
        const existingItemIndex = cart.items.findIndex(item => item.variant.id === variantId);
        
        const newItems = [...cart.items];
        
        if (existingItemIndex >= 0) {
          newItems[existingItemIndex].quantity += quantity;
        } else {
          newItems.push({
            id: `local-${Date.now()}-${Math.random()}`,
            quantity,
            variant: {
              id: variantId,
              size: fallbackDetails?.size || null,
              color: fallbackDetails?.color || null,
              price_override: fallbackDetails?.price_override || null,
              product: { id: fallbackDetails?.product?.id || 'unknown' } as any // lean product
            }
          });
        }
        
        // Update normalized product map
        const newProductMap = { ...productMap };
        if (fallbackDetails?.product) {
          newProductMap[variantId] = fallbackDetails.product;
        }
        
        set({ cart: { ...cart, items: newItems }, productMap: newProductMap });

        // Optimistic UI: If cart.id exists, it's a DB cart, so sync in background
        if (cart.id) {
          fetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variant_id: variantId, quantity }),
          }).catch(e => console.error("Failed to sync cart addition", e));
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const { cart } = get();
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        const newItems = cart.items.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ cart: { ...cart, items: newItems } });

        if (cart.id && !itemId.startsWith('local-')) {
          fetch(`/api/cart/items/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
          }).catch(e => console.error("Failed to sync cart quantity", e));
        }
      },

      removeFromCart: async (itemId) => {
        const { cart } = get();
        const newItems = cart.items.filter(item => item.id !== itemId);
        set({ cart: { ...cart, items: newItems } });

        if (cart.id && !itemId.startsWith('local-')) {
          fetch(`/api/cart/items/${itemId}`, {
            method: "DELETE",
          }).catch(e => console.error("Failed to sync cart removal", e));
        }
      },

      clearCart: async () => {
        set({ cart: { items: [] } });
      },

      fetchDBCart: async () => {
        set({ loading: true });
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            if (data.cart) {
              const items = data.cart.items || [];
              const newProductMap: Record<string, any> = {};
              
              // Normalize product data into productMap and keep items lean
              const leanItems = items.map((item: any) => {
                if (item.variant?.product) {
                  newProductMap[item.variant.id] = item.variant.product;
                }
                return {
                  ...item,
                  variant: {
                    ...item.variant,
                    product: { id: item.variant?.product?.id }
                  }
                };
              });

              set({
                cart: {
                  id: data.cart.id,
                  items: leanItems,
                },
                productMap: newProductMap
              });
            }
          }
        } catch (e) {
          console.error("Failed to fetch database cart", e);
        } finally {
          set({ loading: false });
        }
      },

      syncWithDatabase: async (userId: string) => {
        const { cart, fetchDBCart } = get();
        const localItems = cart.items.filter(item => item.id.startsWith('local-'));
        
        if (localItems.length === 0) {
          // Just fetch the DB cart
          await fetchDBCart();
          return;
        }

        // Push local items to DB sequentially
        for (const item of localItems) {
          try {
            await fetch("/api/cart/items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ variant_id: item.variant.id, quantity: item.quantity }),
            });
          } catch (e) {
            console.error("Failed to sync item", item, e);
          }
        }

        // Fetch the unified cart
        await fetchDBCart();
      }
    }),
    {
      name: 'ordr-cart-storage',
      // We only persist the cart state (guest items), skipping the heavy productMap
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

// Helper to calculate total price
export const getSubtotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => {
    const price = item.variant.price_override ?? item.variant.product.base_price;
    return sum + price * item.quantity;
  }, 0);
};

export const getCartCount = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

// Wrapper hook to mimic previous API
export function useCart() {
  const store = useCartStore();
  
  return {
    cart: {
      ...store.cart,
      // Re-hydrate product details on the fly for UI consumers
      items: store.cart.items.map(item => ({
        ...item,
        variant: {
          ...item.variant,
          product: store.productMap[item.variant.id] || item.variant.product
        }
      }))
    },
    loading: store.loading,
    appliedPromo: store.appliedPromo,
    applyPromo: store.applyPromo,
    addToCart: store.addToCart,
    updateQuantity: store.updateQuantity,
    removeFromCart: store.removeFromCart,
    clearCart: store.clearCart,
    cartCount: getCartCount(store.cart.items),
    subtotal: store.cart.items.reduce((sum, item) => {
      const p = store.productMap[item.variant.id] || item.variant.product;
      const price = item.variant.price_override ?? p.base_price ?? 0;
      return sum + price * item.quantity;
    }, 0),
    discount: store.cart.items.reduce((sum, item) => {
      if (!store.appliedPromo) return sum;
      const p = store.productMap[item.variant.id] || item.variant.product;
      // ONLY discount items from the vendor who issued the promo
      if (p.vendor?.id !== store.appliedPromo.vendor_id) return sum;

      const price = item.variant.price_override ?? p.base_price ?? 0;
      const lineTotal = price * item.quantity;

      if (store.appliedPromo.discount_type === 'percentage') {
        return sum + (lineTotal * (store.appliedPromo.discount_value / 100));
      }
      // For fixed, it's a bit tricky if multiple items. Usually fixed is applied once per order.
      // But we'll just return the fixed amount directly if it's the first matching item, or distribute it.
      // Easiest is just to compute total eligible subtotal and then cap the fixed discount.
      return sum;
    }, 0) + (
      // If it's a fixed discount and there are eligible items, apply it once up to the eligible subtotal
      store.appliedPromo?.discount_type === 'fixed' 
      ? Math.min(
          store.appliedPromo.discount_value, 
          store.cart.items.reduce((sum, item) => {
            const p = store.productMap[item.variant.id] || item.variant.product;
            if (p.vendor?.id !== store.appliedPromo?.vendor_id) return sum;
            return sum + ((item.variant.price_override ?? p.base_price ?? 0) * item.quantity);
          }, 0)
        )
      : 0
    ),
    refreshCart: store.fetchDBCart,
  };
}
