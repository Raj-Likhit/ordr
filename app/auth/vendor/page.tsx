"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";

function VendorAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("vendor1@ordr.com");
  const [password, setPassword] = useState("vendor123456");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstin, setGstin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { refreshProfile } = useAuth();
  const { showToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        showToast({ message: "Welcome back to your studio!", type: "success" });
        await refreshProfile();
        
        const redirectPath = searchParams.get("redirect") || "/vendor";
        router.push(redirectPath);
        router.refresh();
      } else {
        const signupRes = await fetch("/api/auth/signup-vendor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, fullName, businessName })
        });

        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          throw new Error(signupData.error || "Failed to create studio account");
        }

        // Auto-login after successful backend registration
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) throw loginError;

        showToast({
          message: "Studio account created successfully and auto-logged in!",
          type: "success",
        });

        await refreshProfile();
        router.push("/vendor");
        router.refresh();
      }
    } catch (err: any) {
      showToast({
        message: err.message || "Authentication failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link 
          href="/auth" 
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </Link>

        {/* Card */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 md:p-10 shadow-[var(--shadow-sm)]">
          {/* Icon */}
          <div className="inline-flex p-3 rounded-[var(--radius-md)] bg-[var(--color-text-primary)]/5 text-[var(--color-text-primary)] mb-6">
            <Store size={24} strokeWidth={1.5} />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl text-[var(--color-text-primary)] mb-2">
              {isLogin ? "Vendor Portal" : "Open Your Studio"}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {isLogin
                ? "Access your dashboard and manage orders"
                : "Join as a creator and showcase your craft"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <Input
                    type="text"
                    required
                    label="Full Name"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    required
                    label="Business Name"
                    placeholder="Jane's Ceramics"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Input
                type="email"
                required
                label="Email"
                placeholder="studio@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Input
                type="password"
                required
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full justify-center"
              >
                {submitting ? "Processing..." : isLogin ? "Sign In" : "Apply to Sell"}
              </Button>
            </div>
          </form>

          {/* Toggle */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {isLogin ? "New to selling? Apply now" : "Already a vendor? Sign in"}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          Vendors must comply with Ordr's Seller Guidelines and Quality Standards
        </p>
      </div>
    </div>
  );
}

export default function VendorAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    }>
      <VendorAuthForm />
    </Suspense>
  );
}
