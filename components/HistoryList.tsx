'use client'

import { useHistoryStore, type HistoryEntry } from '@/store/useHistoryStore'
import { Card } from '@/components/ui/card'
import { getScoreColor } from '@/lib/metrics'
import { cn } from '@/lib/utils'

interface HistoryListProps {
  onSelect: (entry: HistoryEntry) => void
}

const SCORE_BAR: (score: number) => string = (score) =>
  score >= 90 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'

export function HistoryList({ onSelect }: HistoryListProps) {
  const history = useHistoryStore((s) => s.history)
  const clearHistory = useHistoryStore((s) => s.clearHistory)

  if (history.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Recent Analyses
        </h2>
        <button
          onClick={clearHistory}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="w-full text-left"
          >
            <Card className="p-4 hover:shadow-md hover:border-border/80 transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors leading-none">
                    {entry.url.replace(/^https?:\/\//, '')}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {entry.strategy} · {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn('text-2xl font-bold tabular-nums leading-none', getScoreColor(entry.score))}>
                    {entry.score}
                  </span>
                  <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', SCORE_BAR(entry.score))}
                      style={{ width: `${entry.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
