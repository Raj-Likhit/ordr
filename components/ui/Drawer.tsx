"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right" | "bottom";
  className?: string;
}

export function Drawer({ isOpen, onClose, title, children, side = "right", className = "" }: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const sideClasses = {
    left: "left-0 top-0 bottom-0 h-full w-full max-w-sm border-r-[1.5px] border-[var(--color-border)]",
    right: "right-0 top-0 bottom-0 h-full w-full max-w-[420px] border-l-[1.5px] border-[var(--color-border)]",
    bottom: "bottom-0 left-0 right-0 w-full max-h-[90vh] rounded-t-[var(--radius-lg)] border-t-[1.5px] border-[var(--color-border)]",
  };

  const transformClasses = {
    left: isOpen ? "translate-x-0" : "-translate-x-full",
    right: isOpen ? "translate-x-0" : "translate-x-full",
    bottom: isOpen ? "translate-y-0" : "translate-y-full",
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer Content */}
      <div 
        role="dialog"
        aria-modal="true"
        className={`fixed z-50 flex flex-col bg-[var(--color-bg)] shadow-[var(--shadow-float)] transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${sideClasses[side]} ${transformClasses[side]} ${className}`}
      >
        <div className="flex items-center justify-between p-4 border-b-[1.5px] border-[var(--color-border)]">
          {title && (
            <h2 className="font-accent text-[var(--text-label)] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-primary)]">
              {title}
            </h2>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors ml-auto"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
}
