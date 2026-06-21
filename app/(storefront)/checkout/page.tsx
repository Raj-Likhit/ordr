"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Loader2, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { PhoneInput } from '@/components/ui/PhoneInput';

interface Address {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const { cart, subtotal, cartCount, discount, appliedPromo, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
  // New Address Form State
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Dynamically load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch('/api/users/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data || []);
        if (data && data.length > 0) {
          setSelectedAddressId(data[0].id);
        } else {
          setShowNewAddressForm(true);
        }
      }
    } catch (e) {
      console.error("Failed to load addresses", e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress)
      });
      
      if (!res.ok) throw new Error("Failed to save address");
      
      const data = await res.json();
      setAddresses([data, ...addresses]);
      setSelectedAddressId(data.id);
      setShowNewAddressForm(false);
      setNewAddress({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', country: 'India' });
      showToast({ message: "Address saved", type: "success" });
    } catch (e: any) {
      showToast({ message: e.message || "Could not save address", type: "error" });
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddressId) {
      showToast({ message: "Please select a shipping address", type: "error" });
      return;
    }

    if (cartCount === 0) {
      showToast({ message: "Your cart is empty", type: "error" });
      return;
    }

    setProcessingPayment(true);
    try {
      // 1. Create Order on Backend
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address_id: selectedAddressId, 
          payment_method: paymentMethod,
          coupon_code: appliedPromo?.code 
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // If COD, we are done
      if (paymentMethod === 'cod') {
        clearCart();
        router.push(`/order-confirmation/${data.dbOrderId}`);
        return;
      }

      // 2. Open Razorpay Widget
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Ordr",
        description: "Artisanal Purchase",
        order_id: data.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                db_order_id: data.dbOrderId
              })
            });

            if (verifyRes.ok) {
              clearCart();
              // Redirect to success page
              router.push(`/order-confirmation/${data.dbOrderId}`);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (e: any) {
            showToast({ message: e.message || "Payment verification failed", type: "error" });
            router.push('/shop');
          }
        },
        prefill: {
          name: user?.email?.split('@')[0] || "",
          email: user?.email || "",
        },
        theme: {
          color: "#000000"
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        showToast({ message: "Payment failed. Please try again.", type: "error" });
        setProcessingPayment(false);
      });
      rzp.open();

    } catch (e: any) {
      setProcessingPayment(false);
      showToast({ message: e.message || "Failed to initiate payment", type: "error" });
    }
  };

  const SHIPPING_THRESHOLD = 5000;
  const FLAT_SHIPPING = 100;
  const shippingFee = subtotal > SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const baseTotal = subtotal + shippingFee - (discount || 0);
  const taxAmount = baseTotal * 0.18;
  const totalAmount = baseTotal + taxAmount;

  const fmt = (n: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  };

  if (authLoading || (user && loadingAddresses && !showNewAddressForm && addresses.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-screen">
      <h1 className="font-display text-[var(--text-display)] mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column - Steps */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Step 1: Address */}
          <section className="border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] overflow-hidden shadow-sm">
            <header className="bg-[var(--color-bg-surface)] p-4 md:p-6 flex justify-between items-center border-b border-[var(--color-border)]">
              <h2 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">1</span>
                Shipping Address
              </h2>
            </header>
            
            <div className="p-4 md:p-6">
              {!loadingAddresses && addresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-4 mb-6">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex items-start gap-4 p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}>
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id} 
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 w-4 h-4 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-[var(--color-text-primary)]">{addr.full_name || "Address"}</span>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-[var(--text-small)]">{addr.address_line1}</p>
                        {addr.address_line2 && <p className="text-[var(--color-text-secondary)] text-[var(--text-small)]">{addr.address_line2}</p>}
                        <p className="text-[var(--color-text-secondary)] text-[var(--text-small)]">{addr.city}, {addr.state} {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                  <button 
                    onClick={() => setShowNewAddressForm(true)}
                    className="flex items-center gap-2 text-[var(--color-accent)] text-[var(--text-small)] font-medium hover:underline mt-4"
                  >
                    <Plus size={16} /> Add a new address
                  </button>
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || addresses.length === 0) && (
                <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  <div className="md:col-span-2">
                    <h3 className="font-medium mb-4">Add New Address</h3>
                  </div>
                  <div>
                    <label className="block text-[var(--text-small)] font-medium mb-1">Full Name</label>
                    <input required value={newAddress.full_name} onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})} type="text" className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div>
                    <label className="block text-[var(--text-small)] font-medium mb-1">Phone Number</label>
                    <input required value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} type="tel" className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[var(--text-small)] font-medium mb-1">Address Line 1</label>
                    <input required value={newAddress.address_line1} onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})} type="text" className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[var(--text-small)] font-medium mb-1">Address Line 2 (Optional)</label>
                    <input value={newAddress.address_line2} onChange={(e) => setNewAddress({...newAddress, address_line2: e.target.value})} type="text" className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div>
                    <label className="block text-[var(--text-small)] font-medium mb-1">City</label>
                    <input required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} type="text" className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div>
                    <label className="block text-[var(--text-small)] font-medium mb-1">State</label>
                    <input required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} type="text" className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div>
                    <label className="block text-[var(--text-small)] font-medium mb-1">Pincode</label>
                    <input required value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} type="text" className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-[var(--color-accent)]" />
                  </div>
                  <div className="md:col-span-2 mt-4 flex gap-4">
                    <button type="submit" disabled={savingAddress} className="px-6 py-2 bg-[var(--color-text-primary)] text-white rounded-[var(--radius-sm)] hover:bg-black transition-colors font-medium flex items-center gap-2">
                      {savingAddress && <Loader2 size={16} className="animate-spin" />}
                      Save Address
                    </button>
                    {addresses.length > 0 && (
                      <button type="button" onClick={() => setShowNewAddressForm(false)} className="px-6 py-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] font-medium">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Step 2: Payment Section */}
          <section className={`border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg)] overflow-hidden transition-opacity ${(!selectedAddressId || showNewAddressForm) ? 'opacity-60 pointer-events-none' : 'shadow-sm'}`}>
            <header className="bg-[var(--color-bg-surface)] p-4 md:p-6 border-b border-[var(--color-border)] flex justify-between items-center">
              <h2 className="font-display text-[var(--text-title)] text-[var(--color-text-primary)] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs">2</span>
                Payment
              </h2>
            </header>
            <div className="p-4 md:p-6">
              {(!selectedAddressId || showNewAddressForm) ? (
                <p className="text-[var(--color-text-secondary)]">Save or select a shipping address to proceed to payment.</p>
              ) : (
                <div className="flex flex-col items-start gap-4">
                  
                  {/* Payment Method Selector */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <label className={`flex flex-col p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="font-medium">Pay Online</span>
                      </div>
                      <p className="text-[var(--text-small)] text-[var(--color-text-secondary)] ml-7">UPI, Cards, Netbanking, Wallets via Razorpay</p>
                    </label>
                    <label className={`flex flex-col p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                      <p className="text-[var(--text-small)] text-[var(--color-text-secondary)] ml-7">Pay in cash or UPI when your order arrives.</p>
                    </label>
                  </div>

                  {paymentMethod === 'razorpay' && (
                    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4 rounded-[var(--radius-md)] flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shrink-0">
                        <Image src="/assets/razorpay-icon.png" width={24} height={24} alt="Razorpay" className="invert" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--color-text-primary)]">Razorpay Secure Checkout</h4>
                        <p className="text-[var(--text-small)] text-[var(--color-text-secondary)]">Pay with UPI, Cards, Netbanking, or Wallets.</p>
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={handlePayment} 
                    disabled={processingPayment || cartCount === 0}
                    className="mt-4 px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-[var(--radius-sm)] font-semibold transition-colors w-full focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-subtle)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {processingPayment ? <><Loader2 className="animate-spin" /> Processing...</> : `Pay ${fmt(totalAmount)}`}
                  </button>
                  <p className="text-center w-full text-[var(--text-small)] text-[var(--color-text-muted)] flex items-center justify-center gap-1">
                    <CheckCircle2 size={14} /> Payments are 100% secure and encrypted
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Column - Order Summary */}
        <aside className="w-full lg:w-1/3">
          <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] p-6 sticky top-8 shadow-sm">
            <h2 className="font-display text-[var(--text-title)] mb-6 border-b border-[var(--color-border)] pb-4">Order Summary</h2>
            
            {/* Items */}
            <div className="flex flex-col gap-4 mb-6 border-b border-[var(--color-border)] pb-6 max-h-[40vh] overflow-y-auto pr-2">
              {cart.items.map(item => {
                const price = item.variant.price_override ?? item.variant.product.base_price;
                const image = item.variant.product.images?.[0]?.url || "/assets/product-card-placeholder.png";
                
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-20 rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-[var(--color-border)]">
                      <Image src={image} alt={item.variant.product.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--text-body)] truncate capitalize">{item.variant.product.title}</h4>
                      {item.variant.size && <p className="text-[var(--color-text-secondary)] text-[var(--text-small)]">{item.variant.size}</p>}
                      <p className="text-[var(--text-small)] mt-1 text-[var(--color-text-muted)]">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium shrink-0">{fmt(price * item.quantity)}</div>
                  </div>
                );
              })}
              
              {cart.items.length === 0 && (
                <div className="text-center py-4 text-[var(--color-text-secondary)]">
                  Your cart is empty.
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-3 text-[var(--text-body)]">
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span>Shipping</span>
                <span>{subtotal > 0 ? (shippingFee === 0 ? 'Free' : fmt(shippingFee)) : '—'}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[var(--color-accent)]">
                  <span>Discount</span>
                  <span>-{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--color-text-secondary)]">
                <span>Estimated Tax (18% GST)</span>
                <span>{subtotal > 0 ? fmt(taxAmount) : '—'}</span>
              </div>
              <div className="flex justify-between font-medium text-[var(--text-body-lg)] pt-3 border-t border-[var(--color-border)] text-[var(--color-text-primary)]">
                <span>Total</span>
                <span>{fmt(subtotal > 0 ? totalAmount : 0)}</span>
              </div>
            </div>
            
            {subtotal > 0 && subtotal < SHIPPING_THRESHOLD && (
              <div className="mt-4 p-3 bg-[var(--color-accent-subtle)] text-[var(--color-accent)] rounded-[var(--radius-sm)] text-[var(--text-small)] flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>Add {fmt(SHIPPING_THRESHOLD - subtotal)} more to get free shipping!</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
