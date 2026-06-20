import { getProductBySlug, getFrequentlyBoughtTogether } from '@/lib/services/product.service';
import { ProductClientDetail } from '@/components/storefront/ProductClientDetail';
import ReviewSection from '@/components/storefront/ReviewSection';
import { FrequentlyBoughtTogether } from '@/components/storefront/FrequentlyBoughtTogether';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { ProductQA } from '@/components/storefront/ProductQA';

export const revalidate = 3600; // ISR cache

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProductBySlug(params.slug);
  if (!data) {
    return { title: 'Product Not Found' };
  }
  const product: any = data;
  return {
    title: product.seo_title || `${product.title} | Ordr`,
    description: product.seo_description || product.description,
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--color-text-secondary)] font-body">Product not found.</p>
        <Link href="/shop" className="text-[var(--color-accent)] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Shop
        </Link>
      </div>
    );
  }

  const crossSells = await getFrequentlyBoughtTogether(product.category_id, product.id, 2);

  return (
    <>
      <PageViewTracker productId={product.id} vendorId={product.vendor_id} />
      <ProductClientDetail product={product}>
        {crossSells && crossSells.length > 0 && (
          <FrequentlyBoughtTogether mainProduct={product} crossSells={crossSells} />
        )}
        <Suspense fallback={<div className="mt-16 text-center text-gray-500 animate-pulse">Loading reviews...</div>}>
          <ReviewSection productId={product.id} slug={product.slug} />
        </Suspense>
        <ProductQA productId={product.id} />
      </ProductClientDetail>
    </>
  );
}
