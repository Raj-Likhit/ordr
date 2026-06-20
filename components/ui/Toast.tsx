"use client";

import React, { useEffect, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const toastVariants = cva(
  "flex items-center gap-3 rounded-[var(--radius-sm)] px-4 py-3 shadow-lg transition-all duration-300 transform font-body text-[var(--text-body)]",
  {
    variants: {
      variant: {
        success: "bg-white border-l-[4px] border-[var(--color-success)] text-[var(--color-text-primary)]",
        error: "bg-white border-l-[4px] border-[var(--color-error)] text-[var(--color-text-primary)]",
        neutral: "bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({ message, variant, onClose, duration = 3000, action }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // wait for exit animation
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`
        ${toastVariants({ variant })}
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 md:-translate-y-4 md:translate-y-0"}
      `}
      role="alert"
    >
      <div className="flex items-center gap-3">
        {variant === "success" && <SuccessIcon />}
        {variant === "error" && <ErrorIcon />}
        <span className="flex-1">{message}</span>
      </div>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`ml-2 text-[var(--text-small)] font-semibold px-2 py-1 rounded hover:bg-black/5 transition-colors uppercase tracking-wider ${
            variant === "neutral" ? "text-[var(--color-accent)]" : ""
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
