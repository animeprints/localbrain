import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'

function isPrivateIP(hostname: string): boolean {
  const ip = hostname.toLowerCase()
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1' || ip === '0.0.0.0') return true
  if (ip.startsWith('192.168.')) return true
  if (ip.startsWith('10.')) return true
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1])
    if (second >= 16 && second <= 31) return true
  }
  if (ip.startsWith('169.254.')) return true
  if (ip === '[::1]' || ip.startsWith('fc') || ip.startsWith('fd')) return true
  return false
}

function sanitizeText(text: string): string {
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return Response.json({ error: 'Missing URL' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return Response.json({ error: 'Only HTTP/HTTPS URLs allowed' }, { status: 400 })
  }

  if (isPrivateIP(parsedUrl.hostname)) {
    return Response.json({ error: 'Private/internal URLs not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocalBrain/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return Response.json({ error: `Failed to fetch: ${res.status}` }, { status: 500 })
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return Response.json({ error: 'Only HTML/text content supported' }, { status: 400 })
    }

    const html = await res.text()

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? sanitizeText(titleMatch[1]).trim() : parsedUrl.hostname

    const content = sanitizeText(html).slice(0, 10000)

    return Response.json({ title, content, url: parsedUrl.toString() })
  } catch (err) {
    return Response.json({ error: `Failed to fetch URL: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 500 })
  }
}
