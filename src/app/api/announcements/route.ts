import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function normalizeTargetPage(value: string) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/]/g, '');

  if (['all', 'todos', 'todo', '*'].includes(normalized)) return 'all';
  if (['home', 'inicio', 'index', '/'].includes(normalized)) return 'home';
  if (['catalog', 'catalogo', 'catalogue', 'c'].includes(normalized)) return 'catalog';
  if (['community', 'comunidad'].includes(normalized)) return 'community';
  if (['about', 'sobre', 'sobreeter'].includes(normalized)) return 'about';
  if (['contact', 'contacto'].includes(normalized)) return 'contact';
  return normalized;
}

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ success: false, announcements: [], error: 'Supabase no configurado' }, { status: 500 });
  }

  const page = normalizeTargetPage(new URL(request.url).searchParams.get('page') || '');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id,title,content,category,image_url,is_active,published_at,created_at,target_pages,template_key,display_mode,cta_label,cta_url,priority')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const announcements = (data || []).filter((announcement) => {
      if (!page) return true;
      const pages = ((announcement.target_pages?.length ? announcement.target_pages : ['home']) as string[]).map(normalizeTargetPage);
      return pages.includes('all') || pages.includes(page);
    });

    return NextResponse.json(
      { success: true, announcements },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Public announcements fetch error:', error);
    return NextResponse.json({ success: false, announcements: [], error: message }, { status: 500 });
  }
}
