import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Search Results - Ordr",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q || "";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 20;

  const supabase = createClient();

  let query = supabase
    .from("products")
    .select(`
      id, title, slug, base_price,
      images:product_images ( url ), rating_avg, rating_count,
      vendor:vendor_profiles ( business_name )
    `, { count: "exact" })
    .eq("is_active", true);

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data: products, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-screen pt-32">
      <header className="mb-12">
        <h1 className="font-display text-4xl mb-4">
          {q ? `Search Results for "${q}"` : "All Products"}
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          {count || 0} product{(count || 0) !== 1 && "s"} found
        </p>
      </header>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((p) => {
            const product = p as any;
            const vendorName = Array.isArray(product.vendor) 
              ? (product.vendor[0] as any)?.business_name 
              : product.vendor?.business_name || "Unknown Vendor";
            
            // Assume first image in array or placeholder
            const imageUrl = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0].url
              : "/assets/product-card-placeholder.png";

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex flex-col gap-4 group cursor-pointer block"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-border)]">
                  <Image
                    src={imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h3 className="font-display text-[var(--text-body-lg)] font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                    {product.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-[var(--text-small)] mb-2 truncate">
                    {vendorName}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-[var(--color-text-primary)]">
                      ₹{product.base_price.toLocaleString("en-IN")}
                    </p>
                    {product.rating_count > 0 && (
                      <div className="flex items-center text-[var(--text-small)] text-[var(--color-text-secondary)] gap-1">
                        <span className="text-[var(--color-warning)]">★</span>{" "}
                        {product.rating_avg?.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)]">
          <h2 className="text-2xl font-display mb-4">No products found</h2>
          <p className="text-[var(--color-text-secondary)]">
            Try adjusting your search or browse our collections.
          </p>
          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-block bg-[var(--color-accent)] text-white px-8 py-3 rounded-md hover:bg-black transition-colors"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
