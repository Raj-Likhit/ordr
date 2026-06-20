"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";

export default function PayoutsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gstin: "",
    pan_number: "",
    bank_account_no: "",
    bank_ifsc: "",
    account_holder: "",
    upi_id: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload File if present
      if (file) {
        const filePath = `${user.id}/gstin_certificate/${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("vendor-docs")
          .upload(filePath, file, { upsert: true });

        if (uploadErr) {
          throw new Error("Failed to upload document: " + uploadErr.message);
        }

        // Insert into vendor_documents table
        await supabase.from("vendor_documents").insert({
          vendor_id: user.id,
          doc_type: "gstin_certificate",
          storage_path: filePath,
          file_name: file.name,
          mime_type: file.type
        });
      }

      // 2. Submit to API Route
      const response = await fetch("/api/vendor/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      router.push("/vendor/onboarding/submitted");
    } catch (err: any) {
      showToast({ message: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-display mb-2">Tax & Bank Details</h1>
        <p className="text-[var(--color-text-secondary)]">Step 2 of 2: Setup your payouts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Tax Information</h3>
          <Input
            label="GSTIN"
            required
            pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
            title="Valid 15-character GSTIN"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
          />
          <Input
            label="PAN Number"
            required
            pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
            title="Valid 10-character PAN"
            value={formData.pan_number}
            onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
          />
          <div>
            <label className="block text-sm font-medium mb-2">Upload GSTIN Certificate (Optional but recommended)</label>
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[var(--color-text-primary)] file:text-[var(--color-bg)] hover:file:bg-opacity-90"
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-6 space-y-4">
          <h3 className="font-medium text-lg">Bank Account</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">Your earnings will be settled here.</p>
          
          <Input
            label="Account Holder Name"
            required
            value={formData.account_holder}
            onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
          />
          <Input
            label="Account Number"
            required
            type="password"
            value={formData.bank_account_no}
            onChange={(e) => setFormData({ ...formData, bank_account_no: e.target.value })}
          />
          <Input
            label="IFSC Code"
            required
            pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
            title="Valid 11-character IFSC"
            value={formData.bank_ifsc}
            onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })}
          />
          <Input
            label="UPI ID (Optional)"
            placeholder="merchant@upi"
            value={formData.upi_id}
            onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
          />
        </div>

        <div className="pt-4 flex justify-between items-center">
          <Button type="button" variant="secondary" onClick={() => router.push("/vendor/onboarding/store")} disabled={submitting}>
            Back
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
