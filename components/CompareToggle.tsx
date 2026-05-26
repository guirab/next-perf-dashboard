'use client'

import type { Strategy } from '@/types/metrics'
import { cn } from '@/lib/utils'

interface CompareToggleProps {
  strategy: Strategy
  onChange: (strategy: Strategy) => void
  disabled?: boolean
}

export function CompareToggle({ strategy, onChange, disabled }: CompareToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1 h-11">
      {(['mobile', 'desktop'] as Strategy[]).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-4 h-8 text-sm font-medium transition-all',
            strategy === s
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {s === 'mobile' ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="4" width="20" height="13" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          )}
          <span className="capitalize">{s}</span>
        </button>
      ))}
    </div>
  )
}
