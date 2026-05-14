/**
 * HabitsTimeline — Rootio · habits/HabitsTimeline.tsx
 * ─────────────────────────────────────────────────────────────────
 * Timeline vertical de atividade de hábitos, estilo changelog.
 * Aparece como 3ª coluna sticky na HabitsPage (desktop) ou
 * colapsada como gaveta inferior (mobile).
 *
 * Cada item da timeline representa uma ação registrada:
 *   • Hábito criado
 *   • Hábito concluído (com IO ganho)
 *   • Streak atingido (7d, 14d, 30d)
 *   • Meta avançada
 *   • Hábito excluído / restaurado
 *   • Nota/insight adicionado
 *
 * Dados:
 *   - getHistoryRange() → para atividade de conclusões por data
 *   - habit.created_at  → para entradas de criação
 *   - localStorage 'rootio-timeline' → cache de eventos extras (streaks, etc.)
 *
 * Uso em HabitsPage/index.tsx:
 *   import { HabitsTimeline } from './HabitsTimeline'
 *
 *   // Dentro do layout de 3 colunas:
 *   {!isMobile && (
 *     <HabitsTimeline habits={habits} isMobile={false} />
 *   )}
 */

import { useState, useEffect, useMemo } from 'react'
import type { Habit, HabitList } from '../../engine/habitDB'
import { getHistoryRange } from '../../engine/habitDB'

// ─── Types ────────────────────────────────────────────────────────

type EventType =
  | 'created'
  | 'completed'
  | 'streak'
  | 'goal_progress'
  | 'deleted'
  | 'restored'
  | 'note'
  | 'day_perfect'

export interface TimelineEvent {
  id:        string
  type:      EventType
  date:      string          // ISO "YYYY-MM-DD"
  time?:     string          // "HH:MM" optional
  habitId:   string
  habitName: string
  habitIcon: string
  list:      HabitList
  meta?: {
    pts?:        number
    streakDays?: number
    pct?:        number
    note?:       string
    doneCount?:  number
    totalCount?: number
  }
}

interface Props {
  habits:    Habit[]
  collapsed?: boolean
  onToggleCollapse?: () => void
}

// ─── Constants ────────────────────────────────────────────────────

const TYPE_CONFIG: Record<EventType, {
  icon:    string
  color:   string     // dot background
  border:  string     // dot border
  label:   string
  bg:      string     // card tint
}> = {
  created:      { icon: '✨', color: '#F5EFDF', border: '#D4C9A9', label: 'Criado',       bg: 'transparent' },
  completed:    { icon: '✓',  color: '#ffbf00', border: '#000',    label: 'Concluído',    bg: 'transparent' },
  streak:       { icon: '🔥', color: '#F59E0B', border: '#D97706', label: 'Streak',       bg: 'rgba(245,158,11,.06)' },
  goal_progress:{ icon: '📈', color: '#6FB8FF', border: '#3B82F6', label: 'Meta',         bg: 'transparent' },
  deleted:      { icon: '🗑', color: '#f0ede6', border: '#ccc',    label: 'Excluído',     bg: 'transparent' },
  restored:     { icon: '↩',  color: '#dcfce7', border: '#15803d', label: 'Restaurado',   bg: 'transparent' },
  note:         { icon: '💬', color: '#ede9fe', border: '#7C5CDB', label: 'Insight',      bg: 'transparent' },
  day_perfect:  { icon: '🌟', color: '#ffbf00', border: '#000',    label: 'Dia perfeito', bg: 'rgba(255,191,0,.08)' },
}

const LIST_DOT_COLOR: Record<HabitList, string> = {
  habit: '#D4C9A9',
  task:  '#3B82F6',
  goal:  '#D97706',
  event: '#7C5CDB',
}

const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90]

// ─── Helpers ──────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function formatRelativeDate(iso: string): string {
  const today = todayISO()
  const yesterday = daysAgoISO(1)
  if (iso === today)     return 'Hoje'
  if (iso === yesterday) return 'Ontem'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/** Build synthetic timeline events from habits + history */
function buildEvents(
  habits: Habit[],
  history: Awaited<ReturnType<typeof getHistoryRange>>,
): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const today = todayISO()

  // ── Creation events (last 30 days) ──
  for (const h of habits) {
    if (!h.created_at) continue
    const dateStr = h.created_at.slice(0, 10)
    if (dateStr < daysAgoISO(30)) continue
    events.push({
      id:        `created-${h.id}`,
      type:      'created',
      date:      dateStr,
      time:      formatTime(h.created_at),
      habitId:   h.id,
      habitName: h.name,
      habitIcon: h.icon,
      list:      h.list,
    })
  }

  // ── History events (completions per day) ──
  for (const entry of history) {
    const completedHabits = Object.entries(entry.habits ?? {})
      .filter(([, v]) => v.done)

    if (completedHabits.length === 0) continue

    // Day perfect?
    if (completedHabits.length === entry.total && entry.total > 0) {
      events.push({
        id:        `perfect-${entry.date}`,
        type:      'day_perfect',
        date:      entry.date,
        habitId:   'day',
        habitName: 'Dia perfeito',
        habitIcon: '🌟',
        list:      'habit',
        meta:      { doneCount: completedHabits.length, totalCount: entry.total },
      })
    } else {
      // Individual completions — group into a single event per day if many
      const first = completedHabits[0]
      const h = habits.find(x => x.id === first[0])
      if (h) {
        events.push({
          id:        `completed-${entry.date}-batch`,
          type:      'completed',
          date:      entry.date,
          habitId:   h.id,
          habitName: completedHabits.length === 1
            ? h.name
            : `${h.name} +${completedHabits.length - 1}`,
          habitIcon: h.icon,
          list:      h.list,
          meta:      {
            pts:        completedHabits.reduce((s, [, v]) => s + v.pts, 0),
            doneCount:  completedHabits.length,
            totalCount: entry.total,
          },
        })
      }
    }
  }

  // ── Today's completions (live) ──
  const todayDone = habits.filter(h => h.done)
  for (const h of todayDone) {
    // Don't duplicate if history already has today
    const alreadyHasToday = events.some(
      e => e.date === today && (e.habitId === h.id || e.type === 'day_perfect')
    )
    if (!alreadyHasToday) {
      events.push({
        id:        `live-${h.id}`,
        type:      'completed',
        date:      today,
        habitId:   h.id,
        habitName: h.name,
        habitIcon: h.icon,
        list:      h.list,
        meta:      { pts: h.pts },
      })
    }
  }

  // ── Streak milestone events from localStorage ──
  try {
    const stored = JSON.parse(localStorage.getItem('rootio-streak-events') ?? '[]') as TimelineEvent[]
    events.push(...stored.filter(e => e.date >= daysAgoISO(30)))
  } catch {
    // Silently ignore localStorage parsing errors
  }

  // Sort newest first, deduplicate
  const seen = new Set<string>()
  return events
    .filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true })
    .sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date)
      if (dateCmp !== 0) return dateCmp
      if (a.time && b.time) return b.time.localeCompare(a.time)
      return 0
    })
}

/** Call this when a streak milestone is reached */
export function recordStreakMilestone(habit: Habit, streakDays: number) {
  if (!STREAK_MILESTONES.includes(streakDays)) return
  try {
    const key  = 'rootio-streak-events'
    const prev = JSON.parse(localStorage.getItem(key) ?? '[]') as TimelineEvent[]
    const id   = `streak-${habit.id}-${streakDays}`
    if (prev.some(e => e.id === id)) return   // already recorded
    const next: TimelineEvent = {
      id,
      type:      'streak',
      date:      todayISO(),
      habitId:   habit.id,
      habitName: habit.name,
      habitIcon: habit.icon,
      list:      habit.list,
      meta:      { streakDays },
    }
    localStorage.setItem(key, JSON.stringify([next, ...prev].slice(0, 100)))
  } catch {}
}

// ─── TimelineItem ──────────────────────────────────────────────────

function TimelineItem({
  event,
  isLast,
  showDate,
}: {
  event:    TimelineEvent
  isLast:   boolean
  showDate: boolean      // show date label only on first of each group
}) {
  const cfg  = TYPE_CONFIG[event.type]
  const isToday = event.date === todayISO()

  const dotLabel = (() => {
    switch (event.type) {
      case 'completed':
        return event.meta?.pts ? `+${event.meta.pts} IO` : ''
      case 'streak':
        return `${event.meta?.streakDays}d 🔥`
      case 'day_perfect':
        return `${event.meta?.doneCount}/${event.meta?.totalCount}`
      default:
        return ''
    }
  })()

  const bodyText = (() => {
    switch (event.type) {
      case 'created':
        return `Novo ${event.list === 'habit' ? 'hábito' : event.list === 'task' ? 'tarefa' : event.list === 'goal' ? 'meta' : 'evento'} criado`
      case 'completed':
        if (event.meta?.doneCount && (event.meta.doneCount > 1)) {
          return `${event.meta.doneCount} entradas concluídas`
        }
        return event.meta?.pts ? `+${event.meta.pts} IO ganhos` : 'Concluído'
      case 'streak':
        return `Sequência de ${event.meta?.streakDays} dias!`
      case 'goal_progress':
        return `${event.meta?.pct}% da meta`
      case 'day_perfect':
        return `${event.meta?.doneCount}/${event.meta?.totalCount} hábitos concluídos`
      case 'deleted':
        return 'Movido para excluídos'
      case 'restored':
        return 'Restaurado da lixeira'
      case 'note':
        return event.meta?.note ?? 'Insight adicionado'
      default:
        return ''
    }
  })()

  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>

      {/* ── Left: date label ── */}
      <div style={{
        width:      52,
        flexShrink: 0,
        textAlign:  'right',
        paddingRight: 12,
        paddingTop:   2,
      }}>
        {showDate && (
          <span style={{
            fontSize:    10,
            fontWeight:  700,
            color:       isToday ? 'var(--t1)' : 'var(--t3)',
            background:  isToday ? 'var(--main)' : 'transparent',
            padding:     isToday ? '1px 5px' : '0',
            borderRadius: 3,
            border:      isToday ? '1px solid var(--border)' : 'none',
            whiteSpace:  'nowrap',
            display:     'inline-block',
            lineHeight:  1.4,
          }}>
            {formatRelativeDate(event.date)}
          </span>
        )}
      </div>

      {/* ── Center: dot + line ── */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        flexShrink:     0,
        width:          20,
      }}>
        {/* Dot */}
        <div style={{
          width:        14,
          height:       14,
          borderRadius: '50%',
          background:   cfg.color,
          border:       `2px solid ${cfg.border}`,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontSize:     7,
          flexShrink:   0,
          zIndex:       1,
          boxShadow:    event.type === 'streak' || event.type === 'day_perfect'
            ? '0 0 0 3px rgba(255,191,0,.25)'
            : 'none',
          transition:   'transform .15s',
        }}>
          {event.type === 'completed' && (
            <span style={{ fontWeight: 900, fontSize: 8, color: '#000', lineHeight: 1 }}>✓</span>
          )}
        </div>

        {/* Connector line */}
        {!isLast && (
          <div style={{
            flex:             1,
            width:            2,
            minHeight:        20,
            background:       'var(--bg3, #eeebe2)',
            borderRadius:     1,
            marginTop:        2,
          }} />
        )}
      </div>

      {/* ── Right: event card ── */}
      <div style={{
        flex:          1,
        paddingLeft:   10,
        paddingBottom: isLast ? 0 : 14,
        paddingTop:    0,
      }}>
        <div style={{
          background:   cfg.bg !== 'transparent' ? cfg.bg : undefined,
          borderRadius: 'var(--radius-sm)',
          padding:      cfg.bg !== 'transparent' ? '7px 10px' : '0 0 0 0',
          border:       cfg.bg !== 'transparent' ? '1px solid var(--b2, #ccc)' : 'none',
        }}>
          {/* Name row */}
          <div style={{
            display:     'flex',
            alignItems:  'center',
            gap:         6,
            marginBottom: 1,
          }}>
            {/* Type icon */}
            <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>
              {event.habitIcon}
            </span>

            {/* Name */}
            <span style={{
              fontSize:     12,
              fontWeight:   700,
              color:        'var(--t1)',
              flex:         1,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}>
              {event.habitName}
            </span>

            {/* IO / streak badge */}
            {dotLabel && (
              <span style={{
                fontSize:     9,
                fontWeight:   800,
                padding:      '1px 6px',
                border:       `1.5px solid ${cfg.border}`,
                borderRadius: 99,
                background:   cfg.color,
                color:        'var(--t1)',
                flexShrink:   0,
                fontFamily:   'var(--font-mono)',
              }}>
                {dotLabel}
              </span>
            )}
          </div>

          {/* Body text */}
          <div style={{
            fontSize:  11,
            color:     'var(--t3)',
            fontWeight: 500,
            lineHeight: 1.4,
            display:   'flex',
            alignItems: 'center',
            gap:        5,
          }}>
            {/* List dot */}
            <span style={{
              width:        6,
              height:       6,
              borderRadius: '50%',
              background:   LIST_DOT_COLOR[event.list],
              flexShrink:   0,
              display:      'inline-block',
            }} />
            {bodyText}
            {event.time && (
              <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--t4)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {event.time}
              </span>
            )}
          </div>

          {/* Note content */}
          {event.type === 'note' && event.meta?.note && (
            <div style={{
              marginTop:    5,
              fontSize:     11,
              color:        'var(--t2)',
              fontStyle:    'italic',
              borderLeft:   '2px solid var(--c-event-b, #7C5CDB)',
              paddingLeft:  7,
              lineHeight:   1.5,
            }}>
              "{event.meta.note}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── DateGroupLabel ───────────────────────────────────────────────

// ─── HabitsTimeline (main export) ────────────────────────────────

export function HabitsTimeline({ habits, collapsed = false, onToggleCollapse }: Props) {
  const [events,    setEvents]    = useState<TimelineEvent[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<'all' | EventType>('all')
  const [showAll,   setShowAll]   = useState(false)

  useEffect(() => {
    const from = daysAgoISO(30)
    const to   = todayISO()

    getHistoryRange(from, to).then(history => {
      setEvents(buildEvents(habits, history))
      setLoading(false)
    }).catch(() => {
      setEvents(buildEvents(habits, []))
      setLoading(false)
    })
  }, [habits])

  // Group events by date for separator labels
  const filtered = useMemo(() => {
    const base = filter === 'all' ? events : events.filter(e => e.type === filter)
    return showAll ? base : base.slice(0, 20)
  }, [events, filter, showAll])

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, TimelineEvent[]>()
    for (const e of filtered) {
      const g = groups.get(e.date) ?? []
      g.push(e)
      groups.set(e.date, g)
    }
    return groups
  }, [filtered])

  const totalCount = filter === 'all' ? events.length : events.filter(e => e.type === filter).length

  // ── Collapsed state (mobile / toggle) ──
  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:         8,
          padding:     '8px 14px',
          border:      '2px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          background:  'var(--secondary-background)',
          cursor:      'pointer',
          fontFamily:  'var(--font-sans)',
          boxShadow:   '2px 2px 0 var(--border)',
          width:       '100%',
          transition:  'all .1s',
        }}
      >
        <span style={{ fontSize: 14 }}>📋</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)' }}>
          Timeline · {events.length} eventos
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--t3)' }}>↑</span>
      </button>
    )
  }

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
      minWidth:      0,
    }}>

      {/* ── Header ── */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        gap:           8,
        marginBottom:  14,
        flexShrink:    0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize:    14,
            fontWeight:  800,
            color:       'var(--t1)',
            fontFamily:  'var(--font-title)',
            marginBottom: 2,
          }}>
            Atividade
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
            Últimos 30 dias
          </div>
        </div>

        {/* Collapse button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title="Recolher"
            style={{
              width:        24, height: 24,
              border:       '1.5px solid var(--b2, #ccc)',
              borderRadius: 'var(--radius-sm)',
              background:   'var(--secondary-background)',
              cursor:       'pointer',
              display:      'flex', alignItems: 'center', justifyContent: 'center',
              fontSize:     12, color: 'var(--t3)',
            }}
          >
            →
          </button>
        )}
      </div>

      {/* ── Filter chips ── */}
      <div style={{
        display:       'flex',
        gap:           5,
        flexWrap:      'wrap',
        marginBottom:  14,
        flexShrink:    0,
      }}>
        {([
          ['all',       'Todos',     ''],
          ['completed', '✓ Feitos',  '#ffbf00'],
          ['streak',    '🔥 Streak', '#F59E0B'],
          ['created',   '✨ Novos',  '#F5EFDF'],
        ] as [string, string, string][]).map(([id, label, bg]) => (
          <button
            key={id}
            onClick={() => setFilter(id as 'all' | EventType)}
            style={{
              padding:       '3px 9px',
              fontSize:      10,
              fontWeight:    700,
              border:        `1.5px solid ${filter === id ? 'var(--border)' : 'var(--b2, #ccc)'}`,
              borderRadius:  99,
              background:    filter === id ? (bg || 'var(--border)') : 'var(--secondary-background)',
              color:         filter === id ? (bg ? 'var(--t1)' : 'var(--bg2, #fff)') : 'var(--t3)',
              cursor:        'pointer',
              fontFamily:    'var(--font-sans)',
              transition:    'all .1s',
              boxShadow:     filter === id ? '1px 1px 0 var(--border)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Timeline body ── */}
      <div style={{
        flex:       1,
        overflowY:  'auto',
        paddingRight: 2,
      }}>

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: 'var(--t3)' }}>
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding:      '32px 16px',
            textAlign:    'center',
            border:       '2px dashed var(--bg3, #eeebe2)',
            borderRadius: 'var(--radius-base)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.5 }}>
              {habits.length === 0
                ? 'Crie seu primeiro hábito para ver a atividade aqui.'
                : 'Nenhuma atividade neste período.'}
            </div>
          </div>
        ) : (
          <div>
            {(() => {
              const items: React.ReactNode[] = []
              let prevDate = ''
              const allItems = Array.from(groupedByDate.entries()).flatMap(([, evts]) => evts)

              allItems.forEach((event, globalIdx) => {
                // Date group separator
                if (event.date !== prevDate) {
                  if (prevDate) {
                    items.push(<div key={`sep-${event.date}`} style={{ height: 4 }} />)
                  }
                  prevDate = event.date
                }

                const isLastInAll = globalIdx === allItems.length - 1
                const dateGroup   = groupedByDate.get(event.date) ?? []
                const idxInGroup  = dateGroup.indexOf(event)
                const showDate    = idxInGroup === 0

                items.push(
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={isLastInAll}
                    showDate={showDate}
                  />
                )
              })

              return items
            })()}

            {/* Show more */}
            {totalCount > 20 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                style={{
                  display:     'block',
                  width:       '100%',
                  marginTop:   10,
                  padding:     '7px',
                  fontSize:    11,
                  fontWeight:  700,
                  border:      '1.5px dashed var(--b2, #ccc)',
                  borderRadius: 'var(--radius-sm)',
                  background:  'transparent',
                  color:       'var(--t3)',
                  cursor:      'pointer',
                  fontFamily:  'var(--font-sans)',
                  transition:  'all .1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--t1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b2, #ccc)'; e.currentTarget.style.color = 'var(--t3)' }}
              >
                Ver mais {totalCount - 20} eventos
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Footer stats ── */}
      {!loading && events.length > 0 && (
        <div style={{
          display:     'flex',
          gap:         8,
          marginTop:   12,
          paddingTop:  10,
          borderTop:   '1px solid var(--bg3, #eeebe2)',
          flexShrink:  0,
          flexWrap:    'wrap',
        }}>
          {[
            {
              label: 'Completadas',
              value: events.filter(e => e.type === 'completed' || e.type === 'day_perfect').length,
              color: 'var(--main)',
            },
            {
              label: 'Milestones',
              value: events.filter(e => e.type === 'streak').length,
              color: '#F59E0B',
            },
            {
              label: 'Criados',
              value: events.filter(e => e.type === 'created').length,
              color: '#D4C9A9',
            },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                fontSize:    16,
                fontWeight:  900,
                color:       'var(--t1)',
                lineHeight:  1,
                marginBottom: 2,
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize:   9,
                fontWeight: 700,
                color:      'var(--t3)',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
              }}>
                {s.label}
              </div>
              <div style={{
                height:       2,
                background:   s.color,
                borderRadius: 1,
                marginTop:    3,
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}