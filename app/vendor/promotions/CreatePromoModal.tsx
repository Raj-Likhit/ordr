"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Plus, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function CreatePromoModal({ vendorId, trigger }: { vendorId: string, trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase.from('promotions').insert({
        vendor_id: vendorId,
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value || '0'),
        is_active: true
      });

      if (error) throw error;
      
      setIsOpen(false);
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_value: '0' });
      router.refresh();
    } catch (err: any) {
      alert("Failed to create promotion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || <Button variant="primary" className="flex items-center gap-2"><Plus size={16} /> Create Promo</Button>}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-surface)] w-full max-w-md rounded-[var(--radius-lg)] shadow-xl overflow-hidden border border-[var(--color-border)]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="font-display text-[var(--text-subtitle)]">Create Promo Code</h2>
              <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-muted)] hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[var(--text-small)] font-medium mb-1">Code</label>
                <input 
                  required 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 uppercase" 
                  placeholder="e.g. SUMMER25" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-small)] font-medium mb-1">Type</label>
                  <select 
                    value={formData.discount_type} 
                    onChange={e => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-small)] font-medium mb-1">Value</label>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    step="any"
                    value={formData.discount_value} 
                    onChange={e => setFormData({...formData, discount_value: e.target.value})}
                    className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3" 
                    placeholder="e.g. 15" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[var(--text-small)] font-medium mb-1">Minimum Order Value (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.min_order_value} 
                  onChange={e => setFormData({...formData, min_order_value: e.target.value})}
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3" 
                  placeholder="e.g. 500" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
