import { useHistoryStore, type HistoryEntry } from '@/store/useHistoryStore'
import type { Strategy } from '@/types/metrics'

export function useUrlHistory(url: string, strategy: Strategy): HistoryEntry[] {
  const history = useHistoryStore((s) => s.history)
  return history
    .filter((e) => e.url === url && e.strategy === strategy)
    .sort((a, b) => a.timestamp - b.timestamp)
}
