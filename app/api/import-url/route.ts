import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return Response.json({ error: 'Missing URL' }, { status: 400 })
  }

  try {
    const parsedUrl = new URL(url)
    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LocalBrain/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return Response.json({ error: `Failed to fetch: ${res.status}` }, { status: 500 })
    }

    const html = await res.text()

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname

    let content = html
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

    content = content.slice(0, 10000)

    return Response.json({ title, content, url: parsedUrl.toString() })
  } catch (err) {
    return Response.json({ error: `Failed to fetch URL: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 500 })
  }
}
