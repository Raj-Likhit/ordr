import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/ui";
import "@/styles/globals.css";
import { PageTransition } from "@/components/layout/PageTransition";
import { AuthProvider } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/server";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { OnboardingStatus } from "@/src/modules/onboarding/types";

export const metadata: Metadata = {
  title: "Ordr",
  description: "Independent sellers. Extraordinary finds.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let onboardingStatus: OnboardingStatus = 'completed';
  let hasName = true;
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_status, full_name')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      onboardingStatus = (profile.onboarding_status as OnboardingStatus) || 'pending';
      hasName = !!(profile.full_name && profile.full_name.trim().length > 0);
    }
  }

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[var(--color-bg)]">
        <AuthProvider>
          <ToastProvider>
            <OnboardingProvider initialStatus={onboardingStatus} hasName={hasName}>
              <Header />
              <main className="flex-1 pb-16 md:pb-0 pt-20">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <BottomNav />
            </OnboardingProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
