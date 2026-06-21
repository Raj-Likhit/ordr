import React from "react";
import { VendorSidebar } from "@/components/layout/VendorSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/vendor");
  }

  const { data: vendorProfile } = await supabase
    .from("vendor_profiles")
    .select("status, business_name")
    .eq("id", user.id)
    .single();

  const status = vendorProfile?.status || "pending";
  const businessName = vendorProfile?.business_name || "Vendor";
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path") || "";
  
  const isOnboardingRoute = pathname.includes("/vendor/onboarding");

  // Redirect to onboarding if not approved and not already on an onboarding route
  if (status !== "approved" && !isOnboardingRoute) {
    if (status === "under_review" || status === "rejected" || status === "suspended") {
      redirect("/vendor/onboarding/submitted");
    } else {
      // Pending
      redirect("/vendor/onboarding/store");
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]">
      {!isOnboardingRoute && <VendorSidebar businessName={businessName} />}
      <main className={isOnboardingRoute ? "p-8" : "ml-64 p-8"}>
        {children}
      </main>
    </div>
  );
}
