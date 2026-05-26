'use client'

import { useMutation } from '@tanstack/react-query'
import { useHistoryStore } from '@/store/useHistoryStore'
import type { AnalysisResult, Strategy } from '@/types/metrics'

interface AnalyzeParams {
  url: string
  strategy: Strategy
}

async function fetchAnalysis({ url, strategy }: AnalyzeParams): Promise<AnalysisResult> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, strategy }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Request failed with status ${res.status}`)
  }
  return res.json()
}

export function useAnalyze() {
  const addAnalysis = useHistoryStore((s) => s.addAnalysis)

  const mutation = useMutation({
    mutationFn: fetchAnalysis,
    onSuccess: (data) => {
      addAnalysis(data)
    },
  })

  return {
    analyze: mutation.mutate,
    result: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
