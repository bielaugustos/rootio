import { useEffect, type ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children?: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'relative',
          background: 'var(--secondary-background)',
          border: 'var(--border-width, 2px) solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: 'var(--shadow-x, 4px) var(--shadow-y, 4px) 0 var(--border)',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          margin: '0 12px',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: 'var(--border-width, 2px) solid var(--border)',
        }}>
          {title && (
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--t1)',
              fontFamily: 'var(--font-sans)',
            }}>
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--secondary-background)',
              border: 'var(--border-width, 2px) solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--foreground)',
              boxShadow: '2px 2px 0 var(--border)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(2px,2px)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {children && (
          <div style={{
            padding: 20,
            color: 'var(--t2)',
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'var(--font-sans)',
            overflowY: 'auto',
            flex: 1,
          }}>
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            padding: '14px 16px',
            borderTop: 'var(--border-width, 2px) solid var(--border)',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
