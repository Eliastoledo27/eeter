import { GoogleGenerativeAI } from '@google/generative-ai';

// Delay helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 15000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many Requests');
      if (!isRateLimit || attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt); // 15s, 30s, 60s
      console.log(`Rate limited. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
      await sleep(delay);
    }
  }
  throw new Error('Max retries exceeded');
}

export async function POST(req: Request) {
  try {
    const { products, apiKey: clientApiKey } = await req.json();

    const apiKey = clientApiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Falta la API Key de Gemini' }), { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    console.log(`Usando API Key (termina en): ${apiKey.slice(-4)}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Process products SEQUENTIALLY with delay to avoid rate limits (free tier: 5 req/min)
    const optimizedProducts = [];
    const DELAY_BETWEEN_REQUESTS = 13000; // 13 seconds between each = ~4.6 req/min (safe under 5/min)

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      console.log(`[${i + 1}/${products.length}] Generating description for: ${product.name}`);

      const tallesDisponibles = product.stock_by_size 
        ? Object.entries(product.stock_by_size).filter(([_, qty]) => (qty as number) > 0).map(([size, _]) => size).join(', ')
        : (product.stock > 0 ? "Stock disponible" : "Consultar stock");

      const prompt = `
        Sos un Curador de Contenido Premium y Copywriter de Élite para "ÉTER". 
        Tu objetivo es transformar la información técnica en una descripción DIGNA, ESTÉTICA y de ALTO NIVEL para una boutique de zapatillas exclusiva.
        
        ---
        DATOS TÉCNICOS:
        - MODELO: ${product.name}
        - CATEGORÍA: ${product.category || 'Footwear'}
        - PRECIO: $${product.price ? product.price.toLocaleString('es-AR') : 'Consultar'}
        - DISPONIBILIDAD: Talles ${tallesDisponibles}
        ---

        INSTRUCCIONES DE ESTILO (ESTÉTICA ÉTER):
        1. ESTRUCTURA LIMPIA Y ESPACIADA: Usá mayúsculas para títulos de sección sutiles. Evitá párrafos largos; preferí bloques de texto cortos y con aire.
        2. TONO: Sofisticado, minimalista, experto. Hablá como si estuvieras presentando una pieza de colección en una galería de arte moderno.
        3. CONTENIDO:
           - INTRODUCCIÓN (GOLPE DE VISTA): Una frase minimalista que defina el carácter del modelo.
           - ADN DEL MODELO (ANÁLISIS): Investigá y explicá brevemente la esencia técnica o histórica del modelo (ej: orígenes en el running de los 2000, tecnología de materiales). Sé preciso y profesional.
           - CURADURÍA TÉCNICA: Usá una lista minimalista (puntos o guiones cortos) para destacar 3 especificaciones clave de diseño o confort.
           - CIERRE (STATUS): Una mención elegante a la inversión, los talles disponibles y el precio.
        4. PROHIBICIONES:
           - Prohibido usar "🔥", "🚀", o emojis vulgares. La estética debe ser sobria (blanco y negro mental).
           - Prohibido el lenguaje de "vendedor de oferta". Buscamos deseo, no desesperación.

        EJEMPLO DE FORMATO ESPERADO:
        [NOMBRE DEL MODELO EN MAYÚSCULAS]
        [Frase de impacto minimalista]

        [Párrafo de análisis técnico/histórico breve]

        DETALLES DE CONSTRUCCIÓN:
        • [Punto 1]
        • [Punto 2]
        • [Punto 3]

        [Talles / Inversión / CTA elegante]

        Devolvé ÚNICAMENTE el texto final optimizado.
      `;

      try {
        const result = await withRetry(async () => {
          return await model.generateContent(prompt);
        });
        
        const response = result.response;
        const text = response.text();

        optimizedProducts.push({
          id: product.id,
          description: text.trim(),
        });

        console.log(`[${i + 1}/${products.length}] ✓ Done: ${product.name}`);
      } catch (innerError: any) {
        console.error(`[${i + 1}/${products.length}] ✗ Failed: ${product.name}:`, innerError.message);
        // Don't fail the whole batch — return a fallback for this product
        optimizedProducts.push({
          id: product.id,
          description: product.description || `Descripción no disponible (error: ${innerError.message?.substring(0, 50)})`,
          error: true,
        });
      }

      // Wait between requests (except after the last one)
      if (i < products.length - 1) {
        console.log(`Waiting ${DELAY_BETWEEN_REQUESTS / 1000}s before next request...`);
        await sleep(DELAY_BETWEEN_REQUESTS);
      }
    }

    const successCount = optimizedProducts.filter((p: any) => !p.error).length;
    console.log(`Batch complete: ${successCount}/${products.length} successful`);

    return new Response(JSON.stringify({ products: optimizedProducts }), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('AI Optimization Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
