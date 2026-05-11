import React from 'react'

export interface BadgeProps {
  label: string
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'habit' | 'goal' | 'task' | 'event'
  size?: 'default' | 'sm'
  id?: string
  selected?: boolean
  onClick?: () => void
  onChange?: (selected: boolean) => void
  icon?: React.ReactNode
  style?: React.CSSProperties
}

const variants: Record<string, React.CSSProperties> = {
  default:     { background: 'var(--main)',                 color: 'var(--main-foreground)' },
  secondary:   { background: 'var(--secondary-background)', color: 'var(--foreground)' },
  outline:     { background: 'transparent',                 color: 'var(--foreground)' },
  destructive: { background: 'var(--t1)',                   color: 'var(--background)' },
}

export function Badge({ label, variant = 'default', id, onClick, style }: BadgeProps) {
  return (
    <span
      data-comp-id={id}
      data-comp-type="badge"
      data-comp-editable={id ? 'true' : undefined}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        fontSize: 8,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        background: 'var(--background)',
        color: 'var(--t2)',
        ...variants[variant],
        ...style,
      }}
    >
      {label}
    </span>
  )
}