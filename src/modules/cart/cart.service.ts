import { ICartRepository, CartItem } from './cart.repository.interface';

export class CartService {
  constructor(private readonly cartRepository: ICartRepository) {}

  async getCart(buyerId: string) {
    const cart = await this.cartRepository.getCartWithItems(buyerId);
    if (!cart) {
      throw new Error('Failed to find or create cart');
    }
    return cart;
  }

  async addToCart(buyerId: string, variantId: string, quantity: number) {
    if (!variantId || quantity <= 0) {
      throw new Error('Invalid variant or quantity');
    }

    let cart = await this.cartRepository.findByBuyerId(buyerId);
    if (!cart) {
      cart = await this.cartRepository.create({ buyer_id: buyerId });
    }

    const existingItem = await this.cartRepository.findItemByVariant(cart.id, variantId);

    if (existingItem) {
      return this.cartRepository.updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      return this.cartRepository.addItem(cart.id, variantId, quantity);
    }
  }

  async updateCartItem(itemId: string, quantity: number) {
    if (quantity < 0) {
      throw new Error('Invalid quantity');
    }

    if (quantity === 0) {
      await this.cartRepository.removeItem(itemId);
      return null;
    }

    return this.cartRepository.updateItemQuantity(itemId, quantity);
  }

  async removeCartItem(itemId: string) {
    return this.cartRepository.removeItem(itemId);
  }
}
