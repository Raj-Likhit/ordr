"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Package, ShoppingCart, Undo, Bell, Settings } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Platform Overview", icon: BarChart3 },
    { href: "/admin/vendors", label: "Vendors", icon: Users },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "All Orders", icon: ShoppingCart },
    { href: "/admin/refunds", label: "Refunds", icon: Undo },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)] flex flex-col z-30">
      <div className="p-6">
        <Link href="/" className="font-display text-2xl font-semibold tracking-widest uppercase mb-8 block">
          Ordr Admin
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] transition-colors text-[var(--text-small)] font-body ${
                isActive
                  ? "bg-[var(--color-bg-dark-alt)] text-white font-medium"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-dark-alt)] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {link.label}
              </div>
              {/* Mock notification bubble for vendors queue */}
              {link.label === "Vendors" && (
                <span className="bg-[var(--color-accent)] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  6
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-[var(--color-bg-dark-alt)]">
        <Link href="/" className="text-[var(--text-small)] text-[var(--color-text-muted)] hover:text-white transition-colors flex items-center gap-2">
          Return to Storefront
        </Link>
      </div>
    </aside>
  );
}
