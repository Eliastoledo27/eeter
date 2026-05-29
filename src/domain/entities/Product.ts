export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  images: string[];
  brand: string;
  stockBySize: Record<string, number>;
  totalStock: number;
  status: 'active' | 'inactive' | 'draft';
  colorDescription?: string;
  estimatedProfit?: number;
  margin?: number;
  liquidationActive?: boolean;
  liquidationPrice?: number;
  liquidationDiscountPercent?: number;
  productSections?: Array<'home' | 'catalog' | 'liquidation' | 'flash'>;
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
