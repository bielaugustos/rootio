// Sheet bottom — substitui Radix/shadcn Drawer em Vite puro
// Fecha ao clicar no overlay ou pressionar Escape
import { useEffect, useRef } from 'react'

export function NbDrawer({ open, onClose, children, title, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="nb-drawer-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div
        ref={ref}
        className={['nb-drawer', open ? 'nb-drawer--open' : '', className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
      >
        {/* Handle */}
        <div className="nb-drawer__handle" />
        {title && <h3 className="nb-drawer__title display">{title}</h3>}
        <div className="nb-drawer__body">{children}</div>
      </div>
    </div>
  )
}