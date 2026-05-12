import { useState, useEffect } from 'react'
import { toggleSubtask, getHabitStreak, type Habit } from '../../engine'
import { LIST_COLORS, LIST_LABELS } from './habitConstants'
import { Checkbox } from '../../components/Checkbox'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { Badge } from '../../components/Badge'

import { LembretePanel } from './LembretePanel'
import { TimerPanel } from './panels/TimerPanel'
import { AnexosPanel } from './panels/AnexosPanel'
import { AgendarPanel } from './panels/AgendarPanel'
import { ParticipantesPanel, TabelaPanel } from './panels/ParticipantesPanel'

const progressoIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="M18 9v9"/><path d="M12 9v9"/><path d="M6 9v9"/><path d="M21 9H3"/></svg>


interface HabitCardProps {
  habit: Habit
  onToggle: (id: string) => void
  onEdit: (habit: Habit) => void
  onRefresh: () => void
  onOpenHistorico?: (habit: Habit) => void
  onCloseHistorico?: () => void
  isHistoricoOpen?: boolean
  isMobile?: boolean
}





function GoalPanels({ habit }: { habit: Habit }) {
  const [active, setActive] = useState<'progress' | null>(null)

  const current = habit.goal_current ?? 0
  const target  = habit.goal_target ?? 0
  const unit    = habit.goal_unit ?? ''
  const period  = habit.goal_period
  const pct     = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const done    = pct >= 100

  const toggle = (panel: 'progress') =>
    setActive(prev => prev === panel ? null : panel)

  return (
    <div style={{ width: '100%', padding: '8px 16px' }}>
      <div style={{ display: 'flex', gap: 8 }}>
      <Pill label="Progresso" variant="goal" selected={active === 'progress'} onClick={() => toggle('progress')} id="pill-progress"
        icon={progressoIcon}
        style={{ background: '#FBBF24', border: `2px solid var(--foreground)` }}
        disableHover
      />
      </div>

      {active && (
        <div style={{
          marginTop: 10, padding: '10px 12px',
          background: 'var(--bg3, #e8e4dc)', border: '1.5px solid var(--b2)',
          borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: 8,
          minHeight: '140px',
        }}>
          {active === 'progress' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {period && (
                <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                  Meta detectada. Acompanhamento {period} ativo.
                </div>
              )}
              {target > 0 ? (
                <>
                  {/* Barra de progresso */}
                  <div style={{ height: 6, background: 'var(--b2)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--b2)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: done ? '#22c55e' : 'var(--c-goal, #F59E0B)', borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: done ? '#22c55e' : 'var(--c-goal, #F59E0B)' }}>
                      {unit} {current.toLocaleString('pt-BR')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                      {pct}% · meta {unit} {target.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {done && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#22c55e' }}>
                      <i className="ph ph-check-circle" style={{ fontSize: 14 }} />
                      Meta concluída! 🎉
                    </div>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--t3)', fontStyle: 'italic' }}>
                  Defina um valor alvo no formulário para ver o progresso.
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function HabitCard({ habit, onToggle, onEdit, onRefresh, onOpenHistorico, onCloseHistorico, isHistoricoOpen, isMobile }: HabitCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [streak, setStreak] = useState(0)
  const [sprintActive, setSprintActive] = useState(() => localStorage.getItem('sprint-active') === '1')
  const colors = LIST_COLORS[habit.list]
  const doneSubtasks = habit.subtasks.filter(s => s.done).length

  const hasProgress = habit.list === 'goal' && (habit.goal_target ?? 0) > 0
  const hasDetails = (habit.tags ?? []).length > 0 || !!habit.notes?.trim()

  const formatTimeWithAmPm = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    const period = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
  }

  useEffect(() => {
    const handleSprintState = (e: CustomEvent) => {
      setSprintActive(e.detail.active)
      localStorage.setItem('sprint-active', e.detail.active ? '1' : '0')
    }
    window.addEventListener('sprint-state', handleSprintState as EventListener)
    return () => window.removeEventListener('sprint-state', handleSprintState as EventListener)
  }, [])

  useEffect(() => {
    getHabitStreak(habit.id).then(setStreak)
  }, [habit.id])

  return (
    <div style={{
      background: 'var(--background)',
      border: `2px solid ${habit.done ? 'var(--b2)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-base)',
      boxShadow: 'none',
      opacity: habit.done ? 0.7 : 1,
      transition: 'all 0.15s',
      overflow: 'hidden',
      width: '100%',
      minWidth: 0,
    }}>
      {/* Zona 1 — Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
        <Checkbox
          checked={habit.done}
          onChange={() => onToggle(habit.id)}
          id={`habit-${habit.id}-checkbox`}
          backgroundColor={habit.done ? colors.bg : undefined}
          borderColor={habit.done ? colors.border : undefined}
          checkColor={habit.done ? colors.text : undefined}
        />
        <span style={{ fontSize: 20, flexShrink: 0 }}>{habit.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)', color: 'var(--t1)',
            textDecoration: habit.done ? 'line-through' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {habit.name}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge label={habit.list === 'habit' ? 'Hábito' : habit.list === 'task' ? 'Tarefa' : habit.list === 'goal' ? 'Meta' : habit.list === 'event' ? 'Evento' : LIST_LABELS[habit.list]} variant="default" style={habit.list === 'habit' ? { background: '#FEF3C7', color: 'black' } : habit.list === 'task' ? { background: '#6FB8FF', color: 'black' } : habit.list === 'goal' ? { color: 'black' } : habit.list === 'event' ? { background: '#9B7BFF', color: 'black' } : undefined} />
            {habit.pts > 0 && <Badge label={`+${habit.pts} IO`} variant="destructive" />}
            {/* Streak dots */}
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const hoje = new Date().getDay()
                const daysAgo = (hoje - i + 7) % 7
                const isToday = daysAgo === 0
                const isFilled = daysAgo < streak
                const isEmpty = streak === 0 && isToday
                return (
                  <div key={i} style={{
                    width: isToday ? 8 : 6,
                    height: isToday ? 8 : 6,
                    borderRadius: '50%',
                    border: isToday ? '1px solid var(--border)' : 'none',
                    background: isFilled && !isEmpty ? 'var(--main)' : 'var(--b2)',
                  }} />
                )
              })}
            </div>
          </div>
        </div>

        {/* Actions header */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          {!habit.done && sprintActive && (
            <Button size="tiny" variant="ghost" onClick={() => {}}>
              ⚡
            </Button>
          )}
          <Button size="tiny" variant="ghost" onClick={() => onEdit(habit)}>
            <i className="ph ph-pencil-simple" />
          </Button>
          <Button size="tiny" variant="ghost" onClick={() => setExpanded(e => !e)}>
            <i className={`ph ${expanded ? 'ph-caret-up' : 'ph-caret-down'}`} />
          </Button>
        </div>
      </div>

      {/* Zona 2 — Progresso */}
      {hasProgress && (
        <div style={{ padding: '0 16px 8px 56px' }}>
          {habit.list === 'goal' && (habit.goal_target ?? 0) > 0 && (() => {
            const pct = Math.min(100, Math.round(((habit.goal_current ?? 0) / (habit.goal_target ?? 1)) * 100))
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: 'var(--b2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--c-goal, #F59E0B)', borderRadius: 2, transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--c-goal, #F59E0B)', flexShrink: 0 }}>{pct}%</span>
              </div>
            )
          })()}
        </div>
      )}
      {habit.list !== 'goal' && habit.subtasks.length > 0 && (
        <div style={{ padding: '0 16px 8px 56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--b2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${habit.subtasks.length > 0 ? (doneSubtasks / habit.subtasks.length) * 100 : 0}%`,
                background: doneSubtasks === habit.subtasks.length && habit.list === 'task' ? '#7CE577' : doneSubtasks === habit.subtasks.length ? '#22c55e' : 'var(--main)',
                borderRadius: 4, transition: 'width 0.3s',
              }} />
            </div>
      <span style={{ fontSize: 10, fontWeight: 500, color: doneSubtasks === habit.subtasks.length && habit.list === 'task' ? '#7CE577' : doneSubtasks === habit.subtasks.length ? '#22c55e' : 'var(--main)', flexShrink: 0 }}>
        {doneSubtasks}/{habit.subtasks.length}
      </span>
          </div>
        </div>
      )}

      {/* Expanded zones */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* ActionZone */}
          {(habit.list === 'habit' || habit.list === 'task' || habit.list === 'event' || habit.list === 'goal') && (
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--b2)',
            }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {(habit.list === 'habit' || habit.list === 'task') && (
                  <Pill label={`${streak}d streak`} variant="default" size="sm"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
                  />
                )}

                {habit.list === 'habit' && (
                  <>
                    <Pill label="Histórico" variant="default" size="sm" selected={isHistoricoOpen}
                      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="M18 9v9"/><path d="M12 9v9"/><path d="M6 9v9"/><path d="M21 9H3"/></svg>}
                      onClick={() => isHistoricoOpen ? onCloseHistorico?.() : onOpenHistorico?.(habit)}
                    />
                    <LembretePanel habit={habit} onRefresh={onRefresh} />
                  </>
                )}

                {habit.list === 'task' && (
                  <>
                    <TimerPanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
                    <AnexosPanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
                  </>
                )}

                {habit.list === 'event' && (
                  <>
                    <AgendarPanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
                    <ParticipantesPanel habit={habit} onRefresh={onRefresh} />
                  </>
                )}

                {habit.list === 'goal' && (
                     <TabelaPanel habit={habit} />
                )}
              </div>
            </div>
          )}

          {/* Subtasks if applicable */}
          {habit.subtasks.length > 0 && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--b2)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  paddingBottom: 6,
                }}>
                  <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 400 }}>
                    {doneSubtasks}/{habit.subtasks.length} subtarefas
                  </span>
                </div>
                {habit.subtasks.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={async () => { await toggleSubtask(habit.id, sub.id); onRefresh() }}
                      style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: sub.done ? '1.5px solid var(--main)' : '1.5px solid var(--b2)',
                        background: sub.done ? 'var(--main)' : 'transparent',
                        cursor: 'pointer', fontSize: 9, color: 'var(--main-foreground)',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {sub.done ? '✓' : ''}
                    </button>
                    <span style={{
                      fontSize: 13, color: sub.done ? 'var(--t3)' : 'var(--t2)',
                      textDecoration: sub.done ? 'line-through' : 'none',
                    }}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal panels if applicable */}
          {habit.list === 'goal' && (
            <div style={{ borderTop: '1px solid var(--b2)' }}>
              <GoalPanels habit={habit} />
            </div>
          )}

          {/* Details toggle */}
          {hasDetails && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--b2)' }}>
              <button
                onClick={() => setDetailsExpanded(e => !e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', fontSize: 8, color: 'var(--t3)',
                  fontFamily: 'var(--font-sans)', fontWeight: 500,
                }}
              >
                <i className={`ph ${detailsExpanded ? 'ph-caret-up' : 'ph-caret-down'}`} style={{ fontSize: 8 }} />
                {detailsExpanded ? 'Ocultar' : 'Ver'} detalhes
              </button>
            </div>
          )}

          {/* Details */}
          {detailsExpanded && (
            <div>
              {/* NotesBlock and TagsRow */}
              {(habit.notes || (habit.tags ?? []).length > 0) && (
                <div style={{ padding: '8px 16px 12px 56px', borderTop: '1px solid var(--b2)' }}>
                  {habit.notes && habit.notes.trim().length > 0 && (
                    <p style={{
                      fontSize: 12, color: 'var(--t2)', margin: '0 0 8px 0', fontStyle: 'italic',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', lineHeight: 1.5,
                    } as React.CSSProperties}>
                      {habit.notes.trim()}
                    </p>
                  )}
                  {habit.notes && habit.notes.trim().length > 0 && (habit.tags ?? []).length > 0 && (
                    <div style={{ height: 1, background: 'var(--b2)', margin: '8px 0' }} />
                  )}
                  {(habit.tags ?? []).length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {(habit.tags ?? []).map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 9, fontWeight: 500, padding: '2px 7px',
                            background: 'var(--background)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)', color: 'var(--t1)',
                            whiteSpace: 'nowrap', cursor: 'default',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Badges */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--b2)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge label={(() => {
              const dayNames = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
              if (habit.days.length === 7) return 'Repetir'
              return habit.days.map(d => dayNames[d]).join(', ')
            })()} variant="default" id={`repetition-${habit.id}`} />
            {habit.reminder_enabled && habit.reminder_time && <Badge label={formatTimeWithAmPm(habit.reminder_time)} variant="secondary" id={`reminder-${habit.id}`} />}
            {habit.est_mins != null && habit.est_mins > 0 && <Badge label={`Tempo: ${habit.est_mins}min`} style={{ background: '#9B7BFF', color: 'white' }} id={`time-${habit.id}`} />}
            <Badge label={habit.priority === 'baixa' ? 'Baixa' : habit.priority === 'media' ? 'Média' : 'Alta'} style={{
              background: habit.priority === 'alta' ? 'var(--coral)' : habit.priority === 'media' ? 'var(--amber-2)' : 'var(--grass)',
              color: 'black'
            }} id={`priority-${habit.id}`} />
            {(habit.tags ?? []).map(tag => <Badge key={tag} label={tag.charAt(0).toUpperCase() + tag.slice(1)} variant="outline" id={`tag-${habit.id}-${tag}`} />)}
          </div>

        </div>
      )}

    </div>
  )
}