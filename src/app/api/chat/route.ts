import { createClient } from '@supabase/supabase-js';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        let catalogContext = '';
        let fetchedProducts: any[] = [];
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            
            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const { data: products } = await supabase
                    .from('productos')
                    .select('id, name, category, price, stock_by_size, images')
                    .eq('status', 'activo');

                if (products && products.length > 0) {
                    fetchedProducts = products;
                    catalogContext = '\n\n=== CATÁLOGO ACTUAL EN STOCK ===\n';
                    catalogContext += products.map((p: any) => {
                        const sizes = Object.entries(p.stock_by_size || {})
                            .filter(([, stock]) => (stock as number) > 0)
                            .map(([size]) => size)
                            .sort((a, b) => Number(a) - Number(b));
                        return `• ID: ${p.id} | ${p.name} | $${p.price} | Talles: ${sizes.join(', ')}`;
                    }).join('\n');
                }
            }
        } catch (e) {
            console.error('[Aura] Supabase Sync Error:', e);
        }

        const SYSTEM_PROMPT = `Sos AURA, la IA asistente oficial de ÉTER. Tu identidad: profesional, callejera controlada, directa, clara, rápida y confiable. Hablás con seguridad, sin vueltas, y guiando siempre a la acción.

BASE DE CONOCIMIENTO ÉTER:
- Marca: Calzado urbano, premium y de alta rotación.
- Ubicación: Mar del Plata (principalmente) + Envíos a todo el país.
- Modelo de Reventa: NO es comisión. Es MARGEN PROPIO. Nosotros pasamos precio mayorista, el revendedor le suma lo que quiere. Esa diferencia es su ganancia.
- Proceso: Elegir modelo -> Publicar -> Consultar stock antes de cerrar -> Tomar datos -> Entregamos nosotros.
- Frase Central: "Vos vendés. Nosotros nos encargamos del resto."

REGLAS DE RESPUESTA:
1. Responde claro, rápido y sin marear.
2. Usa voseo argentino (callejero profesional).
3. NUNCA inventes stock, precios ni promesas de entrega.
4. Siempre recomendá confirmar stock antes de vender.
5. Max 2-3 oraciones. Guiá a la acción (catálogo o revender).

CATÁLOGO ACTUAL (Solo para IDs, no listes texto):
${catalogContext}`;

        const result = await generateObject({
            model: google('gemini-2.5-flash'),
            system: SYSTEM_PROMPT,
            messages,
            schema: z.object({
                message: z.string().describe('Respuesta breve de 2-3 oraciones. NUNCA incluir listas de productos, nombres ni precios en este campo. Solo texto conversacional.'),
                type: z.enum(["AURA_MESSAGE", "AURA_SELECTION"]).describe('AURA_SELECTION cuando recomiendes productos.'),
                recommendedProductIds: z.array(z.string()).max(5).optional().describe('Máximo 5 IDs de productos del catálogo. Solo los mejores matches.')
            })
        });

        const auraResponse = result.object;
        let productsPayload: any[] = [];

        if (auraResponse.type === 'AURA_SELECTION' && auraResponse.recommendedProductIds) {
            productsPayload = fetchedProducts
                .filter((p: any) => auraResponse.recommendedProductIds!.includes(p.id))
                .slice(0, 5) // Hard cap: never more than 5
                .map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: (typeof p.images === 'string' ? JSON.parse(p.images) : p.images)?.[0] || '',
                    sizes: Object.entries(p.stock_by_size || {})
                        .filter(([, stock]) => (stock as number) > 0)
                        .map(([size]) => size)
                        .sort((a, b) => Number(a) - Number(b))
                }));
        }

        return Response.json({ 
            text: auraResponse.message, 
            type: auraResponse.type,
            products: productsPayload 
        });

    } catch (error: any) {
        console.error('[Aura] Chat Error:', error);
        return Response.json({ 
            text: 'Conexión neuronal inestable. Contactá a soporte al 2236204002.',
            type: 'AURA_MESSAGE'
        }, { status: 500 });
    }
}


