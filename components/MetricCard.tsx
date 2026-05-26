'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { METRIC_THRESHOLDS, getRatingColor } from '@/lib/metrics'
import type { MetricValue } from '@/types/metrics'
import type { MetricKey } from '@/lib/metrics'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  metricKey: MetricKey
  metric?: MetricValue
  isLoading?: boolean
}

const RATING_LABELS: Record<string, string> = {
  good: 'Good',
  'needs-improvement': 'Needs Work',
  poor: 'Poor',
}

const RATING_DOT: Record<string, string> = {
  good: 'bg-green-500',
  'needs-improvement': 'bg-yellow-500',
  poor: 'bg-red-500',
}

export function MetricCard({ metricKey, metric, isLoading }: MetricCardProps) {
  const meta = METRIC_THRESHOLDS[metricKey]

  if (isLoading) {
    return (
      <Card className="p-4 space-y-3">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-8 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
        <Skeleton className="h-3 w-36" />
      </Card>
    )
  }

  if (!metric) return null

  const { good, poor, unit } = meta
  const pct = Math.min(100, (metric.value / (poor * 1.5)) * 100)

  return (
    <Card className="p-4 space-y-3 hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none">
        {meta.label}
      </p>
      <p className="text-2xl font-bold tabular-nums leading-none">{metric.displayValue}</p>
      <div className="flex items-center gap-1.5">
        <span className={cn('h-2 w-2 rounded-full shrink-0', RATING_DOT[metric.rating])} />
        <span className={cn('text-xs font-medium', getRatingColor(metric.rating).split(' ')[1])}>
          {RATING_LABELS[metric.rating]}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            metric.rating === 'good' ? 'bg-green-500' :
            metric.rating === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Good ≤{good}{unit} · Poor &gt;{poor}{unit}
      </p>
    </Card>
  )
}
