'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateProductDescription(name: string, category: string, price: number) {
  if (!genAI) {
    console.error('GOOGLE_API_KEY is missing');
    return {
      success: false,
      error: 'API Key de IA no configurada. Por favor agrega GOOGLE_API_KEY a tu archivo .env'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Actúa como un experto redactor de productos para e-commerce y un investigador de mercado.
      
      Tarea: Generar una descripción profesional, realista y atractiva para el siguiente producto.
      
      Datos del producto:
      - Nombre: "${name}"
      - Categoría: "${category}"
      - Precio: $${price}
      
      Instrucciones:
      1. ANÁLISIS REAL: Si el nombre del producto corresponde a un producto real y conocido (por ejemplo, una marca famosa o modelo específico), utiliza tu conocimiento interno para incluir detalles técnicos reales, materiales y beneficios específicos de ese modelo.
      2. Si es un producto genérico, crea una descripción verosímil y de alta calidad basada en los estándares de la industria para esa categoría.
      3. TONO: Profesional, persuasivo y confiable. Evita el lenguaje excesivamente publicitario o "spammy".
      4. FORMATO: Un párrafo conciso de 3 a 5 oraciones.
      
      Solo devuelve el texto de la descripción.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { success: true, text: text.trim() };
  } catch {
    // console.error('Error generating description:', error);
    return {
      success: false,
      error: 'Error al conectar con el servicio de IA. Intenta nuevamente.'
    };
  }
}

export async function generateDashboardInsights(metrics: { label: string; value: number; target: number }[]) {
  if (!genAI) {
    return { success: false, error: 'API Key no configurada' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const metricsStr = metrics.map(m => `- ${m.label}: ${m.value} (Objetivo: ${m.target})`).join('\n');

    const prompt = `
      Actúa como un analista de negocios inteligente para un e-commerce llamado "Éter Store".
      Analiza las siguientes métricas de rendimiento actuales y proporciona 3 insights clave, procesables y breves (tipo "bullet points").
      
      Métricas:
      ${metricsStr}
      
      Reglas:
      1. Sé extremadamente breve y directo.
      2. Enfócate en qué mejorar o qué está yendo bien.
      3. No uses introducciones ni conclusiones.
      4. Usa un tono de mentor de negocios premium.
      
      Formato esperado:
      • [Insight 1]
      • [Insight 2]
      • [Insight 3]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { success: true, text: text.trim() };
  } catch {
    return { success: false, error: 'Error al generar insights' };
  }
}
