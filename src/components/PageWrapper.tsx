import { type ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  maxWidth?: number
}

export function PageWrapper({ children, maxWidth = 900 }: PageWrapperProps) {
  return (
    <main style={{
      maxWidth,
      margin: '0 auto',
      padding: 'clamp(52px, 6vw, 64px) clamp(12px, 3vw, 32px) 80px',
      width: '100%',
      boxSizing: 'border-box',
      minWidth: 0,
      overflowX: 'hidden',
    }}>
      {children}
    </main>
  )
}
