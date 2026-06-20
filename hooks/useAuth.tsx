"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useCartStore } from "@/hooks/useCart";

interface Profile {
  id: string;
  role: 'buyer' | 'vendor' | 'admin';
  full_name: string | null;
  phone: string | null;
}

interface VendorProfile {
  id: string;
  business_name: string;
  gstin: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  vendorProfile: VendorProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfileAndVendor = async (userId: string) => {
    try {
      const { data: profData, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profErr) {
        console.error("Error fetching profile:", profErr);
        setProfile(null);
        setVendorProfile(null);
        return;
      }

      setProfile(profData);

      if (profData?.role === "vendor") {
        const { data: vendData, error: vendErr } = await supabase
          .from("vendor_profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (vendErr) {
          console.error("Error fetching vendor profile:", vendErr);
        } else {
          setVendorProfile(vendData);
        }
      } else {
        setVendorProfile(null);
      }
    } catch (e) {
      console.error("Profile fetch exception:", e);
    }
  };

  const loadSession = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfileAndVendor(session.user.id);
        useCartStore.getState().syncWithDatabase(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setVendorProfile(null);
        // Refresh guest cart state just in case
        useCartStore.getState().fetchDBCart();
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfileAndVendor(session.user.id);
          useCartStore.getState().syncWithDatabase(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setVendorProfile(null);
          useCartStore.getState().fetchDBCart();
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setVendorProfile(null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndVendor(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        vendorProfile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
