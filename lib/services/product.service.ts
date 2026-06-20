import { createClient } from '@/lib/supabase/server';

export async function getFeaturedProducts(limit = 4) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, title, slug, base_price, rating_avg, rating_count,
      vendor:vendor_profiles ( business_name ),
      images:product_images ( url )
    `)
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  return data;
}

export async function getProductBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, title, slug, description, base_price, rating_avg, rating_count, category_id, vendor_id,
      vendor:vendor_profiles ( id, business_name ),
      variants:product_variants ( id, size, color, stock, price_override ),
      images:product_images ( url )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
  return data;
}

export async function getFrequentlyBoughtTogether(categoryId: string, excludeProductId: string, limit = 2) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, title, slug, base_price,
      variants:product_variants ( id, size, color, stock, price_override ),
      images:product_images ( url )
    `)
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .limit(limit);

  if (error) {
    console.error('Error fetching frequently bought together:', error);
    return [];
  }
  return data;
}
