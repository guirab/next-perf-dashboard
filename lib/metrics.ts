import type { Rating } from '@/types/metrics'

export const METRIC_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000, unit: 'ms', label: 'Largest Contentful Paint' },
  fid: { good: 100, poor: 300, unit: 'ms', label: 'First Input Delay' },
  cls: { good: 0.1, poor: 0.25, unit: '', label: 'Cumulative Layout Shift' },
  inp: { good: 200, poor: 500, unit: 'ms', label: 'Interaction to Next Paint' },
  ttfb: { good: 800, poor: 1800, unit: 'ms', label: 'Time to First Byte' },
  fcp: { good: 1800, poor: 3000, unit: 'ms', label: 'First Contentful Paint' },
} as const

export type MetricKey = keyof typeof METRIC_THRESHOLDS

export function getRating(metric: MetricKey, value: number): Rating {
  const { good, poor } = METRIC_THRESHOLDS[metric]
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

export function formatMetricValue(metric: MetricKey, value: number): string {
  const { unit } = METRIC_THRESHOLDS[metric]
  if (metric === 'cls') return value.toFixed(3)
  if (unit === 'ms') return `${Math.round(value)} ms`
  return String(value)
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

export function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function getRatingColor(rating: Rating): string {
  if (rating === 'good') return 'bg-green-500/10 text-green-600 dark:text-green-400'
  if (rating === 'needs-improvement') return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
  return 'bg-red-500/10 text-red-600 dark:text-red-400'
}
