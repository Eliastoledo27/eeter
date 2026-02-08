import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: products, error } = await supabase
    .from('productos')
    .select('id, name, stock_by_size, status');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stockMap: Record<string, unknown> = {};

  products.forEach(p => {
    let total = 0;
    if (p.stock_by_size && typeof p.stock_by_size === 'object') {
        Object.values(p.stock_by_size).forEach((qty) => {
            total += Number(qty) || 0;
        });
    }

    let status = 'in_stock';
    if (p.status !== 'activo' || total === 0) status = 'out_of_stock';
    else if (total < 5) status = 'low_stock';

    stockMap[p.id] = {
        total,
        breakdown: p.stock_by_size,
        status,
        is_active: p.status === 'activo'
    };
  });

  return NextResponse.json(stockMap, {
    headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  });
}
