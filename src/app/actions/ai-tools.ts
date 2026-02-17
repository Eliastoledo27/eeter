'use server'

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function processAITool(tool: string, input: any, apiKey?: string) {
    try {
        const finalKey = apiKey || process.env.GEMINI_API_KEY || '';

        if (!finalKey || finalKey.trim() === '') {
            return { error: '⚠️ API Key no encontrada en el sistema. Ingrésala en el banner superior.' };
        }

        const genAI = new GoogleGenerativeAI(finalKey.trim());
        // Usando gemini-2.5-flash para máxima velocidad y precisión (Feb 2026)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
            }
        });

        // Validación de entrada para evitar prompts vacíos (causa común de errores)
        const context = input.content || input.title || '';
        if (!context && tool !== 'testConnection') {
            return { error: 'Por favor, escribe al menos un título o descripción del anuncio para que la IA pueda trabajar.' };
        }

        let prompt = '';

        switch (tool) {
            case 'testConnection':
                prompt = 'Responde exclusivamente con la palabra "SISTEMA_OPERATIVO_ACTIVO" para verificar la funcionalidad.';
                break;
            case 'generateTitle':
                prompt = `Actúa como un Director Creativo de lujo para la marca ÉTER. Genera 5 títulos potentes, minimalistas y disruptivos basados en: "${context}". Solo los títulos, sin texto adicional.`;
                break;
            case 'enhanceContent':
                prompt = `Transforma este texto en una pieza de editorial de moda de lujo: "${context}". Hazlo breve, magnético y sofisticado. Idioma: Español.`;
                break;
            case 'imagePromptGenerator':
                prompt = `Professional studio lighting photography prompt for: "${input.title || context}". Aesthetic: Luxury fashion, cinematic, 8k, sharp focus. English only.`;
                break;
            case 'marketingStrategy':
                prompt = `Analiza el target psicológico y la táctica de conversión para este anuncio: "${input.title} - ${input.content}". Máximo 3 oraciones.`;
                break;
            case 'suggestTags':
                prompt = `Sugiere 2 categorías de lujo y 4 hashtags premium para: "${input.title || context}".`;
                break;
            default:
                return { error: 'Herramienta no configurada en el servidor.' };
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error('El modelo generó una respuesta vacía o bloqueada por seguridad.');

        return { text };
    } catch (error: any) {
        console.error('Gemini AI Detailed Error:', error);

        const rawMessage = error.message || 'Error desconocido del servidor de Google';

        if (rawMessage.includes('leaked')) {
            return { error: 'Error de Seguridad: Tu API Key ha sido reportada como filtrada (leaked) por Google. Por seguridad ha sido bloqueada. Por favor, genera una nueva en Google AI Studio.' };
        }
        if (rawMessage.includes('API_KEY_INVALID')) {
            return { error: 'Error: La API Key es incorrecta. Revísala en Google AI Studio.' };
        }
        if (rawMessage.includes('blockReason')) {
            return { error: 'Error: El contenido fue bloqueado por los filtros de seguridad de la IA.' };
        }
        if (rawMessage.includes('429')) {
            return { error: 'Error: Has alcanzado el límite de uso gratuito de la API.' };
        }

        return { error: `Error de Sistema: ${rawMessage}` };
    }
}
