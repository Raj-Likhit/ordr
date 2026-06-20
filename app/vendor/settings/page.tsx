"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Store, CreditCard, User, Upload, AlertCircle, Camera } from "lucide-react";

interface VendorSettings {
  business_name: string;
  gstin: string;
  description: string;
  bank_account_holder: string;
  bank_account_number: string;
  bank_ifsc: string;
  full_name: string;
  phone: string;
  email: string;
  logo_url: string | null;
}

interface FormErrors {
  business_name?: string;
  gstin?: string;
  bank_account_holder?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  phone?: string;
}

const MOCK_SETTINGS: VendorSettings = {
  business_name:        "Artisan Co.",
  gstin:                "27AAPFU0939F1ZV",
  description:          "Curated handmade crafts from across India — bringing traditional artisanship to modern homes.",
  bank_account_holder:  "Artisan Co. Private Limited",
  bank_account_number:  "••••••••3847",
  bank_ifsc:            "HDFC0001234",
  full_name:            "Rajesh Kumar",
  phone:                "+91 98765 43210",
  email:                "rajesh@artisanco.in",
  logo_url:             null,
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="p-2 rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)]">
          <Icon size={16} className="text-[var(--color-accent)]" />
        </div>
        <h2 className="font-display text-[var(--text-subtitle)] text-[var(--color-text-primary)]">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label, id, type = "text", value, onChange, error, placeholder, hint, readOnly, maxLength,
}: {
  label: string; id: string; type?: string;
  value: string; onChange?: (v: string) => void; error?: string;
  placeholder?: string; hint?: string; readOnly?: boolean; maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[var(--text-small)] font-medium text-[var(--color-text-primary)] mb-2">
        {label}
      </label>
      <input
        id={id} type={type} value={value} readOnly={readOnly} maxLength={maxLength}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white border rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all outline-none ${
          readOnly
            ? "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] cursor-not-allowed"
            : "focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)]"
        } ${error ? "border-[var(--color-error)]" : "border-[var(--color-border)]"}`}
      />
      {hint  && !error && <p className="mt-1 text-[var(--text-label)] text-[var(--color-text-muted)]">{hint}</p>}
      {error && <p className="mt-1.5 text-[var(--text-small)] text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

function Textarea({ label, id, value, onChange, placeholder, rows = 4 }: { label: string; id: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[var(--text-small)] font-medium text-[var(--color-text-primary)] mb-2">{label}</label>
      <textarea
        id={id} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--text-body)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-subtle)] outline-none transition-all resize-y min-h-[100px]"
      />
    </div>
  );
}

export default function VendorSettingsPage() {
  const [settings, setSettings] = useState<VendorSettings>(MOCK_SETTINGS);
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"store" | "bank" | "account">("store");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const update = (field: keyof VendorSettings, value: string) =>
    setSettings(prev => ({ ...prev, [field]: value }));

  const validateGstin = (v: string) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v.toUpperCase());
  const validateIfsc  = (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase());
  const validatePhone = (v: string) => /^[+]?[\d\s\-()]{8,15}$/.test(v);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!settings.business_name.trim())         errs.business_name      = "Business name is required";
    if (settings.gstin && !validateGstin(settings.gstin)) errs.gstin   = "Enter a valid 15-character GSTIN";
    if (activeTab === "bank") {
      if (!settings.bank_account_holder.trim()) errs.bank_account_holder = "Account holder name is required";
      if (!settings.bank_account_number.trim()) errs.bank_account_number = "Account number is required";
      if (!settings.bank_ifsc.trim() || !validateIfsc(settings.bank_ifsc)) errs.bank_ifsc = "Enter a valid IFSC code (e.g. HDFC0001234)";
    }
    if (settings.phone && !validatePhone(settings.phone)) errs.phone = "Enter a valid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSuccess(false);
    
    try {
      if (activeTab === "bank") {
        const res = await fetch("/api/vendor/razorpay-onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bank_account_holder: settings.bank_account_holder,
            bank_account_number: settings.bank_account_number,
            bank_ifsc: settings.bank_ifsc,
            business_name: settings.business_name,
            email: settings.email
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to onboard bank");
      } else {
        // Mock save for other tabs
        await new Promise(r => setTimeout(r, 1000));
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "store"   as const, label: "Store Profile",  icon: Store    },
    { key: "bank"    as const, label: "Bank Details",   icon: CreditCard },
    { key: "account" as const, label: "Account",        icon: User     },
  ];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-48 w-full rounded-[var(--radius-lg)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <header>
        <h1 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)]">Store Settings</h1>
        <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mt-1">
          Manage your shop profile, payout bank account, and account details.
        </p>
      </header>

      {/* Tab nav */}
      <nav className="flex gap-1 p-1 bg-[var(--color-bg-surface)] rounded-[var(--radius-md)] border border-[var(--color-border)]" role="tablist" aria-label="Settings sections">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 flex-1 justify-center py-2 px-3 rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium transition-all duration-200 ${
              activeTab === key
                ? "bg-white text-[var(--color-accent)] shadow-[var(--shadow-sm)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </nav>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-[#E8F3ED] border border-[var(--color-success)] rounded-[var(--radius-md)] text-[var(--color-success)] animate-[fadeIn_0.3s_ease]">
          <CheckCircle2 size={18} />
          <span className="text-[var(--text-small)] font-medium">Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* ── Store Profile tab ── */}
        {activeTab === "store" && (
          <>
            <SectionCard title="Shop Identity" icon={Store}>
              {/* Logo upload */}
              <div>
                <label className="block text-[var(--text-small)] font-medium text-[var(--color-text-primary)] mb-3">Store Logo</label>
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Store logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Store size={28} className="text-[var(--color-text-muted)]" />
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium text-[var(--color-text-secondary)] cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                    >
                      <Camera size={14} />
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </label>
                    <input id="logo-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} className="sr-only" />
                    <p className="mt-1.5 text-[var(--text-label)] text-[var(--color-text-muted)]">PNG, JPG, WEBP — recommended 400x400px</p>
                  </div>
                </div>
              </div>

              <Field
                id="business_name" label="Business / Shop Name" value={settings.business_name}
                onChange={v => update("business_name", v)} error={errors.business_name}
                placeholder="e.g. Artisan Co." maxLength={80}
              />

              <Textarea
                id="description" label="Store Description" value={settings.description}
                onChange={v => update("description", v)}
                placeholder="Tell buyers about your craftsmanship, story, and what makes your products special..."
              />

              <Field
                id="gstin" label="GSTIN (optional)" value={settings.gstin}
                onChange={v => update("gstin", v.toUpperCase())} error={errors.gstin}
                placeholder="e.g. 27AAPFU0939F1ZV" maxLength={15}
                hint="15-character Goods & Services Tax Identification Number"
              />
            </SectionCard>

            {/* Vendor status info */}
            <div className="flex items-start gap-3 p-4 bg-[#E8F3ED] border border-[var(--color-success)] rounded-[var(--radius-md)]">
              <CheckCircle2 size={18} className="text-[var(--color-success)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[var(--text-small)] font-medium text-[var(--color-success)]">Account Approved</p>
                <p className="text-[var(--text-label)] text-[var(--color-text-secondary)] mt-0.5">
                  Your vendor account is active. Products listed as "Active" appear on the storefront.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── Bank Details tab ── */}
        {activeTab === "bank" && (
          <SectionCard title="Payout Bank Account" icon={CreditCard}>
            <div className="flex items-start gap-3 p-4 bg-[#FDF2E3] border border-[var(--color-warning)] rounded-[var(--radius-md)] mb-2">
              <AlertCircle size={16} className="text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              <p className="text-[var(--text-small)] text-[var(--color-text-secondary)]">
                Payouts are processed every 14 days. Ensure your bank details are correct to avoid delays.
              </p>
            </div>

            <Field
              id="bank_account_holder" label="Account Holder Name" value={settings.bank_account_holder}
              onChange={v => update("bank_account_holder", v)} error={errors.bank_account_holder}
              placeholder="As per bank records"
            />

            <Field
              id="bank_account_number" label="Account Number" value={settings.bank_account_number}
              onChange={v => update("bank_account_number", v)} error={errors.bank_account_number}
              type="password" placeholder="Enter bank account number"
              hint="Stored encrypted. We never display or share this."
            />

            <Field
              id="bank_ifsc" label="IFSC Code" value={settings.bank_ifsc}
              onChange={v => update("bank_ifsc", v.toUpperCase())} error={errors.bank_ifsc}
              placeholder="e.g. HDFC0001234" maxLength={11}
              hint="11-character code found on your cheque or passbook"
            />
          </SectionCard>
        )}

        {/* ── Account tab ── */}
        {activeTab === "account" && (
          <SectionCard title="Account Details" icon={User}>
            <Field
              id="full_name" label="Full Name" value={settings.full_name}
              onChange={v => update("full_name", v)} placeholder="Your full name"
            />

            <Field
              id="email" label="Email Address" type="email" value={settings.email}
              readOnly hint="Email is managed via your login credentials and cannot be changed here."
            />

            <Field
              id="phone" label="Mobile Number" type="tel" value={settings.phone}
              onChange={v => update("phone", v)} error={errors.phone}
              placeholder="+91 98765 43210"
            />

            <div className="pt-2 border-t border-[var(--color-border)]">
              <p className="text-[var(--text-small)] font-medium text-[var(--color-text-primary)] mb-1">Password</p>
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)] mb-3">
                Use the password reset link sent to your email to change your password.
              </p>
              <button
                type="button"
                className="px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--text-small)] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
                onClick={() => alert("Password reset email sent!")}
              >
                Send Password Reset Email
              </button>
            </div>
          </SectionCard>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] font-body text-[var(--text-small)] font-medium hover:bg-[var(--color-accent-hover)] hover:-translate-y-[1px] transition-all duration-200 shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Upload size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}