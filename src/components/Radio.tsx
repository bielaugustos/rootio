import { useState } from 'react'

export interface RadioProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  name?: string
}

export function Radio({ checked: initialChecked = false, onChange, disabled, id, name }: RadioProps) {
  const [internalChecked, setInternalChecked] = useState(initialChecked)

  const isChecked = onChange ? initialChecked : internalChecked

  const handleClick = () => {
    if (disabled || isChecked) return
    if (onChange) {
      onChange(true)
    } else {
      setInternalChecked(true)
    }
  }

  return (
    <div
      data-comp-id={id}
      data-comp-type="radio"
      data-comp-editable={id ? 'true' : undefined}
      data-r={name}
      className={`radio ${isChecked ? 'on' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      style={{
        width: 17,
        height: 17,
        borderRadius: '50%',
        border: `2px solid ${isChecked ? 'var(--main)' : 'var(--b3)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'var(--bg3)',
        transition: 'all 0.12s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        className="rdot"
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--main)',
          opacity: isChecked ? 1 : 0,
          transition: 'opacity 0.12s',
        }}
      />
    </div>
  )
}