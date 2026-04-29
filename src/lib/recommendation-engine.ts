import { Product } from '@/domain/entities/Product'

export interface RecommendationProfile {
  occasion?: string
  season?: string
  brand?: string
  style?: string
  budget?: string
  priority?: string
  ageRange?: string
  region?: string
}

export interface SegmentPopularity {
  byProductId: Record<string, number>
  byBrand: Record<string, number>
  byCategory: Record<string, number>
}

export interface RecommendationContext {
  viewedIds: string[]
  purchasedIds: string[]
  sessionServedIds: string[]
  exposureByProduct: Record<string, number>
  profile?: RecommendationProfile | null
  seed: string
  variant: 'control' | 'personalized_diverse'
  segmentPopularity?: SegmentPopularity
  now?: Date
}

interface ScoredProduct {
  product: Product
  score: number
}

const OCCASION_CATEGORY_BOOST: Record<string, string[]> = {
  casual: ['sneakers', 'casual', 'urban'],
  salidas: ['sneakers', 'luxury', 'streetwear'],
  deporte: ['running', 'performance', 'sport'],
  streetwear: ['sneakers', 'streetwear', 'casual'],
}

const STYLE_KEYWORDS: Record<string, string[]> = {
  minimal: ['minimal', 'clean', 'white', 'mono', 'neutral'],
  bold: ['bold', 'neon', 'vibrant', 'color', 'statement'],
  retro: ['retro', 'classic', 'vintage', 'og', 'heritage'],
  urban: ['urban', 'street', 'black', 'dark', 'cargo'],
}

const AGE_STYLE_WEIGHTS: Record<string, string[]> = {
  '18-24': ['streetwear', 'sneakers', 'bold'],
  '25-34': ['casual', 'sneakers', 'minimal'],
  '35-44': ['minimal', 'retro', 'premium'],
  '45+': ['classic', 'comfort', 'retro'],
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num))
}

function hashToUnit(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return Math.abs(h >>> 0) / 4294967295
}

function normalize(value: string | undefined | null) {
  return (value || '').toLowerCase().trim()
}

function priceBucket(price: number) {
  if (price < 90000) return 'low'
  if (price < 160000) return 'mid'
  return 'high'
}

function productText(product: Product) {
  return `${product.name} ${product.description} ${product.brand} ${product.category}`.toLowerCase()
}

function similarity(a: Product, b: Product) {
  let sim = 0
  if (normalize(a.category) === normalize(b.category)) sim += 0.45
  if (normalize(a.brand) === normalize(b.brand)) sim += 0.35
  if (priceBucket(a.basePrice) === priceBucket(b.basePrice)) sim += 0.2
  return sim
}

function buildAffinityMap(products: Product[], ids: string[], weight = 1) {
  const byCategory: Record<string, number> = {}
  const byBrand: Record<string, number> = {}

  for (const id of ids) {
    const product = products.find((p) => p.id === id)
    if (!product) continue

    const category = normalize(product.category)
    const brand = normalize(product.brand)
    byCategory[category] = (byCategory[category] || 0) + weight
    byBrand[brand] = (byBrand[brand] || 0) + weight
  }

  return { byCategory, byBrand }
}

function temporalRelevance(product: Product, now: Date) {
  const days = (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  return 15 * Math.exp(-Math.max(days, 0) / 120)
}

function declaredPreferenceScore(product: Product, profile?: RecommendationProfile | null) {
  if (!profile) return 0

  const text = productText(product)
  const category = normalize(product.category)
  const brand = normalize(product.brand)
  const season = normalize(profile.season)
  let score = 0

  if (profile.brand && normalize(profile.brand) !== 'all' && brand === normalize(profile.brand)) score += 18

  const desiredCategories = OCCASION_CATEGORY_BOOST[normalize(profile.occasion)] || []
  if (desiredCategories.some((c) => category.includes(c))) score += 12

  const styleKeywords = STYLE_KEYWORDS[normalize(profile.style)] || []
  if (styleKeywords.some((k) => text.includes(k))) score += 10

  if (season === 'summer' && (text.includes('light') || text.includes('mesh'))) score += 5
  if (season === 'winter' && (text.includes('leather') || text.includes('boot'))) score += 5

  const budget = normalize(profile.budget)
  if (budget === 'low' && product.basePrice <= 90000) score += 8
  if (budget === 'mid' && product.basePrice > 90000 && product.basePrice <= 160000) score += 8
  if (budget === 'high' && product.basePrice > 160000) score += 8
  if (budget === 'unlimited') score += 4

  const priority = normalize(profile.priority)
  if (priority === 'price' && product.basePrice < 110000) score += 8
  if (priority === 'exclusivity' && product.basePrice > 150000) score += 10
  if (priority === 'design' && (text.includes('limited') || text.includes('premium'))) score += 8
  if (priority === 'comfort' && (text.includes('running') || text.includes('comfort'))) score += 8

  const ageStyles = AGE_STYLE_WEIGHTS[profile.ageRange || ''] || []
  if (ageStyles.some((k) => text.includes(k))) score += 5

  return score
}

export function rankCatalogProducts(products: Product[], context: RecommendationContext): Product[] {
  const activeProducts = products.filter((p) => p.status === 'active')
  const now = context.now || new Date()

  if (activeProducts.length <= 1) return activeProducts

  const viewedSet = new Set(context.viewedIds)
  const purchasedSet = new Set(context.purchasedIds)
  const servedSet = new Set(context.sessionServedIds)

  const viewedAffinity = buildAffinityMap(activeProducts, context.viewedIds, 1)
  const purchasedAffinity = buildAffinityMap(activeProducts, context.purchasedIds, 2.3)

  const scored: ScoredProduct[] = activeProducts.map((product) => {
    const category = normalize(product.category)
    const brand = normalize(product.brand)
    const baseJitter = (hashToUnit(`${context.seed}:${product.id}`) - 0.5) * 6

    if (context.variant === 'control') {
      const controlScore = temporalRelevance(product, now) + baseJitter
      return { product, score: controlScore }
    }

    let score = 18

    score += declaredPreferenceScore(product, context.profile)
    score += temporalRelevance(product, now)

    score += (viewedAffinity.byCategory[category] || 0) * 3.8
    score += (viewedAffinity.byBrand[brand] || 0) * 3.2
    score += (purchasedAffinity.byCategory[category] || 0) * 5.5
    score += (purchasedAffinity.byBrand[brand] || 0) * 5

    const pop = context.segmentPopularity
    if (pop) {
      score += (pop.byProductId[product.id] || 0) * 6
      score += (pop.byBrand[brand] || 0) * 4
      score += (pop.byCategory[category] || 0) * 3
    }

    if (servedSet.has(product.id)) score -= 28
    if (viewedSet.has(product.id)) score -= 8
    if (purchasedSet.has(product.id)) score -= 45

    const exposurePenalty = clamp((context.exposureByProduct[product.id] || 0) * 1.8, 0, 18)
    score -= exposurePenalty

    score += baseJitter

    return { product, score }
  })

  scored.sort((a, b) => b.score - a.score)

  if (context.variant === 'control') {
    return scored.map((s) => s.product)
  }

  const selected: Product[] = []
  const pool = [...scored]
  const lambda = 0.28

  while (pool.length > 0) {
    let bestIdx = 0
    let bestMmr = -Infinity

    for (let i = 0; i < pool.length; i += 1) {
      const candidate = pool[i]
      let maxSim = 0
      for (const picked of selected) {
        maxSim = Math.max(maxSim, similarity(candidate.product, picked))
      }
      const mmr = candidate.score - lambda * maxSim * 100
      if (mmr > bestMmr) {
        bestMmr = mmr
        bestIdx = i
      }
    }

    const [picked] = pool.splice(bestIdx, 1)
    selected.push(picked.product)
  }

  return selected
}
