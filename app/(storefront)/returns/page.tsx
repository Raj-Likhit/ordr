import Link from "next/link";
import { PackageSearch, RefreshCcw, ShieldCheck } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-screen">
      <h1 className="font-display text-4xl md:text-5xl tracking-widest uppercase mb-6 text-[var(--color-text-primary)]">
        Returns & Refunds
      </h1>
      <p className="text-[var(--text-small)] text-[var(--color-text-muted)] font-accent uppercase tracking-wider mb-12 border-b border-[var(--color-border)] pb-4">
        Hassle-free 7-day return policy
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] text-center">
          <div className="mx-auto w-12 h-12 bg-black text-white flex items-center justify-center rounded-full mb-4">
            <RefreshCcw size={24} />
          </div>
          <h3 className="font-accent uppercase text-[var(--color-text-primary)] font-semibold mb-2">Easy Returns</h3>
          <p className="text-[var(--text-small)] text-[var(--color-text-secondary)]">
            Initiate a return within 7 days of delivery directly from your account dashboard.
          </p>
        </div>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] text-center">
          <div className="mx-auto w-12 h-12 bg-black text-white flex items-center justify-center rounded-full mb-4">
            <PackageSearch size={24} />
          </div>
          <h3 className="font-accent uppercase text-[var(--color-text-primary)] font-semibold mb-2">Home Pickup</h3>
          <p className="text-[var(--text-small)] text-[var(--color-text-secondary)]">
            Our delivery partners will pick up the item from your doorstep at no extra cost.
          </p>
        </div>
        <div className="bg-[var(--color-bg-surface)] p-6 rounded-[var(--radius-md)] text-center">
          <div className="mx-auto w-12 h-12 bg-black text-white flex items-center justify-center rounded-full mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-accent uppercase text-[var(--color-text-primary)] font-semibold mb-2">Instant Refunds</h3>
          <p className="text-[var(--text-small)] text-[var(--color-text-secondary)]">
            Refunds are processed to the original payment method within 3-5 business days.
          </p>
        </div>
      </div>

      <div className="space-y-8 font-body text-[var(--text-body)] text-[var(--color-text-secondary)] leading-relaxed">
        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">Eligibility Conditions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Items must be unused, unwashed, and in the same condition that you received them.</li>
            <li>Original tags and packaging must remain intact.</li>
            <li>Certain categories like innerwear, customized items, and perishables are non-returnable unless defective.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">How to Request a Return</h2>
          <p>
            You can request a return by visiting your <Link href="/account/orders" className="text-black underline font-medium">Orders page</Link>, 
            selecting the specific order, and clicking &quot;Initiate Return&quot;. Follow the prompts to select a reason and schedule a pickup.
          </p>
        </section>
      </div>
    </div>
  );
}
