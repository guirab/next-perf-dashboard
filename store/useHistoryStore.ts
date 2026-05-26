'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnalysisResult } from '@/types/metrics'

export type HistoryEntry = AnalysisResult & { id: string }

interface HistoryStore {
  history: HistoryEntry[]
  addAnalysis: (result: AnalysisResult) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addAnalysis: (result) =>
        set((state) => {
          const entry: HistoryEntry = {
            ...result,
            id: `${result.url}-${result.timestamp}`,
          }
          const next = [entry, ...state.history].slice(0, 20)
          return { history: next }
        }),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'perf-history' }
  )
)
