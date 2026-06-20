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

  const handleGoogleSignIn = async () => {
    try {
      // For vendor sign-in, we use Google OAuth and then assign them a 'vendor' role via the callback or profile
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=vendor`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      showToast({ message: err.message || "Google authentication failed", type: "error" });
    }
  };

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
          <div className="mb-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleSignIn}
              className="w-full justify-center flex items-center gap-3 py-2.5 h-auto text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--color-bg-surface)] px-2 text-[var(--color-text-muted)]">
                Or continue with email
              </span>
            </div>
          </div>

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
          Vendors must comply with Ordr&apos;s Seller Guidelines and Quality Standards
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
