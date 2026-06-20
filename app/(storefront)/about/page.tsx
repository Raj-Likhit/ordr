export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-screen">
      <h1 className="font-display text-4xl md:text-5xl tracking-widest uppercase mb-10 text-[var(--color-text-primary)]">
        About Ordr
      </h1>
      <div className="space-y-8 font-body text-[var(--text-body)] text-[var(--color-text-secondary)] leading-relaxed">
        <p>
          Ordr is more than just an e-commerce platform; it's a curated space where discerning buyers meet passionate, independent sellers. 
          Founded with the vision of bridging the gap between unique local artisans and a national audience, Ordr provides a premium 
          shopping experience that prioritizes quality, transparency, and design.
        </p>
        <p>
          We believe in empowering small businesses by providing them with enterprise-grade tools to manage their inventory, process 
          orders seamlessly, and reach customers who value craftsmanship over mass production. Our platform is built from the ground up 
          with performance, security, and aesthetics in mind.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-[var(--color-bg-surface)] p-8 rounded-[var(--radius-md)]">
            <h3 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">Our Mission</h3>
            <p className="text-[var(--text-small)]">To democratize access to premium markets for independent sellers while giving buyers a trusted destination for exceptional products.</p>
          </div>
          <div className="bg-[var(--color-bg-surface)] p-8 rounded-[var(--radius-md)]">
            <h3 className="font-accent text-xl uppercase tracking-wider mb-4 text-[var(--color-text-primary)]">Our Promise</h3>
            <p className="text-[var(--text-small)]">We guarantee secure transactions, reliable vendor payouts, and a shopping environment free from the noise of typical online marketplaces.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
