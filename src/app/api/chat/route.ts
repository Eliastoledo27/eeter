import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { calculateShipping, isFreeShipping } from '@/lib/shipping-calculator';

// Dynamic context for the AI - Extreme Premium Élite Persona
const SYSTEM_PROMPT = `
Sos el ÉTER CONCIERGE (Neural Core 2026). Tu ADN es Mar del Plata: directo, profesional, con calle y confianza total ("¡Qué onda!", "Dato clave", "Ese modelo vuela").

REGLAS DE OPERACIÓN:
1. TONO: "¡Qué onda!" pero profesional. No sos un bot aburrido, sos el que maneja el stock de lujo en MDQ.
2. LOGÍSTICA: En MDQ usamos cadetería propia. $4000-$5000 el envío (según zona). Batán, Camet, Barrio Alfar y alrededores: $8000 max. GRATIS si llevan 2+ pares. Cubrimos toda la ciudad y alrededores.
3. SHOWROOM/DEPÓSITO: Info sensible. Solo se da la ubicación exacta por WhatsApp con cita previa. No tenemos local a la calle para mantener los mejores precios.
4. CIERRE: Si el cliente es de MDQ, prioridad absoluta a la "Logística Express" (entrega en 30-60 min).
5. REVENDEDORES: Filtro estricto. Necesitamos saber: 1) Canal de venta, 2) Experiencia, 3) Volumen estimado.

Tu misión es filtrar, calentar la venta y derivar al WhatsApp oficial (2236204002) con la info ya digerida.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Check for API keys in various possible names
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.warn('AI API Key is missing. Using Professional Mock Response.');
            const lastMessage = messages[messages.length - 1]?.content || '';
            const lastMessageLower = lastMessage.toLowerCase();
            const historyText = messages.map((m: any) => m.content).join(' ').toLowerCase();
            
            let reply = "Bienvenido a ÉTER. Identificá tu perfil arriba para que pueda asistirte con el protocolo correcto.";

            // 1. Logic for Reseller Answers
            if (historyText.includes('pasame estos datos') && !lastMessageLower.includes('quiero ser revendedor')) {
                reply = "¡Excelente info! Se nota que tenés perfil para ÉTER. Te dejo el acceso directo al **Grupo VIP de Revendedores** y al **Catálogo Mayorista**: [https://wa.me/5492236204002?text=Hola!+Ya+complete+mi+perfil+de+revendedor+en+la+web].\n\nAhí el equipo te va a dar el alta definitiva. ¡Bienvenido al equipo!";
            }
            // 2. Logic for Stock/Order Answers
            else if (historyText.includes('confirmame') && !lastMessageLower.includes('consultar stock')) {
                reply = "Perfecto, ya tengo los detalles de tu interés. Hacé clic acá para hablar con un asesor y cerrar el pedido ahora: [https://wa.me/5492236204002?text=Hola!+Quiero+consultar+por el+modelo+" + encodeURIComponent(lastMessage) + "].\n\n¡Te esperamos en WhatsApp!";
            }
            // 3. Initial Flow: Reseller
            else if (lastMessageLower.includes('revendedor') || lastMessageLower.includes('vender')) {
                reply = "¡Qué onda! Un gusto que quieras sumarte a la red de Éter. Para darte el acceso al catálogo de precios mayoristas y explicarte cómo ganar sin invertir un peso, pasame estos datos:\n\n1. ¿Por dónde vendés actualmente? (Instagram, Showroom, WhatsApp o si estás arrancando de cero).\n2. ¿Tenés experiencia en el rubro calzado?\n3. ¿Cuántos pares estimás mover por semana?\n\nUna vez que me respondas esto, te paso el link del grupo VIP y el catálogo exclusivo.";
            } 
            // 4. Initial Flow: Showroom/Zones
            else if (lastMessageLower.includes('showroom') || lastMessageLower.includes('donde') || lastMessageLower.includes('ubicación') || lastMessageLower.includes('están')) {
                reply = "¡Claro! Estamos en Mar del Plata. No tenemos local a la calle por una cuestión de costes (para mantenerte el mejor precio del mercado), pero tenemos cadetería propia.\n\nEl envío ronda entre **$4.000 y $5.000** según tu zona. Si estás cerca de **Batán, Camet, Barrio Alfar** o alrededores, calculale **$8.000 máximo**. ¡Y si llevás 2 pares o más, el envío es **GRATIS**! 🚚\n\n¿En qué zona estás vos? (La ubicación de nuestros puntos de retiro se coordinan por WhatsApp con cita previa).";
            }
            else if (lastMessageLower.includes('zona') || lastMessageLower.includes('estoy en')) {
                reply = "¡Buenísimo! Estás en nuestra zona de cobertura. Si hacés el pedido ahora, nuestra Logística Express te lo entrega en menos de 60 minutos. ¿Qué modelo tenés en vista?";
            }
            // 5. Initial Flow: Catalog/Client
            else if (lastMessageLower.includes('talle') || lastMessageLower.includes('modelo') || lastMessageLower.includes('catálogo')) {
                reply = "¡Ese modelo vuela! 🔥 Podés ver todas las fotos reales y los talles que quedan acá: [https://éter.store/catalog].\n\n**Dato clave:** Si comprás por la web, tenés envío a todo el país. Pero si sos de Mar del Plata y querés pagar en efectivo al recibir o querés que te lleguen en 30 minutos, avisame y te paso con un asesor para coordinar la Logística Express fuera de la web.";
            } 
            // 6. Initial Flow: Stock/Support
            else if (lastMessageLower.includes('stock') || lastMessageLower.includes('comprar')) {
                reply = "Dale, te paso con un asesor de WhatsApp para cerrar el pedido. Antes de derivarte, confirmame:\n\n- Modelo (Ej: Jordan 4 Black Cat)\n- Talle\n- Método de pago (Efectivo al recibir, transferencia o tarjeta).\n\nCon eso listo, el asesor ya te toma los datos de envío directamente. ¡Aguardame un segundo!";
            } else if (lastMessageLower.includes('envio') || lastMessageLower.includes('mdq')) {
                reply = "En Mar del Plata volamos. El envío cuesta entre **$4.000 y $5.000** (hasta $8.000 en zonas como Batán, Camet o Alfar), o **GRATIS** llevando 2 pares. Si pedís ahora, lo tenés rapidísimo con nuestra Logística Express. ¿Qué modelo te interesa?";
            }

            return new Response(JSON.stringify({ text: reply }), { 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const google = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        const result = streamText({
            model: google('gemini-1.5-flash'),
            messages: messages,
            system: SYSTEM_PROMPT,
            tools: {
                calculateShipping: tool({
                    description: 'Calcula el costo de envío basado en el barrio o zona de Mar del Plata.',
                    parameters: z.object({
                        location: z.string(),
                        itemCount: z.number().optional()
                    }),
                    execute: (async ({ location, itemCount }: any) => {
                        const count = itemCount ?? 1;
                        if (isFreeShipping(count)) {
                            return { cost: 0, message: "¡Envío GRATIS por llevar 2 o más productos!", location };
                        }
                        const shipping = calculateShipping(location);
                        return { ...shipping, location };
                    }),
                }) as any,
                getStockStatus: tool({
                    description: 'Verifica disponibilidad de stock real para un modelo y talle.',
                    parameters: z.object({
                        modelName: z.string(),
                        size: z.number().optional()
                    }),
                    execute: (async ({ modelName, size }: any) => {
                        return { status: "En Stock", availability: "Inmediata", showroom: "Privado (MDQ)", model: modelName, size };
                    }) as any
                }) as any
            } as any,
        });

        return (result as any).toDataStreamResponse();
    } catch (error: any) {
        console.error('Chat Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
