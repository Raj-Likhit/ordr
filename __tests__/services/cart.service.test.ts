import { CartService } from '@/src/modules/cart/cart.service';
import { ICartRepository } from '@/src/modules/cart/cart.repository.interface';

describe('CartService', () => {
  let cartService: CartService;
  let mockRepository: jest.Mocked<ICartRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByBuyerId: jest.fn(),
      getCartWithItems: jest.fn(),
      findItemByVariant: jest.fn(),
      addItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      removeItem: jest.fn(),
    };
    cartService = new CartService(mockRepository);
  });

  it('should add new item to cart', async () => {
    const mockCart = { id: 'cart1', buyer_id: 'buyer1' };
    mockRepository.findByBuyerId.mockResolvedValue(mockCart);
    mockRepository.findItemByVariant.mockResolvedValue(null);
    mockRepository.addItem.mockResolvedValue({ id: 'item1', cart_id: 'cart1', variant_id: 'var1', quantity: 2 });

    const result = await cartService.addToCart('buyer1', 'var1', 2);
    
    expect(mockRepository.addItem).toHaveBeenCalledWith('cart1', 'var1', 2);
    expect(result.quantity).toBe(2);
  });

  it('should update quantity if item already in cart', async () => {
    const mockCart = { id: 'cart1', buyer_id: 'buyer1' };
    mockRepository.findByBuyerId.mockResolvedValue(mockCart);
    mockRepository.findItemByVariant.mockResolvedValue({ id: 'item1', cart_id: 'cart1', variant_id: 'var1', quantity: 1 });
    mockRepository.updateItemQuantity.mockResolvedValue({ id: 'item1', cart_id: 'cart1', variant_id: 'var1', quantity: 3 });

    const result = await cartService.addToCart('buyer1', 'var1', 2);
    
    expect(mockRepository.updateItemQuantity).toHaveBeenCalledWith('item1', 3);
    expect(result.quantity).toBe(3);
  });
});
