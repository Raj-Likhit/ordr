import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Check admin role
  if (user.user_metadata?.role !== 'admin') {
    redirect("/"); // Unauthorized, go home
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]">
      <AdminSidebar />
      <main className="ml-72 p-8">
        {children}
      </main>
    </div>
  );
}
