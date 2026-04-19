import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SYSTEM_PROMPT = `Sos ÉTER AI, el asesor personal de calzado de ÉTER Store — la marca de zapatillas premium de Mar del Plata, Argentina. Tu misión es ayudar a los clientes a encontrar el par perfecto según sus gustos, necesidades y presupuesto.

PERSONALIDAD:
- Sos entusiasta, cercano y directo, con onda marplatense ("¡Qué onda!", "Ese modelo vuela 🔥", "Buenísima elección 💎")
- Hablás en español argentino rioplatense (vos, tenés, querés, etc.)
- Sos un experto en sneakers y calzado: sabés de materiales, estilos, tendencias
- Usás emojis con moderación para dar onda, no para saturar
- Tus respuestas son CONCISAS: máximo 3-4 oraciones por mensaje, nunca parrafones largos

REGLAS DE OPERACIÓN:
1. SIEMPRE recomendá basándote en el catálogo real que tenés disponible. Si un producto no está en stock, no lo recomiendes.
2. Hacé preguntas clave para filtrar: ¿Para qué ocasión? ¿Estilo? ¿Presupuesto? ¿Deporte o casual?
3. Cuando recomiendes un producto, mencioná el nombre, precio, talles disponibles y categoría.
4. Si el cliente pregunta por envíos en MDQ: cadetería propia, $4000-$5000 (zonas lejanas $8000), GRATIS con 2+ pares, Logística Express en 30-60 min.
5. Si quiere verlo en persona: no hay local a la calle, se coordina por WhatsApp (2236204002) con cita previa.
6. Si necesita ayuda extra o quiere cerrar compra: derivá a WhatsApp 2236204002.
7. NUNCA inventes productos que NO están en el catálogo que te damos.
8. Calidad: origen brasilero, super premium, sello ÉTER CERTIFIED.
9. Formas de pago: Mercado Pago (3 cuotas sin interés), transferencia bancaria (Naranja, alias eterstore/etershop), efectivo en MDQ.

FLUJO DE RECOMENDACIÓN:
- Pregunta 1: ¿Qué tipo de calzado buscás? (zapatillas, ojotas, botas, botines, etc.)
- Pregunta 2: ¿Para qué ocasión? (día a día, salir, deporte, trabajo)
- Pregunta 3: ¿Qué talle usás?
- Pregunta 4: ¿Tenés un presupuesto en mente?
→ Con esas respuestas, recomendá 1-3 productos del catálogo real.

FORMATO DE RECOMENDACIÓN:
Cuando recomiendes un producto usá este formato:
🔥 **[NOMBRE]** — $[PRECIO]
Talles: [TALLES DISPONIBLES]
[1 frase corta de por qué le va]`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyB_bH7VwEOxBf0s--nI3A5pt1iFXqLGL2c';

        // Fetch real catalog from Supabase
        let catalogContext = '';
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            
            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey);
                const { data: products } = await supabase
                    .from('productos')
                    .select('name, category, price, stock_by_size')
                    .eq('status', 'activo');

                if (products && products.length > 0) {
                    catalogContext = '\n\nCATÁLOGO ACTUAL EN STOCK (esto es lo ÚNICO que podés recomendar):\n';
                    catalogContext += products.map((p: any) => {
                        const sizes = Object.entries(p.stock_by_size || {})
                            .filter(([, stock]) => (stock as number) > 0)
                            .map(([size]) => size)
                            .sort((a, b) => Number(a) - Number(b));
                        return `• ${p.name} | ${p.category || 'General'} | $${p.price.toLocaleString('es-AR')} | Talles: ${sizes.length > 0 ? sizes.join(', ') : 'SIN STOCK'}`;
                    }).join('\n');
                }
            }
        } catch (e) {
            console.error('[AI Chat] Error fetching catalog:', e);
        }

        const fullSystemPrompt = SYSTEM_PROMPT + catalogContext;

        // If no API key, use smart mock responses
        if (!apiKey) {
            const lastMessage = (messages[messages.length - 1]?.content || '').toLowerCase();

            let reply = '¡Hola! 👋 Soy tu asesor personal ÉTER. Contame, ¿qué tipo de calzado estás buscando? Puedo recomendarte el par perfecto según tu estilo 🔥';

            if (lastMessage.includes('zapatilla') || lastMessage.includes('sneaker') || lastMessage.includes('zapas')) {
                reply = '¡Buena elección! Tenemos varios modelos increíbles en stock 🔥 ¿Buscás algo más deportivo para el día a día o algo más elegante para salir? Y contame, ¿qué talle usás?';
            } else if (lastMessage.includes('ojota') || lastMessage.includes('sandalia')) {
                reply = '¡Las ojotas son un must! Ideales para el verano marplatense 🏖️ ¿Las querés para la playa o algo más urbano? ¿Qué talle usás?';
            } else if (lastMessage.includes('talle') || lastMessage.includes('número')) {
                reply = 'Perfecto, ese talle lo tenemos en varios modelos. ¿Tenés un presupuesto en mente? Así te muestro lo mejor para vos 💎';
            } else if (lastMessage.includes('envío') || lastMessage.includes('envio') || lastMessage.includes('llega')) {
                reply = '¡En MDQ volamos! 🚀 Envío por cadetería propia: $4.000-$5.000 (zonas lejanas $8.000). GRATIS si llevás 2+ pares. Logística Express: te llega en 30-60 min. ¿Querés coordinar?';
            } else if (lastMessage.includes('pagar') || lastMessage.includes('cuotas') || lastMessage.includes('transferencia')) {
                reply = 'Tenés varias opciones 💳: Mercado Pago (hasta 3 cuotas sin interés), transferencia bancaria a Naranja (alias: eterstore), o efectivo contra entrega en MDQ. ¿Cuál te queda mejor?';
            } else if (lastMessage.includes('revendedor') || lastMessage.includes('revender') || lastMessage.includes('mayorista')) {
                reply = '¡Genial que quieras sumarte! 💰 Nuestros revendedores ganan entre 30%-50% de margen. Escribinos por WhatsApp al 2236204002 y te pasamos el catálogo mayorista + acceso al grupo VIP.';
            } else if (lastMessage.includes('hola') || lastMessage.includes('buenas') || lastMessage.includes('buen dia')) {
                reply = '¡Qué onda! 👋 Bienvenido/a a ÉTER. Soy tu asesor personal de calzado. Contame, ¿qué estás buscando? Te ayudo a encontrar el par perfecto para vos 🔥';
            }

            return NextResponse.json({ text: reply });
        }

        // Real Gemini AI integration
        // Gemini API requiere que el primer mensaje sea del usuario, así que filtramos el saludo inicial
        let mappedMessages = messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const firstUserIndex = mappedMessages.findIndex((m: any) => m.role === 'user');
        mappedMessages = firstUserIndex >= 0 ? mappedMessages.slice(firstUserIndex) : mappedMessages;

        // Gemini requiere roles intercalados correctamente. Consolidamos mensajes consecutivos del mismo rol.
        const geminiMessages: any[] = [];
        for (const m of mappedMessages) {
            if (geminiMessages.length > 0 && geminiMessages[geminiMessages.length - 1].role === m.role) {
                geminiMessages[geminiMessages.length - 1].parts[0].text += '\n\n' + m.parts[0].text;
            } else {
                geminiMessages.push(m);
            }
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: geminiMessages,
                    systemInstruction: { parts: [{ text: fullSystemPrompt }] },
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 300,
                        topP: 0.9,
                    }
                })
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('[Gemini] API Error:', response.status, errorBody);
            // Si hay un error, intentamos hacer un mock fallback
            return NextResponse.json({ text: '¡Uh! Hubo un error técnico. Escribinos por WhatsApp al 2236204002 💬 y te atendemos al instante.' });
        }

        const data = await response.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta. ¿Podés reformular tu pregunta?';

        return NextResponse.json({ text: aiText });

    } catch (error: any) {
        console.error('[Chat API] Error:', error);
        return NextResponse.json({ text: 'Error de conexión. Intentá de nuevo o contactanos por WhatsApp al 2236204002 📱' });
    }
}
