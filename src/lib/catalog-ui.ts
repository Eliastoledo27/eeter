import type { Product } from '@/types';

export type StockStatus = 'all' | 'available' | 'low' | 'out';

export type AvailableSize = [size: string, stock: number];

export function getTotalStock(product: Pick<Product, 'stockBySize'>) {
  return Object.values(product.stockBySize || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

export function getStockStatus(product: Pick<Product, 'stockBySize'>): Exclude<StockStatus, 'all'> {
  const total = getTotalStock(product);
  if (total <= 0) return 'out';
  if (total <= 3) return 'low';
  return 'available';
}

export function getAvailableSizes(product: Pick<Product, 'stockBySize'>): AvailableSize[] {
  return Object.entries(product.stockBySize || {})
    .filter(([, qty]) => Number(qty || 0) > 0)
    .sort(([a], [b]) => {
      const numA = Number(a);
      const numB = Number(b);
      return Number.isNaN(numA) || Number.isNaN(numB) ? a.localeCompare(b) : numA - numB;
    })
    .map(([size, stock]) => [size, Number(stock || 0)]);
}

export function getSizeStockStatus(stock: number) {
  if (stock <= 0) return 'out';
  if (stock <= 3) return 'critical';
  if (stock <= 8) return 'low';
  return 'available';
}
