export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-screen">
      <h1 className="font-display text-4xl md:text-5xl tracking-widest uppercase mb-6 text-[var(--color-text-primary)]">
        Privacy Policy
      </h1>
      <p className="text-[var(--text-small)] text-[var(--color-text-muted)] font-accent uppercase tracking-wider mb-10 border-b border-[var(--color-border)] pb-4">
        Last Updated: June 2026
      </p>

      <div className="space-y-8 font-body text-[var(--text-body)] text-[var(--color-text-secondary)] leading-relaxed">
        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, payment method, and other information you choose to provide.</p>
        </section>

        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">2. How We Use Information</h2>
          <p className="mb-2">We may use the information we collect about you to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, maintain, and improve our Services.</li>
            <li>Process transactions and send related information, including transaction confirmations and invoices.</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Services.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">3. Sharing of Information</h2>
          <p>We may share the information we collect about you with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf. For instance, payment details are processed securely via Razorpay and never stored on our raw databases.</p>
        </section>

        <section>
          <h2 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">4. Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. We use industry-standard encryption for data at rest and in transit.</p>
        </section>
      </div>
    </div>
  );
}
