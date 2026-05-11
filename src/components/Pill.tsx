import { useState } from 'react'

export interface PillProps {
  label: string
  variant?: 'default' | 'habit' | 'goal' | 'task' | 'event'
  size?: 'default' | 'sm'
  id?: string
  selected?: boolean
  onClick?: () => void
  onChange?: (selected: boolean) => void
  icon?: React.ReactNode
  style?: React.CSSProperties
  disableHover?: boolean
}

const variants: Record<string, { bg: string; color: string; border: string; shadow: string }> = {
  default: { bg: 'var(--secondary-background)', color: 'var(--t1)',        border: 'var(--border)', shadow: 'var(--border)' },
  habit:   { bg: 'var(--c-habit)',               color: 'var(--c-habit-t)', border: 'var(--c-habit-b)', shadow: 'var(--c-habit-b)' },
  goal:    { bg: 'var(--c-goal)',                color: 'var(--c-goal-t)',  border: 'var(--c-goal-b)', shadow: 'var(--c-goal-b)' },
  task:    { bg: 'var(--c-task)',                color: 'var(--c-task-t)',  border: 'var(--c-task-b)', shadow: 'var(--c-task-b)' },
  event:   { bg: 'var(--c-event)',               color: 'var(--c-event-t)', border: 'var(--c-event-b)', shadow: 'var(--c-event-b)' },
}

export function Pill({
  label, variant = 'default', size = 'default',
  id, selected: externalSelected, onClick, onChange, icon, style, disableHover,
}: PillProps) {
  const [internalSelected, setInternalSelected] = useState(false)
  const v = variants[variant]

  const isSelected = externalSelected !== undefined ? externalSelected : internalSelected

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      const next = !isSelected
      setInternalSelected(next)
      onChange?.(next)
    }
  }

  const iconSize = size === 'sm' ? 12 : 14

  return (
    <button
      data-comp-id={id}
      data-comp-type="pill"
      data-comp-editable={id ? 'true' : undefined}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        // Same sizing as the filter buttons in HabitsPage
        padding: size === 'sm' ? '5px 12px' : '5px 14px',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
        // Wallet-style: inactive = elevated, active = pressed
        border: `2px solid ${isSelected ? 'var(--border)' : v.border}`,
        background: isSelected ? v.bg : v.bg,
        color: v.color,
        boxShadow: isSelected ? 'none' : `var(--shadow-x) var(--shadow-y) 0 ${v.shadow}`,
        transform: isSelected ? 'translate(var(--shadow-x), var(--shadow-y))' : 'none',
        transition: 'all 0.1s',
        ...style,
      }}
      onMouseEnter={disableHover ? undefined : e => {
        if (!isSelected && !style?.borderColor) {
          e.currentTarget.style.borderColor = 'var(--border)'
        }
      }}
      onMouseLeave={disableHover ? undefined : e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = v.border
        }
      }}
    >
      {icon && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: iconSize, height: iconSize, flexShrink: 0,
        }}>
          {icon}
        </span>
      )}
      {label}
    </button>
  )
}
