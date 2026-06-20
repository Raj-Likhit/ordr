import Link from 'next/link';
import Image from 'next/image';
import { AnimatedGrid } from '@/components/ui/AnimatedGrid';
import { HeroParallax } from '@/components/ui/HeroParallax';
import { AnimatedReveal } from '@/components/ui/AnimatedReveal';
import { getFeaturedProducts } from '@/lib/services/product.service';

export const revalidate = 3600; // ISR: Revalidate every hour

export default async function StorefrontHome() {
  const products = await getFeaturedProducts(4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroParallax />

      {/* TrustBar */}
      <section className="bg-[var(--color-bg-surface)] py-8 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
          <AnimatedReveal delay={0.1} className="flex flex-col items-center gap-2 pt-4 md:pt-0">
            <h3 className="font-display text-[var(--text-body-lg)] font-semibold text-[var(--color-text-primary)]">Authentic Artisans</h3>
            <p className="text-[var(--color-text-secondary)] text-[var(--text-small)]">Directly from the creators</p>
          </AnimatedReveal>
          <AnimatedReveal delay={0.2} className="flex flex-col items-center gap-2 pt-4 md:pt-0">
            <h3 className="font-display text-[var(--text-body-lg)] font-semibold text-[var(--color-text-primary)]">Secure Payments</h3>
            <p className="text-[var(--color-text-secondary)] text-[var(--text-small)]">100% safe & protected</p>
          </AnimatedReveal>
          <AnimatedReveal delay={0.3} className="flex flex-col items-center gap-2 pt-4 md:pt-0">
            <h3 className="font-display text-[var(--text-body-lg)] font-semibold text-[var(--color-text-primary)]">Curated Quality</h3>
            <p className="text-[var(--color-text-secondary)] text-[var(--text-small)]">Handpicked exceptional items</p>
          </AnimatedReveal>
        </div>
      </section>

      {/* Categories */}
      <section data-tour-id="homepage-nav" className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <AnimatedReveal direction="up" className="flex justify-between items-end mb-12">
          <h2 className="font-display text-[var(--text-display)] text-[var(--color-text-primary)]">Shop by Category</h2>
          <Link href="/shop" className="text-[var(--color-accent)] hover:underline font-medium">View All</Link>
        </AnimatedReveal>
        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Handcrafted', img: '/assets/category-handcrafted.png' },
            { name: 'Home Decor', img: '/assets/category-home-decor.png' },
            { name: 'Jewelry', img: '/assets/category-jewelry.png' },
            { name: 'Wellness', img: '/assets/category-wellness.png' },
            { name: 'Tech', img: '/assets/seed/wireless_earbuds_1781763338489.png' },
            { name: 'Apparel', img: '/images/products/merino_wool_beanie.png' },
          ].map((cat, i) => (
            <Link key={i} href={`/shop?category=${cat.name.toLowerCase()}`} className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] block">
              <Image src={cat.img} alt={cat.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <h3 className="text-white font-display text-[var(--text-title)] drop-shadow-lg">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </AnimatedGrid>
      </section>

      {/* Trending / Featured */}
      <section data-tour-id="homepage-featured" className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] mb-20 shadow-sm border border-[var(--color-border)]">
        <AnimatedReveal direction="up" className="flex justify-between items-end mb-12">
          <h2 className="font-display text-[var(--text-display)] text-[var(--color-text-primary)]">Trending Now</h2>
          <Link href="/shop" className="text-[var(--color-accent)] hover:underline font-medium">Shop All</Link>
        </AnimatedReveal>
        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products && products.length > 0 ? (
            products.map((product: any) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="flex flex-col gap-4 group cursor-pointer block h-full">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-border)] shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500 ease-out">
                  <Image src={product.images?.[0]?.url || "/assets/product-card-placeholder.png"} alt={product.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-display text-[var(--text-body-lg)] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors capitalize line-clamp-1">{product.title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-[var(--text-small)] mb-2">{product.vendor?.business_name}</p>
                  </div>
                  <p className="font-medium text-[var(--color-text-primary)]">₹{product.base_price}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-[var(--color-text-secondary)]">No trending products found.</p>
          )}
        </AnimatedGrid>
      </section>
    </div>
  );
}

