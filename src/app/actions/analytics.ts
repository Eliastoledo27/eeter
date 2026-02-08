'use server';

import { createClient } from '@/utils/supabase/server';
import { OrderItem } from './dashboard';

export interface AnalyticsData {
  revenueOverTime: { date: string; revenue: number; orders: number }[];
  salesByCategory: { name: string; value: number; color: string }[];
  ordersByStatus: { name: string; value: number; color: string }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number; // Mocked for now
  };
}

export async function getDetailedAnalytics(dateRange?: { start?: string; end?: string }): Promise<AnalyticsData> {
  const supabase = createClient();

  let query = supabase
    .from('pedidos')
    .select('id, total_amount, created_at, status, items, customer_email')
    .order('created_at', { ascending: true });

  if (dateRange?.start) {
    query = query.gte('created_at', dateRange.start);
  }
  if (dateRange?.end) {
    query = query.lte('created_at', dateRange.end);
  }

  const { data: orders, error } = await query;

  if (error || !orders) {
    console.error('Error fetching analytics:', error);
    return {
      revenueOverTime: [],
      salesByCategory: [],
      ordersByStatus: [],
      topProducts: [],
      summary: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, conversionRate: 0 }
    };
  }

  // 1. Revenue Over Time & Summary
  const revenueMap = new Map<string, { revenue: number; orders: number }>();
  let totalRevenue = 0;

  orders.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const amount = Number(order.total_amount || 0);

    const current = revenueMap.get(date) || { revenue: 0, orders: 0 };
    revenueMap.set(date, {
      revenue: current.revenue + amount,
      orders: current.orders + 1
    });

    totalRevenue += amount;
  });

  const revenueOverTime = Array.from(revenueMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders
  }));

  // 2. Orders by Status
  const statusMap = new Map<string, number>();
  const statusColors: Record<string, string> = {
    'pendiente': '#F59E0B', // Amber
    'completado': '#10B981', // Emerald
    'enviado': '#3B82F6', // Blue
    'cancelado': '#EF4444', // Red
    'procesando': '#6366F1' // Indigo
  };

  orders.forEach(order => {
    const status = order.status?.toLowerCase() || 'desconocido';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const ordersByStatus = Array.from(statusMap.entries()).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: statusColors[name] || '#94A3B8' // Slate for unknown
  }));

  // 3. Sales by Category & Top Products
  // Need to fetch products to get categories if not in items
  // Assuming items structure similar to dashboard.ts

  // Optimization: Fetch all products once to map IDs to Categories
  const { data: products } = await supabase.from('productos').select('id, category, name');
  const productMap = new Map(products?.map(p => [p.id, p]) || []);

  const categoryMap = new Map<string, number>();
  const productSalesMap = new Map<string, { name: string; sales: number; revenue: number }>();
  const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#A855F7', '#EC4899', '#6366F1'];

  orders.forEach(order => {
    const items = Array.isArray(order.items)
      ? order.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (order.items as any)?.products || [];

    if (Array.isArray(items)) {
      items.forEach((item: OrderItem) => {
        const id = item.id || item.productId;
        const product = productMap.get(id || '');
        const category = product?.category || 'Otros';
        const quantity = Number(item.quantity || 1);
        const price = Number(item.price || item.basePrice || 0);

        categoryMap.set(category, (categoryMap.get(category) || 0) + quantity);

        const productName = product?.name || item.name || 'Desconocido';
        const currentProd = productSalesMap.get(productName) || { name: productName, sales: 0, revenue: 0 };
        productSalesMap.set(productName, {
          name: productName,
          sales: currentProd.sales + quantity,
          revenue: currentProd.revenue + (price * quantity)
        });
      });
    }
  });

  const salesByCategory = Array.from(categoryMap.entries())
    .map(([name, value], index) => ({
      name,
      value,
      color: categoryColors[index % categoryColors.length]
    }))
    .sort((a, b) => b.value - a.value);

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  return {
    revenueOverTime,
    salesByCategory,
    ordersByStatus,
    topProducts,
    summary: {
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      conversionRate: 2.5 // Mocked static value
    }
  };
}
