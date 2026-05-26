import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('@/lib/pagespeed', () => ({
  runPageSpeed: vi.fn().mockResolvedValue({
    url: 'https://example.com',
    strategy: 'mobile',
    score: 80,
    metrics: {},
    timestamp: 1234567890,
  }),
}))

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => vi.clearAllMocks())

describe('POST /api/analyze', () => {
  it('returns 400 when url is missing', async () => {
    const res = await POST(makeRequest({ strategy: 'mobile' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/url is required/i)
  })

  it('returns 400 when url is not a valid URL', async () => {
    const res = await POST(makeRequest({ url: 'not-a-url!@#', strategy: 'mobile' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/invalid url/i)
  })

  it('returns 400 for non-http protocols', async () => {
    const res = await POST(makeRequest({ url: 'ftp://example.com', strategy: 'mobile' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/http/i)
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with result for a valid request', async () => {
    const res = await POST(makeRequest({ url: 'https://example.com', strategy: 'mobile' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.score).toBe(80)
    expect(body.url).toBe('https://example.com')
  })

  it('defaults to mobile strategy when strategy is invalid', async () => {
    const { runPageSpeed } = await import('@/lib/pagespeed')
    await POST(makeRequest({ url: 'https://example.com', strategy: 'tablet' }))
    expect(runPageSpeed).toHaveBeenCalledWith(expect.any(String), 'mobile')
  })

  it('accepts desktop strategy', async () => {
    const { runPageSpeed } = await import('@/lib/pagespeed')
    await POST(makeRequest({ url: 'https://example.com', strategy: 'desktop' }))
    expect(runPageSpeed).toHaveBeenCalledWith(expect.any(String), 'desktop')
  })

  it('returns 502 when runPageSpeed throws', async () => {
    const { runPageSpeed } = await import('@/lib/pagespeed')
    vi.mocked(runPageSpeed).mockRejectedValueOnce(new Error('API down'))
    const res = await POST(makeRequest({ url: 'https://example.com', strategy: 'mobile' }))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBe('API down')
  })
})
