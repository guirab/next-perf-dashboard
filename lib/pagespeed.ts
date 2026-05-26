import type { AnalysisResult, CoreMetrics, Strategy } from '@/types/metrics'
import { getRating, formatMetricValue } from '@/lib/metrics'

const PAGESPEED_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

// Maps Lighthouse audit IDs to our metric keys
const AUDIT_MAP = {
  'largest-contentful-paint': 'lcp',
  'max-potential-fid': 'fid',
  'cumulative-layout-shift': 'cls',
  'interaction-to-next-paint': 'inp',
  'server-response-time': 'ttfb',
  'first-contentful-paint': 'fcp',
} as const

type AuditKey = keyof typeof AUDIT_MAP
type MetricKey = (typeof AUDIT_MAP)[AuditKey]

function extractNumericValue(audit: Record<string, unknown>): number {
  const numValue = audit.numericValue
  if (typeof numValue === 'number') return numValue
  return 0
}

export async function runPageSpeed(url: string, strategy: Strategy): Promise<AnalysisResult> {
  const params = new URLSearchParams({
    url,
    strategy: strategy.toUpperCase(),
    category: 'PERFORMANCE',
  })

  const apiKey = process.env.PAGESPEED_API_KEY
  if (apiKey) params.set('key', apiKey)

  const res = await fetch(`${PAGESPEED_API}?${params}`, {
    headers: { 'User-Agent': 'next-perf-dashboard/1.0' },
    signal: AbortSignal.timeout(55000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let message = `PageSpeed API error ${res.status}`
    try {
      const json = JSON.parse(body)
      const apiMsg: string = json?.error?.message ?? ''
      if (res.status === 500 && apiMsg.includes('Unable to process')) {
        message = 'Google could not analyze this URL. The page may be blocking crawlers — try a different URL or try again in a moment.'
      } else if (res.status === 429) {
        message = 'Rate limit reached. Add a PAGESPEED_API_KEY to .env.local or wait a minute before retrying.'
      } else if (apiMsg) {
        message = apiMsg
      }
    } catch {
      // not JSON (e.g. HTML block page)
      if (res.status === 429) {
        message = 'Rate limit reached. Try again in a moment.'
      }
    }
    throw new Error(message)
  }

  const data = await res.json()

  const score = Math.round((data.lighthouseResult?.categories?.performance?.score ?? 0) * 100)
  const audits = data.lighthouseResult?.audits ?? {}

  const metrics: Partial<CoreMetrics> = {}

  for (const [auditId, metricKey] of Object.entries(AUDIT_MAP) as [AuditKey, MetricKey][]) {
    const audit = audits[auditId] as Record<string, unknown> | undefined
    const value = audit ? extractNumericValue(audit) : 0

    const rating = getRating(metricKey, value)
    const displayValue =
      typeof audit?.displayValue === 'string'
        ? audit.displayValue
        : formatMetricValue(metricKey, value)

    metrics[metricKey] = { value, displayValue, rating }
  }

  // FID was deprecated by Google in March 2024 and replaced by INP.
  // The max-potential-fid audit may be absent from newer API responses.
  if (!metrics.fid) {
    metrics.fid = { value: 0, displayValue: 'N/A', rating: 'good' }
  }

  return {
    url,
    strategy,
    score,
    metrics: metrics as CoreMetrics,
    timestamp: Date.now(),
  }
}
