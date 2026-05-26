export type Strategy = 'mobile' | 'desktop'

export type Rating = 'good' | 'needs-improvement' | 'poor'

export interface MetricValue {
  value: number
  displayValue: string
  rating: Rating
}

export interface CoreMetrics {
  lcp: MetricValue
  fid: MetricValue
  cls: MetricValue
  inp: MetricValue
  ttfb: MetricValue
  fcp: MetricValue
}

export interface AnalysisResult {
  url: string
  strategy: Strategy
  score: number
  metrics: CoreMetrics
  timestamp: number
}

