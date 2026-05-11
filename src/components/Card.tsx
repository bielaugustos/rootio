import type { ReactNode } from 'react'

export interface CardProps {
  title?: string
  content?: string
  id?: string
  children?: ReactNode
}

export function Card({ title, content, id, children }: CardProps) {
  return (
    <div
      data-comp-id={id}
      data-comp-type="card"
      data-comp-editable={id ? 'true' : undefined}
      style={{
        background: 'var(--secondary-background)',
        color: 'var(--foreground)',
        border: 'var(--border-width) solid var(--border)',
        boxShadow: 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
        borderRadius: 'var(--radius-base)',
        padding: 'var(--spacing)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {title && (
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>
          {title}
        </h3>
      )}
      {content && (
        <p style={{ color: 'var(--t2)', lineHeight: 1.6 }}>
          {content}
        </p>
      )}
      {children}
    </div>
  )
}
