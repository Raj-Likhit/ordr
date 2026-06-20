import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/ui";
import "@/styles/globals.css";
import { PageTransition } from "@/components/layout/PageTransition";
import { AuthProvider } from "@/hooks/useAuth";
export const metadata: Metadata = {
  title: "Ordr",
  description: "Independent sellers. Extraordinary finds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[var(--color-bg)]">
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="flex-1 pb-16 md:pb-0 pt-20">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <BottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
