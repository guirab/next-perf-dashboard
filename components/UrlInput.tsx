'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface UrlInputProps {
  onAnalyze: (url: string) => void
  isLoading: boolean
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function UrlInput({ onAnalyze, isLoading }: UrlInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const url = normalizeUrl(value)
    if (!url) { setError('Please enter a URL'); return }
    try { new URL(url) } catch { setError('Please enter a valid URL (e.g. example.com)'); return }
    onAnalyze(url)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter a URL — e.g. github.com"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError('') }}
          disabled={isLoading}
          className="flex-1 h-11 text-base px-4"
          aria-label="URL to analyze"
        />
        <Button type="submit" disabled={isLoading || !value.trim()} className="h-11 px-6 font-medium">
          {isLoading ? 'Analyzing…' : 'Analyze'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
