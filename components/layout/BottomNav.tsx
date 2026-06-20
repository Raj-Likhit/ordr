"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on desktop, or specific paths like vendor, admin, checkout
  if (
    pathname?.startsWith("/vendor") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout")
  ) {
    return null;
  }

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shop", icon: Search, label: "Browse" },
    { href: "/account/wishlist", icon: Heart, label: "Saved" },
    { href: "/cart", icon: ShoppingBag, label: "Cart" },
    { href: "/account", icon: User, label: "Account" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t-[1.5px] border-[var(--color-border)] px-4 py-2 flex items-center justify-between z-40 md:hidden pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center w-14 h-12 transition-colors ${
              isActive
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-body font-medium">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
