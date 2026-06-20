export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-screen">
      <h1 className="font-display text-4xl md:text-5xl tracking-widest uppercase mb-6 text-[var(--color-text-primary)]">
        Terms of Service
      </h1>
      <p className="text-[var(--text-small)] text-[var(--color-text-muted)] font-accent uppercase tracking-wider mb-10 border-b border-[var(--color-border)] pb-4">
        Last Updated: June 2026
      </p>

      <div className="space-y-8 font-body text-[var(--text-body)] text-[var(--color-text-secondary)] leading-relaxed">
        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">1. Acceptance of Terms</h2>
          <p>By accessing and using the Ordr marketplace, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using Ordr&apos;s particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
        </section>

        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">2. Vendor Obligations</h2>
          <p className="mb-2">Sellers registered on Ordr agree to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide accurate and complete product information.</li>
            <li>Fulfill orders within the promised dispatch window.</li>
            <li>Maintain inventory parity between Ordr and other sales channels.</li>
            <li>Abide by the strict prohibition of counterfeit or prohibited items.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">3. Buyer Obligations</h2>
          <p>Buyers agree to provide valid payment information and valid delivery addresses. The buyer acknowledges that Ordr acts as a marketplace facilitator, and the primary contract of sale is between the buyer and the third-party vendor.</p>
        </section>

        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">4. Platform Fees and Payments</h2>
          <p>Ordr reserves the right to charge commissions or transaction fees for use of the platform. All payments are securely escrowed and routed via authorized payment gateways. Vendor payouts are subject to settlement cycles post-delivery confirmation.</p>
        </section>
      </div>
    </div>
  );
}
