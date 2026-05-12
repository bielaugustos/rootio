import { useState, useRef, useEffect, useCallback, forwardRef, useId } from "react"
import { NumberField } from "./NumberField"

export interface TimeValue {
  hours: number
  minutes: number
}

export interface TimePickerProps {
  label?: string
  value?: TimeValue | null
  defaultValue?: TimeValue | null
  onChange?: (time: TimeValue | null) => void
  responsive?: boolean
  static?: boolean
  disabled?: boolean
  readOnly?: boolean
  name?: string
  placeholder?: string
  format?: "12h" | "24h"
  className?: string
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function formatTime(t: TimeValue, fmt: "12h" | "24h"): string {
  if (fmt === "24h") return `${pad(t.hours)}:${pad(t.minutes)}`
  const period = t.hours < 12 ? "AM" : "PM"
  const h = t.hours % 12 || 12
  return `${pad(h)}:${pad(t.minutes)} ${period}`
}

function range(start: number, end: number, step = 1): number[] {
  const out: number[] = []
  for (let i = start; i <= end; i += step) out.push(i)
  return out
}

function getPeriodLabel(h: number) {
  return h < 12 ? "AM" : "PM"
}

function neobtn(interactive: boolean): React.CSSProperties {
  return {
    border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--secondary-background)', color: 'var(--foreground)',
    cursor: interactive ? 'pointer' : 'default',
    boxShadow: '2px 2px 0 var(--border)',
    transition: 'transform 0.1s, box-shadow 0.1s',
    fontFamily: 'var(--font-sans)',
  }
}

function pressEnter(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget
  el.style.transform = 'translate(2px,2px)'
  el.style.boxShadow = 'none'
}

function pressLeave(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget
  el.style.transform = 'none'
  el.style.boxShadow = '2px 2px 0 var(--border)'
}


function ClockFace({ time, onSelect, disabled }: {
  time: TimeValue
  onSelect: (t: TimeValue) => void
  disabled?: boolean
}) {
  const [mode, setMode] = useState<"hours" | "minutes">("hours")
  const SIZE = 200
  const CENTER = SIZE / 2
  const R = 72

  function polarToXY(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
  }

  const hours12 = range(1, 12)
  const minutes5 = range(0, 55, 5)
  const handAngle = mode === "hours" ? ((time.hours % 12) / 12) * 360 : (time.minutes / 60) * 360
  const handEnd = polarToXY(handAngle, R - 18)

  return (
    <div style={{ position: 'relative', width: SIZE, margin: '0 auto', padding: '8px 0 4px' }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ display: 'block', cursor: disabled ? 'default' : 'pointer' }}
        onClick={(e) => {
          if (disabled) return
          const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
          const x = e.clientX - rect.left - CENTER
          const y = e.clientY - rect.top - CENTER
          let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
          if (angle < 0) angle += 360
          if (mode === "hours") {
            const h = Math.round(angle / 30) % 12
            const p = time.hours >= 12 ? 12 : 0
            onSelect({ ...time, hours: (h + p) || (p === 0 ? 12 : 0) })
            setMode("minutes")
          } else {
            onSelect({ ...time, minutes: Math.round(angle / 6) % 60 })
          }
        }}
      >
        <circle cx={CENTER} cy={CENTER} r={CENTER - 4} fill="var(--bg3)" stroke="var(--border)" strokeWidth={2} />
        <line x1={CENTER} y1={CENTER} x2={handEnd.x} y2={handEnd.y}
          stroke="var(--main)" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={CENTER} cy={CENTER} r={4} fill="var(--main)" />
        <circle cx={handEnd.x} cy={handEnd.y} r={20} fill="var(--main)" opacity={0.9} />
        <text x={handEnd.x} y={handEnd.y} textAnchor="middle" dominantBaseline="central"
          fill="#fff" fontSize={13} fontWeight={700}>
          {mode === "hours" ? pad(time.hours % 12 || 12) : pad(time.minutes)}
        </text>
        {mode === "hours" && hours12.map((h) => {
          const pos = polarToXY((h / 12) * 360, R)
          const sel = (time.hours % 12 || 12) === h
          return (
            <text key={h} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
              fill={sel ? "var(--main)" : "var(--foreground)"}
              fontSize={sel ? 15 : 13} fontWeight={sel ? 700 : 400}>
              {pad(h)}
            </text>
          )
        })}
        {mode === "minutes" && minutes5.map((m) => {
          const pos = polarToXY((m / 60) * 360, R)
          const sel = time.minutes === m
          return (
            <text key={m} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
              fill={sel ? "var(--main)" : "var(--foreground)"}
              fontSize={sel ? 14 : 12} fontWeight={sel ? 700 : 400}>
              {pad(m)}
            </text>
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
        {(["hours", "minutes"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              ...neobtn(true), padding: '2px 12px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              background: mode === m ? 'var(--main)' : 'var(--secondary-background)',
              color: mode === m ? 'var(--main-foreground)' : 'var(--foreground)',
            }}
            onMouseEnter={mode === m ? undefined : pressEnter}
            onMouseLeave={mode === m ? undefined : pressLeave}
          >
            {m === "hours" ? "Horas" : "Minutos"}
          </button>
        ))}
      </div>
    </div>
  )
}

function PickerPanel({ time, onTimeChange, onOk, onClear, responsive, format, disabled, showActions = true }: {
  time: TimeValue
  onTimeChange: (t: TimeValue) => void
  onOk?: () => void
  onClear?: () => void
  responsive?: boolean
  format: "12h" | "24h"
  disabled?: boolean
  showActions?: boolean
}) {
  const period = getPeriodLabel(time.hours)

  const [activeColumn, setActiveColumn] = useState<"hours" | "minutes">("minutes")
  const [manualValue, setManualValue] = useState(
    pad(format === "12h" ? (time.hours % 12 || 12) : time.hours) + ":" + pad(time.minutes) + (format === "12h" ? " " + period : "")
  )

  useEffect(() => {
    setManualValue(pad(format === "12h" ? (time.hours % 12 || 12) : time.hours) + ":" + pad(time.minutes) + (format === "12h" ? " " + period : ""))
  }, [time, format])

  function increment() {
    if (activeColumn === "hours") {
      let h = time.hours + 1
      if (format === "12h") { h = h > 23 ? 0 : h }
      else { h = h > 23 ? 0 : h }
      onTimeChange({ ...time, hours: h })
    } else {
      let m = time.minutes + 1
      if (m > 59) m = 0
      onTimeChange({ ...time, minutes: m })
    }
  }

  function decrement() {
    if (activeColumn === "hours") {
      let h = time.hours - 1
      if (h < 0) h = 23
      onTimeChange({ ...time, hours: h })
    } else {
      let m = time.minutes - 1
      if (m < 0) m = 59
      onTimeChange({ ...time, minutes: m })
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        padding: '12px 14px 8px',
        borderBottom: '2px solid var(--border)',
        background: 'var(--background)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontSize: 30, fontWeight: 700, color: 'var(--foreground)',
          letterSpacing: '-0.02em', fontFamily: 'var(--font-title)',
        }}>
          {pad(format === "12h" ? (time.hours % 12 || 12) : time.hours)}
          <span style={{ opacity: 0.3, margin: '0 2px' }}>:</span>
          {pad(time.minutes)}
          {format === "12h" && (
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--main)', marginLeft: 8 }}>
              {period}
            </span>
          )}
        </div>
        {format === "12h" && (
          <div style={{ display: 'flex', gap: 8 }}>
            {["AM", "PM"].map((p) => {
              const active = period === p
              return (
                <button key={p} onClick={() => { const h = time.hours % 12; onTimeChange({ ...time, hours: p === "AM" ? h : h + 12 }) }}
                  style={{
                    ...neobtn(!disabled), width: 28, height: 28, fontSize: 10, fontWeight: 700,
                    lineHeight: 1.4, letterSpacing: '0.05em',
                    background: active ? 'var(--main)' : 'var(--secondary-background)',
                    color: active ? 'var(--main-foreground)' : 'var(--foreground)',
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                  }}
                  onMouseEnter={pressEnter} onMouseLeave={pressLeave}
                  disabled={disabled}
                >{p === "AM" ? <i className="ph ph-sun" style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }} /> : <i className="ph ph-moon" style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }} />}</button>
              )
            })}
          </div>
          )}
      </div>

      {responsive && <ClockFace time={time} onSelect={onTimeChange} disabled={disabled} />}

      <div style={{ padding: '8px 14px', borderBottom: '2px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            <button onClick={increment} disabled={disabled}
              style={{
                width: 28, height: 28, border: '2px solid var(--border)',
                borderRight: 'none', boxSizing: 'border-box',
                background: 'var(--secondary-background)',
                color: 'var(--foreground)',
                cursor: disabled ? 'default' : 'pointer',
                borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, lineHeight: 1, fontWeight: 700,
                opacity: disabled ? 0.4 : 1,
              }}
            >+</button>
            <button onClick={decrement} disabled={disabled}
              style={{
                width: 28, height: 28, border: '2px solid var(--border)',
                boxSizing: 'border-box',
                background: 'var(--secondary-background)',
                color: 'var(--foreground)',
                cursor: disabled ? 'default' : 'pointer',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, lineHeight: 1, fontWeight: 700,
                opacity: disabled ? 0.4 : 1,
              }}
            >-</button>
          </div>
          <input
            type="text"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            onBlur={(e) => {
              const val = e.target.value.trim()
              const match12 = val.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
              const match24 = val.match(/^(\d{1,2}):(\d{2})$/)
              if (format === "12h" && match12) {
                let h = parseInt(match12[1], 10) % 12
                if (match12[3].toUpperCase() === "PM") h += 12
                onTimeChange({ hours: h, minutes: parseInt(match12[2], 10) })
              } else if (format === "24h" && match24) {
                const h = parseInt(match24[1], 10)
                if (h >= 0 && h <= 23) onTimeChange({ hours: h, minutes: parseInt(match24[2], 10) })
              }
            }}
            placeholder={format === "12h" ? "HH:MM AM/PM" : "HH:MM"}
            disabled={disabled}
            style={{
              width: '100%', height: 36, padding: '0 8px',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--border)',
              background: 'var(--secondary-background)',
              color: 'var(--foreground)',
              fontSize: 13, fontFamily: 'var(--font-sans)', fontWeight: 500,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 6, width: '100%' }}>
            <div style={{
              flex: 1, cursor: 'pointer',
              padding: 12, borderRadius: 'var(--radius-sm)',
              background: activeColumn === 'hours' ? 'var(--background)' : 'transparent',
            }} onClick={() => setActiveColumn("hours")}>
              <NumberField label="HH" value={time.hours}
                onChange={(v) => v !== null && onTimeChange({ ...time, hours: Math.round(v) })}
                min={0} max={23} spinner={false} size="sm" disabled={disabled} focusColor="var(--border)" />
            </div>
            <div style={{
              flex: 1, cursor: 'pointer',
              padding: 12, borderRadius: 'var(--radius-sm)',
              background: activeColumn === 'minutes' ? 'var(--background)' : 'transparent',
            }} onClick={() => setActiveColumn("minutes")}>
              <NumberField label="MM" value={time.minutes}
                onChange={(v) => v !== null && onTimeChange({ ...time, minutes: Math.round(v) })}
                min={0} max={59} spinner={false} size="sm" disabled={disabled} focusColor="var(--border)" />
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <>
          <div style={{ height: 2, background: 'var(--border)' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 14px' }}>
            <button onClick={onClear}
              style={{
                ...neobtn(true), height: 34, padding: '0 18px',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.03em',
              }}
              onMouseEnter={pressEnter} onMouseLeave={pressLeave}
            >
              Limpar
            </button>
            <button onClick={onOk}
              style={{
                ...neobtn(true), height: 34, padding: '0 18px',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.03em',
                background: 'var(--main)', color: 'var(--main-foreground)',
              }}
              onMouseEnter={pressEnter} onMouseLeave={pressLeave}
            >
              OK
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const DEFAULT_TIME: TimeValue = { hours: 0, minutes: 0 }

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(
    { label, value, defaultValue = null, onChange, responsive = false,
      static: isStatic = false, disabled = false, readOnly = false,
      name, placeholder = "hh:mm aa", format = "12h", className }, ref
  ) {
    const id = useId()
    const isControlled = value !== undefined
    const [internal, setInternal] = useState<TimeValue | null>(defaultValue)
    const committed = isControlled ? value! : internal
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState<TimeValue>(committed ?? DEFAULT_TIME)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!open || isStatic) return
      function handler(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false) }
      document.addEventListener("mousedown", handler)
      return () => document.removeEventListener("mousedown", handler)
    }, [open, isStatic])

    const handleOk = useCallback(() => {
      if (!isControlled) setInternal(draft)
      onChange?.(draft)
      setOpen(false)
    }, [draft, isControlled, onChange])

    const handleClear = useCallback(() => { setDraft(DEFAULT_TIME); if (!isControlled) setInternal(null); onChange?.(null); setOpen(false) }, [isControlled, onChange])
    const interactive = !disabled && !readOnly

    const inputBtn: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', height: 44, padding: '0 14px',
      borderRadius: 'var(--radius-base)',
      border: '2px solid var(--border)',
      background: 'var(--secondary-background)',
      color: 'var(--foreground)',
      fontSize: 14, fontWeight: 500, cursor: interactive ? 'pointer' : 'default',
      boxShadow: '4px 4px 0 var(--border)',
      transition: 'transform 0.1s, box-shadow 0.1s',
      textAlign: 'left', opacity: disabled ? 0.45 : 1,
    }

    function pressEnterBtn(e: React.MouseEvent<HTMLButtonElement>) {
      const el = e.currentTarget
      el.style.transform = 'translate(4px,4px)'
      el.style.boxShadow = 'none'
    }
    function pressLeaveBtn(e: React.MouseEvent<HTMLButtonElement>) {
      const el = e.currentTarget
      el.style.transform = 'none'
      el.style.boxShadow = '4px 4px 0 var(--border)'
    }

    const popupStyle: React.CSSProperties = {
      position: 'absolute', zIndex: 100, top: 'calc(100% + 6px)', left: 0,
      minWidth: '100%',
      maxWidth: 'min(calc(100vw - 24px), 800px)',
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius-base)',
      boxShadow: '6px 6px 0 var(--border)',
    }

    const staticWrap: React.CSSProperties = {
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius-base)',
      boxShadow: '4px 4px 0 var(--border)',
      overflow: 'hidden',
      maxWidth: 240,
    }

    const panel = (
      <PickerPanel time={draft} onTimeChange={setDraft} onOk={handleOk} onClear={handleClear}
        responsive={responsive} format={format} disabled={disabled} />
    )

    if (isStatic) {
      return (
        <div ref={ref} className={className} style={{ width: '100%' }}>
          {name && <input type="hidden" name={name} value={committed ? formatTime(committed, "24h") : ""} />}
          {label && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {label}
            </div>
          )}
          <div style={staticWrap}>{panel}</div>
        </div>
      )
    }

    return (
      <div ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }} className={className} style={{ position: 'relative', width: '100%' }}>
        {name && <input type="hidden" name={name} value={committed ? formatTime(committed, "24h") : ""} />}
        {label && (
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {label}
          </div>
        )}
        <button id={id}
          onClick={() => !disabled && !readOnly && (setDraft(committed ?? DEFAULT_TIME), setOpen(v => !v))}
          disabled={disabled} style={inputBtn}
          onMouseEnter={interactive ? pressEnterBtn : undefined}
          onMouseLeave={interactive ? pressLeaveBtn : undefined}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--radius-sm)', flexShrink: 0,
            background: committed ? 'var(--main)' : 'var(--bg3)',
            border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ph ph-clock" style={{ fontSize: 13, color: committed ? 'var(--main-foreground)' : 'var(--t3)' }} />
          </div>
          <span style={{ flex: 1, color: committed ? 'var(--foreground)' : 'var(--t3)' }}>
            {committed ? formatTime(committed, format) : placeholder}
          </span>
        </button>
        {open && (
          <div style={popupStyle} role="dialog" aria-label="Selecionar horário">
            {panel}
          </div>
        )}
      </div>
    )
  }
)
