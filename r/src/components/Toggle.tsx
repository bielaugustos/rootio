import { useState } from 'react'

export interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
}

export function Toggle({ checked: initialChecked = false, onChange, disabled, id }: ToggleProps) {
  const [internalChecked, setInternalChecked] = useState(initialChecked)

  const isChecked = onChange ? initialChecked : internalChecked

  const handleClick = () => {
    if (disabled) return
    const newChecked = !isChecked
    if (onChange) {
      onChange(newChecked)
    } else {
      setInternalChecked(newChecked)
    }
  }

  return (
    <div
      data-comp-id={id}
      data-comp-type="toggle"
      data-comp-editable={id ? 'true' : undefined}
      className={`tog ${isChecked ? 'on' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      style={{
        width: 36,
        minWidth: 36,
        height: 20,
        boxSizing: 'border-box',
        borderRadius: 10,
        border: '2px solid var(--border)',
        background: isChecked ? 'var(--main)' : 'var(--bg4)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'all 0.15s',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        className="tog-thumb"
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--foreground)',
          position: 'absolute',
          top: 2,
          left: isChecked ? 18 : 4,
          transition: 'left 0.15s',
        }}
      />
    </div>
  )
}