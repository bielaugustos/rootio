import { useState, useRef, useEffect, useCallback, forwardRef, useId } from "react"

export interface DatePickerProps {
  label?: string
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (date: Date | null) => void
  static?: boolean
  disabled?: boolean
  readOnly?: boolean
  name?: string
  placeholder?: string
  className?: string
}

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]
const DAYS_PT = ["D", "S", "T", "Q", "Q", "S", "S"]
const DAYS_LONG_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatDate(date: Date | null): string {
  if (!date) return ""
  return date.toLocaleDateString("pt-BR")
}

function formatDateLong(date: Date): string {
  return `${DAYS_LONG_PT[date.getDay()]}, ${date.getDate()} de ${MONTHS_PT[date.getMonth()]}`
}

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const days: Date[] = []
  for (let i = 0; i < first.getDay(); i++) {
    const d = new Date(year, month, -first.getDay() + i + 1)
    days.push(d)
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  while (days.length < 42) {
    const last = days[days.length - 1]
    const next = new Date(last)
    next.setDate(next.getDate() + 1)
    days.push(next)
  }
  return days
}

interface CalendarGridProps {
  viewDate: Date
  selected: Date | null
  today: Date
  onSelect: (d: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  showHeader?: boolean
  showActions?: boolean
  onToday?: () => void
  onClear?: () => void
  disabled?: boolean
  readOnly?: boolean
}

function CalendarGrid({
  viewDate, selected, today, onSelect, onPrevMonth, onNextMonth,
  showHeader = true, showActions = false, onToday, onClear, disabled, readOnly,
}: CalendarGridProps) {
  const days = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth())
  const interactive = !disabled && !readOnly

  const btnBase: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--border)',
    background: 'var(--secondary-background)',
    color: 'var(--foreground)',
    cursor: interactive ? 'pointer' : 'default',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, opacity: interactive ? 1 : 0.4,
    boxShadow: '2px 2px 0 var(--border)',
    transition: 'transform 0.1s, box-shadow 0.1s',
  }

  return (
    <div style={{ width: '100%' }}>
      {showHeader && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px 8px',
        }}>
          <button
            onClick={onPrevMonth} disabled={!interactive} aria-label="Mês anterior"
            style={btnBase}
            onMouseEnter={e => { if (interactive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
            onMouseLeave={e => { if (interactive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
          >‹</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>
            {MONTHS_PT[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button
            onClick={onNextMonth} disabled={!interactive} aria-label="Próximo mês"
            style={btnBase}
            onMouseEnter={e => { if (interactive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
            onMouseLeave={e => { if (interactive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
          >›</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', marginBottom: 4 }}>
        {DAYS_PT.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            color: 'var(--t3)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', gap: 2 }}>
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === viewDate.getMonth()
          const isTodayDay = isSameDay(day, today)
          const isSelectedDay = selected ? isSameDay(day, selected) : false
          const canClick = interactive && isCurrentMonth

          return (
            <div key={i} style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => canClick && onSelect(day)}
              disabled={!canClick}
              aria-label={day.toLocaleDateString("pt-BR")}
              aria-pressed={isSelectedDay}
              style={{
                width: 32, height: 32,
                borderRadius: 'var(--radius-sm)',
                border: isSelectedDay ? '2px solid var(--border)' : isTodayDay && !isSelectedDay ? '2px solid var(--main)' : '2px solid transparent',
                background: isSelectedDay ? 'var(--main)' : 'transparent',
                color: isSelectedDay ? 'var(--main-foreground)' : !isCurrentMonth ? 'var(--t3)' : isTodayDay ? 'var(--main)' : 'var(--foreground)',
                fontSize: 13,
                fontWeight: isSelectedDay || isTodayDay ? 700 : 400,
                cursor: canClick ? 'pointer' : 'default',
                transition: 'background 0.1s',
                opacity: !isCurrentMonth ? 0.35 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (canClick && !isSelectedDay) e.currentTarget.style.background = 'var(--bg3)'
              }}
              onMouseLeave={(e) => {
                if (!isSelectedDay) e.currentTarget.style.background = 'transparent'
              }}
            >
              {day.getDate()}
            </button>
            </div>
          )
        })}
      </div>

      {showActions && (
        <>
          <div style={{ height: 1, background: 'var(--b2)', margin: '10px 0 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '10px 12px 12px' }}>
            <button onClick={onToday} disabled={!interactive} style={{
              height: 34, borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--border)',
              background: 'var(--secondary-background)',
              color: 'var(--foreground)', fontSize: 12, fontWeight: 700,
              cursor: interactive ? 'pointer' : 'default',
              boxShadow: '2px 2px 0 var(--border)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
              onMouseEnter={e => { if (interactive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
              onMouseLeave={e => { if (interactive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
            >Hoje</button>
            <button onClick={onClear} disabled={!interactive} style={{
              height: 34, borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--border)',
              background: 'var(--secondary-background)',
              color: 'var(--foreground)', fontSize: 12, fontWeight: 700,
              cursor: interactive ? 'pointer' : 'default',
              boxShadow: '2px 2px 0 var(--border)',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
              onMouseEnter={e => { if (interactive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
              onMouseLeave={e => { if (interactive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
            >Limpar</button>
          </div>
        </>
      )}
    </div>
  )
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    { label, value, defaultValue = null, onChange,
      static: isStatic = false, disabled = false, readOnly = false,
      name, placeholder = "Selecionar prazo...", className }, ref
  ) {
    const id = useId()
    const today = new Date()
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<Date | null>(defaultValue)
    const selected = isControlled ? value! : internalValue
    const [open, setOpen] = useState(false)
    const [viewDate, setViewDate] = useState(selected ?? today)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (isStatic || !open) return
      function handler(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
      }
      document.addEventListener("mousedown", handler)
      return () => document.removeEventListener("mousedown", handler)
    }, [open, isStatic])

    const handleSelect = useCallback((day: Date) => {
      if (!isControlled) setInternalValue(day)
      onChange?.(day)
      setOpen(false)
    }, [isControlled, onChange])

    const handleToday = useCallback(() => {
      handleSelect(today)
      setViewDate(today)
    }, [handleSelect, today])

    const handleClear = useCallback(() => {
      if (!isControlled) setInternalValue(null)
      onChange?.(null)
    }, [isControlled, onChange])

    const handlePrev = useCallback(() => setViewDate(v => new Date(v.getFullYear(), v.getMonth() - 1, 1)), [])
    const handleNext = useCallback(() => setViewDate(v => new Date(v.getFullYear(), v.getMonth() + 1, 1)), [])
    const interactive = !disabled && !readOnly

    const inputBtn: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', height: 44, padding: '0 14px',
      borderRadius: 'var(--radius-base)',
      border: '2px solid var(--border)',
      background: 'var(--secondary-background)',
      color: 'var(--foreground)',
      fontSize: 14, fontWeight: 500,
      cursor: interactive ? 'pointer' : 'default',
      boxShadow: '4px 4px 0 var(--border)',
      transition: 'transform 0.1s, box-shadow 0.1s',
      textAlign: 'left',
      opacity: disabled ? 0.45 : 1,
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
    }

    const sharedContent = (
      <CalendarGrid
        viewDate={viewDate} selected={selected} today={today}
        onSelect={handleSelect} onPrevMonth={handlePrev} onNextMonth={handleNext}
        showActions onToday={handleToday} onClear={handleClear}
        disabled={disabled} readOnly={readOnly}
      />
    )

    if (isStatic) {
      return (
        <div ref={ref} className={className} style={{ width: '100%' }}>
          {name && <input type="hidden" name={name} value={selected ? selected.toISOString() : ""} />}
          {label && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {label}
            </div>
          )}
          <div style={staticWrap}>
            <div style={{
              background: 'var(--background)', padding: '12px 16px',
              borderBottom: '2px solid var(--border)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 4 }}>
                SELECIONAR DATA
              </div>
              <div style={{
                fontSize: 24, fontWeight: 700, color: selected ? 'var(--foreground)' : 'var(--t3)',
                letterSpacing: '-0.02em', fontFamily: 'var(--font-title)',
              }}>
                {selected ? formatDateLong(selected) : "—"}
              </div>
            </div>
            {sharedContent}
          </div>
        </div>
      )
    }

    return (
      <div ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }} className={className} style={{ position: 'relative', width: '100%' }}>
        {name && <input type="hidden" name={name} value={selected ? selected.toISOString() : ""} />}
        {label && (
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {label}
          </div>
        )}
        <button
          id={id} onClick={() => interactive && setOpen(v => !v)} disabled={disabled}
          style={inputBtn}
          onMouseEnter={e => { if (interactive) { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = 'none' } }}
          onMouseLeave={e => { if (interactive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)' } }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--radius-sm)', flexShrink: 0,
            background: selected ? 'var(--main)' : 'transparent',
            border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ph ph-calendar-blank" style={{
              fontSize: 13,
              color: selected ? 'var(--main-foreground)' : 'var(--t3)',
            }} />
          </div>
          <span style={{ flex: 1, color: selected ? 'var(--foreground)' : 'var(--t3)' }}>
            {selected ? formatDate(selected) : placeholder}
          </span>
          {selected && interactive && (
            <span role="button" aria-label="Limpar data"
              onClick={e => { e.stopPropagation(); handleClear() }}
              style={{ fontSize: 16, color: 'var(--t3)', lineHeight: 1, cursor: 'pointer', padding: '0 2px' }}
            >×</span>
          )}
        </button>
        {open && (
          <div style={popupStyle} role="dialog" aria-label="Selecionar data">
            {sharedContent}
          </div>
        )}
      </div>
    )
  }
)
