import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runPageSpeed } from './pagespeed'

const MOCK_SUCCESS = {
  lighthouseResult: {
    categories: { performance: { score: 0.72 } },
    audits: {
      'largest-contentful-paint':   { numericValue: 3200, displayValue: '3.2 s' },
      'max-potential-fid':          { numericValue: 80,   displayValue: '80 ms' },
      'cumulative-layout-shift':    { numericValue: 0.05, displayValue: '0.05' },
      'interaction-to-next-paint':  { numericValue: 180,  displayValue: '180 ms' },
      'server-response-time':       { numericValue: 600,  displayValue: '0.6 s' },
      'first-contentful-paint':     { numericValue: 1500, displayValue: '1.5 s' },
    },
  },
}

beforeEach(() => vi.restoreAllMocks())

describe('runPageSpeed', () => {
  it('parses a successful API response correctly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_SUCCESS),
    }))

    const result = await runPageSpeed('https://example.com', 'mobile')

    expect(result.score).toBe(72)
    expect(result.url).toBe('https://example.com')
    expect(result.strategy).toBe('mobile')
    expect(result.metrics.lcp.value).toBe(3200)
    expect(result.metrics.lcp.displayValue).toBe('3.2 s')
    expect(result.metrics.lcp.rating).toBe('needs-improvement')
    expect(result.metrics.fcp.rating).toBe('good')
    expect(result.metrics.cls.rating).toBe('good')
  })

  it('appends the API key to the request when env var is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_SUCCESS),
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('PAGESPEED_API_KEY', 'test-key-123')

    await runPageSpeed('https://example.com', 'desktop')

    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain('key=test-key-123')
    expect(calledUrl).toContain('strategy=DESKTOP')
  })

  it('throws a user-friendly message on 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve(JSON.stringify({
        error: { message: 'Quota exceeded' },
      })),
    }))

    await expect(runPageSpeed('https://example.com', 'mobile')).rejects.toThrow(
      'Rate limit reached'
    )
  })

  it('throws a user-friendly message on 500 unable-to-process', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(JSON.stringify({
        error: { message: 'Unable to process request. Please wait a while and try again.' },
      })),
    }))

    await expect(runPageSpeed('https://example.com', 'mobile')).rejects.toThrow(
      'Google could not analyze this URL'
    )
  })

  it('returns fid with value 0 when the audit is absent', async () => {
    const noFid = {
      lighthouseResult: {
        categories: { performance: { score: 0.9 } },
        audits: {
          'largest-contentful-paint':  { numericValue: 1000, displayValue: '1 s' },
          'cumulative-layout-shift':   { numericValue: 0.01, displayValue: '0.01' },
          'interaction-to-next-paint': { numericValue: 100,  displayValue: '100 ms' },
          'server-response-time':      { numericValue: 200,  displayValue: '0.2 s' },
          'first-contentful-paint':    { numericValue: 900,  displayValue: '0.9 s' },
        },
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(noFid),
    }))

    const result = await runPageSpeed('https://example.com', 'mobile')
    // When the FID audit is absent, value defaults to 0 and rating is 'good'
    expect(result.metrics.fid.value).toBe(0)
    expect(result.metrics.fid.rating).toBe('good')
  })
})
