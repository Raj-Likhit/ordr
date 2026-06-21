import { IOrderRepository, OrderStatus } from './order.repository.interface';
import { dispatchCommunication } from '@/lib/services/commService';

const ALLOWED: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export class OrderService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async getOrdersForBuyer(buyerId: string) {
    const orders = await this.orderRepository.findByBuyerId(buyerId);

    return orders.map((order: any) => {
      const subOrders = order.sub_orders ?? [];
      const statuses: string[] = subOrders.map((so: any) => so.status);

      let displayStatus: string;
      if (statuses.length > 0 && statuses.every((s) => s === 'delivered')) displayStatus = 'delivered';
      else if (statuses.some((s) => s === 'shipped')) displayStatus = 'shipped';
      else if (statuses.some((s) => s === 'confirmed')) displayStatus = 'processing';
      else if (statuses.some((s) => s === 'cancelled')) displayStatus = 'cancelled';
      else displayStatus = 'placed';

      const totalItems = subOrders.reduce(
        (acc: number, so: any) => acc + (so.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) ?? 0),
        0
      );

      return {
        ...order,
        displayStatus,
        totalItems,
        vendorCount: subOrders.length,
      };
    });
  }

  async getOrderById(orderId: string, buyerId: string) {
    const order = await this.orderRepository.findOrderById(orderId, buyerId);
    if (!order) return null;

    const enriched = {
      ...order,
      sub_orders: (order.sub_orders ?? []).map((so: any) => ({
        ...so,
        order_status_history: [...(so.order_status_history ?? [])].sort(
          (a: any, b: any) =>
            new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
        ),
      })),
    };
    return enriched;
  }

  async advanceOrderStatus(subOrderId: string, newStatus: OrderStatus, note?: string) {
    const subOrder = await this.orderRepository.findSubOrderById(subOrderId);
    if (!subOrder) throw new Error('Order not found');

    if (!ALLOWED[subOrder.status as OrderStatus]?.includes(newStatus)) {
      throw new Error(`Invalid transition: ${subOrder.status} -> ${newStatus}`);
    }

    await this.orderRepository.updateSubOrderStatus(subOrderId, newStatus);
    await this.orderRepository.logStatusHistory(
      subOrderId,
      newStatus,
      note || `Status changed from ${subOrder.status} to ${newStatus}`
    );

    // Fire communications
    const buyerId = subOrder.orders?.buyer_id;
    const buyerProfile = subOrder.orders?.profiles;
    const buyerEmail = buyerProfile?.email;
    const buyerPhone = buyerProfile?.phone;

    const eventMap: Record<string, any> = {
      'placed': 'order_placed',
      'shipped': 'order_shipped',
      'delivered': 'order_delivered',
      'cancelled': 'order_cancelled',
      'returned': 'order_returned'
    };

    const eventId = eventMap[newStatus];
    if (eventId && buyerId) {
      dispatchCommunication({
        eventId,
        subOrderId,
        recipientId: buyerId,
        email: buyerEmail,
        phone: buyerPhone
      }).catch(console.error);
    }

    if (newStatus === 'delivered') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/invoice/${subOrderId}/generate`, { method: 'POST' }).catch(console.error);
    }
  }

  async getVendorOrders(vendorId: string, statusFilter?: string) {
    if ('findVendorOrders' in this.orderRepository) {
      const subOrders = await (this.orderRepository as any).findVendorOrders(vendorId, statusFilter);
      return subOrders.map((so: any) => ({
        ...so,
        order_status_history: [...(so.order_status_history ?? [])].sort(
          (a: any, b: any) =>
            new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
        ),
      }));
    }
    throw new Error('findVendorOrders not implemented');
  }

  async updateVendorOrderStatus(vendorId: string, subOrderId: string, newStatus: OrderStatus) {
    const subOrder = await this.orderRepository.findSubOrderById(subOrderId);
    if (!subOrder || subOrder.vendor_id !== vendorId) {
      throw new Error('Sub-order not found or unauthorized');
    }

    if (!ALLOWED[subOrder.status as OrderStatus]?.includes(newStatus)) {
      throw new Error(`Invalid transition: ${subOrder.status} -> ${newStatus}`);
    }

    await this.orderRepository.updateSubOrderStatus(subOrderId, newStatus);
    await this.orderRepository.logStatusHistory(
      subOrderId,
      newStatus,
      `Status changed to ${newStatus}`
    );

    // Notifications
    const buyerId = subOrder.orders?.buyer_id;
    const buyerProfile = subOrder.orders?.profiles;
    if (buyerProfile && buyerId) {
      const { createClient } = require('@/lib/supabase/server');
      const supabase = createClient();
      const { data: vendorProfile } = await supabase.from('profiles').select('business_name').eq('id', vendorId).single();
      
      const { notifyOrderStatusChanged } = require('@/lib/notify');
      await notifyOrderStatusChanged({
        buyerEmail: buyerProfile.email || '',
        buyerPhone: buyerProfile.phone,
        orderId: subOrder.order_id,
        subOrderId: subOrderId,
        vendorName: vendorProfile?.business_name || 'Ordr Vendor',
        newStatus: newStatus,
      }).catch(console.error);
    }

    // Escrow Release
    if (newStatus.toUpperCase() === 'DELIVERED') {
      const { createClient } = require('@/lib/supabase/server');
      const supabase = createClient();
      const { data: orderData } = await supabase.from('orders').select('razorpay_payment_id').eq('id', subOrder.order_id).single();
      const paymentId = orderData?.razorpay_payment_id;

      if (paymentId) {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_fallback',
          key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_fallback',
        });

        try {
          const transfers = await razorpay.payments.fetchTransfers(paymentId);
          if (transfers && transfers.items) {
            const vendorTransfer = transfers.items.find(
              (t: any) => t.notes && t.notes.vendor_id === vendorId
            );

            if (vendorTransfer && vendorTransfer.on_hold) {
              await razorpay.transfers.edit(vendorTransfer.id, { on_hold: 0 });
              await supabase
                .from('sub_orders')
                .update({ payout_status: 'settled', payout_transfer_id: vendorTransfer.id })
                .eq('id', subOrderId);
            }
          }
        } catch (rzpError: any) {
          console.error("Razorpay Escrow Release Error:", rzpError);
        }
      }
    }
  }
}
