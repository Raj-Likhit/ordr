import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

// Mock the hooks
jest.mock('@/hooks/useCart', () => ({
  useCart: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Header Component', () => {
  beforeEach(() => {
    (useCart as jest.Mock).mockReturnValue({
      cart: { 
        items: [
          { 
            id: 1, 
            quantity: 1, 
            variant: { 
              price_override: null, 
              product: { 
                base_price: 1000, 
                title: 'Product 1', 
                images: [],
                vendor: { business_name: 'Test Vendor' }
              } 
            } 
          }
        ] 
      },
      cartCount: 99,
      isCartOpen: false,
      setIsCartOpen: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
    });
    (useAuth as jest.Mock).mockReturnValue({ user: null, profile: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logo correctly', () => {
    render(<Header />);
    const logos = screen.getAllByText('Ordr');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('displays the correct cart count', () => {
    render(<Header />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('opens search overlay when search button is clicked', () => {
    render(<Header />);
    
    // The search overlay text should not be visible initially
    const overlayHeading = screen.getByText('What are you looking for?');
    expect(overlayHeading.parentElement?.parentElement).toHaveClass('opacity-0');

    // Click search button
    const searchButton = screen.getByLabelText('Search');
    fireEvent.click(searchButton);

    // Overlay should now be visible
    expect(overlayHeading.parentElement?.parentElement).toHaveClass('opacity-100');
  });

  it('toggles mobile menu when hamburger is clicked', () => {
    render(<Header />);
    
    // The drawer should be translated out initially
    const drawerContainer = screen.getByText('Ordr', { selector: 'span' }).parentElement?.parentElement;
    expect(drawerContainer).toHaveClass('-translate-x-full');

    // Click hamburger menu (first button in mobile menu container)
    const hamburgerButtons = screen.getAllByRole('button');
    // The first button in our markup is the mobile menu button
    fireEvent.click(hamburgerButtons[0]);

    expect(drawerContainer).toHaveClass('translate-x-0');
  });
});
