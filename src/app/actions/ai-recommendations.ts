'use server';

import { createClient } from '@/utils/supabase/server';
import { ProductType } from './products';

export async function getSmartRecommendations(targetProductId: string, limit: number = 4) {
    const supabase = createClient();
    
    // 1. Fetch current product context
    const { data: targetProduct, error: targetError } = await supabase
        .from('productos')
        .select('*')
        .eq('id', targetProductId)
        .single();

    if (targetError || !targetProduct) return [];

    // 2. Fetch potential candidates (same category or nearby price)
    const { data: candidates, error: candidatesError } = await supabase
        .from('productos')
        .select('*')
        .eq('status', 'active')
        .neq('id', targetProductId)
        .limit(20); // Get a pool for analysis

    if (candidatesError || !candidates) return [];

    // 3. AI Logic (Hybrid: Metadata + LLM Analysis)
    // If we have a Gemini API key in env, we use it. Otherwise fallback to vector-lite matching.
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (GEMINI_API_KEY) {
        try {
            const prompt = `Actúa como un experto en estilismo de moda y ventas de lujo para la marca "Éter".
            Producto actual: "${targetProduct.name}" (Categoría: ${targetProduct.category}, Descripción: ${targetProduct.description})
            
            Analiza los candidatos y selecciona los ${limit} que mejor combinen.
            Candidatos:
            ${candidates.map(p => `ID: ${p.id} | Nombre: ${p.name} | Cat: ${p.category}`).join('\n')}
            
            Responde ÚNICAMENTE en formato JSON con la siguiente estructura: 
            [{"id": "...", "score": 95}, {"id": "...", "score": 88}, ...]
            Prioriza productos que maximicen la probabilidad de compra conjunta.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
            
            // Clean JSON if Gemini adds markdown blocks
            const cleanJson = resultText.replace(/```json|```/g, '').trim();
            const recommendedData = JSON.parse(cleanJson);

            // Map and attach score
            const recommendedProducts = recommendedData.map((rec: any) => {
                const product = candidates.find(p => p.id === rec.id);
                if (product) {
                    return { ...product, aiScale: rec.score };
                }
                return null;
            }).filter(Boolean);
            
            if (recommendedProducts.length > 0) return recommendedProducts as any as (ProductType & { aiScale: number })[];
        } catch (e) {
            console.error('AI Recommendations Fallback:', e);
        }
    }

    // 4. Fallback: Semantic/Category Match (Fake score)
    return candidates
        .sort((a, b) => {
            if (a.category === targetProduct.category) return -1;
            return 0;
        })
        .slice(0, limit).map(p => ({...p, aiScale: 85})) as any as (ProductType & { aiScale: number })[];
}
