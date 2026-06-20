import { StepConfig } from './types';

export const ONBOARDING_STEPS: StepConfig[] = [
  // Homepage Steps
  {
    id: 'homepage-nav',
    page: '/',
    selector: '[data-tour-id="homepage-nav"]',
    title: 'Explore Categories',
    description: 'Browse through our curated artisan collections from around the world.',
  },
  {
    id: 'homepage-search',
    page: '/',
    selector: '[data-tour-id="homepage-search"]',
    title: 'Find Anything',
    description: 'Looking for something specific? Search for products, vendors, or materials here.',
  },
  {
    id: 'homepage-featured',
    page: '/',
    selector: '[data-tour-id="homepage-featured"]',
    title: 'Featured Creators',
    description: 'Discover the stories and collections of our top artisans.',
    actionLabel: 'Go to Shop',
  },
  // Shop Page Steps
  {
    id: 'shop-filters',
    page: '/shop',
    selector: '[data-tour-id="shop-filters"]',
    title: 'Refine Your Style',
    description: 'Filter products by price, category, and vendor to find your perfect match.',
  },
  {
    id: 'shop-sort',
    page: '/shop',
    selector: '[data-tour-id="shop-sort"]',
    title: 'Sort It Out',
    description: 'View the newest arrivals or sort by price.',
  },
  {
    id: 'shop-add-to-cart',
    page: '/shop',
    selector: '[data-tour-id="shop-add-to-cart"]',
    title: 'Add to Cart',
    description: 'Ready to buy? Add items to your cart instantly.',
    actionLabel: 'Go to Profile',
  },
  // Profile Steps
  {
    id: 'profile-orders',
    page: '/account/orders',
    selector: '[data-tour-id="profile-orders"]',
    title: 'Track Orders',
    description: 'Keep an eye on your recent purchases and their shipping status.',
  },
  {
    id: 'profile-addresses',
    page: '/account/settings',
    selector: '[data-tour-id="profile-addresses"]',
    title: 'Saved Addresses',
    description: 'Manage your delivery locations for faster checkouts.',
    actionLabel: 'Finish Tour',
  }
];
