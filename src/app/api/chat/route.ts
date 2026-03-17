import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { calculateShipping, isFreeShipping } from '@/lib/shipping-calculator';

// Dynamic context for the AI
const SYSTEM_PROMPT = `
Sos el Concierge de Éter Store (Mar del Plata). Tu misión es ser un guía de lujo para la plataforma.
ADN de Marca: Honestidad absoluta (transparencia total), sofisticación, tono directo marplatense ("sin verso").

Lógica de Comportamiento:
1. Siempre preguntá si buscan un par para ellos o si quieren sumarse como revendedores.
2. Si mencionan Mar del Plata o zonas cercanas, usá la herramienta 'calculateShipping'.
3. Explicá que Éter prioriza durabilidad y materiales de alta calidad (calzado brasilero selección) sobre la simple etiqueta de marca.
4. Si compran 2 o más productos, el envío es GRATIS en Mar del Plata.

IMPORTANTE: No menciones temas espirituales ni religiosos. Enfoque técnico y estético. 2.0 Gold Edition.
`;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Check for API keys in various possible names
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({
                error: 'AI API Key is missing. Please set GOOGLE_API_KEY in .env'
            }), { status: 500 });
        }

        const result = streamText({
            model: google('gemini-1.5-flash', {
                apiKey: apiKey
            }),
            messages: messages,
            system: SYSTEM_PROMPT,
            tools: {
                calculateShipping: tool({
                    description: 'Calcula el costo de envío basado en el barrio o zona de Mar del Plata.',
                    parameters: z.object({
                        location: z.string().describe('El barrio o zona mencionada por el usuario (ej: La Perla, Batán)'),
                        itemCount: z.number().optional().describe('Cantidad de productos en el carrito')
                    }),
                    execute: async ({ location, itemCount }: { location: string; itemCount?: number }) => {
                        const count = itemCount ?? 1;
                        if (isFreeShipping(count)) {
                            return { cost: 0, message: "¡Envío GRATIS por llevar 2 o más productos!", location };
                        }
                        const shipping = calculateShipping(location);
                        return { ...shipping, location };
                    },
                }),
                getStockStatus: tool({
                    description: 'Verifica disponibilidad de stock real para un modelo y talle.',
                    parameters: z.object({
                        modelName: z.string(),
                        size: z.number().optional()
                    }),
                    execute: async ({ modelName, size }: { modelName: string; size?: number }) => {
                        return { status: "En Stock", availability: "Inmediata", showroom: "Neuquén 700", model: modelName };
                    }
                })
            },
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error('Chat Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
