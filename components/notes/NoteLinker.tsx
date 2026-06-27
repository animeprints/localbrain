'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

interface NoteLinkerProps {
  content: string
  notes: Array<{ id: string; title: string }>
  onNavigate: (noteId: string) => void
}

export default function NoteLinker({ content, notes, onNavigate }: NoteLinkerProps) {
  const [showLinker, setShowLinker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const wikiLinks = useCallback(() => {
    const regex = /\[\[([^\]]+)\]\]/g
    const matches: Array<{ title: string; start: number; end: number }> = []
    let match
    while ((match = regex.exec(content)) !== null) {
      matches.push({ title: match[1], start: match.index, end: match.index + match[0].length })
    }
    return matches
  }, [content])

  const links = wikiLinks()

  const matchedNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10)

  const insertLink = (title: string) => {
    navigator.clipboard.writeText(`[[${title}]]`)
    toast.success(`Copied [[${title}]] — paste into your note`)
    setShowLinker(false)
    setSearchQuery('')
  }

  const linkedNotes = links
    .map((link) => {
      const note = notes.find((n) => n.title.toLowerCase() === link.title.toLowerCase())
      return { ...link, note }
    })
    .filter((l) => l.note)

  if (links.length === 0 && !showLinker) {
    return (
      <button
        onClick={() => setShowLinker(true)}
        className="text-xs text-[#464a4d] hover:text-[#3b9eff] transition-colors"
      >
        + Link note
      </button>
    )
  }

  return (
    <div className="relative">
      {links.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {linkedNotes.map((link, i) => (
            <button
              key={i}
              onClick={() => link.note && onNavigate(link.note.id)}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs transition-colors ${
                link.note
                  ? 'bg-[rgba(59,158,255,0.1)] text-[#3b9eff] hover:bg-[rgba(59,158,255,0.2)]'
                  : 'bg-[rgba(255,197,61,0.1)] text-[#ffc53d]'
              }`}
            >
              {link.title}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowLinker(!showLinker)}
        className="text-xs text-[#464a4d] hover:text-[#3b9eff] transition-colors"
      >
        {links.length > 0 ? '+ More links' : '+ Link note'}
      </button>

      {showLinker && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-lg p-2 z-50 animate-fade-in-up shadow-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes to link..."
            className="w-full bg-[#06060a] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#3b9eff] mb-2"
            autoFocus
          />
          <div className="max-h-32 overflow-auto space-y-0.5">
            {matchedNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => insertLink(note.title)}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-[#a1a4a5] hover:bg-[#101012] hover:text-[#fcfdff] transition-colors"
              >
                {note.title}
              </button>
            ))}
            {matchedNotes.length === 0 && searchQuery && (
              <div className="text-xs text-[#464a4d] px-2 py-1">No notes found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
