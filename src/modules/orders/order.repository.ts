import { createClient } from '@/lib/supabase/server';
import { IOrderRepository, Order, SubOrder, OrderStatus } from './order.repository.interface';

export class OrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error) return null;
    return data as Order;
  }

  async findAll(params?: Record<string, any>): Promise<Order[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('orders').select('*');
    if (error) return [];
    return data as Order[];
  }

  async create(data: Partial<Order>): Promise<Order> {
    const supabase = createClient();
    const { data: order, error } = await supabase.from('orders').insert(data).select().single();
    if (error) throw error;
    return order as Order;
  }

  async update(id: string, data: Partial<Order>): Promise<Order> {
    const supabase = createClient();
    const { data: order, error } = await supabase.from('orders').update(data).eq('id', id).select().single();
    if (error) throw error;
    return order as Order;
  }

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  }

  async findByBuyerId(buyerId: string): Promise<Order[]> {
    const supabase = createClient();
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        payment_status,
        razorpay_order_id,
        created_at,
        address:user_addresses(line1:address_line1, city, state, pincode),
        sub_orders(
          id,
          status,
          subtotal,
          tracking_id,
          vendor:vendor_profiles(business_name),
          order_items(id)
        )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return orders as Order[];
  }

  async findOrderById(orderId: string, buyerId: string): Promise<Order | null> {
    const supabase = createClient();
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        payment_status,
        razorpay_order_id,
        razorpay_payment_id,
        created_at,
        address:user_addresses(id, line1:address_line1, line2:address_line2, city, state, pincode),
        sub_orders(
          id,
          status,
          subtotal,
          tracking_id,
          created_at,
          updated_at,
          vendor:vendor_profiles(id, business_name),
          order_items(
            id,
            quantity,
            unit_price,
            gst_rate,
            gst_amount,
            variant:product_variants(
              id,
              size,
              color,
              sku,
              product:products(id, title, slug)
            )
          ),
          order_status_history(
            id,
            status,
            changed_at,
            note
          )
        )
      `)
      .eq('id', orderId)
      .eq('buyer_id', buyerId)
      .single();

    if (error || !order) return null;
    return order as unknown as Order;
  }

  async findSubOrderById(subOrderId: string): Promise<SubOrder | null> {
    const supabase = createClient();
    const { data: order, error } = await supabase
      .from('sub_orders')
      .select(`
        id,
        status, 
        vendor_id,
        subtotal,
        order_id,
        orders:order_id (
          buyer_id,
          profiles:buyer_id (
            email,
            phone
          )
        )
      `)
      .eq('id', subOrderId)
      .single();

    if (error || !order) return null;
    return order as SubOrder;
  }

  async updateSubOrderStatus(subOrderId: string, status: OrderStatus): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('sub_orders')
      .update({ status })
      .eq('id', subOrderId);

    if (error) throw error;
  }

  async logStatusHistory(subOrderId: string, status: OrderStatus, note: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('order_status_history').insert({
      sub_order_id: subOrderId,
      status,
      note
    });

    if (error) throw error;
  }

  async findVendorOrders(vendorId: string, statusFilter?: string): Promise<any[]> {
    const supabase = createClient();
    let query = supabase
      .from('sub_orders')
      .select(
        `
        id,
        status,
        subtotal,
        tracking_id,
        created_at,
        updated_at,
        order:orders(
          id,
          total_amount,
          payment_status,
          created_at,
          address:user_addresses(line1:address_line1, city, state, pincode),
          buyer:profiles(id, full_name, phone)
        ),
        order_items(
          id,
          quantity,
          unit_price,
          gst_rate,
          gst_amount,
          variant:product_variants(
            id,
            size,
            color,
            sku,
            product:products(id, title, slug)
          )
        ),
        order_status_history(
          id,
          status,
          changed_at,
          note
        )
      `
      )
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data: subOrders, error } = await query;
    if (error) throw error;

    return subOrders || [];
  }
}
