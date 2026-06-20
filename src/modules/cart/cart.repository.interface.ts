import { IRepository } from '@/src/common/types/repository.interface';

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  variant?: any;
}

export interface Cart {
  id: string;
  buyer_id: string;
  items?: CartItem[];
}

export interface ICartRepository extends IRepository<Cart> {
  findByBuyerId(buyerId: string): Promise<Cart | null>;
  getCartWithItems(buyerId: string): Promise<{ id: string, items: CartItem[] } | null>;
  findItemByVariant(cartId: string, variantId: string): Promise<CartItem | null>;
  addItem(cartId: string, variantId: string, quantity: number): Promise<CartItem>;
  updateItemQuantity(itemId: string, quantity: number): Promise<CartItem>;
  removeItem(itemId: string): Promise<void>;
}
