import { IRepository } from '@/src/common/types/repository.interface';

export interface ProductFilters {
  category?: string;
  price?: string;
  sort?: string;
  search?: string;
  rating?: string;
  vendor?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  vendor_id: string;
  base_price: number;
  category_id?: string;
  created_at: string;
  [key: string]: any;
}

export interface IProductRepository extends IRepository<Product> {
  findByCategory(category: string): Promise<Product[]>;
  findByVendor(vendorId: string): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  findBySlug(slug: string): Promise<any | null>;
  getFeaturedProducts(limit?: number): Promise<any[]>;
  getCategories(): Promise<any[]>;
  getVendors(): Promise<any[]>;
}
