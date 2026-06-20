import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';
import { IPaymentRepository } from './payment.repository.interface';

export class PaymentRepository implements IPaymentRepository {
  async createPendingCheckout(buyerId: string, addressId: string, totalAmount: number): Promise<string> {
    const supabase = createClient();
    const { data: dbOrderId, error } = await supabase.rpc('create_pending_checkout', {
      p_buyer_id: buyerId,
      p_address_id: addressId,
      p_total_amount: totalAmount
    });

    if (error) {
      throw new Error(error.message || 'Failed to reserve stock');
    }
    return dbOrderId as string;
  }

  async updateOrderRazorpayId(dbOrderId: string, razorpayOrderId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('orders').update({ razorpay_order_id: razorpayOrderId }).eq('id', dbOrderId);
    if (error) throw error;
  }

  async createRazorpayOrder(options: any): Promise<any> {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_fallback',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_fallback',
    });

    return razorpay.orders.create(options);
  }

  async confirmCheckout(dbOrderId: string, razorpayOrderId: string, razorpayPaymentId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('confirm_checkout', {
      p_order_id: dbOrderId,
      p_razorpay_order_id: razorpayOrderId,
      p_razorpay_payment_id: razorpayPaymentId
    });

    if (error) throw error;
  }

  async confirmCodCheckout(dbOrderId: string): Promise<void> {
    const supabase = createClient();
    
    const razorpayOrderId = `cod_${dbOrderId}`;
    const razorpayPaymentId = `cod_${Date.now()}`;
    
    const { error } = await supabase.rpc('confirm_checkout', {
      p_order_id: dbOrderId,
      p_razorpay_order_id: razorpayOrderId,
      p_razorpay_payment_id: razorpayPaymentId
    });

    if (error) throw error;

    await supabase.from('orders').update({ payment_method: 'cod', payment_status: 'pending' }).eq('id', dbOrderId);
  }
}
