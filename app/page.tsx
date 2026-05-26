'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { UrlInput } from '@/components/UrlInput'
import { CompareToggle } from '@/components/CompareToggle'
import { ScoreCard } from '@/components/ScoreCard'
import { MetricCard } from '@/components/MetricCard'
import { HistoryList } from '@/components/HistoryList'
import { AnalysisProgress } from '@/components/AnalysisProgress'
import { Separator } from '@/components/ui/separator'
import { useAnalyze } from '@/hooks/useAnalyze'
import type { AnalysisResult, Strategy } from '@/types/metrics'
import type { MetricKey } from '@/lib/metrics'
import type { HistoryEntry } from '@/store/useHistoryStore'

const METRIC_ORDER: MetricKey[] = ['lcp', 'fcp', 'ttfb', 'cls', 'inp', 'fid']

export default function Home() {
  const [strategy, setStrategy] = useState<Strategy>('mobile')
  const [displayed, setDisplayed] = useState<AnalysisResult | null>(null)
  const { analyze, result, isLoading, error } = useAnalyze()

  useEffect(() => {
    if (result) setDisplayed(result)
  }, [result])

  useEffect(() => {
    if (error) toast.error(error.message ?? 'Analysis failed. Please try again.')
  }, [error])

  const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

  function handleHistorySelect(entry: HistoryEntry) {
    const isStale = Date.now() - entry.timestamp > CACHE_TTL_MS
    if (isStale) {
      setStrategy(entry.strategy)
      analyze({ url: entry.url, strategy: entry.strategy })
      toast.info('Cache expired — re-analyzing…')
    } else {
      setDisplayed(entry)
      setStrategy(entry.strategy)
      const age = Math.round((Date.now() - entry.timestamp) / 1000)
      toast.success(`Loaded from cache (${age}s ago)`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight">Perf Dashboard</span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">Powered by Google PageSpeed Insights</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">
        {/* Search bar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <UrlInput onAnalyze={(url) => analyze({ url, strategy })} isLoading={isLoading} />
            </div>
            <div className="w-fit">
              <CompareToggle strategy={strategy} onChange={setStrategy} disabled={isLoading} />
            </div>
          </div>
          {isLoading && <AnalysisProgress />}
        </div>

        {/* Results */}
        {(displayed || isLoading) && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Results</h2>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
              <ScoreCard
                score={displayed?.score ?? 0}
                strategy={displayed?.strategy ?? strategy}
                url={displayed?.url ?? ''}
                isLoading={isLoading}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {METRIC_ORDER.map((key) => (
                  <MetricCard
                    key={key}
                    metricKey={key}
                    metric={displayed?.metrics[key]}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* History */}
        <HistoryList onSelect={handleHistorySelect} />
      </main>

      <footer className="border-t py-4">
        <p className="text-center text-xs text-muted-foreground">
          Analysis data provided by Google PageSpeed Insights API
        </p>
      </footer>
    </div>
  )
}
