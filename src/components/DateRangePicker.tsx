import { useState, useRef, useEffect, useId, useCallback } from "react"

export type DateRange = [Date | null, Date | null]

export interface ShortcutItem {
  label: string
  getValue: () => DateRange
}

export interface DateRangePickerProps {
  label?: string
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange) => void
  static?: boolean
  shortcuts?: ShortcutItem[]
  calendars?: 1 | 2
  disabled?: boolean
  className?: string
}

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  {
    label: "Esta semana",
    getValue: () => {
      const today = new Date()
      const day = today.getDay()
      const start = new Date(today); start.setDate(today.getDate() - day)
      const end = new Date(start); end.setDate(start.getDate() + 6)
      return [start, end]
    },
  },
  {
    label: "Semana passada",
    getValue: () => {
      const today = new Date()
      const day = today.getDay()
      const start = new Date(today); start.setDate(today.getDate() - day - 7)
      const end = new Date(start); end.setDate(start.getDate() + 6)
      return [start, end]
    },
  },
  {
    label: "Últimos 7 dias",
    getValue: () => {
      const today = new Date()
      const start = new Date(today); start.setDate(today.getDate() - 7)
      return [start, today]
    },
  },
  {
    label: "Mês atual",
    getValue: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return [start, end]
    },
  },
  {
    label: "Próximo mês",
    getValue: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      return [start, end]
    },
  },
  { label: "Limpar", getValue: () => [null, null] },
]

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DAYS_PT = ["D","S","T","Q","Q","S","S"]

function pad(n: number) { return String(n).padStart(2, "0") }

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isInRange(day: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false
  const t = day.getTime()
  return t > start.getTime() && t < end.getTime()
}

function formatRange(range: DateRange): string {
  const [s, e] = range
  if (!s && !e) return ""
  const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  if (s && !e) return fmt(s)
  if (s && e) return `${fmt(s)} – ${fmt(e)}`
  return ""
}

function formatShort(d: Date | null): string {
  if (!d) return "—"
  return `${MONTHS_PT[d.getMonth()].slice(0, 3)} ${d.getDate()}`
}

function getDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const days: Date[] = []
  for (let i = 0; i < first.getDay(); i++) {
    days.push(new Date(year, month, -first.getDay() + i + 1))
  }
  const last = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= last; d++) days.push(new Date(year, month, d))
  while (days.length < 42) {
    const prev = days[days.length - 1]
    const next = new Date(prev); next.setDate(prev.getDate() + 1)
    days.push(next)
  }
  return days
}

function MonthGrid({
  viewDate, range, hover, today,
  onDayClick, onDayHover,
  onPrev, onNextMonth,
  showPrev = true, showNext = true,
  disabled,
}: {
  viewDate: Date
  range: DateRange
  hover: Date | null
  today: Date
  onDayClick: (d: Date) => void
  onDayHover: (d: Date | null) => void
  onPrev?: () => void
  onNextMonth?: () => void
  showPrev?: boolean
  showNext?: boolean
  disabled?: boolean
}) {
  const days = getDays(viewDate.getFullYear(), viewDate.getMonth())
  const [start, end] = range
  const effectiveEnd = end ?? hover

  function navBtn(onClick?: () => void, label?: string, arrow?: string) {
    return (
      <button onClick={onClick} disabled={disabled || !onClick} aria-label={label}
        style={{
          width: 28, height: 28, borderRadius: 'var(--radius-sm)',
          border: '2px solid var(--border)',
          background: 'var(--secondary-background)',
          color: 'var(--foreground)',
          cursor: onClick && !disabled ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, opacity: onClick && !disabled ? 1 : 0.3,
          boxShadow: '2px 2px 0 var(--border)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={e => { if (onClick && !disabled) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
        onMouseLeave={e => { if (onClick && !disabled) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
      >{arrow ?? '‹'}</button>
    )
  }

  return (
    <div style={{ minWidth: 260, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
        {showPrev ? navBtn(onPrev, 'Mês anterior', '‹') : <div style={{ width: 28 }} />}
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>
          {MONTHS_PT[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        {showNext ? navBtn(onNextMonth, 'Próximo mês', '›') : <div style={{ width: 28 }} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 12px', marginBottom: 2 }}>
        {DAYS_PT.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t3)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 12px', gap: '1px 0' }}>
        {days.map((day, i) => {
          const inMonth = day.getMonth() === viewDate.getMonth()
          const isToday = isSameDay(day, today)
          const isStart = start ? isSameDay(day, start) : false
          const isEnd = end ? isSameDay(day, end) : false
          const isHover = !end && hover ? isSameDay(day, hover) : false
          const isEndpoint = isStart || isEnd || isHover

          const normalStart = start && effectiveEnd && start.getTime() <= effectiveEnd.getTime() ? start : effectiveEnd
          const normalEnd = start && effectiveEnd && start.getTime() <= effectiveEnd.getTime() ? effectiveEnd : start
          const isRangeStart = normalStart ? isSameDay(day, normalStart) : false
          const isRangeEnd = normalEnd ? isSameDay(day, normalEnd) : false
          const inRangeIncl = isInRange(day, normalStart ?? null, normalEnd ?? null) || isRangeStart || isRangeEnd

          return (
            <div key={i}
              onClick={() => inMonth && !disabled && onDayClick(day)}
              onMouseEnter={() => inMonth && !disabled && onDayHover(day)}
              onMouseLeave={() => onDayHover(null)}
              style={{
                position: 'relative', height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: inMonth && !disabled ? 'pointer' : 'default',
                background: 'transparent',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isEndpoint && inMonth ? 'var(--main)' : inRangeIncl && inMonth && !isEndpoint ? 'rgba(245,158,11,0.10)' : 'transparent',
                border: isEndpoint && inMonth ? '2px solid var(--border)' : inRangeIncl && inMonth && !isEndpoint ? '2px solid var(--main)' : isToday && !isEndpoint ? '2px solid var(--main)' : '2px solid transparent',
                color: isEndpoint && inMonth ? 'var(--main-foreground)' : !inMonth ? 'var(--t3)' : isToday ? 'var(--main)' : 'var(--foreground)',
                fontSize: 13,
                fontWeight: isEndpoint || isToday ? 700 : 400,
                opacity: !inMonth ? 0.3 : 1,
                transition: 'background 0.12s',
                position: 'relative', zIndex: 1,
              }}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RangePanel({
  range, onChange, shortcuts, calendars = 1, showHeader = false, showActions = false,
  onOk, disabled,
}: {
  range: DateRange
  onChange: (r: DateRange) => void
  shortcuts?: ShortcutItem[]
  calendars?: 1 | 2
  showHeader?: boolean
  showActions?: boolean
  onOk?: () => void
  disabled?: boolean
}) {
  const today = new Date()
  const [view1, setView1] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const view2 = new Date(view1.getFullYear(), view1.getMonth() + 1, 1)
  const [hover, setHover] = useState<Date | null>(null)
  const [picking, setPicking] = useState<"start" | "end">("start")

  function handleDay(day: Date) {
    if (picking === "start") {
      onChange([day, null])
      setPicking("end")
    } else {
      const [s] = range
      if (s && day.getTime() < s.getTime()) {
        onChange([day, s])
      } else {
        onChange([s, day])
      }
      setPicking("start")
    }
  }

  function applyShortcut(s: ShortcutItem) {
    const val = s.getValue()
    onChange(val)
    setPicking("start")
  }

  return (
    <div style={{ width: '100%' }}>
      {showHeader && (
        <div style={{ padding: '12px 16px', borderBottom: '2px solid var(--border)', background: 'var(--background)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 4 }}>
            {picking === 'start' ? 'Selecione a data inicial' : 'Selecione a data final'}
          </div>
          <div style={{
            fontSize: 24, fontWeight: 700, color: 'var(--foreground)',
            letterSpacing: '-0.02em', fontFamily: 'var(--font-title)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: range[0] ? 'var(--foreground)' : 'var(--t3)' }}>{formatShort(range[0])}</span>
            <span style={{ color: 'var(--t3)', fontSize: 18 }}>→</span>
            <span style={{ color: range[1] ? 'var(--main)' : 'var(--t3)' }}>{formatShort(range[1])}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {shortcuts && shortcuts.length > 0 && (
          <div style={{
            padding: '8px 12px', borderBottom: '2px solid var(--border)',
            display: 'flex', flexWrap: 'wrap', gap: 6,
          }}>
            {shortcuts.map((sc) => (
              <button key={sc.label} onClick={() => applyShortcut(sc)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border)',
                  background: 'var(--secondary-background)',
                  color: 'var(--foreground)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  boxShadow: '2px 2px 0 var(--border)',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
              >
                {sc.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, gap: 0, flexWrap: 'wrap' }}>
          <MonthGrid viewDate={view1} range={range} hover={hover} today={today}
            onDayClick={handleDay} onDayHover={setHover}
            onPrev={() => setView1(new Date(view1.getFullYear(), view1.getMonth() - 1, 1))}
            onNextMonth={calendars === 1 ? () => setView1(new Date(view1.getFullYear(), view1.getMonth() + 1, 1)) : undefined}
            showPrev showNext={calendars === 1} disabled={disabled}
          />
          {calendars === 2 && (
            <>
              <div style={{ width: 2, background: 'var(--border)', margin: '12px 0', flexShrink: 0 }} />
              <MonthGrid viewDate={view2} range={range} hover={hover} today={today}
                onDayClick={handleDay} onDayHover={setHover}
                onPrev={undefined}
                onNextMonth={() => setView1(new Date(view1.getFullYear(), view1.getMonth() + 1, 1))}
                showPrev={false} showNext disabled={disabled}
              />
            </>
          )}
        </div>
      </div>

      {showActions && (
        <>
          <div style={{ height: 2, background: 'var(--border)' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 14px' }}>
            <button onClick={() => { onChange([null, null]); setPicking("start") }}
              style={{
                height: 34, padding: '0 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.03em',
                border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                background: 'var(--secondary-background)', color: 'var(--foreground)',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 var(--border)',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
            >Limpar</button>
            <button onClick={onOk}
              style={{
                height: 34, padding: '0 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.03em',
                border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                background: 'var(--main)', color: 'var(--main-foreground)',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 var(--border)',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
            >OK</button>
          </div>
        </>
      )}
    </div>
  )
}

export function DateRangePicker({
  label, value, defaultValue = [null, null], onChange,
  static: isStatic = false, shortcuts, calendars = 1, disabled, className,
}: DateRangePickerProps) {
  const id = useId()
  const isControlled = value !== undefined
  const [internal, setInternal] = useState<DateRange>(defaultValue)
  const committed: DateRange = isControlled ? value! : internal
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>(committed)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || isStatic) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, isStatic])

  const commit = useCallback((r: DateRange) => {
    if (!isControlled) setInternal(r)
    onChange?.(r)
  }, [isControlled, onChange])

  const handleOk = useCallback(() => { commit(draft); setOpen(false) }, [draft, commit])
  
  const inputBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', height: 44, padding: '0 14px',
    borderRadius: 'var(--radius-base)',
    border: '2px solid var(--border)',
    background: 'var(--secondary-background)',
    color: 'var(--foreground)',
    fontSize: 14, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '4px 4px 0 var(--border)',
    transition: 'transform 0.1s, box-shadow 0.1s',
    textAlign: 'left', opacity: disabled ? 0.45 : 1,
  }

  const panel = (
    <RangePanel
      range={draft} onChange={setDraft}
      shortcuts={shortcuts} calendars={calendars}
      showHeader showActions
      onOk={handleOk}
      disabled={disabled}
    />
  )

  if (isStatic) {
    return (
      <div className={className} style={{ width: '100%' }}>
        {label && (
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {label}
          </div>
        )}
        <div style={{
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          overflow: 'hidden',
        }}>
          <RangePanel
            range={committed} onChange={commit}
            shortcuts={shortcuts} calendars={calendars}
            showHeader disabled={disabled}
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          {label}
        </div>
      )}
      <button id={id} onClick={() => !disabled && (setDraft(committed), setOpen(v => !v))} disabled={disabled}
        style={inputBtn}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = 'none' } }}
        onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)' } }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 'var(--radius-sm)', flexShrink: 0,
          background: committed[0] ? 'var(--main)' : 'transparent',
          border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="ph ph-calendar-blank" style={{ fontSize: 13, color: committed[0] ? 'var(--main-foreground)' : 'var(--t3)' }} />
        </div>
        <span style={{ flex: 1, color: committed[0] ? 'var(--foreground)' : 'var(--t3)' }}>
          {committed[0] ? formatRange(committed) : 'Selecionar período...'}
        </span>
        {(committed[0] || committed[1]) && (
          <span onClick={e => { e.stopPropagation(); commit([null, null]) }}
            style={{ fontSize: 16, color: 'var(--t3)', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</span>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', zIndex: 100, top: 'calc(100% + 6px)', left: 0,
          minWidth: '100%',
          maxWidth: 'min(calc(100vw - 24px), 800px)',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '6px 6px 0 var(--border)',
        }} role="dialog">
          {panel}
        </div>
      )}
    </div>
  )
}
