export const COMM_TEMPLATES = {
  order_placed: {
    emailSubject: (id: string) => `Your order #${id} is confirmed!`,
    smsTemplate: 'order_confirmation',
  },
  order_shipped: {
    emailSubject: (id: string) => `Your order is on its way 🚚`,
    smsTemplate: 'order_shipped',
  },
  order_delivered: {
    emailSubject: (id: string) => `Your order has been delivered ✅`,
    smsTemplate: 'order_delivered',
  },
  order_cancelled: {
    emailSubject: (id: string) => `Your order #${id} has been cancelled`,
    smsTemplate: 'order_cancelled',
  },
  order_returned: {
    emailSubject: (id: string) => `Refund initiated for order #${id}`,
    smsTemplate: 'order_returned',
  },
  vendor_new_order: {
    emailSubject: (id: string) => `New order received — action needed`,
    smsTemplate: 'vendor_new_order',
  },
  vendor_approved: {
    emailSubject: () => `Your vendor application has been approved!`,
    smsTemplate: 'vendor_approved',
  },
  vendor_rejected: {
    emailSubject: () => `Update on your vendor application`,
    smsTemplate: 'vendor_rejected',
  },
  vendor_suspended: {
    emailSubject: () => `Important notice regarding your vendor account`,
    smsTemplate: 'vendor_suspended',
  },
};
