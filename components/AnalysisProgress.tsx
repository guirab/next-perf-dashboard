'use client'

import { useEffect, useState } from 'react'

const PHASES = [
  { label: 'Connecting to PageSpeed API…', pct: 8 },
  { label: 'Fetching page resources…', pct: 22 },
  { label: 'Running Lighthouse audit…', pct: 45 },
  { label: 'Measuring Core Web Vitals…', pct: 62 },
  { label: 'Analyzing performance…', pct: 78 },
  { label: 'Processing results…', pct: 90 },
]

const PHASE_DURATION = 4500

export function AnalysisProgress() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    setPhaseIndex(0)
    setDisplayed(0)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1))
    }, PHASE_DURATION)
    return () => clearInterval(timer)
  }, [])

  const target = PHASES[phaseIndex].pct

  useEffect(() => {
    if (displayed === target) return
    const step = displayed < target ? 1 : -1
    const timer = setTimeout(() => setDisplayed((d) => d + step), 18)
    return () => clearTimeout(timer)
  }, [displayed, target])

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground animate-pulse">{PHASES[phaseIndex].label}</span>
        <span className="tabular-nums font-medium text-muted-foreground">{displayed}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${displayed}%` }}
        />
      </div>
    </div>
  )
}
