import { createClient } from '@/lib/supabase/server';
import { IProductRepository, Product, ProductFilters } from './product.repository.interface';
import { logger } from '@/src/common/utils/logger';
import { withCache } from '@/src/common/utils/redis';

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendor_profiles ( id, business_name ),
        variants:product_variants ( id, size, color, stock, price_override ),
        images:product_images ( url )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product by id:', error);
      return null;
    }
    return data;
  }

  async findBySlug(slug: string): Promise<any | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, title, slug, description, base_price, rating_avg, rating_count, category_id,
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

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const supabase = createClient();
    let categoryId = null;

    if (filters?.category && filters.category !== 'all') {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', filters.category).single();
      if (cat) categoryId = cat.id;
    }

    let query = supabase
      .from('products')
      .select(`
        id, title, slug, base_price, rating_avg, rating_count, vendor_id, category_id,
        vendor:vendor_profiles ( business_name ),
        images:product_images ( url )
      `);
      
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Text Search
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    // Vendor filtering
    if (filters?.vendor && filters.vendor !== 'all') {
      query = query.eq('vendor_id', filters.vendor);
    }

    // Rating filtering
    if (filters?.rating) {
      const minRating = Number(filters.rating);
      if (!isNaN(minRating)) {
        query = query.gte('rating_avg', minRating);
      }
    }

    // Price filtering
    if (filters?.price) {
      if (filters.price === 'under-1000') query = query.lt('base_price', 1000);
      else if (filters.price === '1000-5000') query = query.gte('base_price', 1000).lte('base_price', 5000);
      else if (filters.price === '5000-10000') query = query.gte('base_price', 5000).lte('base_price', 10000);
      else if (filters.price === 'over-10000') query = query.gt('base_price', 10000);
    }

    // Sorting
    if (filters?.sort === 'price_asc') {
      query = query.order('base_price', { ascending: true });
    } else if (filters?.sort === 'price_desc') {
      query = query.order('base_price', { ascending: false });
    } else if (filters?.sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      // Featured (default)
      query = query.order('rating_count', { ascending: false, nullsFirst: false });
    }

    const { data: products, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return products as unknown as Product[];
  }

  async create(data: Partial<Product>): Promise<Product> {
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return product;
  }

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.findAll({ category });
  }

  async findByVendor(vendorId: string): Promise<Product[]> {
    return this.findAll({ vendor: vendorId });
  }

  async search(query: string): Promise<Product[]> {
    return this.findAll({ search: query });
  }

  async getFeaturedProducts(limit = 4): Promise<any[]> {
    return withCache(`featured_products_${limit}`, 3600, async () => {
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
        logger.error({ error }, 'Error fetching featured products');
        return [];
      }
      return data;
    });
  }

  async getCategories() {
    return withCache('categories', 86400, async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('categories').select('id, name, slug');
      if (error) {
        logger.error({ error }, 'Error fetching categories');
        return [];
      }
      return data;
    });
  }

  async getVendors() {
    const supabase = createClient();
    const { data, error } = await supabase.from('vendor_profiles').select('id, business_name');
    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
    return data;
  }
}
