'use client'

import { RadialBarChart, RadialBar } from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getScoreColor } from '@/lib/metrics'
import type { Strategy } from '@/types/metrics'

interface ScoreCardProps {
  score: number
  strategy: Strategy
  url: string
  isLoading?: boolean
}

const SIZE = 176

function ScoreRing({ score }: { score: number }) {
  const chartData = [{ value: score }]
  const color = score >= 90 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <RadialBarChart
        width={SIZE}
        height={SIZE}
        innerRadius="72%"
        outerRadius="100%"
        data={chartData}
        startAngle={90}
        endAngle={90 - 360 * (score / 100)}
        barSize={12}
      >
        <RadialBar dataKey="value" cornerRadius={6} fill={color} background={{ fill: 'hsl(var(--muted))' }} />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className={`text-5xl font-bold tabular-nums leading-none ${getScoreColor(score)}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground font-medium">/100</span>
      </div>
    </div>
  )
}

export function ScoreCard({ score, strategy, url, isLoading }: ScoreCardProps) {
  if (isLoading) {
    return (
      <Card className="flex flex-col items-center p-6 gap-4">
        <Skeleton className="w-44 h-44 rounded-full" />
        <div className="space-y-2 w-full text-center">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-3 w-40 mx-auto" />
        </div>
      </Card>
    )
  }

  const label = score >= 90 ? 'Fast' : score >= 50 ? 'Needs improvement' : 'Slow'

  return (
    <Card className="flex flex-col items-center p-6 gap-4">
      <ScoreRing score={score} />
      <div className="text-center space-y-1">
        <p className={`text-sm font-semibold ${getScoreColor(score)}`}>{label}</p>
        <p className="text-xs text-muted-foreground capitalize">{strategy} analysis</p>
        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{url}</p>
      </div>
    </Card>
  )
}
