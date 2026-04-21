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

        const SYSTEM_PROMPT = `Sos ÉTER AURA, la solución a tus problemas de los clientes en ÉTER Store. Magnética, profesional, experta en streetwear y resolutiva. Tu misión es cambiarle el día a los clientes con una atención de élite. Usá voseo rioplatense (argentino).

REGLAS ABSOLUTAS DE RESPUESTA:
1. MÁXIMO 2-3 oraciones cortas. Sé concisa y resolutiva.
2. NUNCA listes productos en el texto. NUNCA escribas nombres, precios ni talles en tu mensaje.
3. Cuando recomiendes productos, decilo como: "Mirá esta selección que armé para vos..." o "Encontré estos modelos que te van a cambiar el día..." y usá recommendedProductIds. Los productos se muestran VISUALMENTE en un carrusel.
4. Recomendá MÁXIMO 4-5 productos por respuesta. Elegí los MEJORES matches.
5. Si el cliente pregunta algo genérico, seleccioná lo más icónico. No muestres todo el stock.

KNOWLEDGE:
- Calidad G5/OG (Idénticos al original).
- 10% OFF vía Transferencia.
- Los talles son estándar habitual.
- WhatsApp: 2236204002.

CATÁLOGO DISPONIBLE (usalo para elegir IDs, NUNCA para copiar/pegar en texto):
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


