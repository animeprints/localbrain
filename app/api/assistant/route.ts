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
  const { content, mode, context } = body as {
    content?: string
    mode: string
    context?: string
  }

  if (!content || !mode) {
    return Response.json({ error: 'Missing content or mode' }, { status: 400 })
  }

  const supabase = await createClient()
  const creds = await getUserApiKey(supabase, user!.id)
  if (!creds) {
    return Response.json({ error: 'No LLM provider configured' }, { status: 400 })
  }

  const { provider, apiKey } = creds
  const truncatedContent = content.slice(0, 4000)

  const prompts: Record<string, string> = {
    'eli5': `Explain this concept like I'm 5 years old. Use simple words, analogies, and examples a child would understand. Make it fun and easy to grasp. Return ONLY the explanation.`,
    
    'practice-problems': `Create 5 practice problems from this content. Return a JSON array of objects with "question" (string), "hint" (string), "answer" (string), and "difficulty" ("easy"/"medium"/"hard"). Make problems that test understanding, not just memorization. Return ONLY the JSON array.`,
    
    'socratic-tutor': `You are a Socratic tutor. Based on this content, ask 3 guiding questions that help the student discover the answer themselves. Don't give the answer — ask questions that lead to it. Return a JSON array of objects with "question" (string) and "expectedInsight" (string - what the student should realize). Return ONLY the JSON array.`,
    
    'study-plan': `Create a 7-day study plan for this content. Return a JSON array of 7 objects, each with "day" (1-7), "topic" (string), "activities" (array of 2-3 strings), "duration" (string like "30 min"), and "tip" (string). Space out review sessions. Return ONLY the JSON array.`,
    
    'knowledge-gaps': `Analyze this content and identify knowledge gaps. Return a JSON object with: "strongTopics" (array of strings - well covered), "weakTopics" (array of strings - needs more study), "missingTopics" (array of strings - not covered at all), "recommendations" (array of 3-4 strings - specific actions to fill gaps). Return ONLY the JSON object.`,
    
    'compare-concepts': `Compare and contrast the key concepts in this content. Return a JSON array of comparison objects with "concept1" (string), "concept2" (string), "similarities" (array of strings), "differences" (array of strings), and "whenToUse" (string). Return ONLY the JSON array.`,
    
    'exam-prep': `Generate exam preparation material from this content. Return a JSON object with: "keyFormulas" (array of {formula: string, explanation: string}), "commonMistakes" (array of strings), "quickRecall" (array of {term: string, definition: string}), "practiceQuestions" (array of strings). Return ONLY the JSON object.`,
    
    'meeting-prep': `Prepare a meeting agenda from these notes. Return a JSON object with: "title" (string), "objective" (string), "agenda" (array of {topic: string, duration: string, owner: string}), "talkingPoints" (array of strings), "questionsToAsk" (array of strings), "actionItems" (array of strings). Return ONLY the JSON object.`,
    
    'email-summary': `Summarize this email content. Return a JSON object with: "subject" (string), "summary" (2-3 sentences), "keyPoints" (array of strings), "actionRequired" (boolean), "actions" (array of strings if any), "sentiment" (positive/neutral/negative), "priority" (high/medium/low). Return ONLY the JSON object.`,
    
    'swot-analysis': `Create a SWOT analysis from this content. Return a JSON object with: "strengths" (array of 3-4 strings), "weaknesses" (array of 3-4 strings), "opportunities" (array of 3-4 strings), "threats" (array of 3-4 strings), "recommendations" (array of 3 strings). Return ONLY the JSON object.`,
    
    'okr-tracker': `Extract OKRs from this content. Return a JSON array of objects with "objective" (string), "keyResults" (array of {result: string, progress: string, status: "on-track"/"at-risk"/"behind"}). Return ONLY the JSON array.`,
    
    'stakeholder-update': `Generate a stakeholder update from this content. Return a JSON object with: "executiveSummary" (2-3 sentences), "highlights" (array of strings), "risks" (array of strings), "nextSteps" (array of strings), "metrics" (array of {metric: string, value: string, trend: "up"/"down"/"stable"}). Return ONLY the JSON object.`,
    
    'risk-assessment': `Identify risks from this content. Return a JSON array of objects with "risk" (string), "likelihood" ("high"/"medium"/"low"), "impact" ("high"/"medium"/"low"), "mitigation" (string), "owner" (string). Return ONLY the JSON array.`,
    
    'rubric-generator': `Create a grading rubric from this content. Return a JSON array of criteria, each with "criterion" (string), "excellent" (string), "good" (string), "satisfactory" (string), "needsImprovement" (string), "points" (number). Return ONLY the JSON array.`,
    
    'concept-explanation': `Explain each key concept in this content in detail. Return a JSON array of objects with "concept" (string), "explanation" (2-3 paragraphs), "realWorldExample" (string), "commonMisconception" (string). Return ONLY the JSON array.`,
  }

  const prompt = prompts[mode]
  if (!prompt) {
    return Response.json({ error: `Unknown mode: ${mode}` }, { status: 400 })
  }

  let response: string
  try {
    const systemMsg = context
      ? `You are an expert ${mode.includes('meeting') || mode.includes('swot') || mode.includes('okr') || mode.includes('stakeholder') || mode.includes('risk') ? 'business consultant' : 'teacher and tutor'}. Context: ${context}. Output only what is requested.`
      : `You are an expert ${mode.includes('meeting') || mode.includes('swot') || mode.includes('okr') || mode.includes('stakeholder') || mode.includes('risk') ? 'business consultant' : 'teacher and tutor'}. Output only what is requested, no extra text.`
    response = await callLLM(
      [
        { role: 'system', content: systemMsg },
        { role: 'user', content: `${prompt}\n\nContent:\n${truncatedContent}` },
      ],
      { provider, apiKey }
    )
  } catch (err) {
    return Response.json({ error: `LLM error: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 500 })
  }

  let result: unknown = response

  if (!['eli5', 'concept-explanation'].includes(mode)) {
    const jsonMatch = response.match(/\{[\s\S]*\}/) || response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]) } catch { result = response }
    }
  }

  return Response.json({ result, mode })
}
