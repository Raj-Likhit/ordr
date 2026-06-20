"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Circle } from 'lucide-react';

const STEPS = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
const LABELS: Record<string, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export function OrderTimeline({ subOrderId }: { subOrderId: string }) {
  const [status, setStatus] = useState<string>('placed');
  const [log, setLog] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial state
    supabase.from('sub_orders').select('status').eq('id', subOrderId).single()
      .then(({ data }) => data && setStatus(data.status));
      
    supabase.from('order_status_history').select('*').eq('sub_order_id', subOrderId).order('changed_at')
      .then(({ data }) => data && setLog(data));

    // Subscribe to realtime status changes
    const channel = supabase
      .channel(`sub_order:${subOrderId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sub_orders', filter: `id=eq.${subOrderId}`
      }, (payload) => {
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [subOrderId]);

  const currentIdx = STEPS.indexOf(status);
  const isCancelled = status === 'cancelled';
  const isReturned = status === 'returned';

  return (
    <div className="py-8">
      <h3 className="font-display text-[var(--text-subtitle)] mb-6">Tracking Details</h3>
      <div className="relative pl-4 border-l-2 border-[var(--color-border)] ml-3 space-y-8">
        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isActive = idx === currentIdx;
          const logEntry = log.find(l => l.status === step);

          return (
            <div key={step} className="relative">
              {/* Dot */}
              <div className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center bg-[var(--color-bg)] ${isDone ? 'text-[var(--color-accent)]' : 'text-[var(--color-border-strong)]'}`}>
                {isDone ? <CheckCircle2 size={20} className="bg-white" /> : <Circle size={16} className="bg-white" />}
              </div>
              
              <div className={isActive ? "text-[var(--color-text-primary)] font-medium" : isDone ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"}>
                <p className="text-[var(--text-body)]">{LABELS[step]}</p>
                {logEntry && (
                  <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">
                    {new Date(logEntry.changed_at).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(isCancelled || isReturned) && (
        <div className="mt-8 inline-block px-4 py-2 rounded-[var(--radius-sm)] bg-[#FFF4F4] text-[#E03131] border border-[#FFC9C9] font-medium">
          {status.toUpperCase()}
        </div>
      )}
    </div>
  );
}
