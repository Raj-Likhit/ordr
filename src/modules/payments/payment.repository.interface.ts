export interface IPaymentRepository {
  createPendingCheckout(buyerId: string, addressId: string, totalAmount: number): Promise<string>;
  updateOrderRazorpayId(dbOrderId: string, razorpayOrderId: string): Promise<void>;
  createRazorpayOrder(options: any): Promise<any>;
  confirmCheckout(dbOrderId: string, razorpayOrderId: string, razorpayPaymentId: string): Promise<void>;
  confirmCodCheckout(dbOrderId: string): Promise<void>;
}
