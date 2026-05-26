import { describe, it, expect, beforeEach } from 'vitest'
import { useHistoryStore } from './useHistoryStore'
import type { AnalysisResult } from '@/types/metrics'

function makeResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    url: 'https://example.com',
    strategy: 'mobile',
    score: 75,
    metrics: {} as AnalysisResult['metrics'],
    timestamp: Date.now(),
    ...overrides,
  }
}

beforeEach(() => {
  useHistoryStore.setState({ history: [] })
})

describe('useHistoryStore', () => {
  it('starts with empty history', () => {
    expect(useHistoryStore.getState().history).toHaveLength(0)
  })

  it('adds an analysis to history', () => {
    useHistoryStore.getState().addAnalysis(makeResult())
    expect(useHistoryStore.getState().history).toHaveLength(1)
  })

  it('adds new entries at the front of the list', () => {
    useHistoryStore.getState().addAnalysis(makeResult({ url: 'https://first.com', timestamp: 1000 }))
    useHistoryStore.getState().addAnalysis(makeResult({ url: 'https://second.com', timestamp: 2000 }))
    expect(useHistoryStore.getState().history[0].url).toBe('https://second.com')
  })

  it('caps history at 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      useHistoryStore.getState().addAnalysis(makeResult({ url: `https://site${i}.com`, timestamp: i }))
    }
    expect(useHistoryStore.getState().history).toHaveLength(20)
  })

  it('stores the most recent 20 entries when over the limit', () => {
    for (let i = 0; i < 25; i++) {
      useHistoryStore.getState().addAnalysis(makeResult({ url: `https://site${i}.com`, timestamp: i }))
    }
    const urls = useHistoryStore.getState().history.map((e) => e.url)
    expect(urls).toContain('https://site24.com')
    expect(urls).not.toContain('https://site0.com')
  })

  it('clears history', () => {
    useHistoryStore.getState().addAnalysis(makeResult())
    useHistoryStore.getState().clearHistory()
    expect(useHistoryStore.getState().history).toHaveLength(0)
  })

  it('generates a unique id per entry', () => {
    const t = Date.now()
    useHistoryStore.getState().addAnalysis(makeResult({ url: 'https://a.com', timestamp: t }))
    useHistoryStore.getState().addAnalysis(makeResult({ url: 'https://b.com', timestamp: t + 1 }))
    const ids = useHistoryStore.getState().history.map((e) => e.id)
    expect(new Set(ids).size).toBe(2)
  })
})
