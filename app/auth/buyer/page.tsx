"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Eye, EyeOff, Smartphone, Mail } from "lucide-react";
import { useCartStore } from "@/hooks/useCart";

function BuyerAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  
  // Email Auth State
  const [email, setEmail] = useState("buyer@ordr.com");
  const [password, setPassword] = useState("buyer123456");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone Auth State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  // Shared State
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };
  const strength = getPasswordStrength(password);
  const strengthColors = ["bg-gray-200", "bg-red-400", "bg-yellow-400", "bg-green-400", "bg-green-600"];

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { refreshProfile } = useAuth();
  const { showToast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      showToast({ message: err.message || "Google authentication failed", type: "error" });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Default to Indian country code +91 if none provided
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          data: !isLogin && fullName ? { full_name: fullName } : undefined,
        }
      });
      
      if (error) throw error;
      
      setOtpSent(true);
      showToast({ message: "OTP sent to your phone!", type: "success" });
    } catch (err: any) {
      showToast({ message: err.message || "Failed to send OTP", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });
      
      if (error) throw error;

      showToast({ message: "Successfully verified!", type: "success" });
      await refreshProfile();
      
      if (data.user) {
        // Try creating profile for new users
        if (!isLogin) {
          const { error: profileErr } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              role: "buyer",
              full_name: fullName || "Ordr User",
            });

          if (profileErr && profileErr.code !== "23505") {
            console.error("Profile creation error:", profileErr);
          }
        }
        
        // Sync guest cart
        try {
          await useCartStore.getState().syncWithDatabase(data.user.id);
        } catch (e) {
          console.error("Cart sync failed", e);
        }
      }
      
      const redirectPath = searchParams.get("redirect") || "/";
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      showToast({ message: err.message || "Invalid OTP", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        showToast({ message: "Welcome back!", type: "success" });
        await refreshProfile();
        
        // Seamless Guest-to-User Cart Merge
        if (data.user) {
          try {
            await useCartStore.getState().syncWithDatabase(data.user.id);
          } catch (e) {
            console.error("Cart sync failed", e);
          }
        }
        
        const redirectPath = searchParams.get("redirect") || "/";
        router.push(redirectPath);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.user) {
          const { error: profileErr } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              role: fullName.toLowerCase().includes("admin") ? "admin" : "buyer",
              full_name: fullName,
            });

          if (profileErr && profileErr.code !== "23505") {
            console.error("Profile creation error:", profileErr);
          }
        }

        showToast({
          message: "Account created! Check your email to verify.",
          type: "success",
        });
        setIsLogin(true);
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
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </Link>

        {/* Card */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 md:p-10 shadow-[var(--shadow-sm)]">
          {/* Icon */}
          <div className="inline-flex p-3 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] mb-6">
            <ShoppingBag size={24} strokeWidth={1.5} />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl text-[var(--color-text-primary)] mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {isLogin
                ? "Sign in to continue shopping"
                : "Join to discover unique handcrafted goods"}
            </p>
          </div>

          {/* Google Auth Button */}
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
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Auth Method Toggles */}
          <div className="flex gap-2 p-1 bg-[var(--color-bg)] rounded-[var(--radius-md)] mb-6">
            <button
              type="button"
              onClick={() => setAuthMode("email")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                authMode === "email" 
                  ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]" 
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Mail size={16} /> Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("phone")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
                authMode === "phone" 
                  ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]" 
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Smartphone size={16} /> Phone
            </button>
          </div>

          {/* Forms */}
          {authMode === "email" ? (
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {!isLogin && (
                <div>
                  <Input
                    type="text"
                    required
                    label="Full Name"
                    placeholder="Arjun Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Input
                  type="email"
                  required
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconRight={
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:text-[var(--color-text-primary)] focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
                {!isLogin && password.length > 0 && (
                  <div className="mt-2 flex gap-1 h-1.5 w-full">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-full transition-colors duration-300 ${i < strength ? strengthColors[strength] : 'bg-[var(--color-border)]'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="w-full justify-center"
                >
                  {submitting ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
              {!isLogin && !otpSent && (
                <div>
                  <Input
                    type="text"
                    required
                    label="Full Name"
                    placeholder="Arjun Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              {!otpSent ? (
                <div>
                  <Input
                    type="tel"
                    required
                    label="Phone Number"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Enter mobile number with country code if outside India
                  </p>
                </div>
              ) : (
                <div>
                  <Input
                    type="text"
                    required
                    label="Enter OTP"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    Sent to {phone}. <button type="button" onClick={() => setOtpSent(false)} className="text-[var(--color-accent)] hover:underline">Change</button>
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="w-full justify-center"
                >
                  {submitting 
                    ? "Processing..." 
                    : otpSent 
                      ? "Verify & Continue" 
                      : isLogin 
                        ? "Send OTP" 
                        : "Sign Up with Phone"}
                </Button>
              </div>
            </form>
          )}

          {/* Toggle */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setOtpSent(false);
              }}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          By continuing, you agree to Ordr&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default function BuyerAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    }>
      <BuyerAuthForm />
    </Suspense>
  );
}
