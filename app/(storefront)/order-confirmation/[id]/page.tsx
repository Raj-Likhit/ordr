import Link from 'next/link';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-20 min-h-screen text-center flex flex-col items-center">
      <div className="w-20 h-20 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-[var(--radius-full)] flex items-center justify-center mb-8">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="font-display text-[var(--text-display)] mb-4">Order Confirmed!</h1>
      <p className="text-[var(--text-body-lg)] text-[var(--color-text-secondary)] mb-2">
        Thank you for supporting independent artisans. Your order has been placed successfully.
      </p>
      <p className="text-[var(--text-body)] text-[var(--color-text-muted)] mb-12">
        Order ID: <span className="font-medium text-[var(--color-text-primary)]">{params.id}</span>
      </p>

      <section className="bg-[var(--color-bg-surface)] w-full rounded-[var(--radius-md)] p-6 md:p-8 text-left mb-12 border border-[var(--color-border)] shadow-sm">
        <h2 className="font-display text-[var(--text-title)] mb-4 border-b border-[var(--color-border)] pb-2">What&apos;s Next?</h2>
        <ul className="space-y-4 text-[var(--color-text-secondary)] mt-4">
          <li className="flex gap-4 items-start">
            <span className="font-medium text-[var(--color-text-primary)] bg-[var(--color-bg)] w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] shrink-0 border border-[var(--color-border)]">1</span>
            <p className="pt-1">You will receive an order confirmation email with details of your purchase.</p>
          </li>
          <li className="flex gap-4 items-start">
            <span className="font-medium text-[var(--color-text-primary)] bg-[var(--color-bg)] w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] shrink-0 border border-[var(--color-border)]">2</span>
            <p className="pt-1">The artisan will begin preparing your handcrafted item for shipment.</p>
          </li>
          <li className="flex gap-4 items-start">
            <span className="font-medium text-[var(--color-text-primary)] bg-[var(--color-bg)] w-8 h-8 flex items-center justify-center rounded-[var(--radius-full)] shrink-0 border border-[var(--color-border)]">3</span>
            <p className="pt-1">You will receive a tracking link once your order has been dispatched.</p>
          </li>
        </ul>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link href="/account/orders" className="px-8 py-4 border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] rounded-[var(--radius-sm)] font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--color-border)]">
          View Order Status
        </Link>
        <Link href="/shop" className="px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-[var(--radius-sm)] font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-subtle)]">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
