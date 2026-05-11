import { useState, useRef, useEffect } from 'react'

export type PeriodType = 'month' | 'quarter' | 'year'

export interface PeriodValue {
  type: PeriodType
  year: number
  month: number   // 1-12, só relevante quando type === 'month'
  quarter: number // 1-4, só relevante quando type === 'quarter'
}

interface PeriodPickerProps {
  value: PeriodValue
  onChange: (v: PeriodValue) => void
  maxDate?: PeriodValue  // não permite navegar além disso (padrão: mês atual)
  id?: string
}

const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const PERIOD_LABELS: Record<PeriodType, string> = { month: 'Mês', quarter: 'Trimestre', year: 'Ano' }

function formatDisplay(v: PeriodValue): string {
  if (v.type === 'month')   return `${MONTHS_SHORT[v.month - 1]} ${v.year}`
  if (v.type === 'quarter') return `T${v.quarter} · ${v.year}`
  return `${v.year}`
}

function isAtMax(v: PeriodValue, max: PeriodValue): boolean {
  if (v.year > max.year) return true
  if (v.year < max.year) return false
  if (v.type === 'month')   return v.month >= max.month
  if (v.type === 'quarter') return v.quarter >= max.quarter
  return true
}

function navigate(v: PeriodValue, dir: -1 | 1): PeriodValue {
  if (v.type === 'month') {
    let m = v.month + dir
    let y = v.year
    if (m < 1)  { m = 12; y-- }
    if (m > 12) { m = 1;  y++ }
    return { ...v, month: m, year: y }
  }
  if (v.type === 'quarter') {
    let q = v.quarter + dir
    let y = v.year
    if (q < 1) { q = 4; y-- }
    if (q > 4) { q = 1; y++ }
    return { ...v, quarter: q, year: y }
  }
  return { ...v, year: v.year + dir }
}

export function PeriodPicker({ value, onChange, maxDate, id }: PeriodPickerProps) {
  const now = new Date()
  const max: PeriodValue = maxDate ?? {
    type: value.type,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    quarter: Math.floor(now.getMonth() / 3) + 1,
  }

  const [open, setOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const POPOVER_HEIGHT = 280

  const openPopover = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const w = Math.min(r.width, vw - 24)
      const spaceBelow = vh - r.bottom
      let left = r.left + window.scrollX
      if (left + w > vw - 12) left = vw - w - 12
      if (left < 12) left = 12
      const top = spaceBelow < POPOVER_HEIGHT && r.top > POPOVER_HEIGHT
        ? r.top + window.scrollY - POPOVER_HEIGHT - 6
        : r.bottom + window.scrollY + 8
      setPopoverPos({ top, left, width: w })
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const atMax = isAtMax(value, { ...max, type: value.type })

  const switchType = (type: PeriodType) => {
    onChange({ ...value, type })
    setOpen(false)
  }

  const nav = (dir: -1 | 1) => {
    if (dir === 1 && atMax) return
    onChange(navigate(value, dir))
  }

  // Gerar anos para seleção (últimos 5)
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }} data-comp-id={id}>
      {/* Controle principal — full width */}
      <div style={{
        display: 'flex', width: '100%',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        overflow: 'hidden',
        boxShadow: open ? 'none' : '4px 4px 0 var(--border)',
        transition: 'box-shadow 0.1s',
      }}>
        {/* ‹ */}
        <button
          onClick={() => nav(-1)}
          style={{
            width: 44, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg3)', border: 'none',
            borderRight: '2px solid var(--border)',
            cursor: 'pointer', color: 'var(--t2)',
            fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-sans)',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary-background)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)' }}
        >‹</button>

        {/* Display central */}
        <button
          onClick={() => open ? setOpen(false) : openPopover()}
          style={{
            flex: 1, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: open ? 'var(--main)' : 'var(--secondary-background)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', transition: 'background 0.1s',
          }}
        >
          <i className="ph ph-calendar-blank" style={{
            fontSize: 15,
            color: open ? 'var(--main-foreground)' : 'var(--t3)',
          }} />
          <span style={{
            fontSize: 14, fontWeight: 800, letterSpacing: '0.01em',
            color: open ? 'var(--main-foreground)' : 'var(--t1)',
          }}>
            {formatDisplay(value)}
          </span>
          <i className={`ph ph-caret-${open ? 'up' : 'down'}`} style={{
            fontSize: 12,
            color: open ? 'var(--main-foreground)' : 'var(--t4)',
          }} />
        </button>

        {/* › */}
        <button
          onClick={() => nav(1)}
          disabled={atMax}
          style={{
            width: 44, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg3)', border: 'none',
            borderLeft: '2px solid var(--border)',
            cursor: atMax ? 'not-allowed' : 'pointer',
            color: atMax ? 'var(--t4)' : 'var(--t2)',
            fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-sans)',
            opacity: atMax ? 0.35 : 1,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { if (!atMax) e.currentTarget.style.background = 'var(--secondary-background)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)' }}
        >›</button>
      </div>

      {/* Popover */}
      {open && (
        <div style={{
          position: 'fixed',
          top: popoverPos.top,
          left: popoverPos.left,
          width: popoverPos.width,
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 9999,
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '6px 6px 0 var(--border)',
          padding: '16px',
          userSelect: 'none',
        }}>
          {/* Toggle tipo — full width */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 16,
            border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
            overflow: 'hidden', background: 'var(--bg3)',
          }}>
            {(['month', 'quarter', 'year'] as PeriodType[]).map((t, i) => (
              <button
                key={t}
                onClick={() => switchType(t)}
                style={{
                  flex: 1, height: 34, border: 'none', outline: 'none',
                  borderRight: i < 2 ? '2px solid var(--border)' : 'none',
                  background: value.type === t ? 'var(--main)' : 'transparent',
                  color: value.type === t ? 'var(--main-foreground)' : 'var(--t2)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', transition: 'all 0.1s',
                  letterSpacing: '0.02em',
                }}
              >
                {PERIOD_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Ano */}
          <div style={{ marginBottom: value.type === 'year' ? 0 : 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Ano</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => { onChange({ ...value, year: y }); if (value.type === 'year') setOpen(false) }}
                  style={{
                    flex: 1, height: 32,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)',
                    border: `2px solid ${value.year === y ? 'var(--border)' : 'var(--b2)'}`,
                    background: value.year === y ? 'var(--main)' : 'var(--bg3)',
                    color: value.year === y ? 'var(--main-foreground)' : 'var(--t2)',
                    boxShadow: value.year === y ? '2px 2px 0 var(--border)' : 'none',
                    transition: 'all 0.1s',
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Trimestre */}
          {value.type === 'quarter' && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Trimestre</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {([1, 2, 3, 4] as const).map((q, i) => {
                  const labels = ['Jan–Mar', 'Abr–Jun', 'Jul–Set', 'Out–Dez']
                  const active = value.quarter === q
                  return (
                    <button
                      key={q}
                      onClick={() => { onChange({ ...value, quarter: q }); setOpen(false) }}
                      style={{
                        padding: '8px 4px', border: '2px solid', cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)',
                        borderColor: active ? 'var(--border)' : 'var(--b2)',
                        background: active ? 'var(--main)' : 'var(--bg3)',
                        color: active ? 'var(--main-foreground)' : 'var(--t2)',
                        boxShadow: active ? '2px 2px 0 var(--border)' : 'none',
                        transition: 'all 0.1s', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 2,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 800 }}>T{q}</span>
                      <span style={{ fontSize: 9, opacity: 0.7, fontWeight: 600 }}>{labels[i]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Meses — grid 4×3 */}
          {value.type === 'month' && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Mês</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {MONTHS_SHORT.map((m, i) => {
                  const isSelected = value.month === i + 1
                  const isDisabled = value.year === now.getFullYear() && i + 1 > now.getMonth() + 1
                  return (
                    <button
                      key={m}
                      disabled={isDisabled}
                      onClick={() => { onChange({ ...value, month: i + 1 }); setOpen(false) }}
                      style={{
                        height: 34, border: '2px solid',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)',
                        borderColor: isSelected ? 'var(--border)' : 'transparent',
                        background: isSelected ? 'var(--main)' : 'var(--bg3)',
                        color: isSelected ? 'var(--main-foreground)' : isDisabled ? 'var(--t4)' : 'var(--t1)',
                        fontSize: 12, fontWeight: isSelected ? 700 : 500,
                        boxShadow: isSelected ? '2px 2px 0 var(--border)' : 'none',
                        opacity: isDisabled ? 0.35 : 1,
                        transition: 'all 0.1s',
                      }}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}