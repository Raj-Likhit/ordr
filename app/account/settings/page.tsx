"use client";

import React, { useState, useEffect } from "react";
import { User, MapPin, CreditCard, Lock, Edit2, Plus, Trash2, X } from "lucide-react";
import { PhoneInput } from "@/components/ui/PhoneInput";

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  // Forms state
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", date_of_birth: "", gender: "" });
  const [addressForm, setAddressForm] = useState({ full_name: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", is_default_shipping: false });
  const [paymentForm, setPaymentForm] = useState({ card_holder_name: "", card_brand: "Visa", card_number: "", expiry_month: 12, expiry_year: 2026 });
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Basic ZIP auto-fill for supported countries
    const countryMap: Record<string, string> = {
      'United States': 'us', 'US': 'us', 'USA': 'us',
      'Canada': 'ca', 'CA': 'ca',
      'United Kingdom': 'gb', 'UK': 'gb', 'GB': 'gb',
      'Australia': 'au', 'AU': 'au',
      'India': 'in', 'IN': 'in',
      'Germany': 'de', 'DE': 'de',
      'France': 'fr', 'FR': 'fr',
      'Japan': 'jp', 'JP': 'jp'
    };

    const fetchZip = async () => {
      if (!addressForm.postal_code || !addressForm.country) return;
      const cCode = countryMap[addressForm.country];
      if (!cCode) return;
      
      if (addressForm.postal_code.length < 4) return;

      try {
        const res = await fetch(`https://api.zippopotam.us/${cCode}/${addressForm.postal_code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.places && data.places.length > 0) {
            const place = data.places[0];
            // Only update if they haven't typed something manually yet
            setAddressForm(prev => {
              if (!prev.city && !prev.state) {
                return {
                  ...prev,
                  city: place['place name'] || prev.city,
                  state: place['state abbreviation'] || place['state'] || prev.state
                };
              }
              return prev;
            });
          }
        }
      } catch (e) {
        // silently fail for zip lookup
      }
    };

    const timeoutId = setTimeout(fetchZip, 500); // debounce
    return () => clearTimeout(timeoutId);
  }, [addressForm.postal_code, addressForm.country]);

  async function fetchData() {
    setLoading(true);
    try {
      const [profileRes, addressesRes, paymentsRes] = await Promise.all([
        fetch("/api/users/profile"),
        fetch("/api/users/addresses"),
        fetch("/api/users/payment-methods")
      ]);
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setProfileForm({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          date_of_birth: profileData.date_of_birth || "",
          gender: profileData.gender || ""
        });
      }
      
      if (addressesRes.ok) {
        const addressesData = await addressesRes.json();
        setAddresses(addressesData);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPaymentMethods(paymentsData);
      }
    } catch (e) {
      console.error("Failed to fetch account settings", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        setProfileModalOpen(false);
        fetchData();
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...addressForm,
        pincode: addressForm.postal_code
      };
      const res = await fetch("/api/users/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddingAddress(false);
        setAddressForm({ full_name: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", is_default_shipping: false });
        fetchData();
      } else {
        alert("Failed to add address");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/users/addresses/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = paymentForm.card_number.replace(/\D/g, "");
    if (digits.length !== 16) {
      alert("Please enter a valid 16-digit card number");
      return;
    }
    const payload = {
      card_holder_name: paymentForm.card_holder_name,
      card_brand: paymentForm.card_brand,
      last_digits: digits.slice(-4),
      expiry_month: Number(paymentForm.expiry_month),
      expiry_year: Number(paymentForm.expiry_year),
    };
    try {
      const res = await fetch("/api/users/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPaymentModalOpen(false);
        setPaymentForm({ card_holder_name: "", card_brand: "Visa", card_number: "", expiry_month: 12, expiry_year: 2026 });
        fetchData();
      } else {
        alert("Failed to add payment method");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePayment(id: string) {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    try {
      const res = await fetch(`/api/users/payment-methods/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading your settings...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display mb-8">Your Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Profile Details Card */}
        <div className="border border-[var(--color-border)] rounded-lg p-6 hover:shadow-md transition-shadow relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--color-bg-dark)]/5 rounded-full">
              <User size={32} className="text-[var(--color-text-primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Login & Security</h2>
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">Edit name, mobile number</p>
            </div>
          </div>
          <div className="space-y-3 text-[var(--text-small)] mt-6">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-muted)]">Name:</span>
              <span className="font-medium">{profile?.full_name || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-muted)]">Phone:</span>
              <span className="font-medium">{profile?.phone || "Not set"}</span>
            </div>
            <button 
              onClick={() => setProfileModalOpen(true)}
              className="mt-4 text-[var(--color-accent)] font-medium flex items-center gap-2 hover:underline focus:outline-none"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Addresses Card */}
        <div className="border border-[var(--color-border)] rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--color-bg-dark)]/5 rounded-full">
              <MapPin size={32} className="text-[var(--color-text-primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Your Addresses</h2>
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">Edit addresses for orders</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {addresses.slice(0, 2).map((addr) => (
              <div key={addr.id} className="text-[var(--text-small)] border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                <p className="font-medium">{addr.full_name}</p>
                <p className="text-[var(--color-text-secondary)]">{addr.address_line1}, {addr.city}</p>
              </div>
            ))}
            {addresses.length === 0 && (
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">No addresses saved yet.</p>
            )}
            <button 
              onClick={() => setAddressModalOpen(true)}
              className="text-[var(--color-accent)] font-medium flex items-center gap-2 hover:underline focus:outline-none"
            >
              <Plus size={16} /> Manage Addresses
            </button>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="border border-[var(--color-border)] rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--color-bg-dark)]/5 rounded-full">
              <CreditCard size={32} className="text-[var(--color-text-primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Payment Options</h2>
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">Saved cards for checkout</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="text-[var(--text-small)] border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0 flex justify-between items-center">
                <div>
                  <p className="font-medium">{pm.card_brand} •••• {pm.last_digits}</p>
                  <p className="text-[var(--color-text-secondary)]">Expires {pm.expiry_month}/{pm.expiry_year}</p>
                </div>
                <button 
                  onClick={() => handleDeletePayment(pm.id)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {paymentMethods.length === 0 && (
              <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">No saved payment methods.</p>
            )}
            <button 
              onClick={() => setPaymentModalOpen(true)}
              className="text-[var(--color-accent)] font-medium flex items-center gap-2 hover:underline focus:outline-none"
            >
              <Plus size={16} /> Add Payment Method
            </button>
          </div>
        </div>

      </div>

      {/* --- MODALS --- */}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-medium">Edit Profile</h3>
              <button onClick={() => setProfileModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-black focus:outline-none">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Full Name</label>
                <input required type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Phone Number</label>
                <PhoneInput required value={profileForm.phone} onChange={val => setProfileForm({...profileForm, phone: val})} />
              </div>
              <div>
                <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Date of Birth</label>
                <input type="date" min="1900-01-01" max={new Date().toISOString().split('T')[0]} className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={profileForm.date_of_birth} onChange={e => setProfileForm({...profileForm, date_of_birth: e.target.value})} />
              </div>
              <div>
                <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Gender</label>
                <select className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setProfileModalOpen(false)} className="px-4 py-2 text-[var(--text-small)] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-dark)]/5 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-[var(--text-small)] font-medium bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent)]/90">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Addresses Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-medium">{isAddingAddress ? "Add New Address" : "Manage Addresses"}</h3>
              <button onClick={() => { setAddressModalOpen(false); setIsAddingAddress(false); }} className="text-[var(--color-text-muted)] hover:text-black focus:outline-none">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              {!isAddingAddress ? (
                <div className="space-y-6">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-text-muted)] text-[var(--text-small)]">No addresses found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <div key={addr.id} className="border border-[var(--color-border)] rounded p-4 text-[var(--text-small)] relative">
                          <p className="font-medium">{addr.full_name}</p>
                          <p className="text-[var(--color-text-secondary)] mt-1">{addr.address_line1}</p>
                          {addr.address_line2 && <p className="text-[var(--color-text-secondary)]">{addr.address_line2}</p>}
                          <p className="text-[var(--color-text-secondary)]">{addr.city}, {addr.state} {addr.pincode || addr.postal_code}</p>
                          <p className="text-[var(--color-text-secondary)]">{addr.country}</p>
                          <p className="text-[var(--color-text-secondary)] mt-2">Phone: {addr.phone}</p>
                          <button 
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full py-3 border-2 border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-accent)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-bg-dark)]/5 transition-colors focus:outline-none"
                  >
                    <Plus size={18} /> Add a new address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Full Name</label>
                      <input required type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={addressForm.full_name} onChange={e => setAddressForm({...addressForm, full_name: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Address Line 1</label>
                    <input required type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={addressForm.address_line1} onChange={e => setAddressForm({...addressForm, address_line1: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Address Line 2 (Optional)</label>
                    <input type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={addressForm.address_line2} onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">City</label>
                      <input required type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">State</label>
                      <input required type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">ZIP Code</label>
                      <input required type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Country</label>
                    <input required type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} />
                  </div>
                  <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                    <button type="button" onClick={() => setIsAddingAddress(false)} className="px-4 py-2 text-[var(--text-small)] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-dark)]/5 rounded">Back</button>
                    <button type="submit" className="px-4 py-2 text-[var(--text-small)] font-medium bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent)]/90">Save Address</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-medium">Add Payment Method</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-black focus:outline-none">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Cardholder Name</label>
                <input required type="text" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={paymentForm.card_holder_name} onChange={e => setPaymentForm({...paymentForm, card_holder_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Card Brand</label>
                <select className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={paymentForm.card_brand} onChange={e => setPaymentForm({...paymentForm, card_brand: e.target.value})}>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                  <option value="Rupay">RuPay</option>
                </select>
              </div>
              <div>
                <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Card Number</label>
                <input required type="text" maxLength={16} placeholder="16 digits" className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={paymentForm.card_number} onChange={e => setPaymentForm({...paymentForm, card_number: e.target.value.replace(/\D/g, "")})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Expiry Month</label>
                  <select className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={paymentForm.expiry_month} onChange={e => setPaymentForm({...paymentForm, expiry_month: Number(e.target.value)})}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--text-small)] text-[var(--color-text-secondary)] mb-1">Expiry Year</label>
                  <select className="w-full border border-[var(--color-border)] rounded px-3 py-2 text-[var(--text-small)] focus:outline-none focus:border-[var(--color-accent)]" value={paymentForm.expiry_year} onChange={e => setPaymentForm({...paymentForm, expiry_year: Number(e.target.value)})}>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="px-4 py-2 text-[var(--text-small)] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-dark)]/5 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-[var(--text-small)] font-medium bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent)]/90">Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
