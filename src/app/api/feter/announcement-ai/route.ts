import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

type AnnouncementAiRequest = {
  templateKey?: string;
  productName?: string;
  brand?: string;
  category?: string;
  price?: number;
  stock?: number;
  targetPages?: string[];
  tone?: string;
};

function fallbackCopy(input: AnnouncementAiRequest) {
  const productName = input.productName || 'modelos seleccionados';
  const price = typeof input.price === 'number' ? ` desde $${Math.round(input.price).toLocaleString('es-AR')}` : '';
  const scarce = typeof input.stock === 'number' && input.stock <= 5 ? ' Ultimas unidades.' : ' Stock actualizado.';

  return {
    title: `${input.templateKey === 'flash' ? 'HOY' : 'DROP'}: ${productName}`.toUpperCase(),
    content: `Producto destacado${price}.${scarce} Consulta directa, imagen premium y compra rapida desde el catalogo.`,
    category: (input.brand || input.category || 'ETER').toUpperCase(),
    ctaLabel: input.templateKey === 'stock' ? 'REVISAR TALLE' : 'VER PRODUCTO',
    priority: input.templateKey === 'flash' ? 35 : 20,
    displayMode: input.templateKey === 'community' ? 'banner' : input.templateKey === 'flash' ? 'modal' : 'floating',
  };
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as AnnouncementAiRequest;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ ...fallbackCopy(input), source: 'fallback' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.86,
        topP: 0.92,
        maxOutputTokens: 420,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
Actua como director creativo de ETER Store, marca de moda urbana premium.
Genera copy de alto impacto para un anuncio mobile/web. Debe ser breve, elegante, directo y vender sin saturar.

Datos:
- plantilla: ${input.templateKey || 'drop'}
- producto: ${input.productName || 'sin producto especifico'}
- marca: ${input.brand || 'ETER'}
- categoria: ${input.category || 'sneakers'}
- precio: ${typeof input.price === 'number' ? input.price : 'sin precio'}
- stock: ${typeof input.stock === 'number' ? input.stock : 'sin stock'}
- paginas destino: ${(input.targetPages || ['catalog']).join(', ')}
- tono visual: ${input.tone || 'luxury dark, neon cyan, premium'}

Devuelve solo JSON valido con:
{
  "title": "maximo 42 caracteres, uppercase",
  "content": "maximo 145 caracteres",
  "category": "maximo 14 caracteres",
  "ctaLabel": "maximo 18 caracteres",
  "priority": numero entre 1 y 40,
  "displayMode": "floating" | "banner" | "modal"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json({
      title: String(parsed.title || fallbackCopy(input).title).slice(0, 60),
      content: String(parsed.content || fallbackCopy(input).content).slice(0, 180),
      category: String(parsed.category || fallbackCopy(input).category).slice(0, 18),
      ctaLabel: String(parsed.ctaLabel || fallbackCopy(input).ctaLabel).slice(0, 24),
      priority: Number(parsed.priority || fallbackCopy(input).priority),
      displayMode: ['floating', 'banner', 'modal'].includes(parsed.displayMode) ? parsed.displayMode : fallbackCopy(input).displayMode,
      source: 'gemini',
    });
  } catch (error) {
    console.error('Announcement AI error:', error);
    return NextResponse.json({ error: 'No se pudo generar el anuncio con IA.' }, { status: 500 });
  }
}
