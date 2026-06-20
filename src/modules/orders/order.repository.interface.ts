import { IRepository } from '@/src/common/types/repository.interface';

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  buyer_id: string;
  total_amount: number;
  payment_status: string;
  razorpay_order_id?: string;
  created_at: string;
  address_id?: string;
  address?: any;
  sub_orders?: any[];
  [key: string]: any;
}

export interface SubOrder {
  id: string;
  order_id: string;
  vendor_id: string;
  status: OrderStatus;
  subtotal: number;
  tracking_id?: string;
  orders?: any;
  [key: string]: any;
}

export interface IOrderRepository extends IRepository<Order> {
  findByBuyerId(buyerId: string): Promise<Order[]>;
  findOrderById(orderId: string, buyerId: string): Promise<Order | null>;
  findSubOrderById(subOrderId: string): Promise<SubOrder | null>;
  updateSubOrderStatus(subOrderId: string, status: OrderStatus): Promise<void>;
  logStatusHistory(subOrderId: string, status: OrderStatus, note: string): Promise<void>;
}
