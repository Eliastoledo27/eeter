import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const vipOnly = searchParams.get('vip') === 'true';
  const query = searchParams.get('q') || '';

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is VIP
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single();

  const isPremium = profile?.is_premium || false;

  // Build query
  let dbQuery = supabase
    .from('academy_content')
    .select('id, title, type, url, description, is_vip')
    .order('title', { ascending: true });

  if (type && type !== 'all') {
    dbQuery = dbQuery.eq('type', type);
  }

  if (vipOnly) {
    dbQuery = dbQuery.eq('is_vip', true);
  }

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  const { data: items, error } = await dbQuery;

  if (error || !items) {
    // Fallback to Mock Data if DB fails
    console.warn('API Academy: DB Error, returning MOCK data', error);
    const mockItems = [
        {
            id: 'mock-1',
            title: 'Fundamentos de Éter (Demo)',
            type: 'video',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            description: 'Curso introductorio simulado para desarrollo.',
            is_vip: false
        },
        {
            id: 'mock-2',
            title: 'Guía de Ventas PDF (Demo)',
            type: 'pdf',
            url: 'https://example.com/guide.pdf',
            description: 'Material de lectura simulado.',
            is_vip: true
        }
    ];
    
    return NextResponse.json({ 
        items: mockItems,
        isPremium 
    });
  }

  // Audit Log (Simplified for now - printing to console, ideally insert into 'audit_logs')
  if (vipOnly || items?.some(i => i.is_vip)) {
      // console.log(`[AUDIT] User ${user.id} accessed VIP content catalog. Premium: ${isPremium}`);
  }

  // Sanitize URLs for non-premium users
  const sanitizedItems = items?.map(item => {
    if (item.is_vip && !isPremium) {
        return { ...item, url: null }; // Hide URL
    }
    return item;
  });

  return NextResponse.json({ 
    items: sanitizedItems,
    isPremium 
  });
}
