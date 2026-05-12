import { useState, useEffect, useCallback } from 'react'

interface ToastData {
  id: number
  name: string
  pts: number
}

export function ToastIO() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    let nextId = 0

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { name: string; pts: number }
      const id = nextId++
      setToasts(prev => [...prev, { id, name: detail.name, pts: detail.pts }])
      setTimeout(() => remove(id), 2800)
    }

    window.addEventListener('habit-completed', handler)
    return () => window.removeEventListener('habit-completed', handler)
  }, [remove])

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes toastIoSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes toastIoFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: 'var(--main)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-base)',
              boxShadow: 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
              padding: '10px 16px',
              fontWeight: 500,
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              color: 'var(--main-foreground)',
              animation: 'toastIoSlideUp 0.25s ease',
              whiteSpace: 'nowrap',
            }}
          >
            ⚡ +{t.pts} IO · {t.name}
          </div>
        ))}
      </div>
    </>
  )
}
