"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";

export default function StoreDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "individual",
    category: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFormData({
          business_name: data.business_name || "",
          business_type: data.business_type || "individual",
          category: data.category?.[0] || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        });
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("vendor_profiles")
        .update({
          business_name: formData.business_name,
          business_type: formData.business_type,
          category: formData.category ? [formData.category] : [],
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        })
        .eq("id", user.id);

      if (error) throw error;

      router.push("/vendor/onboarding/payouts");
    } catch (err: any) {
      showToast({ message: err.message || "Failed to save details", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-display mb-2">Store & Business Details</h1>
        <p className="text-[var(--color-text-secondary)]">Step 1 of 2: Tell us about your business</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Legal Business Name"
          required
          value={formData.business_name}
          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Business Type</label>
          <select
            className="w-full h-10 px-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-sm"
            value={formData.business_type}
            onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
          >
            <option value="individual">Individual / Proprietorship</option>
            <option value="partnership">Partnership</option>
            <option value="pvt_ltd">Private Limited</option>
            <option value="llp">LLP</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Input
          label="Primary Category"
          placeholder="e.g. Ceramics, Jewelry, Clothing"
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />

        <div className="border-t border-[var(--color-border)] pt-6 mt-6">
          <h3 className="font-medium mb-4">Business Address</h3>
          <div className="space-y-4">
            <Input
              label="Address Line 1"
              required
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
            />
            <Input
              label="Address Line 2 (Optional)"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="State"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <Input
              label="Pincode"
              required
              pattern="^[1-9][0-9]{5}$"
              title="6 digit Indian Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Next: Tax & Payouts"}
          </Button>
        </div>
      </form>
    </div>
  );
}
