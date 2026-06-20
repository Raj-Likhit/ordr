"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SubmittedPage() {
  const [status, setStatus] = useState<string>("loading");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let channel: any;

    async function loadStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Initial fetch
      const { data } = await supabase
        .from("vendor_profiles")
        .select("status, rejection_reason")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setStatus(data.status);
        setRejectionReason(data.rejection_reason);
      }

      // Realtime subscription
      channel = supabase
        .channel('vendor-status')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendor_profiles',
          filter: `id=eq.${user.id}` // using 'id' as it maps to user_id in our schema
        }, (payload) => {
          setStatus(payload.new.status);
          setRejectionReason(payload.new.rejection_reason);
        })
        .subscribe();
    }

    loadStatus();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (status === "loading") {
    return <div className="p-8 text-center">Checking status...</div>;
  }

  const renderContent = () => {
    switch (status) {
      case "approved":
        return (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-display text-[var(--color-text-primary)]">Store Approved!</h2>
            <p className="text-[var(--color-text-secondary)]">Your vendor application has been approved. You can now start adding products.</p>
            <div className="pt-4">
              <Link href="/vendor">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        );
      case "rejected":
        return (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-display text-[var(--color-text-primary)]">Application Action Required</h2>
            <p className="text-[var(--color-text-secondary)]">Your application requires some changes before it can be approved.</p>
            {rejectionReason && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md text-sm text-left mx-auto max-w-md border border-red-200">
                <p className="font-semibold mb-1">Reason from Admin:</p>
                <p>{rejectionReason}</p>
              </div>
            )}
            <div className="pt-4 space-x-4">
              <Link href="/vendor/onboarding/store">
                <Button variant="secondary">Update Details</Button>
              </Link>
              <Link href="/vendor/onboarding/payouts">
                <Button>Update Documents</Button>
              </Link>
            </div>
          </div>
        );
      case "under_review":
      case "pending":
      default:
        return (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
              <Clock size={32} />
            </div>
            <h2 className="text-2xl font-display text-[var(--color-text-primary)]">Application Under Review</h2>
            <p className="text-[var(--color-text-secondary)]">
              Your application has been successfully submitted and is currently being reviewed by our team.
              We will notify you via email once a decision is made.
            </p>
            <div className="pt-8 flex justify-center items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <RefreshCw size={14} className="animate-spin" />
              <span>Auto-updating... no need to refresh</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] shadow-sm min-h-[400px] flex items-center justify-center">
      {renderContent()}
    </div>
  );
}
