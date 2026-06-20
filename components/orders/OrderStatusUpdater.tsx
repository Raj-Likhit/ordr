"use client";

import React, { useState } from 'react';
import { advanceOrderStatus, OrderStatus } from '@/lib/services/OrderService';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';

const NEXT_ACTIONS: Record<string, { to: string; label: string; variant: 'primary' | 'danger' | 'success' }[]> = {
  placed: [
    { to: 'confirmed', label: 'Confirm Order', variant: 'primary' },
    { to: 'cancelled', label: 'Cancel', variant: 'danger' }
  ],
  confirmed: [
    { to: 'shipped', label: 'Mark Shipped', variant: 'primary' },
    { to: 'cancelled', label: 'Cancel', variant: 'danger' }
  ],
  shipped: [
    { to: 'out_for_delivery', label: 'Out for Delivery', variant: 'primary' }
  ],
  out_for_delivery: [
    { to: 'delivered', label: 'Mark Delivered', variant: 'success' }
  ],
  delivered: [],
  cancelled: [],
  returned: [],
};

export function OrderStatusUpdater({ 
  subOrderId, 
  currentStatus, 
  onUpdate 
}: { 
  subOrderId: string, 
  currentStatus: string, 
  onUpdate?: () => void 
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { showToast } = useToast();

  const actions = NEXT_ACTIONS[currentStatus] ?? [];

  if (!actions.length) {
    return (
      <span className="px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] font-medium text-[var(--text-small)] border border-[var(--color-border)] uppercase tracking-wider">
        {currentStatus.replace('_', ' ')}
      </span>
    );
  }

  const handleAction = async (toStatus: OrderStatus) => {
    setLoadingAction(toStatus);
    try {
      await advanceOrderStatus(subOrderId, toStatus);
      showToast({ message: `Order updated to ${toStatus.replace('_', ' ')}`, type: 'success' });
      onUpdate?.();
    } catch (e: any) {
      showToast({ message: e.message || "Failed to update status", type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map(action => {
        const isPrimary = action.variant === 'primary';
        const isSuccess = action.variant === 'success';
        const isDanger = action.variant === 'danger';

        let btnClass = "px-4 py-2 rounded-[var(--radius-sm)] font-medium text-[var(--text-small)] transition-colors flex items-center gap-2";
        if (isPrimary) btnClass += " bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]";
        else if (isSuccess) btnClass += " bg-[#16A34A] text-white hover:bg-[#15803D]";
        else if (isDanger) btnClass += " bg-transparent border border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2]";

        return (
          <button
            key={action.to}
            className={btnClass}
            disabled={loadingAction !== null}
            onClick={() => handleAction(action.to as OrderStatus)}
          >
            {loadingAction === action.to && <Loader2 size={16} className="animate-spin" />}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
