'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ArrowLeft, AlertCircle, ChevronDown, Star, ShoppingBag, Heart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCarousel } from "@/components/ui/ProductCarousel";

export function ProductClientDetail({ product, children }: { product: any, children: React.ReactNode }) {
  const [quantity, setQuantity] = useState(1);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const addToCartRef = React.useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string>(product.variants?.[0]?.size || "Medium");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [wishlistGroups, setWishlistGroups] = useState<any[]>([]);
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [newWishlistName, setNewWishlistName] = useState("");
  const [isCreatingWishlist, setIsCreatingWishlist] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { recentlyViewed, addViewedProduct } = useRecentlyViewed();

  React.useEffect(() => {
    // Fetch wishlist groups on mount
    fetch('/api/wishlists/groups').then(res => res.ok && res.json()).then(data => {
      if (Array.isArray(data)) setWishlistGroups(data);
    }).catch(e => console.error(e));
    
    // Add to recently viewed
    addViewedProduct({
      id: product.id,
      name: product.title,
      price: product.base_price,
      images: product.images?.map((img: any) => img.url),
      category: product.category
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCart(!entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );

    if (addToCartRef.current) {
      observer.observe(addToCartRef.current);
    }
    return () => observer.disconnect();
  }, [product]);

  const handleCreateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishlistName.trim()) return;
    try {
      const res = await fetch('/api/wishlists/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWishlistName })
      });
      if (res.ok) {
        const newGroup = await res.json();
        setWishlistGroups([...wishlistGroups, newGroup]);
        setNewWishlistName("");
        setIsCreatingWishlist(false);
        showToast({ message: "Wishlist created!", type: "success" });
        handleSaveToWishlist(newGroup.id);
      } else {
        showToast({ message: "Failed to create wishlist", type: "error" });
      }
    } catch(err) {
      showToast({ message: "Failed to create wishlist", type: "error" });
    }
  };

  const handleSaveToWishlist = async (groupId: string) => {
    try {
      const res = await fetch('/api/wishlists/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: groupId, product_id: product.id })
      });
      if (res.ok) {
        showToast({ message: "Saved to wishlist!", type: "success" });
        setShowWishlistDropdown(false);
      } else {
        showToast({ message: "Item is already in this wishlist", type: "error" });
      }
    } catch (e) {
      showToast({ message: "Failed to save to wishlist", type: "error" });
    }
  };

  const activeVariant = product.variants?.find(
    (v: any) => v.size?.toLowerCase() === selectedSize.toLowerCase()
  ) || product.variants?.[0] || { id: "fallback", price_override: null, stock: 0 };

  const price = activeVariant.price_override ?? product.base_price;
  const mainImage = product.images?.[activeImageIndex]?.url || product.images?.[0]?.url || "/assets/product-card-placeholder.png";
  const isOutOfStock = activeVariant.stock === 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return; // Only magnify on desktop
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.8)' });
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1024) return;
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    if (quantity > activeVariant.stock) {
      showToast({ message: `Only ${activeVariant.stock} left in stock.`, type: "error" });
      setQuantity(activeVariant.stock);
      return;
    }

    try {
      const fallbackDetails = {
        size: selectedSize,
        color: null,
        price_override: activeVariant.price_override,
        product: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          base_price: product.base_price,
          vendor: {
            id: product.vendor.id,
            business_name: product.vendor.business_name,
          },
          images: product.images,
        },
      };

      await addToCart(activeVariant.id, quantity, fallbackDetails);
      showToast({
        message: `${product.title} (${selectedSize}) added to cart!`,
        type: "success",
      });
    } catch (e: any) {
      showToast({
        message: "Failed to add item to cart.",
        type: "error",
      });
    }
  };

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  // Check prefers-reduced-motion to avoid freezing old phones
  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  const animationProps = prefersReducedMotion ? { initial: false, animate: false, transition: { duration: 0 } } : {};

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...animationProps}
      className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-screen"
    >
      {/* Breadcrumb */}
      <nav className="text-[var(--text-small)] text-[var(--color-text-secondary)] mb-8 flex gap-2">
        <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[var(--color-accent)] transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-[var(--color-text-primary)] capitalize">{product.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Gallery */}
        <section className="w-full lg:w-3/5 flex flex-col md:flex-row gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            {...animationProps}
            className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible order-2 md:order-1 w-full md:w-24 shrink-0"
          >
            {product.images?.map((img: any, i: number) => (
              <button 
                key={i} 
                onClick={() => setActiveImageIndex(i)}
                className={`relative aspect-[3/4] w-20 md:w-full shrink-0 overflow-hidden rounded-[var(--radius-sm)] border-2 transition-all focus:outline-none bg-[var(--color-bg-surface)] ${activeImageIndex === i ? 'border-[var(--color-accent)] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <Image src={img.url} alt={`Thumbnail ${i}`} fill sizes="80px" loading="lazy" className="object-cover" />
              </button>
            )) || (
              <button className="relative aspect-[3/4] w-20 md:w-full shrink-0 overflow-hidden rounded-[var(--radius-sm)] border-2 border-[var(--color-accent)] focus:outline-none bg-[var(--color-bg-surface)]">
                <Image src="/assets/product-card-placeholder.png" alt="Thumbnail" fill sizes="80px" loading="lazy" className="object-cover" />
              </button>
            )}
          </motion.div>
          
          <div 
            className="relative aspect-[3/4] md:aspect-[4/5] w-full order-1 md:order-2 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] lg:cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mainImage}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={prefersReducedMotion ? false : { opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
                className="absolute inset-0 transition-transform duration-100 ease-out"
                style={zoomStyle}
              >
                <Image src={mainImage} alt={product.title} fill sizes="(max-width: 1024px) 100vw, 60vw" priority className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Product Details */}
        <motion.section 
          variants={prefersReducedMotion ? undefined : staggerContainer}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? false : "show"}
          className="w-full lg:w-2/5 flex flex-col gap-6"
        >
          <motion.div variants={prefersReducedMotion ? undefined : fadeUp}>
            <h1 className="font-display text-[var(--text-display)] mb-2 capitalize">{product.title}</h1>
            <p className="text-[var(--color-text-secondary)] text-[var(--text-body-lg)]">
              By <span className="font-medium text-[var(--color-text-primary)]">{product.vendor.business_name}</span>
            </p>
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : fadeUp} className="flex items-center gap-4">
            <span className="text-[var(--text-title)] font-semibold">{fmt(price)}</span>
            {product.rating_count > 0 && (
              <div className="flex items-center gap-1 text-[var(--text-small)] bg-[var(--color-bg-surface)] px-2 py-1 rounded-[var(--radius-sm)]">
                <Star size={14} className="fill-[var(--color-warning)] text-[var(--color-warning)]" />
                <span>{product.rating_avg} ({product.rating_count} reviews)</span>
              </div>
            )}
          </motion.div>

          <motion.p variants={prefersReducedMotion ? undefined : fadeUp} className="text-[var(--color-text-secondary)] leading-relaxed font-body">
            {product.description}
          </motion.p>

          <motion.hr variants={prefersReducedMotion ? undefined : fadeUp} className="border-[var(--color-border)] my-2" />

          {/* Sizes */}
          {product.variants && product.variants.some((v: any) => v.size) && (
            <motion.div variants={prefersReducedMotion ? undefined : fadeUp}>
              <h3 className="font-medium mb-3 text-[var(--color-text-primary)]">Select Size</h3>
              <div className="flex gap-3">
                {Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))).map((size: any) => (
                  <button
                    key={size}
                    className={`px-6 py-2 border rounded-[var(--radius-sm)] font-medium transition-all focus:outline-none ${
                      selectedSize === size
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                        : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
                    }`}
                    onClick={() => setSelectedSize(size!)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quantity & Add to Cart */}
          <motion.div variants={prefersReducedMotion ? undefined : fadeUp} className="flex flex-col gap-4 mt-4">
            {isOutOfStock ? (
              <div className="flex items-center gap-2 p-4 rounded-[var(--radius-sm)] bg-[#FFF4F4] text-[#E03131] border border-[#FFC9C9]">
                <AlertCircle size={20} />
                <span className="font-medium">Currently out of stock</span>
              </div>
            ) : activeVariant.stock <= 5 ? (
              <p className="text-[var(--color-warning)] text-[var(--text-small)] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> Only {activeVariant.stock} left in stock - order soon.
              </p>
            ) : null}

            <div className="flex gap-4" ref={addToCartRef}>
              <div className={`flex items-center border border-[var(--color-border)] rounded-[var(--radius-sm)] h-12 bg-[var(--color-bg)] ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  className="px-4 h-full text-[var(--color-text-secondary)] hover:text-black font-semibold focus:outline-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  className="px-4 h-full text-[var(--color-text-secondary)] hover:text-black font-semibold focus:outline-none"
                  onClick={() => setQuantity(Math.min(activeVariant.stock, quantity + 1))}
                  disabled={isOutOfStock}
                >
                  +
                </button>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 text-white h-12 rounded-[var(--radius-sm)] font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-subtle)] flex items-center justify-center gap-2 ${
                  isOutOfStock ? "bg-gray-300 cursor-not-allowed" : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
                }`}
              >
                <ShoppingBag size={18} /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </motion.button>
              <div className="relative">
                <button
                  className="h-12 w-12 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] rounded-[var(--radius-sm)] flex items-center justify-center transition-colors focus:outline-none"
                  onClick={() => setShowWishlistDropdown(!showWishlistDropdown)}
                  aria-label="Save to Wishlist"
                >
                  <Heart size={20} />
                </button>
                
                {showWishlistDropdown && (
                  <div className="absolute right-0 bottom-14 w-64 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-[var(--color-bg-dark)]/5 border-b border-[var(--color-border)] flex justify-between items-center">
                      <h4 className="text-[var(--text-micro)] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Save to Wishlist</h4>
                      {!isCreatingWishlist && (
                        <button onClick={() => setIsCreatingWishlist(true)} className="text-[var(--text-micro)] text-[var(--color-accent)] font-medium uppercase tracking-wider hover:underline">
                          + New
                        </button>
                      )}
                    </div>
                    
                    {isCreatingWishlist ? (
                      <form onSubmit={handleCreateWishlist} className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="Wishlist name..." 
                          className="w-full text-[var(--text-small)] px-2 py-1.5 border border-[var(--color-border)] rounded mb-2 focus:outline-none focus:border-[var(--color-accent)]"
                          value={newWishlistName}
                          onChange={(e) => setNewWishlistName(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setIsCreatingWishlist(false)} className="text-[var(--text-micro)] text-[var(--color-text-muted)] hover:text-black">Cancel</button>
                          <button type="submit" className="text-[var(--text-micro)] text-white bg-[var(--color-accent)] px-2 py-1 rounded font-medium">Create & Save</button>
                        </div>
                      </form>
                    ) : null}

                    {wishlistGroups.length === 0 && !isCreatingWishlist ? (
                      <div className="p-4 text-[var(--text-small)] text-center text-[var(--color-text-muted)]">
                        No wishlists found.
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {wishlistGroups.map(group => (
                          <button
                            key={group.id}
                            onClick={() => handleSaveToWishlist(group.id)}
                            className="w-full text-left px-4 py-2 text-[var(--text-small)] hover:bg-[var(--color-bg-dark)]/5 transition-colors border-b border-[var(--color-border)] last:border-0 truncate"
                          >
                            {group.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Details Accordion */}
          <motion.div variants={prefersReducedMotion ? undefined : fadeUp} className="mt-8 flex flex-col divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
            <div className="py-4">
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'description' ? null : 'description')}
                className="w-full flex justify-between items-center font-medium focus:outline-none focus:text-[var(--color-accent)] group"
              >
                Description
                <ChevronDown size={18} className={`transition-transform duration-300 ${openAccordion === 'description' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openAccordion === 'description' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 text-[var(--color-text-secondary)] text-[var(--text-small)] space-y-2">
                      <p>Each piece is entirely unique due to the handmade nature of the creations process.</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Directly sourced from Indian independent makers</li>
                        <li>Premium quality authentic materials</li>
                        <li>Eco-friendly traditional crafting methods</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="py-4">
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                className="w-full flex justify-between items-center font-medium focus:outline-none focus:text-[var(--color-accent)] group"
              >
                Shipping & Returns
                <ChevronDown size={18} className={`transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openAccordion === 'shipping' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 text-[var(--color-text-secondary)] text-[var(--text-small)]">
                      <p>Ships directly from the artist&apos;s studio. Usually dispatches within 3-5 business days.</p>
                      <p className="mt-2">Returns accepted within 14 days of delivery if the item is unused and in original condition.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.section>
      </div>

      {recentlyViewed.length > 1 && (
        <div className="mt-24 border-t border-[var(--color-border)] pt-12">
          <ProductCarousel 
            title="Recently Viewed" 
            products={recentlyViewed.filter(p => p.id !== product.id)} 
          />
        </div>
      )}

      {children}

      {/* Sticky Mobile Add To Cart */}
      <AnimatePresence>
        {showStickyCart && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[var(--color-border)] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 md:hidden flex items-center justify-between gap-4"
          >
            <div className="flex flex-col truncate">
              <span className="font-medium text-[var(--text-small)] truncate">{product.title}</span>
              <span className="font-semibold text-[var(--text-body)]">{fmt(price)}</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`px-6 h-12 text-white rounded-[var(--radius-sm)] font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                isOutOfStock ? "bg-gray-300 cursor-not-allowed" : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
