'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#101012',
          color: '#fcfdff',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#11ff99', secondary: '#101012' },
        },
        error: {
          iconTheme: { primary: '#ff2047', secondary: '#101012' },
        },
      }}
    />
  )
}
