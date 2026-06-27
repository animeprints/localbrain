'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface UrlImporterProps {
  onImport: (title: string, content: string) => void
}

export default function UrlImporter({ onImport }: UrlImporterProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const importUrl = async () => {
    if (!url.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/import-url?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()
        onImport(data.title, `# ${data.title}\n\nSource: ${data.url}\n\n${data.content}`)
        setUrl('')
        setShow(false)
        toast.success('Content imported')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to import')
      }
    } catch { toast.error('Failed to import') } finally { setLoading(false) }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setShow(!show)}>
        Import URL
      </Button>

      {show && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-lg p-3 z-50 animate-fade-in-up shadow-xl">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && importUrl()}
            placeholder="https://example.com/article"
            className="w-full bg-[#06060a] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff] mb-2"
            autoFocus
          />
          <Button onClick={importUrl} disabled={loading || !url.trim()} size="sm" className="w-full">
            {loading ? 'Importing...' : 'Import Content'}
          </Button>
        </div>
      )}
    </div>
  )
}
