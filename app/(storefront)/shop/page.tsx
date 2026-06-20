import Link from 'next/link';
import Image from 'next/image';
import { ShopSidebar, ShopSort, MobileFilterDrawer, ShopSearch } from './ShopClientControls';
import { ProductService } from '@/lib/services/ProductService';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; price?: string; search?: string; rating?: string; vendor?: string; material?: string; color?: string; };
}) {
  // Fetch categories, vendors, and facets for the sidebar
  const categories = await ProductService.getCategories();
  const vendors = await ProductService.getVendors();
  const facets = await ProductService.getFacets();

  const currentCategory = searchParams.category || 'all';
  const currentPrice = searchParams.price || '';
  const currentSort = searchParams.sort || 'featured';
  const currentSearch = searchParams.search || '';
  const currentRating = searchParams.rating || '';
  const currentVendor = searchParams.vendor || 'all';
  const currentMaterial = searchParams.material || '';
  const currentColor = searchParams.color || '';

  // Fetch products using the new Service layer
  const products = await ProductService.getProducts({
    category: currentCategory,
    price: currentPrice,
    sort: currentSort,
    search: currentSearch,
    rating: currentRating,
    vendor: currentVendor,
    material: currentMaterial,
    color: currentColor
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8 min-h-screen">
      {/* Desktop Sidebar Filters */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-8">
        <ShopSidebar 
          categories={categories || []} 
          vendors={vendors || []}
          facets={facets}
          currentCategory={currentCategory} 
          currentPrice={currentPrice} 
          currentRating={currentRating}
          currentVendor={currentVendor}
          currentMaterial={currentMaterial}
          currentColor={currentColor}
        />
      </aside>

      {/* Main Content */}
      <section className="flex-1">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="font-display text-[var(--text-display)]">All Products</h1>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <ShopSearch currentSearch={currentSearch} />
            <MobileFilterDrawer 
              categories={categories || []} 
              vendors={vendors || []}
              facets={facets}
              currentCategory={currentCategory} 
              currentPrice={currentPrice} 
              currentRating={currentRating}
              currentVendor={currentVendor}
              currentMaterial={currentMaterial}
              currentColor={currentColor}
            />
            <ShopSort currentSort={currentSort} />
          </div>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products && products.length > 0 ? (
            products.map((product: any, index: number) => (
              <Link data-tour-id={index === 0 ? "shop-add-to-cart" : undefined} key={product.id} href={`/product/${product.slug}`} prefetch={true} className="flex flex-col gap-4 group cursor-pointer block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-border)]">
                  <Image 
                    src={product.images?.[0]?.url || "/assets/product-card-placeholder.png"} 
                    alt={product.title} 
                    width={600} 
                    height={800} 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                    priority={index < 4}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div>
                  <h3 className="font-display text-[var(--text-body-lg)] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors capitalize">{product.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-[var(--text-small)] mb-2">{product.vendor?.business_name}</p>
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-[var(--color-text-primary)]">₹{product.base_price}</p>
                    {product.rating_count > 0 && (
                      <div className="flex items-center text-[var(--text-small)] text-[var(--color-text-secondary)] gap-1">
                        <span className="text-[var(--color-warning)]">★</span> {product.rating_avg}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <p className="text-[var(--text-body-lg)] font-medium text-[var(--color-text-primary)] mb-2">No pieces match your criteria</p>
              <p className="text-[var(--color-text-secondary)]">Try adjusting your filters or search term to discover more artisan creations.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
