export type RecoVariant = 'control' | 'personalized_diverse'

interface RecoEvent {
  type: 'impression' | 'click' | 'purchase'
  variant: RecoVariant
  timestamp: number
  sessionId: string
  visitorId: string
  productId?: string
  productIds?: string[]
  revenue?: number
  isNewDiscovery?: boolean
  segment?: string
  category?: string
  brand?: string
  catalogSize?: number
}

interface VariantMetrics {
  variant: RecoVariant
  impressions: number
  clicks: number
  purchases: number
  revenue: number
  visitors: number
  sessions: number
  ctr: number
  revenuePerVisitor: number
  discoveryRate: number
  coverage: number
}

const STORAGE_KEY = 'eter-reco-events-v1'
const VISITOR_KEY = 'eter-reco-visitor-id'
const SESSION_KEY = 'eter-reco-session-id'
const COVERAGE_KEY = 'eter-reco-coverage-v1'

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
}

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getRecoVisitorId() {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = randomId('visitor')
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export function getRecoSessionId() {
  if (typeof window === 'undefined') return 'server-session'
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = randomId('session')
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function hashToVariant(source: string): RecoVariant {
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2 === 0 ? 'control' : 'personalized_diverse'
}

export function getRecoVariant() {
  return hashToVariant(getRecoVisitorId())
}

function pushEvent(event: RecoEvent) {
  const events = getStorage<RecoEvent[]>(STORAGE_KEY, [])
  const trimmed = [...events, event].slice(-25000)
  setStorage(STORAGE_KEY, trimmed)
}

export function trackRecoImpression(params: {
  variant: RecoVariant
  productIds: string[]
  viewedIds: string[]
  segment?: string
  productsMeta?: Array<{ id: string; category?: string; brand?: string }>
  catalogSize: number
}) {
  const visitorId = getRecoVisitorId()
  const sessionId = getRecoSessionId()
  const viewed = new Set(params.viewedIds)

  const coverage = getStorage<{ uniqueShownIds: string[]; maxCatalogSize: number }>(COVERAGE_KEY, {
    uniqueShownIds: [],
    maxCatalogSize: params.catalogSize,
  })
  coverage.maxCatalogSize = Math.max(coverage.maxCatalogSize, params.catalogSize)
  coverage.uniqueShownIds = [...new Set([...coverage.uniqueShownIds, ...params.productIds])]
  setStorage(COVERAGE_KEY, coverage)

  for (const productId of params.productIds) {
    const meta = params.productsMeta?.find((p) => p.id === productId)
    pushEvent({
      type: 'impression',
      variant: params.variant,
      timestamp: Date.now(),
      sessionId,
      visitorId,
      productId,
      isNewDiscovery: !viewed.has(productId),
      segment: params.segment,
      category: meta?.category,
      brand: meta?.brand,
      catalogSize: params.catalogSize,
    })
  }
}

export function trackRecoClick(params: {
  variant: RecoVariant
  productId: string
  viewedIds: string[]
  segment?: string
  category?: string
  brand?: string
}) {
  pushEvent({
    type: 'click',
    variant: params.variant,
    timestamp: Date.now(),
    sessionId: getRecoSessionId(),
    visitorId: getRecoVisitorId(),
    productId: params.productId,
    isNewDiscovery: !new Set(params.viewedIds).has(params.productId),
    segment: params.segment,
    category: params.category,
    brand: params.brand,
  })
}

export function trackRecoPurchase(params: {
  variant: RecoVariant
  productIds: string[]
  revenue: number
  segment?: string
}) {
  pushEvent({
    type: 'purchase',
    variant: params.variant,
    timestamp: Date.now(),
    sessionId: getRecoSessionId(),
    visitorId: getRecoVisitorId(),
    productIds: params.productIds,
    revenue: params.revenue,
    segment: params.segment,
  })
}

export function getSegmentPopularity(segment?: string) {
  const events = getStorage<RecoEvent[]>(STORAGE_KEY, [])
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 30
  const filtered = events.filter((e) => e.timestamp >= cutoff && e.type !== 'impression' && (!segment || e.segment === segment))

  const byProductId: Record<string, number> = {}
  const byBrand: Record<string, number> = {}
  const byCategory: Record<string, number> = {}

  for (const event of filtered) {
    const weight = event.type === 'purchase' ? 3 : 1
    if (event.productId) {
      byProductId[event.productId] = (byProductId[event.productId] || 0) + weight
    }
    if (event.productIds) {
      for (const id of event.productIds) {
        byProductId[id] = (byProductId[id] || 0) + weight
      }
    }
    if (event.brand) byBrand[event.brand.toLowerCase()] = (byBrand[event.brand.toLowerCase()] || 0) + weight
    if (event.category) byCategory[event.category.toLowerCase()] = (byCategory[event.category.toLowerCase()] || 0) + weight
  }

  const normalize = (obj: Record<string, number>) => {
    const max = Math.max(1, ...Object.values(obj), 1)
    const result: Record<string, number> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = value / max
    }
    return result
  }

  return {
    byProductId: normalize(byProductId),
    byBrand: normalize(byBrand),
    byCategory: normalize(byCategory),
  }
}

function proportionZTest(succA: number, totalA: number, succB: number, totalB: number) {
  if (totalA === 0 || totalB === 0) return { z: 0, pValue: 1 }
  const p1 = succA / totalA
  const p2 = succB / totalB
  const p = (succA + succB) / (totalA + totalB)
  const se = Math.sqrt(p * (1 - p) * (1 / totalA + 1 / totalB))
  if (se === 0) return { z: 0, pValue: 1 }
  const z = (p2 - p1) / se
  const pValue = Math.exp(-0.717 * Math.abs(z) - 0.416 * z * z)
  return { z, pValue }
}

function mean(values: number[]) {
  if (!values.length) return 0
  return values.reduce((acc, value) => acc + value, 0) / values.length
}

function variance(values: number[]) {
  if (values.length < 2) return 0
  const m = mean(values)
  return values.reduce((acc, value) => acc + (value - m) ** 2, 0) / (values.length - 1)
}

function revenueZTest(valuesA: number[], valuesB: number[]) {
  if (valuesA.length < 2 || valuesB.length < 2) return { z: 0, pValue: 1 }
  const meanA = mean(valuesA)
  const meanB = mean(valuesB)
  const varA = variance(valuesA)
  const varB = variance(valuesB)
  const se = Math.sqrt(varA / valuesA.length + varB / valuesB.length)
  if (se === 0) return { z: 0, pValue: 1 }
  const z = (meanB - meanA) / se
  const pValue = Math.exp(-0.717 * Math.abs(z) - 0.416 * z * z)
  return { z, pValue }
}

export function getRecoExperimentMetrics() {
  const events = getStorage<RecoEvent[]>(STORAGE_KEY, [])
  const coverage = getStorage<{ uniqueShownIds: string[]; maxCatalogSize: number }>(COVERAGE_KEY, {
    uniqueShownIds: [],
    maxCatalogSize: 0,
  })

  const variants: RecoVariant[] = ['control', 'personalized_diverse']

  const metricsByVariant: VariantMetrics[] = variants.map((variant) => {
    const variantEvents = events.filter((e) => e.variant === variant)
    const impressions = variantEvents.filter((e) => e.type === 'impression')
    const clicks = variantEvents.filter((e) => e.type === 'click')
    const purchases = variantEvents.filter((e) => e.type === 'purchase')

    const visitors = new Set(variantEvents.map((e) => e.visitorId)).size
    const sessions = new Set(variantEvents.map((e) => e.sessionId)).size

    const revenue = purchases.reduce((acc, event) => acc + (event.revenue || 0), 0)
    const clicksNew = clicks.filter((e) => e.isNewDiscovery).length

    const uniqueShown = new Set(impressions.map((e) => e.productId).filter(Boolean) as string[]).size
    const coverageRate = coverage.maxCatalogSize > 0 ? uniqueShown / coverage.maxCatalogSize : 0

    return {
      variant,
      impressions: impressions.length,
      clicks: clicks.length,
      purchases: purchases.length,
      revenue,
      visitors,
      sessions,
      ctr: impressions.length > 0 ? clicks.length / impressions.length : 0,
      revenuePerVisitor: visitors > 0 ? revenue / visitors : 0,
      discoveryRate: clicks.length > 0 ? clicksNew / clicks.length : 0,
      coverage: coverageRate,
    }
  })

  const control = metricsByVariant.find((m) => m.variant === 'control')!
  const treatment = metricsByVariant.find((m) => m.variant === 'personalized_diverse')!

  const ctrStats = proportionZTest(control.clicks, control.impressions, treatment.clicks, treatment.impressions)

  const sessionRevenueMap = (variant: RecoVariant) => {
    const result: Record<string, number> = {}
    for (const event of events) {
      if (event.variant !== variant || event.type !== 'purchase') continue
      result[event.sessionId] = (result[event.sessionId] || 0) + (event.revenue || 0)
    }
    return Object.values(result)
  }

  const rpvStats = revenueZTest(sessionRevenueMap('control'), sessionRevenueMap('personalized_diverse'))

  const delta = {
    ctrLift: control.ctr > 0 ? (treatment.ctr - control.ctr) / control.ctr : 0,
    revenuePerVisitorLift:
      control.revenuePerVisitor > 0 ? (treatment.revenuePerVisitor - control.revenuePerVisitor) / control.revenuePerVisitor : 0,
    discoveryLift: control.discoveryRate > 0 ? (treatment.discoveryRate - control.discoveryRate) / control.discoveryRate : 0,
    coverageLift: control.coverage > 0 ? (treatment.coverage - control.coverage) / control.coverage : 0,
  }

  return {
    metricsByVariant,
    delta,
    significance: {
      ctr: { ...ctrStats, significant: ctrStats.pValue < 0.05 },
      revenuePerVisitor: { ...rpvStats, significant: rpvStats.pValue < 0.05 },
    },
  }
}
