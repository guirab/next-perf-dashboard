'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card'
import { CompareToggle } from '@/components/CompareToggle'
import { useUrlHistory } from '@/hooks/useUrlHistory'
import type { Strategy } from '@/types/metrics'
import type { HistoryEntry } from '@/store/useHistoryStore'

interface TrendsChartProps {
  url: string
  defaultStrategy?: Strategy
}

function CustomTooltip({ active, payload, label }: TooltipContentProps<TooltipValueType, string>) {
  if (!active || !payload?.length) return null
  const entry: HistoryEntry | undefined = (payload[0]?.payload as { _raw?: HistoryEntry })?._raw
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md space-y-1">
      <p className="font-medium text-muted-foreground mb-1">
        {format(new Date(label as number), 'MMM dd HH:mm')}
      </p>
      {payload.map((p) => {
        const name = p.name as string
        const value = p.value as number
        let displayVal = ''
        if (name === 'Score') {
          displayVal = String(value)
        } else if (name === 'CLS') {
          displayVal = (entry?.metrics.cls.value ?? value / 1000).toFixed(3)
        } else if (name === 'LCP' && entry) {
          displayVal = entry.metrics.lcp.displayValue
        } else if (name === 'FCP' && entry) {
          displayVal = entry.metrics.fcp.displayValue
        } else if (name === 'TTFB' && entry) {
          displayVal = entry.metrics.ttfb.displayValue
        } else {
          displayVal = String(value)
        }
        return (
          <p key={name} style={{ color: p.color as string }}>
            <span className="font-medium">{name}:</span> {displayVal}
          </p>
        )
      })}
    </div>
  )
}

export function TrendsChart({ url, defaultStrategy }: TrendsChartProps) {
  const [localStrategy, setLocalStrategy] = useState<Strategy>(defaultStrategy ?? 'mobile')
  const entries = useUrlHistory(url, localStrategy)

  const chartData = entries.map((e) => ({
    timestamp: e.timestamp,
    score: e.score,
    lcp: e.metrics.lcp.value,
    fcp: e.metrics.fcp.value,
    ttfb: e.metrics.ttfb.value,
    cls: e.metrics.cls.value * 1000,
    _raw: e,
  }))

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Trends</CardTitle>
        <CardAction>
          <CompareToggle strategy={localStrategy} onChange={setLocalStrategy} />
        </CardAction>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length < 2 ? (
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ height: 300 }}
          >
            Analyze this URL again to see performance trends
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) => format(new Date(v), 'MMM dd HH:mm')}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                label={{ value: 'Score', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'ms / CLS×1000', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 11 } }}
                tick={{ fontSize: 11 }}
              />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip content={CustomTooltip as any} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="score"
                name="Score"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="lcp"
                name="LCP"
                stroke="#f97316"
                strokeWidth={1.5}
                dot
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fcp"
                name="FCP"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ttfb"
                name="TTFB"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cls"
                name="CLS"
                stroke="#22c55e"
                strokeWidth={1.5}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
