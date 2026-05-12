import { useEffect } from 'react'
import type { ToastVariant, ToastItem } from './useToast'

const variantStyles: Record<ToastVariant, { background: string; color: string; border: string; shadow: string }> = {
  default: {
    background: 'var(--secondary-background)',
    color: 'var(--foreground)',
    border: 'var(--border)',
    shadow: 'var(--shadow-color)',
  },
  success: {
    background: '#d4edda',
    color: '#155724',
    border: '#155724',
    shadow: '#155724',
  },
  error: {
    background: 'var(--destructive)',
    color: '#fff',
    border: 'var(--destructive)',
    shadow: '#7a1a00',
  },
  warning: {
    background: 'var(--main)',
    color: 'var(--main-foreground)',
    border: 'var(--border)',
    shadow: 'var(--shadow-color)',
  },
}

function ToastElement({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const v = variantStyles[item.variant]

  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), 3500)
    return () => clearTimeout(t)
  }, [item.id, onRemove])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        background: v.background,
        color: v.color,
        border: `var(--border-width, 2px) solid ${v.border}`,
        borderRadius: 'var(--radius-base)',
        boxShadow: `var(--shadow-x, 4px) var(--shadow-y, 4px) 0 ${v.shadow}`,
        fontSize: 14,
        fontWeight: 400,
        fontFamily: 'var(--font-sans)',
        minWidth: 260,
        maxWidth: 380,
        animation: 'slideIn 0.2s ease',
      }}
    >
      <span>{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          color: v.color,
          opacity: 0.7,
          padding: 0,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: 80,
        right: 20,
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {toasts.map(t => (
          <ToastElement key={t.id} item={t} onRemove={onRemove} />
        ))}
      </div>
    </>
  )
}


