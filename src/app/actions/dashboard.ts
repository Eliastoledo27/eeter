'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const saleSchema = z.object({
  customer_name: z.string().min(2, 'Nombre demasiado corto'),
  price: z.coerce.number().min(1, 'El precio debe ser mayor a 0'),
  product_id: z.string().uuid('Producto inválido'),
});

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface OrderItem {
  id?: string;
  productId?: string;
  name?: string;
  quantity?: number;
  price?: number;
  basePrice?: number;
  images?: string[];
  image?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  // 1. Total Revenue & Orders (All time)
  const { data: allOrders, error: ordersError } = await supabase
    .from('pedidos')
    .select('total_amount, created_at');

  if (ordersError) {
    console.error('Error fetching orders stats:', ordersError);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      activeCustomers: 0,
      revenueGrowth: 0,
      ordersGrowth: 0
    };
  }

  const orders = allOrders || [];
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const totalOrders = orders.length;

  // 2. Total Products
  const { count: totalProducts } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true });

  // 3. Active Customers
  const { count: activeCustomers } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  return {
    totalRevenue,
    totalOrders,
    totalProducts: totalProducts || 0,
    activeCustomers: activeCustomers || 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  };
}

export async function getRanking() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, points, streak_days')
    .order('points', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching ranking:', error);
    return [];
  }

  return data.map(p => ({
    id: p.id,
    name: p.full_name || 'Sin nombre',
    points: p.points || 0,
    streak: p.streak_days || 0
  }));
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }

  return data.map(order => ({
    ...order,
    items: Array.isArray(order.items)
      ? order.items
      : (order.items as any)?.products || [] // eslint-disable-line @typescript-eslint/no-explicit-any
  })) as Order[];
}

export async function getUserRecentOrders(limit = 5): Promise<Order[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return [];
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('customer_email', user.email)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user recent orders:', error);
    return [];
  }

  return data.map(order => ({
    ...order,
    items: Array.isArray(order.items)
      ? order.items
      : (order.items as any)?.products || [] // eslint-disable-line @typescript-eslint/no-explicit-any
  })) as Order[];
}

export async function getUserDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      activeCustomers: 0,
      revenueGrowth: 0,
      ordersGrowth: 0
    };
  }

  // 1. User's Orders
  const { data: userOrders } = await supabase
    .from('pedidos')
    .select('total_amount')
    .eq('customer_email', user.email);

  const totalSpent = userOrders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
  const totalOrders = userOrders?.length || 0;

  // 2. Active Orders (not completed/cancelled)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeOrdersCount = userOrders?.filter((o: any) => o.status !== 'completado' && o.status !== 'cancelado').length || 0;

  // 3. Cart Items (Approximate, from local storage usually, but maybe we have a server cart?)
  // For now we'll use activeOrders as a proxy for "active activity" or just 0.

  return {
    totalRevenue: totalSpent, // Reuse field for "Total Spent"
    totalOrders: totalOrders,
    totalProducts: 0, // Not relevant
    activeCustomers: 0, // Not relevant
    revenueGrowth: activeOrdersCount, // Reuse for "Active Orders" count
    ordersGrowth: 0
  };
}

export async function getRevenueData(): Promise<RevenueData[]> {
  const supabase = createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: orders, error } = await supabase
    .from('pedidos')
    .select('created_at, total_amount')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (error || !orders) {
    return [];
  }

  const revenueMap = new Map<string, number>();

  orders.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const amount = Number(order.total_amount || 0);
    revenueMap.set(date, (revenueMap.get(date) || 0) + amount);
  });

  return Array.from(revenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = createClient();

  const { data: orders, error } = await supabase
    .from('pedidos')
    .select('items')
    .not('items', 'is', null);

  if (error || !orders) {
    console.error('Error fetching top products:', error);
    return [];
  }

  const productSales = new Map<string, { name: string; sales: number; revenue: number; image?: string }>();

  orders.forEach(order => {
    // Handle legacy (array) and new (object) items structure
    const items = Array.isArray(order.items)
      ? order.items
      : (order.items as any)?.products || []; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (Array.isArray(items)) {
      items.forEach((item: OrderItem) => {
        const id = item.id || item.productId;
        const name = item.name || 'Producto Desconocido';
        const quantity = Number(item.quantity || 1);
        const price = Number(item.price || item.basePrice || 0);
        const image = Array.isArray(item.images) ? item.images[0] : (item.image || undefined);

        if (id) {
          const current = productSales.get(id) || { name, sales: 0, revenue: 0, image: undefined };
          productSales.set(id, {
            name,
            sales: current.sales + quantity,
            revenue: current.revenue + (price * quantity),
            image: current.image || image
          });
        }
      });
    }
  });

  const sortedProducts = Array.from(productSales.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);

  return sortedProducts;
}

// --- New Analytics Actions ---

export interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down';
  trendValue: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'revenue' | 'review' | 'message' | 'product';
  title: string;
  description: string;
  timestamp: string;
  value?: string;
}

export async function getPerformanceMetrics(): Promise<PerformanceMetric[]> {
  const supabase = createClient();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Previous periods for comparison
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // 1. Sales Today
  const { data: ordersToday } = await supabase
    .from('pedidos')
    .select('total_amount')
    .gte('created_at', startOfDay);

  const { data: ordersYesterday } = await supabase
    .from('pedidos')
    .select('total_amount')
    .gte('created_at', startOfYesterday)
    .lt('created_at', endOfYesterday);

  const salesToday = ordersToday?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;
  const salesYesterday = ordersYesterday?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;

  // 2. New Customers (Monthly)
  const { count: newCustomersMonth } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth);

  // 3. Monthly Revenue
  const { data: ordersMonth } = await supabase
    .from('pedidos')
    .select('total_amount')
    .gte('created_at', startOfMonth);

  const revenueMonth = ordersMonth?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;

  // Calculate trends (simple percentage diff)
  const salesTrend = salesYesterday > 0 ? ((salesToday - salesYesterday) / salesYesterday) * 100 : 100;

  return [
    {
      label: 'Ventas Hoy',
      value: salesToday,
      target: 500000, // Example target: $500k daily
      trend: salesTrend >= 0 ? 'up' : 'down',
      trendValue: Math.abs(salesTrend)
    },
    {
      label: 'Conversión', // Mocked as we don't have visitor tracking yet
      value: 3.2,
      target: 5.0,
      trend: 'up',
      trendValue: 0.5
    },
    {
      label: 'Nuevos Clientes',
      value: newCustomersMonth || 0,
      target: 50, // Example target
      trend: 'up',
      trendValue: 10
    },
    {
      label: 'Objetivo Mensual',
      value: revenueMonth,
      target: 10000000, // Example target: $10M monthly
      trend: revenueMonth > 5000000 ? 'up' : 'down',
      trendValue: (revenueMonth / 10000000) * 100
    }
  ];
}

export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const supabase = createClient();

  // Combine latest orders and new customers
  // In a real scenario, you might have an 'events' table or union queries.
  // Here we'll fetch both and sort in JS.

  const { data: orders } = await supabase
    .from('pedidos')
    .select('id, customer_name, total_amount, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data: customers } = await supabase
    .from('clientes')
    .select('id, nombre, created_at') // Changed 'name' to 'nombre' based on previous file read
    .order('created_at', { ascending: false })
    .limit(limit);

  const activities: ActivityItem[] = [];

  orders?.forEach(o => {
    activities.push({
      id: `order-${o.id}`,
      type: 'order',
      title: `Nuevo pedido`,
      description: `${o.customer_name} realizó una compra`,
      timestamp: o.created_at,
      value: `$${o.total_amount}`
    });
  });

  customers?.forEach(c => {
    activities.push({
      id: `customer-${c.id}`,
      type: 'customer',
      title: 'Nuevo cliente',
      description: `${c.nombre || 'Usuario'} se ha registrado`,
      timestamp: c.created_at
    });
  });

  // Check for low stock products
  const { data: lowStock } = await supabase
    .from('productos')
    .select('id, name, stock')
    .lt('stock', 5)
    .limit(5);

  lowStock?.forEach(p => {
    activities.push({
      id: `stock-${p.id}`,
      type: 'product',
      title: 'Stock Crítico',
      description: `${p.name} tiene solo ${p.stock} unidades`,
      timestamp: new Date().toISOString() // Current time as it's a state, not an event
    });
  });

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export async function getAdvancedAnalytics() {
  const supabase = createClient();

  // 1. Sales by Category
  // Re-using logic from getTopProducts but grouping by category
  const { data: products } = await supabase
    .from('productos')
    .select('id, category, name');

  const { data: orders } = await supabase
    .from('pedidos')
    .select('items, created_at, total_amount')
    .not('items', 'is', null);

  const categoryMap = new Map<string, number>();
  const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#A855F7', '#EC4899', '#6366F1'];

  // Helper to find category for an item
  const productCategoryMap = new Map(products?.map(p => [p.id, p.category]) || []);

  orders?.forEach(order => {
    // Handle legacy (array) and new (object) items structure
    const items = Array.isArray(order.items)
      ? order.items
      : (order.items as any)?.products || []; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (Array.isArray(items)) {
      items.forEach((item: OrderItem) => {
        const id = item.id || item.productId;
        const category = productCategoryMap.get(id || '') || 'Otros';
        const quantity = Number(item.quantity || 1);
        categoryMap.set(category, (categoryMap.get(category) || 0) + quantity);
      });
    }
  });

  const salesByCategory = Array.from(categoryMap.entries())
    .map(([name, value], index) => ({
      name: name || 'General',
      value,
      color: categoryColors[index % categoryColors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // 2. Monthly Targets vs Reality (Mocked targets, Real data)
  const currentYear = new Date().getFullYear();
  const monthlyDataMap = new Map<string, number>();

  orders?.forEach(order => {
    const d = new Date(order.created_at);
    if (d.getFullYear() === currentYear) {
      const monthKey = d.toLocaleString('es-ES', { month: 'short' });
      monthlyDataMap.set(monthKey, (monthlyDataMap.get(monthKey) || 0) + Number(order.total_amount));
    }
  });

  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const monthlyData = months.map(m => {
    const val = monthlyDataMap.get(m) || 0;
    // Mock target: assume growth or static target
    return {
      month: m.charAt(0).toUpperCase() + m.slice(1),
      ventas: val,
      objetivo: 500000 // Example static monthly target
    };
  });

  return {
    salesByCategory,
    monthlyData: monthlyData.filter(m => m.ventas > 0 || m.month === new Date().toLocaleString('es-ES', { month: 'short' })) // Filter empty future months roughly
  };
}

export async function getQuickStats() {
  const supabase = createClient();

  const { count: customersCount } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  const { count: productsCount } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true });

  // Count unread notifications (assuming notifications table exists as seen in notifications.ts)
  const { data: { user } } = await supabase.auth.getUser();
  let unreadNotifications = 0;

  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    unreadNotifications = count || 0;
  }

  return {
    customersCount: customersCount || 0,
    productsCount: productsCount || 0,
    unreadNotifications
  };
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data.map(order => ({
    ...order,
    items: Array.isArray(order.items)
      ? order.items
      : (order.items as any)?.products || [] // eslint-disable-line @typescript-eslint/no-explicit-any
  })) as Order[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  lastPurchase: string;
  totalSpent: number;
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = createClient();

  // Obtenemos clientes y sus pedidos para calcular totales
  const { data: customers, error } = await supabase
    .from('clientes')
    .select('id, nombre, email'); // Ajustado a 'nombre' probable, o 'name'

  if (error || !customers) {
    // console.error('Error fetching customers:', error);
    return [];
  }

  // Para cada cliente, obtenemos sus stats de pedidos
  const customersWithStats = await Promise.all(customers.map(async (c) => {
    const { data: orders } = await supabase
      .from('pedidos')
      .select('total_amount, created_at')
      .eq('customer_email', c.email)
      .order('created_at', { ascending: false });

    const totalSpent = orders?.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;
    const lastPurchase = orders?.[0]?.created_at
      ? new Date(orders[0].created_at).toLocaleDateString('es-ES')
      : 'Sin compras';

    return {
      id: c.id,
      name: c.nombre || 'Cliente',
      email: c.email,
      lastPurchase,
      totalSpent
    };
  }));

  return customersWithStats;
}

export async function registerSale(prevState: { success: boolean, message?: string, errors?: Record<string, string[] | undefined> }, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'No autorizado' };
  }

  const rawData = {
    customer_name: formData.get('customer_name'),
    price: formData.get('price'),
    product_id: formData.get('product_id'),
  };

  const validated = saleSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Error de validación'
    };
  }

  const { customer_name, price, product_id } = validated.data;

  // 1. Registrar pedido
  const { error: orderError } = await supabase
    .from('pedidos')
    .insert({
      customer_name,
      total_amount: price,
      status: 'completado',
      items: [{ productId: product_id, quantity: 1, price }]
    });

  if (orderError) {
    return { success: false, message: 'Error al registrar la venta' };
  }

  // 2. Sumar puntos al usuario (ejemplo: 10 puntos por venta)
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user.id)
    .single();

  const newPoints = (profile?.points || 0) + 10;

  await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', user.id);

  revalidatePath('/dashboard');

  return {
    success: true,
    message: `¡Venta registrada! Ganaste 10 puntos. Total: ${newPoints} pts`
  };
}
