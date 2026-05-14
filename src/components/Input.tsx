import { useState, useEffect } from 'react'

export interface InputProps {
  placeholder?: string
  label?: string
  value?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  disabled?: boolean
  error?: string
  id?: string
  style?: React.CSSProperties
  onChange?: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function Input({
  placeholder,
  label,
  value = '',
  type = 'text',
  disabled,
  error,
  id,
  style,
  onChange,
  onKeyDown,
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const [internal, setInternal] = useState(value)

  useEffect(() => {
    setInternal(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternal(e.target.value)
    onChange?.(e.target.value)
  }

  return (
    <div
      data-comp-id={id}
      data-comp-type="input"
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
      <input
        id={id}
        type={type}
        value={internal}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        style={{
          height: 40,
          padding: '0 12px',
          fontSize: 14,
          fontFamily: 'var(--font-sans)',
          fontWeight: 400,
          background: 'var(--secondary-background)',
          color: 'var(--foreground)',
          borderWidth: 'var(--border-width, 2px)',
          borderStyle: 'solid',
          borderColor: error ? 'var(--destructive)' : focused ? 'var(--main)' : 'var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: focused
            ? `var(--shadow-x, 4px) var(--shadow-y, 4px) 0 ${error ? 'var(--destructive)' : 'var(--foreground)'}`
            : 'none',
          outline: 'none',
          transition: 'box-shadow 0.2s ease-out',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          width: '100%',
          ...style,
        }}
      />
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
