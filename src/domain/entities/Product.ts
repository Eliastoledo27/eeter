export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  images: string[];
  stockBySize: Record<string, number>;
  totalStock: number;
  status: 'active' | 'inactive' | 'draft';
  margin?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ProductRepository {
  findAll(filter?: { query?: string; category?: string }): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}
