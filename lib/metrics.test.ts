import { describe, it, expect } from 'vitest'
import {
  getRating,
  formatMetricValue,
  getScoreColor,
  getScoreBg,
  getRatingColor,
} from './metrics'

describe('getRating', () => {
  describe('lcp', () => {
    it('returns good when value <= 2500', () => {
      expect(getRating('lcp', 2500)).toBe('good')
      expect(getRating('lcp', 1000)).toBe('good')
    })
    it('returns needs-improvement when value is between 2501 and 4000', () => {
      expect(getRating('lcp', 2501)).toBe('needs-improvement')
      expect(getRating('lcp', 4000)).toBe('needs-improvement')
    })
    it('returns poor when value > 4000', () => {
      expect(getRating('lcp', 4001)).toBe('poor')
      expect(getRating('lcp', 10000)).toBe('poor')
    })
  })

  describe('cls', () => {
    it('returns good when value <= 0.1', () => {
      expect(getRating('cls', 0.1)).toBe('good')
      expect(getRating('cls', 0)).toBe('good')
    })
    it('returns needs-improvement when value is between 0.1 and 0.25', () => {
      expect(getRating('cls', 0.15)).toBe('needs-improvement')
      expect(getRating('cls', 0.25)).toBe('needs-improvement')
    })
    it('returns poor when value > 0.25', () => {
      expect(getRating('cls', 0.26)).toBe('poor')
    })
  })

  describe('inp', () => {
    it('returns good when value <= 200', () => expect(getRating('inp', 200)).toBe('good'))
    it('returns needs-improvement when value is between 201 and 500', () => expect(getRating('inp', 350)).toBe('needs-improvement'))
    it('returns poor when value > 500', () => expect(getRating('inp', 501)).toBe('poor'))
  })

  describe('fcp', () => {
    it('returns good when value <= 1800', () => expect(getRating('fcp', 1800)).toBe('good'))
    it('returns needs-improvement when value is between 1801 and 3000', () => expect(getRating('fcp', 2500)).toBe('needs-improvement'))
    it('returns poor when value > 3000', () => expect(getRating('fcp', 3001)).toBe('poor'))
  })

  describe('ttfb', () => {
    it('returns good when value <= 800', () => expect(getRating('ttfb', 800)).toBe('good'))
    it('returns needs-improvement when value is between 801 and 1800', () => expect(getRating('ttfb', 1000)).toBe('needs-improvement'))
    it('returns poor when value > 1800', () => expect(getRating('ttfb', 1801)).toBe('poor'))
  })

  describe('fid', () => {
    it('returns good when value <= 100', () => expect(getRating('fid', 100)).toBe('good'))
    it('returns needs-improvement when value is between 101 and 300', () => expect(getRating('fid', 200)).toBe('needs-improvement'))
    it('returns poor when value > 300', () => expect(getRating('fid', 301)).toBe('poor'))
  })
})

describe('formatMetricValue', () => {
  it('formats ms metrics with unit', () => {
    expect(formatMetricValue('lcp', 2500)).toBe('2500 ms')
    expect(formatMetricValue('fcp', 1234)).toBe('1234 ms')
    expect(formatMetricValue('ttfb', 800)).toBe('800 ms')
  })

  it('formats cls to 3 decimal places without unit', () => {
    expect(formatMetricValue('cls', 0.123)).toBe('0.123')
    expect(formatMetricValue('cls', 0.1)).toBe('0.100')
  })

  it('rounds ms values', () => {
    expect(formatMetricValue('lcp', 2500.9)).toBe('2501 ms')
  })
})

describe('getScoreColor', () => {
  it('returns green for scores >= 90', () => {
    expect(getScoreColor(90)).toBe('text-green-500')
    expect(getScoreColor(100)).toBe('text-green-500')
  })
  it('returns yellow for scores 50-89', () => {
    expect(getScoreColor(50)).toBe('text-yellow-500')
    expect(getScoreColor(89)).toBe('text-yellow-500')
  })
  it('returns red for scores < 50', () => {
    expect(getScoreColor(49)).toBe('text-red-500')
    expect(getScoreColor(0)).toBe('text-red-500')
  })
})

describe('getScoreBg', () => {
  it('returns correct bg class per range', () => {
    expect(getScoreBg(95)).toBe('bg-green-500')
    expect(getScoreBg(70)).toBe('bg-yellow-500')
    expect(getScoreBg(30)).toBe('bg-red-500')
  })
})

describe('getRatingColor', () => {
  it('returns green classes for good', () => {
    expect(getRatingColor('good')).toContain('green')
  })
  it('returns yellow classes for needs-improvement', () => {
    expect(getRatingColor('needs-improvement')).toContain('yellow')
  })
  it('returns red classes for poor', () => {
    expect(getRatingColor('poor')).toContain('red')
  })
})
