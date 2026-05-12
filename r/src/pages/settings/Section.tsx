import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 500, color: 'var(--t3)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
      }}>
        {title}
      </h2>
      <div style={{
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        overflow: 'hidden',
        boxShadow: '4px 4px 0 var(--border)',
      }}>
        {children}
      </div>
    </section>
  )
}
