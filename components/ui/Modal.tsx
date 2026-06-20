"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = "" }: ModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        role="dialog"
        aria-modal="true"
        className={`relative z-50 w-full max-w-lg bg-[var(--color-bg)] shadow-[var(--shadow-float)] rounded-[var(--radius-lg)] p-6 m-4 flex flex-col max-h-[90vh] overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)]">
              {title}
            </h2>
          )}
          <button 
            onClick={onClose}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors ml-auto"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
