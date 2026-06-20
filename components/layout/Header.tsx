"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu, X, LogOut, Settings, Heart, Package, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CartDrawer } from "./CartDrawer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const router = useRouter();
  
  const { cartCount } = useCart();
  const { user, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-40 transition-colors duration-300 ${
          isScrolled || isMobileMenuOpen || isSearchOpen
            ? "bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)] shadow-sm"
            : "bg-transparent text-[var(--color-text-primary)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button 
                className="p-2 -ml-2 hover:bg-black/5 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex-1 md:flex-none text-center md:text-left">
              <Link href="/" className="font-display text-3xl font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity">
                Ordr
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8 text-[var(--text-small)] font-body font-medium uppercase tracking-wider">
              <Link href="/shop" className="hover:text-[var(--color-accent)] transition-colors">
                Browse
              </Link>
              <Link href="/auth/vendor-apply" className="hover:text-[var(--color-accent)] transition-colors">
                Become a Seller
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="p-2 hover:text-[var(--color-accent)] transition-colors hidden md:block"
                aria-label="Search"
              >
                <Search size={22} />
              </button>
              
              {user ? (
                <div className="relative profile-dropdown-container hidden md:block">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="p-2 hover:text-[var(--color-accent)] transition-colors focus:outline-none"
                    aria-label="Account Menu"
                    aria-expanded={isProfileDropdownOpen}
                  >
                    <User size={22} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] rounded-[var(--radius-md)] shadow-lg border border-[var(--color-border)] overflow-hidden z-50 py-2">
                      <div className="px-4 py-3 border-b border-[var(--color-border)] mb-2">
                        <p className="text-[var(--text-small)] font-medium truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-[var(--text-micro)] text-[var(--color-text-muted)] truncate">{user.email}</p>
                      </div>
                      
                      {profile?.role === "admin" && (
                        <Link href="/admin/vendors" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-[var(--text-small)] hover:bg-[var(--color-bg-dark)]/5 transition-colors">
                          <LayoutDashboard size={16} className="mr-3 text-[var(--color-text-muted)]" /> Admin Dashboard
                        </Link>
                      )}
                      
                      {profile?.role === "vendor" && (
                        <Link href="/vendor/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-[var(--text-small)] hover:bg-[var(--color-bg-dark)]/5 transition-colors">
                          <LayoutDashboard size={16} className="mr-3 text-[var(--color-text-muted)]" /> Seller Dashboard
                        </Link>
                      )}

                      <Link href="/account/orders" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-[var(--text-small)] hover:bg-[var(--color-bg-dark)]/5 transition-colors">
                        <Package size={16} className="mr-3 text-[var(--color-text-muted)]" /> My Orders
                      </Link>

                      <Link href="/account/wishlist" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-[var(--text-small)] hover:bg-[var(--color-bg-dark)]/5 transition-colors">
                        <Heart size={16} className="mr-3 text-[var(--color-text-muted)]" /> Wishlist
                      </Link>

                      <Link href="/account/settings" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-[var(--text-small)] hover:bg-[var(--color-bg-dark)]/5 transition-colors">
                        <Settings size={16} className="mr-3 text-[var(--color-text-muted)]" /> Account Settings
                      </Link>

                      <div className="h-px bg-[var(--color-border)] my-2"></div>
                      
                      <button 
                        onClick={async () => {
                          setIsProfileDropdownOpen(false);
                          const supabase = createClient();
                          await supabase.auth.signOut();
                          window.location.href = '/';
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-[var(--text-small)] text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors text-left"
                      >
                        <LogOut size={16} className="mr-3" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth" className="p-2 hover:text-[var(--color-accent)] transition-colors hidden md:block" aria-label="Sign In">
                  <User size={22} />
                </Link>
              )}

              <button 
                className="p-2 hover:text-[var(--color-accent)] transition-colors relative"
                onClick={() => setIsCartOpen(true)}
                aria-label="Cart"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0 bg-[var(--color-accent)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full Screen Search Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-[var(--color-bg-dark)]/95 backdrop-blur-sm transition-all duration-500 flex flex-col items-center justify-center px-4 ${
          isSearchOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <button 
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-8 right-8 p-2 text-white/70 hover:text-white transition-colors"
        >
          <X size={32} />
        </button>
        <div className="w-full max-w-3xl">
          <h2 className="text-white font-display text-2xl md:text-4xl mb-8 text-center">What are you looking for?</h2>
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={28} />
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              className="w-full bg-white/10 border border-white/20 rounded-full py-6 pl-16 pr-8 text-white text-xl md:text-2xl focus:outline-none focus:border-[var(--color-accent)] focus:bg-white/20 transition-all placeholder:text-white/30"
              autoFocus={isSearchOpen}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    router.push(`/search?q=${encodeURIComponent(val)}`);
                    setIsSearchOpen(false);
                    e.currentTarget.value = "";
                  }
                } else if (e.key === "Escape") {
                  setIsSearchOpen(false);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-[300px] bg-[var(--color-bg-surface)] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <span className="font-display text-2xl tracking-widest uppercase">Ordr</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-black/5 rounded-md">
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col p-6 space-y-6 flex-1 overflow-y-auto">
          <button 
            onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-[var(--text-body-lg)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Search size={22} /> Search
          </button>
          <Link 
            href="/shop" 
            className="flex items-center gap-3 text-[var(--text-body-lg)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ShoppingBag size={22} /> Shop All
          </Link>
          <Link 
            href="/auth/vendor-apply" 
            className="flex items-center gap-3 text-[var(--text-body-lg)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Become a Seller
          </Link>
          {user ? (
            <Link 
              href={profile?.role === "vendor" ? "/vendor/dashboard" : profile?.role === "admin" ? "/admin/vendors" : "/account/orders"} 
              className="flex items-center gap-3 text-[var(--text-body-lg)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mt-auto"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={22} /> My Account
            </Link>
          ) : (
            <Link 
              href="/auth" 
              className="flex items-center gap-3 text-[var(--text-body-lg)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mt-auto"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={22} /> Sign In
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
