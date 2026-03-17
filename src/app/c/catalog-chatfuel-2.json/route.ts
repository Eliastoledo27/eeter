import { NextResponse } from 'next/server';
import { getChatfuelCatalog } from '@/lib/chatfuel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const catalog = await getChatfuelCatalog(2, 30);
        return new NextResponse(JSON.stringify(catalog), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });
    } catch (error: any) {
        console.error('API Catalog Error:', error);
        return new NextResponse(JSON.stringify([]), {
            status: 500,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
    }
}
