'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface AssistantToolsProps {
  content: string
}

type ToolMode = 'meeting-prep' | 'email-summary' | 'swot-analysis' | 'okr-tracker' | 'stakeholder-update' | 'risk-assessment'

const tools: Array<{ id: ToolMode; label: string }> = [
  { id: 'meeting-prep', label: 'Meeting Prep' },
  { id: 'email-summary', label: 'Email Summary' },
  { id: 'swot-analysis', label: 'SWOT' },
  { id: 'okr-tracker', label: 'OKRs' },
  { id: 'stakeholder-update', label: 'Stakeholder' },
  { id: 'risk-assessment', label: 'Risks' },
]

export default function AssistantTools({ content }: AssistantToolsProps) {
  const [activeTool, setActiveTool] = useState<ToolMode | null>(null)
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

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

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    toast.success('Copied')
  }

  const renderResult = () => {
    if (!result) return null

    if (activeTool === 'meeting-prep' && typeof result === 'object') {
      const r = result as { title: string; objective: string; agenda: Array<{ topic: string; duration: string; owner: string }>; talkingPoints: string[]; questionsToAsk: string[]; actionItems: string[] }
      return (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
            <div className="text-sm text-[#fcfdff] font-medium mb-1">{r.title}</div>
            <div className="text-xs text-[#a1a4a5]">{r.objective}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
            <div className="text-xs font-medium text-[#3b9eff] mb-2">Agenda</div>
            {r.agenda?.map((item: { topic: string; duration: string; owner: string }, i: number) => (
              <div key={i} className="flex justify-between text-xs text-[#a1a4a5] mb-1">
                <span>{item.topic}</span>
                <span className="text-[#464a4d]">{item.duration} • {item.owner}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="text-xs font-medium text-[#11ff99] mb-1">Talking Points</div>
              <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.talkingPoints?.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
            </div>
            <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="text-xs font-medium text-[#ffc53d] mb-1">Questions</div>
              <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.questionsToAsk?.map((t: string, i: number) => <li key={i}>? {t}</li>)}</ul>
            </div>
          </div>
        </div>
      )
    }

    if (activeTool === 'email-summary' && typeof result === 'object') {
      const r = result as { summary: string; keyPoints: string[]; actionRequired: boolean; actions: string[]; sentiment: string; priority: string }
      return (
        <div className="space-y-3">
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${r.sentiment === 'positive' ? 'bg-[rgba(17,255,153,0.1)] text-[#11ff99]' : r.sentiment === 'negative' ? 'bg-[rgba(255,32,71,0.1)] text-[#ff2047]' : 'bg-[#101012] text-[#a1a4a5]'}`}>{r.sentiment}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${r.priority === 'high' ? 'bg-[rgba(255,32,71,0.1)] text-[#ff2047]' : r.priority === 'medium' ? 'bg-[rgba(255,197,61,0.1)] text-[#ffc53d]' : 'bg-[#101012] text-[#a1a4a5]'}`}>{r.priority} priority</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] text-sm text-[rgba(252,253,255,0.86)]">{r.summary}</div>
          <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
            <div className="text-xs font-medium text-[#a1a4a5] mb-1">Key Points</div>
            <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.keyPoints?.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
          </div>
          {r.actionRequired && (
            <div className="p-3 rounded-lg bg-[rgba(255,197,61,0.05)] border border-[rgba(255,197,61,0.14)]">
              <div className="text-xs font-medium text-[#ffc53d] mb-1">Actions Required</div>
              <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.actions?.map((t: string, i: number) => <li key={i}>→ {t}</li>)}</ul>
            </div>
          )}
        </div>
      )
    }

    if (activeTool === 'swot-analysis' && typeof result === 'object') {
      const r = result as { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-[rgba(17,255,153,0.05)] border border-[rgba(17,255,153,0.14)]">
            <div className="text-xs font-medium text-[#11ff99] mb-1">Strengths</div>
            <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.strengths?.map((t: string, i: number) => <li key={i}>✓ {t}</li>)}</ul>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(255,32,71,0.05)] border border-[rgba(255,32,71,0.14)]">
            <div className="text-xs font-medium text-[#ff2047] mb-1">Weaknesses</div>
            <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.weaknesses?.map((t: string, i: number) => <li key={i}>✗ {t}</li>)}</ul>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(59,158,255,0.05)] border border-[rgba(59,158,255,0.14)]">
            <div className="text-xs font-medium text-[#3b9eff] mb-1">Opportunities</div>
            <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.opportunities?.map((t: string, i: number) => <li key={i}>↑ {t}</li>)}</ul>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(255,197,61,0.05)] border border-[rgba(255,197,61,0.14)]">
            <div className="text-xs font-medium text-[#ffc53d] mb-1">Threats</div>
            <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.threats?.map((t: string, i: number) => <li key={i}>⚠ {t}</li>)}</ul>
          </div>
        </div>
      )
    }

    if (activeTool === 'okr-tracker' && Array.isArray(result)) {
      return (
        <div className="space-y-2">
          {result.map((okr: { objective: string; keyResults: Array<{ result: string; progress: string; status: string }> }, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="text-sm text-[#fcfdff] font-medium mb-2">{okr.objective}</div>
              {okr.keyResults?.map((kr: { result: string; progress: string; status: string }, j: number) => (
                <div key={j} className="flex items-center gap-2 text-xs mb-1">
                  <span className={`w-2 h-2 rounded-full ${kr.status === 'on-track' ? 'bg-[#11ff99]' : kr.status === 'at-risk' ? 'bg-[#ffc53d]' : 'bg-[#ff2047]'}`} />
                  <span className="text-[#a1a4a5]">{kr.result}</span>
                  <span className="text-[#464a4d] ml-auto">{kr.progress}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    }

    if (activeTool === 'risk-assessment' && Array.isArray(result)) {
      return (
        <div className="space-y-2">
          {result.map((risk: { risk: string; likelihood: string; impact: string; mitigation: string }, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-[#fcfdff]">{risk.risk}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${risk.likelihood === 'high' ? 'bg-[rgba(255,32,71,0.1)] text-[#ff2047]' : risk.likelihood === 'medium' ? 'bg-[rgba(255,197,61,0.1)] text-[#ffc53d]' : 'bg-[rgba(17,255,153,0.1)] text-[#11ff99]'}`}>{risk.likelihood}</span>
              </div>
              <div className="text-xs text-[#a1a4a5]">Mitigation: {risk.mitigation}</div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTool === 'stakeholder-update' && typeof result === 'object') {
      const r = result as { executiveSummary: string; highlights: string[]; risks: string[]; nextSteps: string[] }
      return (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] text-sm text-[rgba(252,253,255,0.86)]">{r.executiveSummary}</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="text-xs font-medium text-[#11ff99] mb-1">Highlights</div>
              <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.highlights?.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
            </div>
            <div className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="text-xs font-medium text-[#ffc53d] mb-1">Risks</div>
              <ul className="text-xs text-[#a1a4a5] space-y-0.5">{r.risks?.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
            </div>
          </div>
        </div>
      )
    }

    return <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] text-sm text-[rgba(252,253,255,0.86)] whitespace-pre-wrap">{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => runTool(tool.id)}
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
        {result !== null && (
          <Button variant="ghost" size="sm" onClick={copyResult}>Copy</Button>
        )}
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
