'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface AuraProfile {
    occasion: string
    season: string
    brand: string
    style: string
    budget: string
    priority: string
}

export async function getPersonalizedRanking(
    viewedProductIds: string[],
    profile?: AuraProfile | null
) {
    try {
        const repository = new SupabaseProductRepository()
        const allProducts = await repository.findAll()
        const activeProducts = allProducts.filter(p => p.status === 'active')

        // If no API key or no data at all, return neutral scores
        if (!process.env.GEMINI_API_KEY) {
            return activeProducts.map(p => ({ id: p.id, score: 50 }))
        }

        // Build the user context from quiz + browsing
        const profileContext = profile
            ? `
            PERFIL DEL USUARIO (obtenido por cuestionario):
            - Ocasión de uso: ${profile.occasion}
            - Estación actual: ${profile.season}
            - Marca preferida: ${profile.brand === 'all' ? 'Sin preferencia' : profile.brand}
            - Estilo personal: ${profile.style}
            - Presupuesto: ${profile.budget}
            - Prioridad al comprar: ${profile.priority}
            `
            : 'Sin perfil disponible. Usa el historial de navegación para inferir gustos.'

        const viewedProducts = activeProducts.filter(p => viewedProductIds.includes(p.id))
        const browsingContext = viewedProducts.length > 0
            ? `Productos vistos recientemente: ${viewedProducts.map(p => `${p.name} (${p.category}, $${p.basePrice})`).join(', ')}`
            : 'Sin historial de navegación.'

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
            Eres un algoritmo de personalización de e-commerce de lujo para la tienda ÉTER (zapatillas premium importadas de Brasil).

            ${profileContext}

            ${browsingContext}

            CATÁLOGO COMPLETO:
            ${activeProducts.map(p => `- ID: ${p.id} | ${p.name} | Categoría: ${p.category} | Precio: $${p.basePrice}`).join('\n')}

            Tu tarea: Asigna a CADA producto una puntuación de relevancia del 0 al 100 basada en:
            1. Qué tanto coincide con el perfil del usuario (40% del peso)
            2. Qué tanto complementa su historial de navegación (30% del peso)
            3. Probabilidad de conversión basada en precio y categoría (30% del peso)

            REGLAS IMPORTANTES:
            - Los productos que coinciden EXACTAMENTE con la marca preferida reciben un boost de +15 puntos
            - Si el presupuesto es "low", penaliza productos > $80000; si es "mid", penaliza > $150000
            - Si la ocasión es "deporte", prioriza Running y Performance
            - Si el estilo es "retro", prioriza modelos clásicos

            Responde ÚNICAMENTE con un JSON plano: {"id1": score, "id2": score, ...}
            Sin explicaciones, sin markdown, solo JSON puro.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const scores = JSON.parse(cleanedText)

        return activeProducts.map(p => ({
            id: p.id,
            score: Math.min(100, Math.max(0, scores[p.id] || 50))
        }))
    } catch (error) {
        console.error('[AURA] Personalization error:', error)
        // Fallback: return moderate scores so sorting still works
        return []
    }
}
