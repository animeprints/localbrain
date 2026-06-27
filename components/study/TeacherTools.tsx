'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface TeacherToolsProps {
  content: string
}

type ToolMode = 'eli5' | 'practice-problems' | 'socratic-tutor' | 'study-plan' | 'knowledge-gaps' | 'compare-concepts' | 'exam-prep' | 'rubric-generator' | 'concept-explanation'

const tools: Array<{ id: ToolMode; label: string; icon: string }> = [
  { id: 'eli5', label: 'ELI5', icon: '5' },
  { id: 'practice-problems', label: 'Problems', icon: '?' },
  { id: 'socratic-tutor', label: 'Tutor', icon: '?' },
  { id: 'study-plan', label: 'Study Plan', icon: 'P' },
  { id: 'knowledge-gaps', label: 'Gaps', icon: '!' },
  { id: 'compare-concepts', label: 'Compare', icon: '<>' },
  { id: 'exam-prep', label: 'Exam Prep', icon: 'E' },
  { id: 'rubric-generator', label: 'Rubric', icon: 'R' },
  { id: 'concept-explanation', label: 'Explain', icon: 'i' },
]

export default function TeacherTools({ content }: TeacherToolsProps) {
  const [activeTool, setActiveTool] = useState<ToolMode | null>(null)
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const runTool = async (mode: ToolMode) => {
    setActiveTool(mode)
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data.result)
        toast.success('Generated')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed')
      }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const renderResult = () => {
    if (!result) return null

    if (activeTool === 'eli5' || activeTool === 'concept-explanation') {
      return (
        <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] text-sm text-[rgba(252,253,255,0.86)] whitespace-pre-wrap leading-relaxed">
          {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
        </div>
      )
    }

    if (activeTool === 'practice-problems' && Array.isArray(result)) {
      const q = result[currentQuestion] as { question: string; hint: string; answer: string; difficulty: string }
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a1a4a5]">Question {currentQuestion + 1} of {result.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#101012] text-[#a1a4a5]">{q.difficulty}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
            <div className="text-sm text-[#fcfdff] mb-3">{q.question}</div>
            <details className="text-xs text-[#464a4d]">
              <summary className="cursor-pointer hover:text-[#a1a4a5]">Hint</summary>
              <p className="mt-1 text-[#a1a4a5]">{q.hint}</p>
            </details>
            <details className="text-xs text-[#464a4d] mt-2">
              <summary className="cursor-pointer hover:text-[#a1a4a5]">Answer</summary>
              <p className="mt-1 text-[#11ff99]">{q.answer}</p>
            </details>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>Prev</Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentQuestion(Math.min(result.length - 1, currentQuestion + 1))} disabled={currentQuestion === result.length - 1}>Next</Button>
          </div>
        </div>
      )
    }

    if (activeTool === 'socratic-tutor' && Array.isArray(result)) {
      const q = result[currentQuestion] as { question: string; expectedInsight: string }
      return (
        <div className="space-y-3">
          <div className="text-xs text-[#a1a4a5]">Question {currentQuestion + 1} of {result.length}</div>
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
            <div className="text-sm text-[#fcfdff] mb-3">{q.question}</div>
            <details className="text-xs text-[#464a4d]">
              <summary className="cursor-pointer hover:text-[#a1a4a5]">Reveal insight</summary>
              <p className="mt-1 text-[#3b9eff]">{q.expectedInsight}</p>
            </details>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>Prev</Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentQuestion(Math.min(result.length - 1, currentQuestion + 1))} disabled={currentQuestion === result.length - 1}>Next</Button>
          </div>
        </div>
      )
    }

    if (activeTool === 'study-plan' && Array.isArray(result)) {
      return (
        <div className="space-y-2">
          {result.map((day: { day: number; topic: string; activities: string[]; duration: string; tip: string }, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#3b9eff]">Day {day.day}</span>
                <span className="text-xs text-[#464a4d]">{day.duration}</span>
              </div>
              <div className="text-sm text-[#fcfdff] mb-1">{day.topic}</div>
              <ul className="text-xs text-[#a1a4a5] space-y-0.5">
                {day.activities.map((a: string, j: number) => <li key={j}>• {a}</li>)}
              </ul>
              <div className="text-xs text-[#ffc53d] mt-1">Tip: {day.tip}</div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTool === 'knowledge-gaps' && typeof result === 'object' && result !== null) {
      const r = result as { strongTopics: string[]; weakTopics: string[]; missingTopics: string[]; recommendations: string[] }
      return (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[rgba(17,255,153,0.05)] border border-[rgba(17,255,153,0.14)]">
            <div className="text-xs font-medium text-[#11ff99] mb-1">Strong Topics</div>
            <div className="flex flex-wrap gap-1">{r.strongTopics?.map((t: string, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(17,255,153,0.1)] text-[#11ff99]">{t}</span>)}</div>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(255,197,61,0.05)] border border-[rgba(255,197,61,0.14)]">
            <div className="text-xs font-medium text-[#ffc53d] mb-1">Weak Topics</div>
            <div className="flex flex-wrap gap-1">{r.weakTopics?.map((t: string, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,197,61,0.1)] text-[#ffc53d]">{t}</span>)}</div>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(255,32,71,0.05)] border border-[rgba(255,32,71,0.14)]">
            <div className="text-xs font-medium text-[#ff2047] mb-1">Missing Topics</div>
            <div className="flex flex-wrap gap-1">{r.missingTopics?.map((t: string, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,32,71,0.1)] text-[#ff2047]">{t}</span>)}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
            <div className="text-xs font-medium text-[#a1a4a5] mb-1">Recommendations</div>
            <ul className="text-xs text-[#a1a4a5] space-y-1">{r.recommendations?.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
          </div>
        </div>
      )
    }

    if (activeTool === 'rubric-generator' && Array.isArray(result)) {
      return (
        <div className="space-y-2">
          {result.map((r: { criterion: string; excellent: string; good: string; satisfactory: string; needsImprovement: string; points: number }, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#fcfdff] font-medium">{r.criterion}</span>
                <span className="text-xs text-[#3b9eff]">{r.points} pts</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-[#11ff99]">Excellent: {r.excellent}</div>
                <div className="text-[#3b9eff]">Good: {r.good}</div>
                <div className="text-[#ffc53d]">Satisfactory: {r.satisfactory}</div>
                <div className="text-[#ff2047]">Needs Work: {r.needsImprovement}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTool === 'compare-concepts' && Array.isArray(result)) {
      return (
        <div className="space-y-2">
          {result.map((c: { concept1: string; concept2: string; similarities: string[]; differences: string[]; whenToUse: string }, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="text-sm text-[#fcfdff] font-medium mb-2">{c.concept1} vs {c.concept2}</div>
              <div className="text-xs text-[#11ff99] mb-1">Similar: {c.similarities?.join(', ')}</div>
              <div className="text-xs text-[#ff2047] mb-1">Different: {c.differences?.join(', ')}</div>
              <div className="text-xs text-[#3b9eff]">When to use: {c.whenToUse}</div>
            </div>
          ))}
        </div>
      )
    }

    return <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] text-sm text-[rgba(252,253,255,0.86)] whitespace-pre-wrap">{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => { setCurrentQuestion(0); runTool(tool.id) }}
            disabled={loading}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTool === tool.id
                ? 'bg-[#101012] text-[#fcfdff] border border-[rgba(255,255,255,0.14)]'
                : 'text-[#464a4d] hover:text-[#a1a4a5] hover:bg-[#0a0a0c]'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-[#464a4d]">
          <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
          <span className="ml-1">Thinking...</span>
        </div>
      )}

      {activeTool !== null && result !== null && <>{renderResult()}</>}
    </div>
  )
}
