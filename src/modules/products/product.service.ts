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
}
