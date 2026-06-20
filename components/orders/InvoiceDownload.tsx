"use client";

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';
import { Download, Loader2 } from 'lucide-react';

export function InvoiceDownload({ subOrderId, status }: { subOrderId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  // According to specs, invoice is only available on 'delivered' status
  if (status !== 'delivered') return null;

  const handleDownload = async () => {
    setLoading(true);
    try {
      // 1. Check if invoice exists in DB
      let path;
      const { data: inv } = await supabase
        .from('invoices')
        .select('pdf_url')
        .eq('sub_order_id', subOrderId)
        .single();

      if (inv?.pdf_url) {
        path = inv.pdf_url;
      } else {
        // Fallback: forcefully generate it if it failed during the async delivery trigger
        const res = await fetch(`/api/invoice/${subOrderId}/generate`, { method: 'POST' });
        if (!res.ok) throw new Error("Could not generate invoice");
        const data = await res.json();
        path = data.storagePath;
      }

      if (!path) throw new Error("Invoice path missing");

      // 2. Get signed URL (valid for 60s)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('order-invoices')
        .createSignedUrl(path, 60);

      if (urlError || !urlData?.signedUrl) throw new Error("Could not authorize download");

      // 3. Open PDF
      window.open(urlData.signedUrl, '_blank');
      
    } catch (e: any) {
      showToast({ message: e.message || "Failed to download invoice", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium hover:bg-[var(--color-bg-surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {loading ? 'Generating...' : 'Download Invoice'}
    </button>
  );
}
