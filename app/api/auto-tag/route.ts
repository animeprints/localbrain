import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'
import { callLLM } from '@/lib/llm/adapter'
import type { ProviderName } from '@/lib/llm/adapter'

async function getUserApiKey(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<{ provider: ProviderName; apiKey: string } | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('provider_configs, default_provider')
    .eq('user_id', userId)
    .single()
  if (!data) return null
  const configs = Array.isArray(data.provider_configs) ? data.provider_configs : []
  const active = configs.find((c: { enabled?: boolean; apiKey?: string }) => c.enabled && c.apiKey)
  if (!active) return null
  try { return { provider: active.name || data.default_provider, apiKey: decrypt(active.apiKey) } }
  catch { return null }
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { content, existingTags } = body as { content: string; existingTags?: string[] }

  if (!content) {
    return Response.json({ error: 'Missing content' }, { status: 400 })
  }

  const supabase = await createClient()
  const creds = await getUserApiKey(supabase, user!.id)
  if (!creds) {
    return Response.json({ tags: [] })
  }

  try {
    const response = await callLLM(
      [
        {
          role: 'system',
          content: `Suggest 2-5 tags for this note. Return ONLY a JSON array of strings. Tags should be short (1-2 words), lowercase. Avoid duplicates. ${existingTags?.length ? `Existing tags to consider: ${existingTags.join(', ')}` : ''}`,
        },
        { role: 'user', content: content.slice(0, 2000) },
      ],
      creds
    )

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const tags = JSON.parse(jsonMatch[0])
      return Response.json({ tags: tags.filter((t: string) => typeof t === 'string').slice(0, 5) })
    }
    return Response.json({ tags: [] })
  } catch {
    return Response.json({ tags: [] })
  }
}
