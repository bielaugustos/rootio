import { useState, useEffect, useCallback, useRef } from 'react'
import type { Habit, HabitList } from '../../engine/habitDB'
import { getHistoryRange, createHabit, updateHabit, syncTodayHistory } from '../../engine/habitDB'
import { HabitCard } from './HabitCard'
import { EntryForm } from './EntryForm'

interface CalendarViewProps {
  habits:    Habit[]
  onToggle:  (id: string) => void
  onDelete:  (id: string) => void
  onRefresh: () => void
  isMobile?: boolean
}

interface DayData {
  date:            Date
  dateStr:         string
  isToday:         boolean
  isOtherMonth:    boolean
  habits:          Habit[]
  doneFromHistory: Set<string>
}

const WEEKDAYS_FULL = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.']

const MONTHS_GEN = [
  'janeiro','fevereiro','março','abril','maio','junho',
  'julho','agosto','setembro','outubro','novembro','dezembro',
]

const TYPE_PILL: Record<HabitList, { bg: string; text: string; dot: string }> = {
  habit: { bg: 'rgba(212,201,169,.3)', text: 'var(--t2)',  dot: '#D4C9A9' },
  task:  { bg: 'rgba(59,130,246,.14)', text: '#1d4ed8',    dot: '#3B82F6' },
  goal:  { bg: 'rgba(217,119,6,.14)',  text: '#92400e',    dot: '#D97706' },
  event: { bg: 'rgba(124,92,219,.14)', text: '#4c1d95',    dot: '#7C5CDB' },
}

const QUICK_ACTIONS: { id: string; label: string; list: HabitList }[] = [
  { id: 'ev', label: 'Novo Evento',  list: 'event' },
  { id: 'ta', label: 'Nova Tarefa',  list: 'task'  },
  { id: 'ha', label: 'Novo Hábito', list: 'habit' },
  { id: 'go', label: 'Nova Meta',   list: 'goal'  },
]

function dateToStr(d: Date) { return d.toISOString().slice(0, 10) }
function todayStr()         { return dateToStr(new Date()) }

function buildCalendarDays(year: number, month: number): Date[] {
  const first    = new Date(year, month, 1)
  const last     = new Date(year, month + 1, 0)
  const startDow = first.getDay()
  const days: Date[] = []
  for (let i = startDow - 1; i >= 0; i--)
    days.push(new Date(year, month, -i))
  for (let d = 1; d <= last.getDate(); d++)
    days.push(new Date(year, month, d))
  while (days.length < 42)
    days.push(new Date(year, month + 1, days.length - last.getDate() - startDow + 1))
  return days
}

function habitsForDay(habits: Habit[], dow: number, dateStr: string): Habit[] {
  return habits.filter(
    h => !h.hidden && h.days.includes(dow) &&
         new Date(h.created_at).toISOString().split('T')[0] <= dateStr
  )
}

// ─── DayCell ─────────────────────────────────────────────────────

function DayCell({
  day, isSelected, onClick, isMobile,
}: {
  day: DayData; isSelected: boolean; onClick: () => void; isMobile: boolean
}) {
  const { date, isToday, isOtherMonth, habits, doneFromHistory } = day
  const maxPills = isMobile ? 0 : 3
  const visible  = habits.slice(0, maxPills)
  const overflow = habits.length - maxPills

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{
        position:      'relative',
        padding:       isMobile ? '6px 5px' : '8px 10px',
        minHeight:     isMobile ? 44 : 90,
        cursor:        'pointer',
        userSelect:    'none',
        borderLeft:    isSelected ? '3px solid var(--main)' : '3px solid transparent',
        background:    isSelected
          ? 'color-mix(in srgb, var(--main) 7%, var(--secondary-background))'
          : 'transparent',
        transition: 'background .1s, border-color .1s',
        display:    'flex', flexDirection: 'column', gap: 3,
        outline:    'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width:        isToday ? 24 : 'auto',
          height:       isToday ? 24 : 'auto',
          borderRadius: isToday ? '50%' : 0,
          background:   isToday ? '#ef4444' : 'transparent',
          color:        isToday ? '#fff' : isOtherMonth ? 'var(--t4)' : 'var(--t1)',
          fontSize:     isMobile ? 12 : 14,
          fontWeight:   isOtherMonth ? 400 : isToday ? 700 : 500,
          lineHeight:   1,
          fontFamily:   'var(--font-sans)',
          flexShrink:   0,
        }}>
          {date.getDate()}
        </span>

        {isMobile && habits.length > 0 && (
          <div style={{ display: 'flex', gap: 2 }}>
            {habits.slice(0, 3).map(h => (
              <div key={h.id} style={{
                width: 4, height: 4, borderRadius: '50%',
                background: TYPE_PILL[h.list].dot,
                opacity: doneFromHistory.has(h.id) || (isToday && h.done) ? 1 : 0.38,
              }} />
            ))}
          </div>
        )}
      </div>

      {!isMobile && visible.map(h => {
        const cfg    = TYPE_PILL[h.list]
        const isDone = doneFromHistory.has(h.id) || (isToday && h.done)
        return (
          <div key={h.id} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '2px 6px', borderRadius: 4,
            background: cfg.bg, fontSize: 10, fontWeight: 600,
            color: isDone ? 'var(--t4)' : cfg.text,
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textDecoration: isDone ? 'line-through' : 'none',
            opacity: isDone ? 0.55 : 1,
          }}>
            <span style={{ flexShrink: 0, lineHeight: 1 }}>{h.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{h.name}</span>
          </div>
        )
      })}

      {!isMobile && overflow > 0 && (
        <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 500, paddingLeft: 6, fontFamily: 'var(--font-sans)' }}>
          +{overflow} mais
        </span>
      )}
    </div>
  )
}

// ─── DayPanel ────────────────────────────────────────────────────

function DayPanel({
  day, habits, onClose, onToggle, onRefresh, isMobile, onDelete,
}: {
  day: DayData; habits: Habit[]; onClose: () => void;
  onToggle: (id: string) => void; onRefresh: () => void;
  isMobile: boolean; onDelete: (id: string) => void;
}) {
  const [formOpen,  setFormOpen]  = useState(false)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)
  const [prefill,   setPrefill]   = useState<Partial<Habit>>({})

  const dayLabel = day.date.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  // Capitalize first letter
  const dayLabelFormatted = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)

  const openCreate = (extra: Partial<Habit> = {}) => {
    setEditHabit(null)
    setPrefill({ deadline: day.dateStr, ...extra })
    setFormOpen(true)
  }

  const handleSave = async (data: Partial<Habit>) => {
    if (editHabit?.id) await updateHabit(editHabit.id, data)
    else               await createHabit(data)
    await syncTodayHistory()
    setFormOpen(false); setEditHabit(null); onRefresh()
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--secondary-background)',
      borderLeft: isMobile ? 'none' : '1px solid var(--b2, #ccc)',
      borderTop:  isMobile ? '1px solid var(--b2, #ccc)' : 'none',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '2px solid var(--border)',
        background: 'var(--background, #eeebe2)',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 17, textTransform: 'capitalize' }}>
            {dayLabelFormatted}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>
            {day.habits.length} {day.habits.length === 1 ? 'entrada' : 'entradas'}
          </div>
        </div>
       
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, border: '1.5px solid var(--b2, #ccc)',
            borderRadius: 'var(--radius-sm)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 13, color: 'var(--t2)', flexShrink: 0,
          }}
        >✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {/* Quick-create chips */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.id}
              onClick={() => openCreate({ list: a.list })}
              style={{
                padding: '3px 10px', fontSize: 11, fontWeight: 700,
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                background: TYPE_PILL[a.list].bg, color: TYPE_PILL[a.list].text,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                boxShadow: '2px 2px 0 var(--border)', transition: 'all .1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translate(2px,2px)'; e.currentTarget.style.boxShadow='none' }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='2px 2px 0 var(--border)' }}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* EntryForm inline */}
        {formOpen && (
          <div style={{
            border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
            marginBottom: 12, overflow: 'hidden', boxShadow: '3px 3px 0 var(--border)',
          }}>
            <EntryForm
              habit={editHabit ?? (prefill as Habit | null)}
              onSave={handleSave}
              onClose={() => { setFormOpen(false); setEditHabit(null) }}
              habits={habits}
            />
          </div>
        )}

        {/* Cards ou empty state — hidden while form is open */}
        {day.habits.length === 0 && !formOpen ? (
          <div style={{
            padding: '28px 16px', textAlign: 'center',
            border: '2px dashed var(--b2, #ccc)', borderRadius: 'var(--radius-base)',
          }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>📅</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>
              Nenhuma entrada para este dia
            </div>
            <button
              onClick={() => openCreate()}
              style={{
                padding: '6px 14px', fontSize: 11, fontWeight: 700,
                border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                background: 'var(--main)', cursor: 'pointer', color: 'var(--main-foreground)',
                boxShadow: '2px 2px 0 var(--border)', fontFamily: 'var(--font-sans)',
              }}
            >+ Criar entrada</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {day.habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={onToggle}
                onEdit={h => { setEditHabit(h); setPrefill({}); setFormOpen(true) }}
                onDelete={onDelete}
                onRefresh={onRefresh}
                isMobile={isMobile}
                collapsed={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CalendarView ─────────────────────────────────────────────────

export function CalendarView({
  habits, onToggle, onDelete, onRefresh, isMobile = false,
}: CalendarViewProps) {
  const today = new Date()
  const [year,         setYear]         = useState(today.getFullYear())
  const [month,        setMonth]        = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [historyCache, setHistoryCache] = useState<Map<string, Set<string>>>(new Map())
  const touchStartX   = useRef<number | null>(null)
  // ── NEW: ref for the DayPanel on mobile so we can scroll to it
  const dayPanelRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const from = `${year}-${String(month+1).padStart(2,'0')}-01`
    const to   = `${year}-${String(month+1).padStart(2,'0')}-${new Date(year,month+1,0).getDate()}`
    getHistoryRange(from, to).then(entries => {
      const cache = new Map<string, Set<string>>()
      for (const e of entries) {
        cache.set(e.date, new Set(
          Object.entries(e.habits ?? {})
            .filter(([,v]) => v.done)
            .map(([id]) => id)
        ))
      }
      setHistoryCache(cache)
    })
  }, [year, month])

  // ── NEW: scroll to DayPanel when it opens on mobile
  useEffect(() => {
    if (isMobile && selectedDate && dayPanelRef.current) {
      // Small timeout so the DOM has rendered the panel before scrolling
      setTimeout(() => {
        dayPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 60)
    }
  }, [isMobile, selectedDate])

  const calDays = buildCalendarDays(year, month)

  const buildDayData = useCallback((d: Date): DayData => ({
    date:            d,
    dateStr:         dateToStr(d),
    isToday:         dateToStr(d) === todayStr(),
    isOtherMonth:    d.getMonth() !== month,
    habits:          habitsForDay(habits, d.getDay(), dateToStr(d)),
    doneFromHistory: historyCache.get(dateToStr(d)) ?? new Set(),
  }), [habits, month, historyCache])

  const selectedDayData = selectedDate
    ? buildDayData(new Date(selectedDate + 'T12:00:00'))
    : null

  const prevMonth = () => month === 0  ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1)
  const nextMonth = () => month === 11 ? (setYear(y=>y+1), setMonth(0))  : setMonth(m=>m+1)
  const goToday   = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDate(todayStr())
  }

  // ── NEW: "Nova entrada" on mobile → select today and open panel
  const handleNovaEntrada = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDate(todayStr())
  }

  // ── NEW: clicking a day
  const handleDayClick = (ds: string) => {
    setSelectedDate(p => p === ds ? null : ds)
  }

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) { if (dx > 0) prevMonth(); else nextMonth() }
    touchStartX.current = null
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const todayHabits    = habitsForDay(habits, today.getDay(), todayStr())
  const doneToday      = todayHabits.filter(h => h.done).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>

      {/* ── "Nova entrada" — mobile only ── */}
      {isMobile && (
        <button
          onClick={handleNovaEntrada}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px 16px', marginBottom: 16,
            border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
            background: 'var(--main)', color: 'var(--main-foreground)',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-sans)',
            cursor: 'pointer', boxShadow: '3px 3px 0 var(--border)',
            transition: 'transform .08s, box-shadow .08s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translate(3px,3px)'; e.currentTarget.style.boxShadow='none' }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='3px 3px 0 var(--border)' }}
        >
          + Nova entrada
        </button>
      )}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, flexWrap: 'wrap',
      }}>
        <div style={{
          fontSize: isMobile ? 22 : 28, fontWeight: 700, color: 'var(--t1)',
          fontFamily: 'Indie Flower', letterSpacing: '-.02em', flex: 1,
        }}>
          {MONTHS_GEN[month]} de {year}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {!isCurrentMonth && (
            <button
              onClick={goToday}
              style={{
                padding: '5px 12px', fontSize: 12, fontWeight: 600,
                border: '1.5px solid var(--border)', borderRadius: 6,
                background: 'var(--secondary-background)', color: 'var(--t1)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >Hoje</button>
          )}
          <button onClick={prevMonth} style={NAV_BTN}>‹</button>
          <button onClick={nextMonth} style={NAV_BTN}>›</button>
        </div>

        {!isMobile && isCurrentMonth && (
          <span style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-sans)' }}>
            {doneToday}/{todayHabits.length} hoje
          </span>
        )}
      </div>

      {/* ── Grid container ── */}
      <div style={{
        display:             isMobile ? 'flex' : 'grid',
        flexDirection:       isMobile ? 'column' : undefined,
        gridTemplateColumns: selectedDate && !isMobile ? '1fr 360px' : '1fr',
        border:       '1px solid var(--b2, #e0ddd6)',
        borderRadius: 8,
        boxShadow:    '0 1px 3px rgba(0,0,0,.07)',
        alignItems:   'stretch',
      }}>
        {/* Grid — clipped independently */}
        <div
          style={{
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', minWidth: 0,
            borderRadius: selectedDate && !isMobile ? '8px 0 0 8px' : 8,
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Weekday headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--b2, #e0ddd6)',
          }}>
            {WEEKDAYS_FULL.map((d, i) => (
              <div key={i} style={{
                padding:   isMobile ? '6px 2px' : '7px 10px',
                textAlign: 'right', fontSize: isMobile ? 9 : 11,
                fontWeight: 400, color: 'var(--t3)', fontFamily: 'var(--font-sans)',
                letterSpacing: '.01em',
              }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: 'repeat(6, 1fr)', flex: 1,
          }}>
            {calDays.map((d, i) => {
              const ds      = dateToStr(d)
              const dayData = buildDayData(d)
              const col     = i % 7
              const row     = Math.floor(i / 7)
              return (
                <div
                  key={i}
                  style={{
                    borderRight:  col < 6 ? '1px solid var(--b2, #e0ddd6)' : 'none',
                    borderBottom: row < 5 ? '1px solid var(--b2, #e0ddd6)' : 'none',
                    opacity:      dayData.isOtherMonth ? 0.3 : 1,
                  }}
                >
                  <DayCell
                    day={dayData}
                    isSelected={selectedDate === ds}
                    isMobile={isMobile}
                    onClick={() => handleDayClick(ds)}
                  />
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex', gap: 14, padding: '7px 12px',
            borderTop: '1px solid var(--b2, #e0ddd6)', flexWrap: 'wrap',
          }}>
            {(['habit','task','goal','event'] as HabitList[]).map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_PILL[t].dot }} />
                <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400, fontFamily: 'var(--font-sans)' }}>
                  {{ habit:'Hábito', task:'Tarefa', goal:'Meta', event:'Evento' }[t]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DayPanel — desktop */}
        {selectedDate && selectedDayData && !isMobile && (
          <div style={{
            borderLeft:   '1px solid var(--b2, #e0ddd6)',
            borderRadius: '0 8px 8px 0',
            overflow:     'hidden',
            display:      'flex',
            flexDirection:'column',
            maxHeight:    '80vh',
            overflowY:    'auto',
          }}>
            <DayPanel
              day={selectedDayData}
              habits={habits}
              onClose={() => setSelectedDate(null)}
              onToggle={onToggle}
              onRefresh={onRefresh}
              isMobile={false}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>

      {/* DayPanel — mobile (abaixo do calendário, com scroll automático) */}
      {isMobile && selectedDate && selectedDayData && (
        <div
          ref={dayPanelRef}
          style={{
            marginTop: 8,
            border: '2px solid var(--border)', borderRadius: 8,
            overflow: 'hidden', boxShadow: '4px 4px 0 var(--border)',
            // Sem maxHeight fixo — deixa o conteúdo respirar; a page faz o scroll
          }}
        >
          <DayPanel
            day={selectedDayData}
            habits={habits}
            onClose={() => setSelectedDate(null)}
            onToggle={onToggle}
            onRefresh={onRefresh}
            isMobile={true}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}

const NAV_BTN: React.CSSProperties = {
  width: 28, height: 28,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1.5px solid var(--border)', borderRadius: 6,
  background: 'var(--secondary-background)', color: 'var(--t1)',
  fontSize: 16, fontWeight: 400, cursor: 'pointer',
  fontFamily: 'var(--font-sans)', transition: 'background .1s',
}