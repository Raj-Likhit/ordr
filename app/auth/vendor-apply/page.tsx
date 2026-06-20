'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

export default function VendorApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData);
    
    try {
      const response = await fetch('/api/vendor/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit application');
      }

      router.push('/account');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-display font-semibold text-[var(--color-text-primary)]">
          Apply to Become a Vendor
        </h2>
        <p className="mt-2 text-center text-[var(--text-body)] text-[var(--color-text-secondary)]">
          Join Ordr and start selling your luxury artisanal goods.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-[var(--color-border)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="Store Name" 
              name="storeName" 
              required 
            />
            <Input 
              label="Store Description" 
              name="storeDescription" 
              required 
            />
            <Input 
              label="GSTIN" 
              name="gstin" 
              required 
            />
            
            <div className="pt-4 border-t border-[var(--color-border)]">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Bank Details</h3>
              <div className="space-y-4">
                <Input 
                  label="Account Name" 
                  name="accountName" 
                  required 
                />
                <Input 
                  label="Account Number" 
                  name="accountNumber" 
                  required 
                />
                <Input 
                  label="IFSC Code" 
                  name="ifsc" 
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="text-[var(--color-error)] text-[var(--text-small)] bg-red-50 p-3 rounded-[var(--radius-sm)] border border-[var(--color-error)]">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
