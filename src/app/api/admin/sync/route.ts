import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const ADMIN_KEY = (process.env.ADMIN_API_KEY || 'Feter').replace(/^"|"$/g, '');

function normalizeToken(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function isAuthorized(req: Request) {
  const adminHeader = req.headers.get('x-admin-token');
  const authHeader = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const token = (adminHeader || authHeader || '').replace(/^"|"$/g, '');
  return !!token && normalizeToken(token) === normalizeToken(ADMIN_KEY);
}

function revalidateStore() {
  ['/', '/catalog', '/resellers', '/dashboard', '/dashboard/products', '/dashboard/announcements', '/c/catalogorev', '/c/nuevocatalogrev'].forEach((path) => {
    try {
      revalidatePath(path);
    } catch (error) {
      console.error(`Error revalidating ${path}`, error);
    }
  });
}

function productSelect() {
  return 'id,name,description,category,price,image,images,stock_by_size,stock,status,brand,liquidation_active,liquidation_price,liquidation_discount_percent,product_sections,updated_at';
}

function formatCoupon(row: Record<string, unknown>) {
  return {
    id: row.id,
    code: row.code,
    type: row.discount_type,
    value: Number(row.discount_value || 0),
    min_purchase: Number(row.min_purchase_amount || 0),
    is_active: row.is_active,
    usage_limit: row.usage_limit,
    usage_count: row.used_count,
    expires_at: row.valid_until,
  };
}

function couponPayload(coupon: Record<string, unknown>) {
  return {
    code: String(coupon.code || '').trim().toUpperCase(),
    discount_type: String(coupon.type || coupon.discount_type || 'percentage'),
    discount_value: Number(coupon.value ?? coupon.discount_value ?? 0),
    applies_to: String(coupon.applies_to || 'all'),
    min_purchase_amount: Number(coupon.min_purchase ?? coupon.min_purchase_amount ?? 0),
    usage_limit: coupon.usage_limit ?? null,
    valid_until: coupon.expires_at ?? coupon.valid_until ?? null,
    is_active: coupon.is_active ?? true,
    updated_at: new Date().toISOString(),
  };
}

function normalizeAnnouncementTarget(value: unknown) {
  const clean = normalizeToken(String(value || '').toLowerCase()).replace(/[^a-z0-9/]/g, '');
  if (['all', 'todos', 'todo', '*'].includes(clean)) return 'all';
  if (['home', 'inicio', 'index', '/'].includes(clean)) return 'home';
  if (['catalog', 'catalogo', 'catalogue', 'c'].includes(clean)) return 'catalog';
  if (['community', 'comunidad'].includes(clean)) return 'community';
  if (['about', 'sobre', 'sobreeter'].includes(clean)) return 'about';
  if (['contact', 'contacto'].includes(clean)) return 'contact';
  return '';
}

function normalizeAnnouncementPages(value: unknown) {
  const source = Array.isArray(value) ? value : [];
  const pages = Array.from(new Set(source.map(normalizeAnnouncementTarget).filter(Boolean)));
  if (pages.includes('all')) return ['all'];
  return pages.length ? pages : ['home'];
}

function announcementPayload(announcement: Record<string, unknown>) {
  const targetPages = Array.isArray(announcement.target_pages)
    ? announcement.target_pages
    : announcement.targetPages;

  return {
    title: String(announcement.title || '').trim(),
    content: announcement.content ?? null,
    category: announcement.category ?? null,
    image_url: announcement.image_url ?? announcement.imageUrl ?? null,
    is_active: announcement.is_active ?? announcement.isActive ?? true,
    target_pages: normalizeAnnouncementPages(targetPages),
    template_key: announcement.template_key ?? announcement.templateKey ?? 'minimal',
    display_mode: announcement.display_mode ?? announcement.displayMode ?? 'floating',
    cta_label: announcement.cta_label ?? announcement.ctaLabel ?? null,
    cta_url: announcement.cta_url ?? announcement.ctaUrl ?? null,
    priority: Number(announcement.priority || 0),
    updated_at: new Date().toISOString(),
  };
}

async function listAll() {
  const supabase = getSupabase();

  const [pedidos, coupons, announcements, resellerLinks] = await Promise.all([
    supabase
      .from('pedidos')
      .select('id,customer_name,customer_email,total_amount,status,items,created_at,discount_amount,applied_coupon_id')
      .order('created_at', { ascending: false })
      .limit(300),
    supabase
      .from('coupons')
      .select('id,code,discount_type,discount_value,min_purchase_amount,is_active,usage_limit,used_count,valid_until,created_at')
      .order('created_at', { ascending: false })
      .limit(300),
    supabase
      .from('announcements')
      .select('id,title,content,category,image_url,is_active,published_at,created_at,target_pages,template_key,display_mode,cta_label,cta_url,priority')
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(100),
    supabase
      .from('profiles')
      .select('id,full_name,reseller_slug,role,is_premium')
      .eq('role', 'reseller')
      .not('reseller_slug', 'is', null)
      .order('full_name', { ascending: true })
      .limit(200),
  ]);

  const error = pedidos.error || coupons.error || announcements.error || resellerLinks.error;
  if (error) throw error;

  return {
    pedidos: pedidos.data || [],
    coupons: (coupons.data || []).map(formatCoupon),
    announcements: announcements.data || [],
    resellerLinks: resellerLinks.data || [],
  };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    return NextResponse.json({ success: true, ...(await listAll()) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = String(body.action || '');
    const supabase = getSupabase();

    if (action === 'list_all') {
      return NextResponse.json({ success: true, ...(await listAll()) }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (action === 'update_product_sections') {
      const sections = Array.isArray(body.sections) && body.sections.length ? body.sections : ['catalog'];
      const { data, error } = await supabase
        .from('productos')
        .update({ product_sections: sections, updated_at: new Date().toISOString() })
        .eq('id', body.productId)
        .select(productSelect())
        .single();
      if (error) throw error;
      revalidateStore();
      return NextResponse.json({ success: true, product: data });
    }

    if (action === 'update_product') {
      const stock = body.stockBySize
        ? Object.values(body.stockBySize as Record<string, unknown>).reduce((total: number, value) => total + Number(value), 0)
        : 0;
      const { data, error } = await supabase
        .from('productos')
        .update({
          name: body.name,
          description: body.description,
          category: body.category,
          price: Number(body.price),
          stock_by_size: body.stockBySize || {},
          stock: stock,
          status: body.status,
          brand: body.brand,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.productId)
        .select(productSelect())
        .single();
      if (error) throw error;
      revalidateStore();
      return NextResponse.json({ success: true, product: data });
    }

    if (action === 'update_order_status') {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ status: body.status })
        .eq('id', body.orderId)
        .select('id,status')
        .single();
      if (error) throw error;
      revalidateStore();
      return NextResponse.json({ success: true, pedido: data });
    }

    if (action === 'save_coupon') {
      const payload = couponPayload(body.coupon || {});
      if (!payload.code || payload.discount_value <= 0) {
        return NextResponse.json({ success: false, error: 'Cupón inválido' }, { status: 400 });
      }

      const query = body.coupon?.id
        ? supabase.from('coupons').update(payload).eq('id', body.coupon.id)
        : supabase.from('coupons').insert({ ...payload, used_count: 0 });
      const { data, error } = await query.select().single();
      if (error) throw error;
      revalidateStore();
      return NextResponse.json({ success: true, coupon: formatCoupon(data) });
    }

    if (action === 'delete_coupon') {
      const { error } = await supabase.from('coupons').delete().eq('id', body.id);
      if (error) throw error;
      revalidateStore();
      return NextResponse.json({ success: true });
    }

    if (action === 'save_announcement') {
      const payload = announcementPayload(body.announcement || {});
      if (!payload.title) {
        return NextResponse.json({ success: false, error: 'Título requerido' }, { status: 400 });
      }

      const query = body.announcement?.id
        ? supabase.from('announcements').update(payload).eq('id', body.announcement.id)
        : supabase.from('announcements').insert({ ...payload, published_at: new Date().toISOString() });
      const { data, error } = await query.select().single();
      if (error) throw error;
      revalidateStore();
      return NextResponse.json({ success: true, announcement: data });
    }

    if (action === 'delete_announcement') {
      const { error } = await supabase.from('announcements').delete().eq('id', body.id);
      if (error) throw error;
      revalidateStore();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Acción no soportada' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Féter admin sync error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
