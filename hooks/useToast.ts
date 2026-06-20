"use client";

import { useToast as useProviderToast } from "@/components/ui/ToastProvider";

export function useToast() {
  const { addToast } = useProviderToast();

  const showToast = ({ message, type, action, duration }: { message: string; type?: "success" | "error" | "neutral", duration?: number, action?: {label: string, onClick: () => void} }) => {
    addToast({ message, variant: type, action, duration });
  };

  return { showToast };
}
