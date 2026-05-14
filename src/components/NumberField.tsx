import { useState, useRef, useEffect, useId, forwardRef, type ChangeEvent, type KeyboardEvent } from "react"

export interface NumberFieldProps {
  label?: string
  value?: number | null
  defaultValue?: number | null
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  spinner?: boolean
  size?: "md" | "sm"
  placeholder?: string
  helperText?: string
  error?: boolean | string
  disabled?: boolean
  readOnly?: boolean
  name?: string
  prefix?: string
  suffix?: string
  className?: string
  focusColor?: string
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    { label, value, defaultValue = null, onChange,
      min, max, step = 1, spinner = true,
      size = "md", placeholder, helperText, error,
      disabled = false, readOnly = false,
      name, prefix, suffix, className, focusColor }, ref
  ) {
    const id = useId()
    const isControlled = value !== undefined
    const [internal, setInternal] = useState<number | null>(defaultValue)
    const current = isControlled ? value! : internal
    const [focused, setFocused] = useState(false)
    const [rawInput, setRawInput] = useState(current !== null ? String(current) : "")
    const inputRef = useRef<HTMLInputElement>(null)
    const pressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
      if (!focused) setRawInput(current !== null ? String(current) : "")
    }, [current, focused])

    const hasError = !!error
    const errorMsg = typeof error === "string" ? error : helperText
    const helper = hasError ? errorMsg : helperText

    function clamp(n: number): number {
      if (min !== undefined && n < min) return min
      if (max !== undefined && n > max) return max
      return n
    }

    function emit(val: number | null) {
      if (!isControlled) setInternal(val)
      onChange?.(val)
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value
      setRawInput(raw)
      if (raw === "" || raw === "-") { emit(null); return }
      const n = parseFloat(raw)
      if (!isNaN(n)) emit(n)
    }

    function handleBlur() {
      setFocused(false)
      if (current !== null) {
        const clamped = clamp(current)
        if (clamped !== current) emit(clamped)
        setRawInput(String(clamped))
      }
    }

    function step_(dir: 1 | -1) {
      if (disabled || readOnly) return
      const base = current ?? (dir === 1 ? (min ?? 0) - step : (max ?? 0) + step)
      const next = clamp(base + dir * step)
      emit(next)
      setRawInput(String(next))
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowUp") { e.preventDefault(); step_(1) }
      if (e.key === "ArrowDown") { e.preventDefault(); step_(-1) }
    }

    function startPress(dir: 1 | -1) {
      step_(dir)
      pressTimerRef.current = setInterval(() => step_(dir), 80)
    }

    function stopPress() {
      if (pressTimerRef.current) clearInterval(pressTimerRef.current)
    }

    const atMin = min !== undefined && current !== null && current <= min
    const atMax = max !== undefined && current !== null && current >= max
    const sm = size === "sm"

    const h = sm ? 36 : 44
    const inputFontSize = sm ? 13 : 15
    const padL = prefix ? (sm ? 4 : 6) : (sm ? 8 : 12)
    const padR = spinner ? 0 : (sm ? 8 : 12)

    const wrapStyle: React.CSSProperties = {
      display: 'flex', alignItems: 'stretch',
      borderRadius: 'var(--radius-base)',
      border: hasError ? '2px solid var(--destructive)' : focused ? `2px solid ${focusColor || 'var(--main)'}` : '2px solid var(--border)',
      background: disabled ? 'var(--bg3)' : 'var(--secondary-background)',
      boxShadow: focused ? (hasError ? '3px 3px 0 var(--destructive)' : '3px 3px 0 var(--border)') : 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      overflow: 'hidden', opacity: disabled ? 0.45 : 1,
    }

    const inputStyle: React.CSSProperties = {
      flex: 1, border: 'none', outline: 'none',
      background: 'transparent', color: 'var(--foreground)',
      fontFamily: 'var(--font-sans)', fontWeight: 500,
      fontSize: inputFontSize, height: h,
      padding: `0 ${padR}px 0 ${padL}px`,
      minWidth: 0,
      MozAppearance: 'textfield',
    }

    return (
      <div className={className} style={{ width: '100%' }}>
        {name && <input type="hidden" name={name} value={current !== null ? current : ""} />}

        {label && (
          <div style={{
            fontSize: 10, fontWeight: 700, color: hasError ? 'var(--destructive)' : 'var(--t3)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
          }}>
            {label}
          </div>
        )}

        {spinner && (
          <div style={{ display: 'flex', gap: 0, justifyContent: 'center', marginBottom: 4 }}>
            <button type="button" tabIndex={-1}
              disabled={disabled || readOnly || atMax}
              aria-label="Aumentar"
              onMouseDown={() => startPress(1)}
              onMouseUp={stopPress} onMouseLeave={stopPress}
              onTouchStart={() => startPress(1)} onTouchEnd={stopPress}
              style={{
                width: 28, height: 28, border: '2px solid var(--border)',
                borderRight: 'none',
                background: atMax ? 'var(--bg3)' : 'var(--secondary-background)',
                color: 'var(--t3)', cursor: 'pointer', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, lineHeight: 1, fontWeight: 700,
                opacity: atMax ? 0.3 : 1,
              }}
            >+</button>
            <button type="button" tabIndex={-1}
              disabled={disabled || readOnly || atMin}
              aria-label="Diminuir"
              onMouseDown={() => startPress(-1)}
              onMouseUp={stopPress} onMouseLeave={stopPress}
              onTouchStart={() => startPress(-1)} onTouchEnd={stopPress}
              style={{
                width: 28, height: 28, border: '2px solid var(--border)',
                background: atMin ? 'var(--bg3)' : 'var(--secondary-background)',
                color: 'var(--t3)', cursor: 'pointer', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, lineHeight: 1, fontWeight: 700,
                opacity: atMin ? 0.3 : 1,
              }}
            >-</button>
          </div>
        )}

        <div style={wrapStyle}>
          {prefix && (
            <span style={{
              display: 'flex', alignItems: 'center', flexShrink: 0,
              fontSize: 13, color: 'var(--t3)', paddingLeft: 12, fontWeight: 500,
            }}>{prefix}</span>
          )}

          <input ref={(node) => {
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
            if (typeof ref === "function") ref(node)
            else if (ref) ref.current = node
          }}
            id={id} type="number" inputMode="decimal"
            value={rawInput}
            onChange={handleChange}
            onFocus={() => { setFocused(true); setRawInput(current !== null ? String(current) : "") }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={focused || !label ? placeholder : undefined}
            disabled={disabled} readOnly={readOnly} min={min} max={max} step={step}
            aria-invalid={hasError}
            aria-describedby={helper ? `${id}-helper` : undefined}
            style={inputStyle}
          />

          {suffix && (
            <span style={{
              display: 'flex', alignItems: 'center', flexShrink: 0,
              fontSize: 13, color: 'var(--t3)', paddingRight: 12, fontWeight: 500,
            }}>{suffix}</span>
          )}
        </div>

        {helper && (
          <p id={`${id}-helper`} style={{
            fontSize: 11, marginTop: 4, color: hasError ? 'var(--destructive)' : 'var(--t3)',
          }}>
            {helper}
          </p>
        )}
      </div>
    )
  }
)
