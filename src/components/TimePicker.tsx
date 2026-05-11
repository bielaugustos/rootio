import { useState, useEffect } from 'react'

export interface TimePickerProps {
  value?: string        // HH:MM format
  onChange?: (value: string) => void
  label?: string
  disabled?: boolean
  id?: string
}

function parseTime(time: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  const [h, m] = time.split(':').map(Number)
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const period = h >= 12 ? 'PM' : 'AM'
  return { hour: hour12, minute: m || 0, period }
}

function formatTime(hour: number, minute: number, period: 'AM' | 'PM'): string {
  const h24 = period === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour)
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function TimePicker({ value = '08:00', onChange, label, disabled, id }: TimePickerProps) {
  const { hour: initialHour, minute: initialMinute, period: initialPeriod } = parseTime(value)
  const [hour, setHour] = useState(initialHour)
  const [minute, setMinute] = useState(initialMinute)
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialPeriod)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const newTime = formatTime(hour, minute, period)
    if (newTime !== value) {
      onChange?.(newTime)
    }
  }, [hour, minute, period, onChange, value])

  return (
    <div style={{ position: 'relative', maxWidth: '120px', width: '100%' }} data-comp-id={id} data-comp-type="timepicker">
      {label && (
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          {label}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 8px',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          background: 'var(--secondary-background)',
          boxShadow: focused ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
          transition: 'box-shadow 0.15s',
        }}>
          <input
            type="number"
            value={hour}
            onChange={e => {
              const val = parseInt(e.target.value) || 1
              if (val >= 1 && val <= 12) setHour(val)
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            min="1"
            max="12"
            style={{
              width: '32px', textAlign: 'center',
              background: 'transparent', border: 'none',
              fontSize: 14, fontWeight: 700, color: 'var(--foreground)',
              outline: 'none',
            }}
            disabled={disabled}
          />
          <span style={{ fontSize: 16, color: 'var(--t1)' }}>:</span>
          <input
            type="number"
            value={minute}
            onChange={e => {
              const val = parseInt(e.target.value) || 0
              if (val >= 0 && val <= 59) setMinute(val)
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            min="0"
            max="59"
            style={{
              width: '32px', textAlign: 'center',
              background: 'transparent', border: 'none',
              fontSize: 14, fontWeight: 700, color: 'var(--foreground)',
              outline: 'none',
            }}
            disabled={disabled}
          />
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              onClick={() => setPeriod('AM')}
              style={{
                padding: '2px 6px', fontSize: 10, fontWeight: 700,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: period === 'AM' ? 'var(--main)' : 'var(--bg3)',
                color: period === 'AM' ? 'var(--main-foreground)' : 'var(--t2)',
                cursor: 'pointer',
              }}
              disabled={disabled}
            >
              AM
            </button>
            <button
              onClick={() => setPeriod('PM')}
              style={{
                padding: '2px 6px', fontSize: 10, fontWeight: 700,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: period === 'PM' ? 'var(--main)' : 'var(--bg3)',
                color: period === 'PM' ? 'var(--main-foreground)' : 'var(--t2)',
                cursor: 'pointer',
              }}
              disabled={disabled}
            >
              PM
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}