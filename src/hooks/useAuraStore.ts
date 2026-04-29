'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuraProfile {
  occasion: string
  season?: string
  brand: string
  style: string
  budget: string
  priority: string
  ageRange?: string
  region?: string
  completedAt: string
}

interface AuraState {
  viewedIds: string[]
  trackView: (id: string) => void
  clearHistory: () => void

  purchasedIds: string[]
  markPurchased: (ids: string[]) => void

  profile: AuraProfile | null
  hasCompletedQuiz: boolean
  setProfile: (profile: AuraProfile) => void
  resetProfile: () => void

  isFirstVisit: boolean
  markVisited: () => void

  sessionServedIds: string[]
  markServed: (ids: string[]) => void
  clearSessionServed: () => void

  exposureByProduct: Record<string, number>
  addExposure: (ids: string[]) => void

  isQuizOpen: boolean
  openQuiz: () => void
  closeQuiz: () => void
}

export const useAuraStore = create<AuraState>()(
  persist(
    (set) => ({
      viewedIds: [],
      trackView: (id: string) =>
        set((state) => ({
          viewedIds: [id, ...state.viewedIds.filter((v) => v !== id)].slice(0, 30),
        })),
      clearHistory: () => set({ viewedIds: [] }),

      purchasedIds: [],
      markPurchased: (ids: string[]) =>
        set((state) => ({
          purchasedIds: [...new Set([...ids, ...state.purchasedIds])].slice(0, 80),
        })),

      profile: null,
      hasCompletedQuiz: false,
      setProfile: (profile: AuraProfile) =>
        set({
          profile,
          hasCompletedQuiz: true,
          isFirstVisit: false,
        }),
      resetProfile: () => set({ profile: null, hasCompletedQuiz: false }),

      isFirstVisit: true,
      markVisited: () => set({ isFirstVisit: false }),

      sessionServedIds: [],
      markServed: (ids: string[]) =>
        set((state) => ({
          sessionServedIds: [...new Set([...state.sessionServedIds, ...ids])].slice(-200),
        })),
      clearSessionServed: () => set({ sessionServedIds: [] }),

      exposureByProduct: {},
      addExposure: (ids: string[]) =>
        set((state) => {
          const next = { ...state.exposureByProduct }
          for (const id of ids) {
            next[id] = (next[id] || 0) + 1
          }
          return { exposureByProduct: next }
        }),

      isQuizOpen: false,
      openQuiz: () => set({ isQuizOpen: true }),
      closeQuiz: () => set({ isQuizOpen: false }),
    }),
    {
      name: 'aura-personalization',
    }
  )
)
