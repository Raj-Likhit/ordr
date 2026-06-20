"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PromoStatusToggle({ promoId, isActive }: { promoId: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !isActive })
        .eq('id', promoId);

      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleStatus}
      disabled={loading}
      className={`text-[var(--text-small)] font-medium underline underline-offset-2 ${isActive ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'} disabled:opacity-50`}
    >
      {loading ? '...' : (isActive ? 'Deactivate' : 'Activate')}
    </button>
  );
}
