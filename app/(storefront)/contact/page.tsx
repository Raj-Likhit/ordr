export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 min-h-screen">
      <h1 className="font-display text-4xl md:text-5xl tracking-widest uppercase mb-6 text-[var(--color-text-primary)]">
        Contact Us
      </h1>
      <p className="text-[var(--color-text-secondary)] font-body mb-12">
        We're here to help. Reach out to us for any inquiries regarding your orders, vendor accounts, or general questions.
      </p>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-accent text-[var(--text-small)] uppercase tracking-wider text-[var(--color-text-primary)]">Name</label>
            <input type="text" className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-black transition-colors" placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <label className="block font-accent text-[var(--text-small)] uppercase tracking-wider text-[var(--color-text-primary)]">Email</label>
            <input type="email" className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-black transition-colors" placeholder="Your email address" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block font-accent text-[var(--text-small)] uppercase tracking-wider text-[var(--color-text-primary)]">Subject</label>
          <select className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-black transition-colors">
            <option>Order Inquiry</option>
            <option>Vendor Support</option>
            <option>Returns & Refunds</option>
            <option>Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block font-accent text-[var(--text-small)] uppercase tracking-wider text-[var(--color-text-primary)]">Message</label>
          <textarea rows={6} className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-3 focus:outline-none focus:border-black transition-colors resize-none" placeholder="How can we help you?"></textarea>
        </div>
        <button type="button" className="bg-black text-white px-8 py-4 uppercase font-accent tracking-widest text-[var(--text-small)] hover:bg-gray-800 transition-colors rounded-[var(--radius-sm)] w-full md:w-auto">
          Send Message
        </button>
      </form>

      <div className="mt-20 pt-10 border-t border-[var(--color-border)] grid grid-cols-1 md:grid-cols-2 gap-8 text-[var(--text-small)] text-[var(--color-text-secondary)]">
        <div>
          <h4 className="font-accent uppercase text-[var(--color-text-primary)] mb-2 font-semibold">Email Us</h4>
          <p>support@ordr.com</p>
          <p>vendors@ordr.com</p>
        </div>
        <div>
          <h4 className="font-accent uppercase text-[var(--color-text-primary)] mb-2 font-semibold">Business Hours</h4>
          <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
          <p>Saturday: 10:00 AM - 2:00 PM IST</p>
        </div>
      </div>
    </div>
  );
}
