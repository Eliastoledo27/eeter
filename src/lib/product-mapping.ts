import { Product } from '@/domain/entities/Product';
import { ProductType } from '@/app/actions/products';

/**
 * Maps the database product type (from server actions) to the domain entity Product.
 */
export const mapProductTypeToProduct = (p: ProductType): Product => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    category: p.category || 'General',
    basePrice: p.base_price,
    images: p.images,
    brand: p.brand || p.category || 'Éter',
    stockBySize: p.stock_by_size as Record<string, number>,
    totalStock: Object.values(p.stock_by_size || {}).reduce((a, b) => a + (Number(b) || 0), 0),
    status: p.is_active ? 'active' : 'inactive',
    createdAt: new Date(p.created_at || Date.now()),
    liquidationActive: p.liquidation_active,
    liquidationPrice: p.liquidation_price,
    liquidationDiscountPercent: p.liquidation_discount_percent,
    productSections: (p.product_sections || ['catalog']) as Array<'home' | 'catalog' | 'liquidation' | 'flash'>,
});
