import { IPaymentRepository } from './payment.repository.interface';

export class PaymentService {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async processCheckout(buyerId: string, addressId: string, cartItems: any[]) {
    if (!addressId) throw new Error('Address is required');
    if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');

    let itemsTotal = 0;
    const vendorData: Record<string, { accountId: string | null; total: number; totalPlatformCut: number }> = {};

    for (const item of cartItems) {
      const variant: any = Array.isArray(item.variant) ? item.variant[0] : item.variant;
      const product: any = Array.isArray(variant?.product) ? variant.product[0] : variant?.product;
      const vendor: any = Array.isArray(product?.vendor) ? product.vendor[0] : product?.vendor;
      const category: any = Array.isArray(product?.category) ? product.category[0] : product?.category;
      
      const price = variant?.price_override || product?.base_price || 0;
      const lineTotal = price * item.quantity;
      
      itemsTotal += lineTotal;
      
      const commissionRate = product?.commission_rate ?? category?.commission_rate ?? 0.10;
      const itemPlatformCut = lineTotal * Number(commissionRate);

      if (vendor && vendor.id) {
        if (!vendorData[vendor.id]) {
          vendorData[vendor.id] = { accountId: vendor.razorpay_account_id, total: 0, totalPlatformCut: 0 };
        }
        vendorData[vendor.id].total += lineTotal;
        vendorData[vendor.id].totalPlatformCut += itemPlatformCut;
      }
    }

    const SHIPPING_THRESHOLD = 5000;
    const FLAT_SHIPPING = 100;
    const shippingFee = itemsTotal > SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    
    const totalAmount = itemsTotal + shippingFee;

    if (totalAmount <= 0) throw new Error('Invalid total amount');

    const FIXED_CLOSING_FEE = 50;
    const transfers: any[] = [];

    for (const [vendorId, data] of Object.entries(vendorData)) {
      if (data.accountId) {
        const platformFee = data.totalPlatformCut + FIXED_CLOSING_FEE;
        const vendorShare = Math.max(0, data.total - platformFee);
        
        if (vendorShare > 0) {
          transfers.push({
            account: data.accountId,
            amount: Math.round(vendorShare * 100),
            currency: "INR",
            notes: {
              vendor_id: vendorId,
              type: "sub_order_payout"
            },
            on_hold: 1
          });
        }
      }
    }

    const dbOrderId = await this.paymentRepository.createPendingCheckout(buyerId, addressId, totalAmount);

    if (paymentMethod === 'cod') {
      await this.paymentRepository.confirmCodCheckout(dbOrderId);
      return { 
        id: `cod_${dbOrderId}`, 
        currency: "INR", 
        amount: totalAmount * 100,
        totalAmount,
        dbOrderId
      };
    }

    const options: any = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${dbOrderId.slice(0, 8)}`,
      notes: { db_order_id: dbOrderId }
    };

    if (transfers.length > 0) {
      options.transfers = transfers;
    }

    const order = await this.paymentRepository.createRazorpayOrder(options);

    await this.paymentRepository.updateOrderRazorpayId(dbOrderId, order.id);

    return { 
      id: order.id, 
      currency: order.currency, 
      amount: order.amount,
      totalAmount,
      dbOrderId
    };
  }

  async verifyPayment(dbOrderId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_fallback';
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      throw new Error('Invalid payment signature');
    }

    await this.paymentRepository.confirmCheckout(dbOrderId, razorpayOrderId, razorpayPaymentId);
    return true;
  }
}
