'use server';

import { createClient } from '@/utils/supabase/server';
import { checkUserPermissions } from '@/utils/supabase/middleware-auth';

export type LiquidationSort = 'name' | 'price' | 'discount' | 'liquidated_at';

export interface LiquidationInputItem {
  productId: string;
  discountPercent: number;
}

export async function applyLiquidationBatch(items: LiquidationInputItem[]) {
  const { user, isAdmin, isStaff } = await checkUserPermissions();
  if (!user || (!isAdmin && !isStaff)) return { success: false, error: 'Unauthorized' };
  const supabase = createClient();
  if (!items.length) {
    // If no selection, clear all active liquidations.
    const { error: clearError } = await supabase
      .from('productos')
      .update({
        liquidation_active: false,
        liquidation_discount_percent: null,
        liquidation_price: null,
        liquidation_at: null,
      })
      .eq('liquidation_active', true);
    if (clearError) return { success: false, error: clearError.message };
    return { success: true, count: 0 };
  }

  const ids = items.map((i) => i.productId);

  const { data: products, error: fetchError } = await supabase
    .from('productos')
    .select('id,name,price,stock_by_size,status');

  if (fetchError || !products) return { success: false, error: fetchError?.message || 'Fetch failed' };

  const selectedSet = new Set(ids);
  const updates: Array<{ id: string; values: Record<string, unknown> }> = [];
  const auditRows: Array<Record<string, unknown>> = [];

  for (const p of products as Array<Record<string, unknown>>) {
    const pid = String(p.id);
    const isSelected = selectedSet.has(pid);
    const isActive = String(p.status) === 'activo';
    const price = Number(p.price || 0);
    const stockBySize = (p.stock_by_size || {}) as Record<string, number>;
    const totalStock = Object.values(stockBySize).reduce((acc, qty) => acc + Number(qty || 0), 0);
    if (isSelected && (!isActive || totalStock <= 0)) {
      return { success: false, error: `Producto sin stock o inactivo: ${String(p.name)}` };
    }

    if (isSelected) {
      updates.push({
        id: pid,
        values: {
          liquidation_active: true,
          liquidation_discount_percent: 20,
          liquidation_price: price, // Precio final de liquidación = precio actual
          liquidation_at: new Date().toISOString(),
          liquidation_by: user.id,
        },
      });
      auditRows.push({
        user_id: user.id,
        action: 'LIQUIDATION_CONTROL_SYNC',
        ip_address: 'server-action',
        entity: 'productos',
        entity_id: pid,
        payload: {
          sku: pid,
          liquidation_price: price,
          display_strike_price: Math.round(price * 1.2),
          discount_percent: 20,
          affected_stock: totalStock,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      updates.push({
        id: pid,
        values: {
          liquidation_active: false,
          liquidation_discount_percent: null,
          liquidation_price: null,
          liquidation_at: null,
        },
      });
    }
  }

  for (const row of updates) {
    const { error } = await supabase.from('productos').update(row.values).eq('id', row.id);
    if (error) return { success: false, error: error.message };
  }

  await supabase.from('audit_logs').insert(auditRows);
  return { success: true, count: updates.length };
}

export async function getLiquidationProducts(params?: {
  page?: number;
  pageSize?: number;
  sortBy?: LiquidationSort;
  sortOrder?: 'asc' | 'desc';
}) {
  const { user, isAdmin, isStaff } = await checkUserPermissions();
  if (!user || (!isAdmin && !isStaff)) return { data: [], total: 0, error: 'Unauthorized' };
  const page = Math.max(1, Number(params?.page || 1));
  const pageSize = Math.max(1, Math.min(50, Number(params?.pageSize || 12)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const sortBy = params?.sortBy || 'liquidated_at';
  const sortOrder = params?.sortOrder || 'desc';

  const supabase = createClient();
  const col = sortBy === 'price' ? 'liquidation_price' : sortBy === 'discount' ? 'liquidation_discount_percent' : sortBy === 'name' ? 'name' : 'liquidation_at';
  const { data, count, error } = await supabase
    .from('productos')
    .select('id,name,images,price,liquidation_price,liquidation_discount_percent,liquidation_at', { count: 'exact' })
    .eq('liquidation_active', true)
    .order(col, { ascending: sortOrder === 'asc' })
    .range(from, to);
  return { data: data || [], total: count || 0, error: error?.message || null };
}

export async function getPublicLiquidationProducts(limit = 3) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('productos')
    .select('id,name,description,images,price,liquidation_price,liquidation_discount_percent,liquidation_active')
    .eq('status', 'activo')
    .eq('liquidation_active', true)
    .order('liquidation_at', { ascending: false, nullsFirst: false })
    .limit(Math.max(1, Math.min(12, limit)));

  return { data: data || [], error: error?.message || null };
}
