'use client';

import { useFormStatus } from 'react-dom';
import { completeNameStep } from '../../app/actions/onboarding';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] transition-all"
    >
      {pending ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
      {pending ? 'Saving...' : 'Continue'}
    </button>
  );
}

export function NameCaptureModal() {
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    const res = await completeNameStep(formData);
    if (res.error) {
      setError(res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-bg)] w-full max-w-md rounded-2xl p-8 shadow-2xl m-4 border border-[var(--color-border)] animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-display font-light text-[var(--color-text-primary)] mb-2">Welcome to Ordr</h2>
          <p className="text-[var(--color-text-secondary)]">What should we call you?</p>
        </div>

        <form action={action} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="full_name" className="sr-only">Full Name</label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              required
              autoFocus
              placeholder="Your full name"
              className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
            />
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
