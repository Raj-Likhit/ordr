import { IProductRepository, Product, ProductFilters } from './product.repository.interface';

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<any> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new Error(`Product with slug ${slug} not found`);
    }
    return product;
  }

  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    return this.productRepository.findAll(filters);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.productRepository.findByCategory(category);
  }

  async getFeaturedProducts(limit = 4): Promise<any[]> {
    return this.productRepository.getFeaturedProducts(limit);
  }

  async getCategories() {
    return this.productRepository.getCategories();
  }

  async getVendors() {
    return this.productRepository.getVendors();
  }

  async getVendorProducts(vendorId: string, options: { search?: string; status?: string; page: number; pageSize: number }) {
    // We can delegate to repository, but for now we define the interface
    if ('findVendorProducts' in this.productRepository) {
      return (this.productRepository as any).findVendorProducts(vendorId, options);
    }
    throw new Error('findVendorProducts not implemented in repository');
  }

  async createProduct(vendorId: string, input: any) {
    if ('createProduct' in this.productRepository) {
      return (this.productRepository as any).createProduct(vendorId, input);
    }
    throw new Error('createProduct not implemented in repository');
  }

  async getVendorProductById(vendorId: string, productId: string) {
    if ('getVendorProductById' in this.productRepository) {
      return (this.productRepository as any).getVendorProductById(vendorId, productId);
    }
    throw new Error('getVendorProductById not implemented in repository');
  }

  async updateProduct(vendorId: string, productId: string, input: any) {
    if ('updateProduct' in this.productRepository) {
      return (this.productRepository as any).updateProduct(vendorId, productId, input);
    }
    throw new Error('updateProduct not implemented in repository');
  }

  async deleteProduct(vendorId: string, productId: string) {
    if ('deleteProduct' in this.productRepository) {
      return (this.productRepository as any).deleteProduct(vendorId, productId);
    }
    throw new Error('deleteProduct not implemented in repository');
  }
}
