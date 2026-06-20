import { createClient } from '@/lib/supabase/server';

export interface ProductFilters {
  category?: string;
  price?: string;
  sort?: string;
  search?: string;
  rating?: string;
  vendor?: string;
  material?: string;
  color?: string;
}

export class ProductService {
  /**
   * Fetches all categories for the sidebar.
   */
  static async getCategories() {
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('id, name, slug');
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data;
  }

  /**
   * Fetches all vendors for the filter.
   */
  static async getVendors() {
    const supabase = createClient();
    const { data, error } = await supabase.from('vendor_profiles').select('id, business_name');
    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
    return data;
  }

  /**
   * Fetches unique attribute facets.
   */
  static async getFacets() {
    const supabase = createClient();
    // Using a Postgres RPC might be more efficient, but we can do a simple distinct fetch here if small,
    // or we can just return hardcoded common ones for now to avoid complex queries.
    // Let's do a fast query on products if possible.
    const { data, error } = await supabase
      .from('products')
      .select('attributes');
      
    if (error) return { materials: [], colors: [] };
    
    const materials = new Set<string>();
    const colors = new Set<string>();
    
    data.forEach((p) => {
      if (p.attributes?.Material) materials.add(p.attributes.Material);
      if (p.attributes?.Color) colors.add(p.attributes.Color);
    });

    return {
      materials: Array.from(materials).sort(),
      colors: Array.from(colors).sort()
    };
  }

  /**
   * Fetches products based on filters.
   */
  static async getProducts(filters: ProductFilters) {
    const supabase = createClient();
    let categoryId = null;

    if (filters.category && filters.category !== 'all') {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', filters.category).single();
      if (cat) categoryId = cat.id;
    }

    let query = supabase
      .from('products')
      .select(`
        id, title, slug, base_price, rating_avg, rating_count, vendor_id, auto_hide_when_empty,
        vendor:vendor_profiles ( business_name ),
        images:product_images ( url ),
        variants:product_variants ( id, stock )
      `);
      
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Text Search
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    // Vendor filtering
    if (filters.vendor && filters.vendor !== 'all') {
      query = query.eq('vendor_id', filters.vendor);
    }

    // Rating filtering
    if (filters.rating) {
      const minRating = Number(filters.rating);
      if (!isNaN(minRating)) {
        query = query.gte('rating_avg', minRating);
      }
    }

    // Price filtering
    if (filters.price) {
      if (filters.price === 'under-1000') query = query.lt('base_price', 1000);
      else if (filters.price === '1000-5000') query = query.gte('base_price', 1000).lte('base_price', 5000);
      else if (filters.price === '5000-10000') query = query.gte('base_price', 5000).lte('base_price', 10000);
      else if (filters.price === 'over-10000') query = query.gt('base_price', 10000);
    }

    // Attributes filtering (Faceted Search)
    if (filters.material) {
      query = query.eq('attributes->>Material', filters.material);
    }
    
    if (filters.color) {
      query = query.eq('attributes->>Color', filters.color);
    }

    // Sorting
    if (filters.sort === 'price_asc') {
      query = query.order('base_price', { ascending: true });
    } else if (filters.sort === 'price_desc') {
      query = query.order('base_price', { ascending: false });
    } else if (filters.sort === 'newest') {
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

    // Post-filter for stock auto-hide
    const filteredProducts = products.filter((p: any) => {
      if (!p.auto_hide_when_empty) return true;
      // if auto_hide_when_empty is true, ensure at least one variant has stock > 0
      return p.variants && p.variants.some((v: any) => v.stock > 0);
    });

    return filteredProducts;
  }
}
