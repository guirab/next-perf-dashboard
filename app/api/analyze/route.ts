import { runPageSpeed } from '@/lib/pagespeed'
import type { Strategy } from '@/types/metrics'

export const maxDuration = 60

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { url, strategy } = body as { url?: string; strategy?: string }

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'url is required' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return Response.json({ error: 'URL must use http or https' }, { status: 400 })
  }

  const resolvedStrategy: Strategy =
    strategy === 'desktop' || strategy === 'mobile' ? strategy : 'mobile'

  try {
    const result = await runPageSpeed(parsedUrl.href, resolvedStrategy)
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return Response.json({ error: message }, { status: 502 })
  }
}
