import { render, screen, fireEvent } from '@testing-library/react';
import { ShopSidebar, ShopSort } from '@/app/(storefront)/shop/ShopClientControls';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('ShopClientControls Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('category=home-decor'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ShopSidebar', () => {
    it('renders categories and prices', () => {
      const categories = [
        { id: 1, name: 'Home Decor', slug: 'home-decor' },
        { id: 2, name: 'Tech', slug: 'tech' }
      ];
      
      render(<ShopSidebar categories={categories} currentCategory="home-decor" currentPrice="" />);
      
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Home Decor')).toBeInTheDocument();
      expect(screen.getByText('Tech')).toBeInTheDocument();
      expect(screen.getByText('Under ₹1000')).toBeInTheDocument();
    });

    it('navigates when price filter is clicked', () => {
      render(<ShopSidebar categories={[]} currentCategory="all" currentPrice="" />);
      
      const under1000Checkbox = screen.getByLabelText('Under ₹1000');
      fireEvent.click(under1000Checkbox);

      expect(mockPush).toHaveBeenCalledWith('/shop?category=home-decor&price=under-1000');
    });
  });

  describe('ShopSort', () => {
    it('renders sort options and triggers navigation on change', () => {
      render(<ShopSort currentSort="featured" />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('featured');

      fireEvent.change(select, { target: { value: 'price_asc' } });

      expect(mockPush).toHaveBeenCalledWith('/shop?category=home-decor&sort=price_asc');
    });
  });
});
