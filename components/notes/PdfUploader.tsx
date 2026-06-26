'use client'

import { useCallback, useRef, useState } from 'react'
import Button from '@/components/ui/Button'

interface PdfUploaderProps {
  onUpload: (content: string, filename: string) => void
}

export default function PdfUploader({ onUpload }: PdfUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parsePdf = useCallback(async (file: File) => {
    setParsing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = (content.items as Array<{ str: string }>).map((item) => item.str).join(' ')
        text += pageText + '\n\n'
      }

      onUpload(text.trim(), file.name)
    } catch (err) {
      console.error('PDF parse error:', err)
    } finally {
      setParsing(false)
    }
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') {
      parsePdf(file)
    }
  }, [parsePdf])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parsePdf(file)
  }, [parsePdf])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
        dragOver
          ? 'border-[#3b9eff] bg-[rgba(59,158,255,0.05)]'
          : 'border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.24)]'
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="text-[#a1a4a5] text-sm">
        {parsing ? (
          <span>Parsing PDF...</span>
        ) : (
          <>
            <span className="text-[#3b9eff]">Drop a PDF here</span> or click to browse
          </>
        )}
      </div>
    </div>
  )
}
