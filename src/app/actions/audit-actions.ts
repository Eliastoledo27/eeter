'use server';

import { createClient } from '@/utils/supabase/server';
import { checkUserPermissions } from '@/utils/supabase/middleware-auth';

interface Filters {
  userId?: string;
  productId?: string;
  action?: string;
  from?: string;
  to?: string;
}

export async function getAuditLogs(filters: Filters = {}) {
  const { user, isAdmin, isStaff } = await checkUserPermissions();
  if (!user || (!isAdmin && !isStaff)) return { data: [], error: 'Unauthorized' };
  const supabase = createClient();
  let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(300);
  if (filters.userId) q = q.eq('user_id', filters.userId);
  if (filters.productId) q = q.eq('entity_id', filters.productId);
  if (filters.action) q = q.eq('action', filters.action);
  if (filters.from) q = q.gte('created_at', filters.from);
  if (filters.to) q = q.lte('created_at', filters.to);
  const { data, error } = await q;
  return { data: data || [], error: error?.message || null };
}
