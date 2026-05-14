/**
 * CalendarView — Rootio · habits/CalendarView.tsx
 * ─────────────────────────────────────────────────────────────────
 * Visualização em calendário mensal para hábitos, tarefas, metas
 * e eventos. Integra-se com o HabitsPage via prop view="calendar".
 *
 * Funcionalidades:
 *   • Grid mensal neobrutalist com dot indicators de hábitos por dia
 *   • Click no dia: abre DayPanel lateral com cards e ações
 *   • Quick-create no dia clicado (atalho +) com mesmo EntryForm
 *   • Ações da imagem 1: Novo Evento, Novo Lembrete, Buscar,
 *     Filtrar, Novo Calendário, Resumo, etc. via menu de contexto
 *   • Navegação por mês com ← →
 *   • Indicadores de cor por tipo (habit/task/goal/event)
 *   • Suporte mobile: swipe para mudar mês
 *
 * Uso no HabitsPage/index.tsx:
 *   import { CalendarView } from './CalendarView'
 *   // substituir o bloco de lista quando view === 'calendar':
 *   {view === 'calendar'
 *     ? <CalendarView habits={habits} onNew={openNew} onEdit={handleEdit} onToggle={handleToggle} onDelete={handleDelete} onRefresh={load} />
 *     : <lista normal...>
 *   }
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Habit, HabitList } from '../../engine/habitDB'
import { getHistoryRange } from '../../engine/habitDB'
import { HabitCard } from './HabitCard'
import { EntryForm } from './EntryForm'
import { createHabit, updateHabit, syncTodayHistory } from '../../engine/habitDB'

// ─── Types ────────────────────────────────────────────────────────

interface CalendarViewProps {
  habits:    Habit[]
  onToggle:  (id: string) => void
  onDelete:  (id: string) => void
  onRefresh: () => void
  isMobile?: boolean
}

interface DayData {
  date:     Date
  dateStr:  string
  isToday:  boolean
  isOtherMonth: boolean
  habits:   Habit[]            // habits scheduled on this day
  doneFromHistory: Set<string> // habit IDs marked done on this date
}

// ─── Constants ───────────────────────────────────────────────────

const WEEKDAYS    = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAYS_SH = ['D',   'S',   'T',   'Q',   'Q',   'S',   'S']
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// type → color mapping
const TYPE_COLOR: Record<HabitList, string> = {
  habit: 'var(--c-habit-b, #D4C9A9)',
  task:  'var(--c-task-b,  #3B82F6)',
  goal:  'var(--c-goal-b,  #D97706)',
  event: 'var(--c-event-b, #7C5CDB)',
}
const TYPE_BG: Record<HabitList, string> = {
  habit: 'var(--c-habit, #F5EFDF)',
  task:  'var(--c-task-bg, #6FB8FF)',
  goal:  'var(--c-goal-bg, #F59E0B)',
  event: 'var(--c-event-bg, #9B7BFF)',
}

// Context menu actions (from image 1)
const CONTEXT_ACTIONS = [
  { id: 'new-event',     icon: 'ph-calendar-plus',   label: 'Novo Evento do Calendário',    list: 'event'  as HabitList },
  { id: 'new-reminder',  icon: 'ph-bell-plus',        label: 'Novo Item do App Lembretes',   list: 'task'   as HabitList },
  { id: 'new-habit',     icon: 'ph-plus-circle',      label: 'Novo Hábito',                  list: 'habit'  as HabitList },
  { id: 'separator1',    icon: '',                    label: '—',                            list: null },
  { id: 'search',        icon: 'ph-magnifying-glass', label: 'Buscar Itens do Calendário',   list: null },
  { id: 'filter',        icon: 'ph-funnel',           label: 'Filtrar Itens do Calendário',  list: null },
  { id: 'separator2',    icon: '',                    label: '—',                            list: null },
  { id: 'summary',       icon: 'ph-list-bullets',     label: 'Resumo de Eventos',            list: null },
]

// ─── Helpers ─────────────────────────────────────────────────────

function dateToStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function todayStr(): string {
  return dateToStr(new Date())
}

/** All days to display in a calendar grid (6 rows × 7 cols = 42 cells) */
function buildCalendarDays(year: number, month: number): Date[] {
  const first     = new Date(year, month, 1)
  const last      = new Date(year, month + 1, 0)
  const startDow  = first.getDay()           // 0=Sun
  const days: Date[] = []

  // Pad start
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push(d)
  }
  // Month days
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  // Pad end to fill 6 rows
  while (days.length < 42) {
    const d = new Date(year, month + 1, days.length - last.getDate() - startDow + 1)
    days.push(d)
  }
  return days
}

/** Habits whose `days[]` includes the given day of week AND not hidden */
function habitsForDay(habits: Habit[], dow: number): Habit[] {
  return habits.filter(h => !h.hidden && h.days.includes(dow))
}

// ─── DayCell ─────────────────────────────────────────────────────

function DayCell({
  day,
  isSelected,
  onClick,
  isMobile,
}: {
  day:        DayData
  isSelected: boolean
  onClick:    () => void
  isMobile:   boolean
}) {
  const { date, isToday, isOtherMonth, habits, doneFromHistory } = day
  const doneCount = habits.filter(h => doneFromHistory.has(h.id) || (isToday && h.done)).length
  const totalCount = habits.length

  // Show up to 3 dot indicators
  const dots = habits.slice(0, isMobile ? 3 : 4)

  return (
    <button
      onClick={onClick}
      aria-label={`${date.getDate()} — ${totalCount} hábitos`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '4px 2px' : '6px 4px',
        minHeight: isMobile ? 48 : 72,
        border: isSelected
          ? '2px solid var(--border)'
          : isToday
            ? '2px solid var(--main)'
            : '2px solid transparent',
        borderRadius: 'var(--radius-sm)',
        background: isSelected
          ? 'var(--main)'
          : isToday
            ? 'color-mix(in srgb, var(--main) 12%, var(--secondary-background))'
            : 'var(--secondary-background)',
        cursor: 'pointer',
        boxShadow: isSelected ? '2px 2px 0 var(--border)' : 'none',
        transform: isSelected ? 'translate(2px,2px)' : 'none',
        transition: 'all .1s',
        opacity: isOtherMonth ? 0.35 : 1,
        fontFamily: 'var(--font-sans)',
        gap: 3,
      }}
    >
      {/* Day number */}
      <span style={{
        fontSize: isMobile ? 12 : 13,
        fontWeight: isToday ? 900 : 600,
        color: isSelected ? 'var(--t1)' : isToday ? 'var(--t1)' : 'var(--t2)',
        lineHeight: 1,
      }}>
        {date.getDate()}
      </span>

      {/* Progress arc (desktop only) */}
      {!isMobile && totalCount > 0 && (
        <div style={{
          fontSize: 9, fontWeight: 700, color: 'var(--t3)',
          fontFamily: 'var(--font-mono)',
        }}>
          {doneCount}/{totalCount}
        </div>
      )}

      {/* Type dots */}
      {dots.length > 0 && (
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {dots.map(h => (
            <div key={h.id} style={{
              width: isMobile ? 5 : 6,
              height: isMobile ? 5 : 6,
              borderRadius: '50%',
              background: TYPE_COLOR[h.list],
              border: '1px solid var(--border)',
              opacity: (doneFromHistory.has(h.id) || (isToday && h.done)) ? 1 : 0.45,
            }} />
          ))}
          {totalCount > dots.length && (
            <span style={{ fontSize: 8, color: 'var(--t3)', fontWeight: 700 }}>
              +{totalCount - dots.length}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

// ─── DayPanel ────────────────────────────────────────────────────

function DayPanel({
  day,
  habits,
  onClose,
  onToggle,
  onRefresh,
  isMobile,
  onDelete,
}: {
  day:       DayData
  habits:    Habit[]
  onClose:   () => void
  onToggle:  (id: string) => void
  onRefresh: () => void
  isMobile:   boolean
  onDelete:  (id: string) => void
}) {
  const [formOpen,    setFormOpen]    = useState(false)
  const [editHabit,   setEditHabit]   = useState<Habit | null>(null)
  const [formPrefill, setFormPrefill] = useState<Partial<Habit>>({})

  const dayLabel = day.date.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const openCreate = (prefill: Partial<Habit> = {}) => {
    const deadline = day.dateStr
    setFormPrefill({ deadline, ...prefill })
    setEditHabit(null)
    setFormOpen(true)
  }

  const handleSave = async (data: Partial<Habit>) => {
    if (editHabit?.id) {
      await updateHabit(editHabit.id, data)
    } else {
      await createHabit(data)
    }
    await syncTodayHistory()
    setFormOpen(false)
    setEditHabit(null)
    onRefresh()
  }

  const handleLocalEdit = (h: Habit) => {
    setEditHabit(h)
    setFormPrefill({})
    setFormOpen(true)
  }

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      height:         '100%',
      background:     'var(--secondary-background)',
      borderLeft:     isMobile ? 'none' : '2px solid var(--border)',
      borderTop:      isMobile ? '2px solid var(--border)' : 'none',
      overflow:       'hidden',
    }}>

      {/* Panel header */}
      <div style={{
        padding:       '12px 16px',
        borderBottom:  '2px solid var(--border)',
        background:    'var(--bg3, #eeebe2)',
        display:       'flex',
        alignItems:    'center',
        gap:           8,
        flexShrink:    0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-title)',
            fontSize:   18,
            color:      'var(--t1)',
            textTransform: 'capitalize',
          }}>
            {dayLabel}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2, fontWeight: 600 }}>
            {day.habits.length} {day.habits.length === 1 ? 'entrada' : 'entradas'}
          </div>
        </div>

        {/* Quick create button */}
        <button
          onClick={() => openCreate()}
          title="Nova entrada neste dia"
          style={{
            width:        30, height: 30,
            border:       '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background:   'var(--main)',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            cursor:       'pointer',
            boxShadow:    '2px 2px 0 var(--border)',
            fontSize:     16, fontWeight: 900,
            transition:   'all .1s',
          }}
        >
          +
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          title="Fechar"
          style={{
            width:        30, height: 30,
            border:       '1.5px solid var(--b2, #ccc)',
            borderRadius: 'var(--radius-sm)',
            background:   'var(--secondary-background)',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            cursor:       'pointer', fontSize: 14, color: 'var(--t2)',
          }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>

        {/* Quick-create context actions */}
        <div style={{
          display:       'flex',
          gap:           6,
          flexWrap:      'wrap',
          marginBottom:  12,
        }}>
          {CONTEXT_ACTIONS.filter(a => a.list !== null && a.label !== '—').map(action => (
            <button
              key={action.id}
              onClick={() => openCreate({ list: action.list as HabitList })}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           5,
                padding:       '4px 10px',
                fontSize:      11,
                fontWeight:    700,
                border:        '1.5px solid var(--border)',
                borderRadius:  'var(--radius-sm)',
                background:    action.list ? TYPE_BG[action.list as HabitList] : 'var(--bg3)',
                cursor:        'pointer',
                fontFamily:    'var(--font-sans)',
                boxShadow:     '2px 2px 0 var(--border)',
                transition:    'all .1s',
                whiteSpace:    'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
            >
              <i className={`ph ${action.icon}`} style={{ fontSize: 13 }} />
              {action.label.replace('do Calendário','').replace('do App Lembretes','').trim()}
            </button>
          ))}
        </div>

        {/* EntryForm (inline when open) */}
        {formOpen && (
          <div style={{
            border:        '2px solid var(--border)',
            borderRadius:  'var(--radius-base)',
            background:    'var(--secondary-background)',
            marginBottom:  12,
            overflow:      'hidden',
            boxShadow:     '3px 3px 0 var(--border)',
          }}>
            <EntryForm
              habit={editHabit ?? (formPrefill as Habit | null)}
              onSave={handleSave}
              onClose={() => { setFormOpen(false); setEditHabit(null) }}
              habits={habits}
            />
          </div>
        )}

        {/* Habit cards for this day */}
        {day.habits.length === 0 ? (
          <div style={{
            padding:    '32px 16px',
            textAlign:  'center',
            border:     '2px dashed var(--b2, #ccc)',
            borderRadius: 'var(--radius-base)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 12 }}>
              Nenhuma entrada para este dia
            </div>
            <button
              onClick={() => openCreate()}
              style={{
                padding:       '7px 16px',
                fontSize:      12,
                fontWeight:    700,
                border:        '2px solid var(--border)',
                borderRadius:  'var(--radius-sm)',
                background:    'var(--main)',
                cursor:        'pointer',
                boxShadow:     '2px 2px 0 var(--border)',
                fontFamily:    'var(--font-sans)',
              }}
            >
              + Criar entrada
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {day.habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={onToggle}
                onEdit={handleLocalEdit}
                onDelete={onDelete}
                onRefresh={onRefresh}
                isMobile={isMobile}
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
  habits,
  onToggle,
  onDelete,
  onRefresh,
  isMobile = false,
}: CalendarViewProps) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate,  setSelectedDate]  = useState<string | null>(todayStr())
  const [historyCache,  setHistoryCache]  = useState<Map<string, Set<string>>>(new Map())
  const [contextMenu,   setContextMenu]   = useState<{ x: number; y: number; dateStr: string } | null>(null)

  const touchStartX = useRef<number | null>(null)

  // Load history for visible month
  useEffect(() => {
    const from = `${year}-${String(month + 1).padStart(2,'0')}-01`
    const to   = `${year}-${String(month + 1).padStart(2,'0')}-${new Date(year, month+1, 0).getDate()}`

    getHistoryRange(from, to).then(entries => {
      const cache = new Map<string, Set<string>>()
      for (const entry of entries) {
        const doneIds = new Set(
          Object.entries(entry.habits ?? {})
            .filter(([, v]) => (v as { done?: boolean }).done)
            .map(([id]) => id)
        )
        cache.set(entry.date, doneIds)
      }
      setHistoryCache(cache)
    })
  }, [year, month])

  // Build grid
  const calDays = buildCalendarDays(year, month)

  const buildDayData = useCallback((d: Date): DayData => {
    const ds   = dateToStr(d)
    const dow  = d.getDay()
    const thisMonthHabits = habitsForDay(habits, dow)

    return {
      date:        d,
      dateStr:     ds,
      isToday:     ds === todayStr(),
      isOtherMonth: d.getMonth() !== month,
      habits:      thisMonthHabits,
      doneFromHistory: historyCache.get(ds) ?? new Set(),
    }
  }, [habits, month, historyCache])

  const selectedDayData = selectedDate
    ? buildDayData(new Date(selectedDate + 'T12:00:00'))
    : null

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else              setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else               setMonth(m => m + 1)
  }
  const goToday = () => {
    setYear(today.getFullYear()); setMonth(today.getMonth())
    setSelectedDate(todayStr())
  }

  // Swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) dx > 0 ? prevMonth() : nextMonth()
    touchStartX.current = null
  }



  const closeContext = () => setContextMenu(null)

  const handleContextAction = (action: typeof CONTEXT_ACTIONS[0]) => {
    if (!contextMenu) return
    if (action.list) {
      // Navigate: open DayPanel for this date + pre-open form
      setSelectedDate(contextMenu.dateStr)
    }
    closeContext()
  }

  // Count stats for header
  const todayHabits = habitsForDay(habits, today.getDay())
  const doneTodayCount = todayHabits.filter(h => h.done).length

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* ── Calendar header ── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   12,
        gap:            8,
        flexWrap:       'wrap',
      }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevMonth} style={navBtnStyle}>
            <i className="ph ph-caret-left" style={{ fontSize: 14 }} />
          </button>
          <div style={{
            fontFamily: 'var(--font-title)',
            fontSize:   isMobile ? 20 : 24,
            color:      'var(--t1)',
            minWidth:   isMobile ? 130 : 160,
            textAlign:  'center',
          }}>
            {MONTHS[month]} {year}
          </div>
          <button onClick={nextMonth} style={navBtnStyle}>
            <i className="ph ph-caret-right" style={{ fontSize: 14 }} />
          </button>
          {!isCurrentMonth && (
            <button onClick={goToday} style={{
              ...navBtnStyle,
              background: 'var(--main)',
              border: '2px solid var(--border)',
              fontSize: 11, fontWeight: 700,
              padding: '4px 10px', width: 'auto',
            }}>
              Hoje
            </button>
          )}
        </div>



        {/* Stats chip */}
        {!isMobile && (
          <div style={{
            display:       'flex',
            alignItems:    'center',
            gap:           5,
            padding:       '5px 12px',
            border:        '2px solid var(--border)',
            borderRadius:  'var(--radius-sm)',
            background:    'var(--bg3, #eeebe2)',
            fontSize:      11,
            fontWeight:    700,
            color:         'var(--t2)',
            boxShadow:     '2px 2px 0 var(--border)',
          }}>
            <span style={{ color: doneTodayCount === todayHabits.length && todayHabits.length > 0 ? 'var(--c-goal-b)' : 'var(--t2)' }}>
              ✓ {doneTodayCount}/{todayHabits.length}
            </span>
            hoje
          </div>
        )}
      </div>

      {/* ── Main calendar + side panel ── */}
      <div style={{
        display:       isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: selectedDate && !isMobile ? '1fr 360px' : '1fr',
        flex:          1,
        border:        '2px solid var(--border)',
        borderRadius:  'var(--radius-base)',
        overflow:      'hidden',
        boxShadow:     '4px 4px 0 var(--border)',
      }}>

        {/* ── Grid ── */}
        <div
          style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Weekday headers */}
          <div style={{
            display:       'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom:  '2px solid var(--border)',
            background:    'var(--bg3, #eeebe2)',
          }}>
            {(isMobile ? WEEKDAYS_SH : WEEKDAYS).map(d => (
              <div key={d} style={{
                padding:    isMobile ? '6px 0' : '8px 0',
                textAlign:  'center',
                fontSize:   isMobile ? 10 : 11,
                fontWeight: 700,
                color:      'var(--t3)',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows:    'repeat(6, 1fr)',
            flex:                1,
            gap:                 1,
            background:          'var(--b2, #ccc)',
            overflow:            'hidden',
          }}>
            {calDays.map((d, i) => {
              const ds      = dateToStr(d)
              const dayData = buildDayData(d)
              return (
                <div key={i} style={{ background: 'var(--secondary-background)' }}>
                  <DayCell
                    day={dayData}
                    isSelected={selectedDate === ds}
                    isMobile={isMobile}
                    onClick={() => setSelectedDate(prev => prev === ds ? null : ds)}
                  />
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{
            display:      'flex',
            gap:          12,
            padding:      '8px 12px',
            borderTop:    '1.5px solid var(--b2, #ccc)',
            background:   'var(--bg3, #eeebe2)',
            flexWrap:     'wrap',
          }}>
            {(['habit','task','goal','event'] as HabitList[]).map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: TYPE_COLOR[t], border: '1px solid var(--border)',
                }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'capitalize' }}>
                  {{ habit:'Hábito', task:'Tarefa', goal:'Meta', event:'Evento' }[t]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Day panel (sidebar) ── */}
        {selectedDate && selectedDayData && !isMobile && (
          <DayPanel
            day={selectedDayData}
            habits={habits}
            onClose={() => setSelectedDate(null)}
            onToggle={onToggle}
            onRefresh={onRefresh}
            isMobile={isMobile}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* ── Mobile: Day panel as bottom sheet ── */}
      {isMobile && selectedDate && selectedDayData && (
        <div style={{
          marginTop:    8,
          border:       '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          overflow:     'hidden',
          boxShadow:    '4px 4px 0 var(--border)',
          maxHeight:    '50vh',
          overflowY:    'auto',
        }}>
          <DayPanel
            day={selectedDayData}
            habits={habits}
            onClose={() => setSelectedDate(null)}
            onToggle={onToggle}
            onRefresh={onRefresh}
            isMobile={isMobile}
            onDelete={onDelete}
          />
        </div>
      )}

      {/* ── Context menu ── */}
      {contextMenu && (
        <>
          <div
            onClick={closeContext}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          <div style={{
            position:     'fixed',
            left:         contextMenu.x,
            top:          contextMenu.y,
            zIndex:       999,
            background:   'var(--secondary-background)',
            border:       '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow:    '6px 6px 0 var(--border)',
            minWidth:     220,
            overflow:     'hidden',
            fontFamily:   'var(--font-sans)',
          }}>
            {CONTEXT_ACTIONS.map((action, i) => {
              if (action.label === '—') return (
                <div key={i} style={{ height: 1, background: 'var(--b2, #ccc)', margin: '2px 0' }} />
              )
              return (
                <button
                  key={action.id}
                  onClick={() => handleContextAction(action)}
                  style={{
                    display:     'flex',
                    alignItems:  'center',
                    gap:         10,
                    width:       '100%',
                    padding:     '9px 14px',
                    fontSize:    13,
                    fontWeight:  600,
                    fontFamily:  'var(--font-sans)',
                    border:      'none',
                    background:  'transparent',
                    color:       'var(--t1)',
                    cursor:      'pointer',
                    textAlign:   'left',
                    transition:  'background .1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3, #eeebe2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <i className={`ph ${action.icon}`} style={{
                    fontSize:   16,
                    color:      action.list ? TYPE_COLOR[action.list as HabitList] : 'var(--t3)',
                    flexShrink: 0,
                  }} />
                  {action.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Shared styles ───────────────────────────────────────────────

const navBtnStyle: React.CSSProperties = {
  width:        32,
  height:       32,
  border:       '2px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  background:   'var(--secondary-background)',
  display:      'flex',
  alignItems:   'center',
  justifyContent: 'center',
  cursor:       'pointer',
  boxShadow:    '2px 2px 0 var(--border)',
  transition:   'all .1s',
  color:        'var(--t1)',
}