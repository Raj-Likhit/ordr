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

  async getVendors(): Promise<any[]> {
    const supabase = createClient();
    const { data } = await supabase.from('vendor_profiles').select('id, business_name, store_slug, logo_url').eq('status', 'approved');
    return data || [];
  }

  async findVendorProducts(vendorId: string, { search, status, page, pageSize }: any) {
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select(`
        id, title, slug, description, base_price, is_active,
        rating_avg, rating_count, created_at,
        categories ( id, name, slug ),
        product_variants ( id, stock, sku, size, color, price_override )
      `, { count: "exact" })
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) query = query.ilike("title", `%${search}%`);
    if (status === "active") query = query.eq("is_active", true);
    else if (status === "draft") query = query.eq("is_active", false);

    const { data, count, error } = await query;
    if (error) throw new Error(`Failed to fetch vendor products: ${error.message}`);

    return { products: data || [], total: count || 0, page, pageSize };
  }

  async createProduct(vendorId: string, input: any) {
    const supabase = createClient();
    
    // Generate slug from title
    const slug = input.title.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      + "-" + Date.now();

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        vendor_id: vendorId,
        title: input.title.trim(),
        slug,
        description: input.description ?? null,
        base_price: Number(input.base_price),
        category_id: input.category_id ?? null,
        is_active: Boolean(input.is_active),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") throw new Error("A product with this title already exists");
      throw new Error(`Failed to create product: ${error.message}`);
    }

    if (input.variants && input.variants.length > 0) {
      const variantInserts = input.variants.map((v: any) => ({
        product_id: product.id,
        size: v.size || null,
        color: v.color || null,
        stock: Number(v.stock ?? 0),
        sku: v.sku || null,
        price_override: v.price_override ? Number(v.price_override) : null
      }));
      await supabase.from("product_variants").insert(variantInserts);
    } else if (input.stock !== undefined || input.sku) {
      await supabase.from("product_variants").insert({
        product_id: product.id,
        stock: Number(input.stock ?? 0),
        sku: input.sku ?? null,
      });
    }

    if (input.images && input.images.length > 0) {
      const imageInserts = input.images.map((url: string, index: number) => ({
        product_id: product.id,
        url: url,
        sort_order: index
      }));
      await supabase.from("product_images").insert(imageInserts);
    }

    return product;
  }
  async getVendorProductById(vendorId: string, productId: string) {
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        id, title, slug, description, base_price, is_active,
        rating_avg, rating_count, created_at, category_id,
        categories ( id, name, slug ),
        product_variants ( id, stock, sku, size, color, price_override ),
        product_images   ( id, url, sort_order )
      `)
      .eq("id", productId)
      .eq("vendor_id", vendorId)
      .single();

    if (error || !product) throw new Error("Product not found");
    return product;
  }

  async updateProduct(vendorId: string, productId: string, body: any) {
    const supabase = createClient();
    const product = await this.getVendorProductById(vendorId, productId);
    if (!product) throw new Error("Product not found");

    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) {
      patch.title = body.title.trim();
      patch.slug  = body.title.trim().toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        + "-" + Date.now();
    }
    if (body.description !== undefined) patch.description = body.description;
    if (body.base_price  !== undefined) patch.base_price = Number(body.base_price);
    if (body.category_id !== undefined) patch.category_id = body.category_id;
    if (body.is_active   !== undefined) patch.is_active   = Boolean(body.is_active);

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from("products").update(patch).eq("id", productId);
      if (error) throw new Error("Failed to update product");
    }

    if (body.stock !== undefined || body.sku !== undefined) {
      const variantPatch: Record<string, unknown> = {};
      if (body.stock !== undefined) variantPatch.stock = Number(body.stock);
      if (body.sku   !== undefined) variantPatch.sku   = body.sku;

      const { data: variants } = await supabase.from("product_variants").select("id").eq("product_id", productId).limit(1);

      if (variants && variants.length > 0) {
        await supabase.from("product_variants").update(variantPatch).eq("id", variants[0].id);
      } else {
        await supabase.from("product_variants").insert({
          product_id: productId,
          stock: Number(body.stock ?? 0),
          sku:   body.sku ?? null,
        });
      }
    }

    const { data: updated } = await supabase
      .from("products")
      .select("*, categories(*), product_variants(*), product_images(*)")
      .eq("id", productId)
      .single();

    return updated;
  }

  async deleteProduct(vendorId: string, productId: string) {
    const supabase = createClient();
    const product = await this.getVendorProductById(vendorId, productId);
    if (!product) throw new Error("Product not found");

    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) throw new Error("Failed to delete product");
  }
}
