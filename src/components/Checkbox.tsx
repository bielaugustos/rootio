import { useState } from 'react'

export interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  backgroundColor?: string
  borderColor?: string
  checkColor?: string
}

export function Checkbox({ checked: initialChecked = false, onChange, disabled, id, backgroundColor, borderColor, checkColor }: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(initialChecked)

  const isChecked = onChange ? initialChecked : internalChecked

  const handleClick = () => {
    if (disabled) return
    if (onChange) {
      onChange(!isChecked)
    } else {
      setInternalChecked(!isChecked)
    }
  }

  return (
    <div
      data-comp-id={id}
      data-comp-type="checkbox"
      data-comp-editable={id ? 'true' : undefined}
      className={`cb ${isChecked ? 'on' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: `2px solid ${isChecked ? (borderColor || 'var(--main)') : 'var(--b3)'}`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: isChecked ? (backgroundColor || 'var(--main)') : 'var(--bg3)',
        transition: 'all 0.12s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {isChecked && (
        <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }}>
          <polyline points="2 6 5 9 10 3" stroke={checkColor || 'var(--main-foreground)'} strokeWidth="2" fill="none" />
        </svg>
      )}
    </div>
  )
}