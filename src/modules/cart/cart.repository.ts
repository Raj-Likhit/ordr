import { createClient } from '@/lib/supabase/server';
import { ICartRepository, Cart, CartItem } from './cart.repository.interface';

export class CartRepository implements ICartRepository {
  async findById(id: string): Promise<Cart | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('carts').select('*').eq('id', id).single();
    if (error) return null;
    return data as Cart;
  }

  async findAll(params?: Record<string, any>): Promise<Cart[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('carts').select('*');
    if (error) return [];
    return data as Cart[];
  }

  async create(data: Partial<Cart>): Promise<Cart> {
    const supabase = createClient();
    const { data: cart, error } = await supabase.from('carts').insert(data).select().single();
    if (error) throw error;
    return cart as Cart;
  }

  async update(id: string, data: Partial<Cart>): Promise<Cart> {
    const supabase = createClient();
    const { data: cart, error } = await supabase.from('carts').update(data).eq('id', id).select().single();
    if (error) throw error;
    return cart as Cart;
  }

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('carts').delete().eq('id', id);
    if (error) throw error;
  }

  async findByBuyerId(buyerId: string): Promise<Cart | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('carts').select('*').eq('buyer_id', buyerId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data as Cart | null;
  }

  async getCartWithItems(buyerId: string): Promise<{ id: string, items: CartItem[] } | null> {
    const supabase = createClient();
    let { data: cart, error: cartError } = await supabase.from('carts').select('id').eq('buyer_id', buyerId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    
    if (!cart && !cartError) {
      // Cart does not exist, create it
      const { data: newCart, error: insertError } = await supabase.from('carts').insert({ buyer_id: buyerId }).select('id').single();
      if (insertError) throw insertError;
      cart = newCart;
    } else if (cartError) {
      throw cartError;
    }

    if (!cart) return null;

    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        variant_id,
        cart_id,
        variant:product_variants(
          id,
          size,
          color,
          price_override,
          product:products(
            id,
            title,
            slug,
            base_price,
            vendor:vendor_profiles(id, business_name),
            images:product_images(url)
          )
        )
      `)
      .eq('cart_id', cart.id);

    if (itemsError) throw itemsError;

    return { id: cart.id, items: items as CartItem[] };
  }

  async findItemByVariant(cartId: string, variantId: string): Promise<CartItem | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('cart_items').select('*').eq('cart_id', cartId).eq('variant_id', variantId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as CartItem | null;
  }

  async addItem(cartId: string, variantId: string, quantity: number): Promise<CartItem> {
    const supabase = createClient();
    const { data, error } = await supabase.from('cart_items').insert({ cart_id: cartId, variant_id: variantId, quantity }).select().single();
    if (error) throw error;
    return data as CartItem;
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const supabase = createClient();
    const { data, error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId).select().single();
    if (error) throw error;
    return data as CartItem;
  }

  async removeItem(itemId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (error) throw error;
  }
}
