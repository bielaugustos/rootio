import type { ReactNode } from 'react'

export interface ButtonProps {
  label?: string
  variant?: 'default' | 'neutral' | 'ghost' | 'destructive' | 'reverse' | 'no-shadow'
  size?: 'sm' | 'default' | 'lg' | 'icon' | 'tiny'
  disabled?: boolean
  id?: string
  onClick?: () => void
  children?: ReactNode
  style?: React.CSSProperties
}

const variantStyles: Record<string, { background: string; color: string; boxShadow: string }> = {
  default:     { background: 'var(--main)',                  color: 'var(--main-foreground)',       boxShadow: 'var(--shadow-x, 4px) var(--shadow-y, 4px) 0 var(--border)' },
  neutral:     { background: 'var(--secondary-background)',  color: 'var(--foreground)',             boxShadow: 'var(--shadow-x, 4px) var(--shadow-y, 4px) 0 var(--border)' },
  ghost:       { background: 'var(--secondary-background)',  color: 'var(--foreground)',             boxShadow: 'var(--shadow-x, 4px) var(--shadow-y, 4px) 0 var(--b2)' },
  destructive: { background: 'var(--destructive)',           color: 'var(--destructive-foreground)', boxShadow: 'var(--shadow-x, 4px) var(--shadow-y, 4px) 0 #ff6b6b' },
  reverse:     { background: 'var(--main)',                  color: 'var(--main-foreground)',        boxShadow: 'none' },
  'no-shadow': { background: 'var(--main)',                  color: 'var(--main-foreground)',        boxShadow: 'none' },
}

const sizeStyles: Record<string, { height: string; padding: string; fontSize: string; width?: string }> = {
  sm:      { height: '32px', padding: '0 12px', fontSize: '13px' },
  default: { height: '36px', padding: '0 18px', fontSize: '14px' },
  lg:      { height: '40px', padding: '0 32px', fontSize: '16px' },
  icon:    { height: '40px', padding: '0',      fontSize: '14px', width: '40px' },
  tiny:    { height: '28px', padding: '0',      fontSize: '14px', width: '28px' },
}

export function Button({
  label, variant = 'default', size = 'default',
  disabled, id, onClick, children, style: styleProp,
}: ButtonProps) {
  const v = variantStyles[variant]
  const s = sizeStyles[size]
  const isReverse = variant === 'reverse'

  return (
    <button
      data-comp-id={id}
      data-comp-type="button"
      data-comp-editable={id ? 'true' : undefined}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={e => {
        if (disabled) return
        const el = e.currentTarget
        if (isReverse) {
          el.style.transform = 'translate(-4px, -4px)'
          el.style.boxShadow = 'var(--shadow-x, 4px) var(--shadow-y, 4px) 0 var(--border)'
        } else {
          el.style.transform = 'translate(4px, 4px)'
          el.style.boxShadow = 'none'
        }
      }}
      onMouseLeave={e => {
        if (disabled) return
        const el = e.currentTarget
        el.style.transform = 'none'
        el.style.boxShadow = v.boxShadow
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        height: s.height,
        width: s.width,
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        background: v.background,
        color: v.color,
        border: 'var(--border-width, 2px) solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: v.boxShadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        ...styleProp,
      }}
    >
      {children ?? label}
    </button>
  )
}