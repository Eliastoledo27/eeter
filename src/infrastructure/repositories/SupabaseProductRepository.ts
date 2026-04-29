import { createClient } from '@/lib/supabase';
import { Product } from '@/domain/entities/Product';
import { ProductRepository } from '@/domain/entities/Product'; // Using the interface defined in the entity file or separate file

interface SupabaseProductRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  images: string[];
  image?: string | null;
  stock_by_size: Record<string, number>;
  stock: number;
  status: string;
  margin?: number;
  brand: string | null;
  estimated_profit: number;
  liquidation_active: boolean;
  liquidation_price: number | null;
  liquidation_discount_percent: number | null;
  created_at: string;
  updated_at?: string | null;
}

export class SupabaseProductRepository implements ProductRepository {
  private supabase = createClient();

  async findAll(filter?: { query?: string; category?: string }): Promise<Product[]> {
    let query = this.supabase
      .from('productos')
      .select('*')
      .eq('status', 'activo')
      .order('created_at', { ascending: false });

    if (filter?.category && filter.category !== 'Todos') {
      query = query.eq('category', filter.category);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    let products = data.map(row => this.mapToEntity(row));

    if (filter?.query) {
      const q = filter.query.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    return products;
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .in('id', ids);

    if (error || !data) return [];
    return data.map(row => this.mapToEntity(row));
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await this.supabase
      .from('productos')
      .insert({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.basePrice,
        images: product.images,
        image: product.images[0] || null, // Legacy support
        stock_by_size: product.stockBySize,
        stock: product.totalStock,
        status: product.status === 'active' ? 'activo' : 'inactivo', // Mapping enum
        brand: product.brand,
        estimated_profit: product.estimatedProfit
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapToEntity(data);
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const updates: Partial<SupabaseProductRow> = {};
    if (product.name) updates.name = product.name;
    if (product.description) updates.description = product.description;
    if (product.category) updates.category = product.category;
    if (product.basePrice) updates.price = product.basePrice;
    if (product.images) {
      updates.images = product.images;
      updates.image = product.images[0] || null;
    }
    if (product.stockBySize) {
      updates.stock_by_size = product.stockBySize;
      updates.stock = Object.values(product.stockBySize).reduce((a, b) => a + b, 0);
    }
    if (product.status) updates.status = product.status === 'active' ? 'activo' : 'inactivo';
    if (product.brand) updates.brand = product.brand;
    if (product.estimatedProfit !== undefined) updates.estimated_profit = product.estimatedProfit;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToEntity(row: SupabaseProductRow): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      category: row.category || 'Sin categoría',
      basePrice: Number(row.price) || 0,
      images: row.images || (row.image ? [row.image] : []),
      stockBySize: row.stock_by_size || {},
      totalStock: row.stock || 0,
      status: row.status === 'activo' ? 'active' : 'inactive',
      margin: Number(row.margin) || 0,
      brand: row.brand || '',
      estimatedProfit: Number(row.estimated_profit) || 0,
      liquidationActive: row.liquidation_active || false,
      liquidationPrice: row.liquidation_price ? Number(row.liquidation_price) : undefined,
      liquidationDiscountPercent: row.liquidation_discount_percent ? Number(row.liquidation_discount_percent) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }
}
