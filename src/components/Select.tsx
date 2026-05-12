import { useState } from 'react'

export interface SelectOption {
  value: string
  label: string
  type?: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  id?: string
  onChange?: (value: string) => void
}

export function Select({
  options,
  value = '',
  label,
  placeholder = 'Selecionar...',
  disabled,
  error,
  id,
  onChange,
}: SelectProps) {
  const [focused, setFocused] = useState(false)
  const [internal, setInternal] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInternal(e.target.value)
    onChange?.(e.target.value)
  }

  return (
    <div
      data-comp-id={id}
      data-comp-type="select"
      data-comp-editable={id ? 'true' : undefined}
      style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      {label && (
        <label style={{
          fontSize: 13,
          fontWeight: 400,
          color: 'var(--t1)',
          fontFamily: 'var(--font-sans)',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          value={internal}
          disabled={disabled}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            height: 40,
            padding: '0 36px 0 12px',
            fontSize: 14,
            fontFamily: 'var(--font-sans)',
            background: 'var(--secondary-background)',
            color: internal ? 'var(--foreground)' : 'var(--t3)',
            border: `var(--border-width, 2px) solid ${error ? 'var(--destructive)' : focused ? 'var(--main)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-base)',
            boxShadow: focused
              ? `var(--shadow-x, 4px) var(--shadow-y, 4px) 0 ${error ? 'var(--destructive)' : 'var(--main)'}`
               : `var(--shadow-x, 4px) var(--shadow-y, 4px) 0 var(--shadow-color)`,
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            width: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Arrow icon */}
        <div style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--t2)',
          fontSize: 12,
        }}>
          ▼
        </div>
      </div>
      {error && (
        <span style={{
          fontSize: 12,
          color: 'var(--destructive)',
          fontFamily: 'var(--font-sans)',
        }}>
          {error}
        </span>
      )}
    </div>
  )
}
