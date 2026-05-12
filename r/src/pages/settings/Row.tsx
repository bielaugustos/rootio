import type { ReactNode } from 'react'

interface RowProps {
  label: string
  desc?: string
  children: ReactNode
  last?: boolean
  isMobile?: boolean
  fullWidth?: boolean
}

export function Row({ label, desc, children, last, isMobile, fullWidth }: RowProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile && fullWidth ? 'column' : 'row',
      alignItems: isMobile && fullWidth ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: isMobile && fullWidth ? 12 : 16,
      padding: isMobile ? '14px 16px' : '14px 20px',
      borderBottom: last ? 'none' : '1px solid var(--b2)',
      background: 'var(--secondary-background)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={fullWidth ? { flex: 1, minWidth: 0, width: isMobile && fullWidth ? '100%' : undefined } : { flexShrink: 0 }}>
        {children}
      </div>
    </div>
  )
}