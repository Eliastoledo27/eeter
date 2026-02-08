export interface DashboardProfile {
  id: string
  full_name: string
  role: string
  is_premium: boolean
  points: number
  streak_days: number
  commission_rate: number
  reseller_slug?: string | null
  avatar_url?: string | null
}

export interface DashboardRankingUser {
  id: string
  name: string
  points: number
  streak: number
  rank?: number
}

export interface DashboardProduct {
  id: string
  name: string
  category: string
  description?: string | null
  base_price: number
  images: string[]
  stock_by_size?: Record<string, number> | null
}

export type AcademyContentType = 'video' | 'pdf' | 'audio'

export interface DashboardAcademyItem {
  id: string
  title: string
  type: AcademyContentType
  url: string
  description?: string | null
  is_vip: boolean
}
