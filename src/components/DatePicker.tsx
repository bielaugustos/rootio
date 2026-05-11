import { useState, useRef } from 'react'

export interface DatePickerProps {
  value?: string        // ISO: 'YYYY-MM-DD'
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  minDate?: string
  maxDate?: string
  disabled?: boolean
  id?: string
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const WEEKDAYS = ['D','S','T','Q','Q','S','S']

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function parseISO(s: string): [number,number,number] | null {
  if (!s) return null
  const parts = s.split('-')
  if (parts.length !== 3) return null
  return [parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2])]
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m+1, 0).getDate()
}

function firstWeekday(y: number, m: number) {
  return new Date(y, m, 1).getDay()
}

function formatDisplay(iso: string) {
  const p = parseISO(iso)
  if (!p) return ''
  const [y, m, d] = p
  return `${String(d).padStart(2,'0')} de ${MONTHS_SHORT[m]} de ${y}`
}

export function DatePicker({ value = '', onChange, placeholder = 'Selecionar data...', label, minDate, maxDate, disabled, id }: DatePickerProps) {
  const today = new Date()
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())

  const parsed = parseISO(value)
  const [viewY, setViewY] = useState(parsed?.[0] ?? today.getFullYear())
  const [viewM, setViewM] = useState(parsed?.[1] ?? today.getMonth())
  const [hovered, setHovered] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const isToday = value === todayISO
  const isDisabledDate = (iso: string) => {
    if (minDate && iso < minDate) return true
    if (maxDate && iso > maxDate) return true
    return false
  }

  const selectDate = (iso: string) => {
    if (isDisabledDate(iso)) return
    onChange?.(iso)
  }

  const prevMonth = () => {
    if (viewM === 0) { setViewY(y => y-1); setViewM(11) }
    else setViewM(m => m-1)
  }
  const nextMonth = () => {
    if (viewM === 11) { setViewY(y => y+1); setViewM(0) }
    else setViewM(m => m+1)
  }

  // Gerar grid do mês
  const days: Array<{ iso: string; d: number; inMonth: boolean }> = []
  const first = firstWeekday(viewY, viewM)
  const total = daysInMonth(viewY, viewM)
  // dias do mês anterior
  const prevTotal = daysInMonth(viewY, viewM === 0 ? 11 : viewM-1)
  const prevY = viewM === 0 ? viewY-1 : viewY
  const prevM = viewM === 0 ? 11 : viewM-1
  for (let i = first-1; i >= 0; i--) {
    days.push({ iso: toISO(prevY, prevM, prevTotal-i), d: prevTotal-i, inMonth: false })
  }
  for (let d = 1; d <= total; d++) {
    days.push({ iso: toISO(viewY, viewM, d), d, inMonth: true })
  }
  // dias do próximo mês
  const nextY = viewM === 11 ? viewY+1 : viewY
  const nextM = viewM === 11 ? 0 : viewM+1
  let nd = 1
  while (days.length % 7 !== 0) {
    days.push({ iso: toISO(nextY, nextM, nd++), d: nd-1, inMonth: false })
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }} data-comp-id={id} data-comp-type="datepicker">
      {label && (
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
          {label}
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => {}}
        style={{
          width: '100%', height: 44, padding: '0 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          border: `2px solid ${value ? 'var(--border)' : 'var(--b2)'}`,
          borderRadius: 'var(--radius-base)',
          background: value ? 'var(--secondary-background)' : 'var(--bg3)',
          boxShadow: value ? '4px 4px 0 var(--border)' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
          textAlign: 'left',
        }}
      >
        {/* Ícone */}
        <div style={{
          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
          background: value ? 'var(--main)' : 'var(--bg3)',
          border: `1.5px solid ${value ? 'var(--border)' : 'var(--b2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          <i className="ph ph-calendar-blank" style={{ fontSize: 13, color: value ? 'var(--main-foreground)' : 'var(--t3)' }} />
        </div>

        {/* Texto */}
        <div style={{ flex: 1 }}>
          {value
            ? <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{formatDisplay(value)}</div>
                {isToday && <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, marginTop: 1 }}>Hoje</div>}
              </div>
            : <span style={{ fontSize: 13, color: 'var(--t4)' }}>{placeholder}</span>
          }
        </div>

        {/* Limpar */}
        {value && !disabled && (
          <div
            onClick={e => { e.stopPropagation(); onChange?.(''); }}
            style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: 'var(--bg3)', border: '1.5px solid var(--b2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <i className="ph ph-x" style={{ fontSize: 10, color: 'var(--t3)' }} />
          </div>
        )}
      </button>

      {/* Calendário docked */}
      <div style={{
        marginTop: 8,
        background: 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--border)',
        padding: '14px',
        userSelect: 'none',
      }}>
        {/* Cabeçalho do mês */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={prevMonth} style={{ width: 28, height: 28, border: '1.5px solid var(--b2)', borderRadius: 6, background: 'var(--bg3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-caret-left" style={{ fontSize: 12, color: 'var(--t2)' }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
            {MONTHS[viewM]} {viewY}
          </span>
          <button onClick={nextMonth} style={{ width: 28, height: 28, border: '1.5px solid var(--b2)', borderRadius: 6, background: 'var(--bg3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-caret-right" style={{ fontSize: 12, color: 'var(--t2)' }} />
          </button>
        </div>

        {/* Dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {WEEKDAYS.map((w, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t4)', padding: '4px 0', textTransform: 'uppercase' }}>{w}</div>
          ))}
        </div>

        {/* Grid de dias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {days.map(({ iso, d, inMonth }) => {
            const isSelected = iso === value
            const isTodayDay = iso === todayISO
            const isHovered = hovered === iso
            const disabled = isDisabledDate(iso)

            return (
              <button
                key={iso}
                onClick={() => selectDate(iso)}
                onMouseEnter={() => !disabled && setHovered(iso)}
                onMouseLeave={() => setHovered('')}
                style={{
                  height: 32, borderRadius: 6,
                  fontSize: 12, fontWeight: isSelected || isTodayDay ? 700 : 400,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-mono)',
                  transition: 'all 0.1s',
                  background: isSelected
                    ? 'var(--main)'
                    : isHovered && !disabled
                      ? 'var(--bg3)'
                      : 'transparent',
                  color: isSelected
                    ? 'var(--main-foreground)'
                    : !inMonth
                      ? 'var(--t4)'
                      : disabled
                        ? 'var(--t4)'
                        : isTodayDay
                          ? 'var(--main)'
                          : 'var(--t1)',
                  boxShadow: isSelected ? '2px 2px 0 var(--border)' : 'none',
                  border: isTodayDay && !isSelected
                    ? '1.5px solid var(--main)'
                    : isSelected
                      ? '2px solid var(--border)'
                      : '1.5px solid transparent',
                  opacity: disabled ? 0.35 : 1,
                }}
              >
                {d}
              </button>
            )
          })}
        </div>

        {/* Rodapé — atalhos */}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--b2)', display: 'flex', gap: 6 }}>
          <button
            onClick={() => selectDate(todayISO)}
            style={{
              flex: 1, height: 28, border: '1.5px solid var(--b2)',
              borderRadius: 6, background: 'var(--bg3)', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, color: 'var(--t2)',
              fontFamily: 'var(--font-sans)',
            }}
          >Hoje</button>
          <button
            onClick={() => { onChange?.('') }}
            style={{
              flex: 1, height: 28, border: '1.5px solid var(--b2)',
              borderRadius: 6, background: 'var(--bg3)', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, color: 'var(--t2)',
              fontFamily: 'var(--font-sans)',
            }}
          >Limpar</button>
        </div>
      </div>
    </div>
  )
}