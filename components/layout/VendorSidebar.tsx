"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, DollarSign, Settings, Store, Tags, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui";

export function VendorSidebar({ businessName = "Vendor" }: { businessName?: string }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/vendor/dashboard",  label: "Overview",    icon: LayoutDashboard },
    { href: "/vendor/products",   label: "My Products", icon: Package },
    { href: "/vendor/orders",     label: "Orders",      icon: ShoppingCart },
    { href: "/vendor/promotions", label: "Promotions",  icon: Tags },
    { href: "/vendor/questions",  label: "Questions",   icon: MessageSquare },
    { href: "/vendor/payouts",    label: "Payouts",     icon: DollarSign },
    { href: "/vendor/settings",   label: "Settings",    icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)] flex flex-col z-30">
      <div className="p-6">
        <Link href="/" className="font-display text-2xl font-semibold tracking-widest uppercase mb-8 block">
          Ordr Vendor
        </Link>
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-2 text-[var(--text-small)]">
            <Store size={16} className="text-[var(--color-text-muted)]" />
            <span className="font-medium">{businessName}</span>
          </div>
          <div>
            <Badge variant="approved">APPROVED</Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors text-[var(--text-small)] font-body ${
                isActive
                  ? "bg-[var(--color-bg-dark-alt)] text-white font-medium"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-dark-alt)] hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {link.label}
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
