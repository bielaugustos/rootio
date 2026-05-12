/**
 * TimerPanel — Rootio · panels/TimerPanel.tsx
 * ─────────────────────────────────────────────────────────────────
 * Cronômetro Pomodoro integrado ao HabitCard de tarefas.
 *
 * Integração bidirecional com SprintPage:
 *   • TimerPanel → Sprint: emite 'sprint-state' ao iniciar/pausar/concluir
 *   • Sprint → TimerPanel: escuta 'sprint-external-tick' para sync de estado
 *
 * Ao completar um Pomodoro, registra sessão e emite IO via CustomEvent
 * 'habit-completed' (capturado pelo ToastIO no App.tsx).
 *
 * Uso:
 *   import { TimerPanel } from './panels/TimerPanel'
 *   // dentro do expanded de habit.list === 'task':
 *   <TimerPanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Habit } from '../../../engine/habitDB'
import { Pill } from '../../../components/Pill'

// ─── Types ───────────────────────────────────────────────────────────────────

type TimerMode  = 'foco' | 'pausa_curta' | 'pausa_longa'
type TimerState = 'idle' | 'running' | 'paused' | 'done'

interface PanelProps {
  habit:     Habit
  isMobile?: boolean
  onRefresh: () => void
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DURATIONS: Record<TimerMode, number> = {
  foco:        25 * 60,
  pausa_curta:  5 * 60,
  pausa_longa: 15 * 60,
}

const MODE_LABELS: Record<TimerMode, string> = {
  foco:        'Foco',
  pausa_curta: 'Pausa curta',
  pausa_longa: 'Pausa longa',
}

const POMODORO_IO = 10   // IO por sessão de foco completa

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0') }
function fmt(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}` }

function emitSprintState(active: boolean, habitId: string, habitName: string) {
  window.dispatchEvent(new CustomEvent('sprint-state', {
    detail: { active, habitId, habitName, source: 'TimerPanel' },
  }))
  // persist for HabitCard collapsed badge
  localStorage.setItem('sprint-active', active ? '1' : '0')
  localStorage.setItem('sprint-habit-id', active ? habitId : '')
}

function emitHabitCompleted(name: string, pts: number) {
  window.dispatchEvent(new CustomEvent('habit-completed', { detail: { name, pts } }))
}

// ─── SVG Ring Timer ──────────────────────────────────────────────────────────

function TimerRing({
  remaining,
  total,
  mode,
  state,
}: {
  remaining: number
  total:     number
  mode:      TimerMode
  state:     TimerState
}) {
  const R   = 44
  const C   = 2 * Math.PI * R
  const pct = remaining / total
  const stroke = mode === 'foco' ? 'var(--c-task-b, #3B82F6)' : 'var(--c-habit-b, #b8a97a)'

  return (
    <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx="50" cy="50" r={R} fill="none" stroke="var(--b2, #ccc)" strokeWidth="6" />
      {/* Progress */}
      <circle
        cx="50" cy="50" r={R}
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct)}
        style={{ transition: state === 'running' ? 'stroke-dashoffset 1s linear' : 'none' }}
      />
    </svg>
  )
}

// ─── TimerPanel ──────────────────────────────────────────────────────────────

export function TimerPanel({ habit, isMobile: _isMobile = false, onRefresh: _onRefresh }: PanelProps) {
  const [open,      setOpen]      = useState(false)
  const [mode,      setMode]      = useState<TimerMode>('foco')
  const [state,     setState]     = useState<TimerState>('idle')
  const [remaining, setRemaining] = useState(DURATIONS.foco)
  const [pomodoros, setPomodoros] = useState(0)
  const [sessions,  setSessions]  = useState<{ mins: number; at: string }[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Load sessions from localStorage ──
  useEffect(() => {
    try {
      const key = `timer-sessions-${habit.id}`
      const saved = JSON.parse(localStorage.getItem(key) ?? '[]')
      setSessions(saved)
    } catch {}
  }, [habit.id])

  // ── Reset when mode changes ──
  useEffect(() => {
    stop()
    setRemaining(DURATIONS[mode])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // ── Listen for external sprint sync ──
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { source, active, habitId } = e.detail ?? {}
      if (source === 'TimerPanel') return
      if (habitId && habitId !== habit.id) return
      if (!active && state === 'running') pause()
    }
    window.addEventListener('sprint-external-tick' as any, handler)
    return () => window.removeEventListener('sprint-external-tick' as any, handler)
  }, [state, habit.id])

  // ── Tick ──
  const start = useCallback(() => {
    if (intervalRef.current) return
    setState('running')
    emitSprintState(true, habit.id, habit.name)
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          handleComplete()
          return 0
        }
        return r - 1
      })
    }, 1000)
  }, [habit.id, habit.name])

  const pause = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setState('paused')
    emitSprintState(false, habit.id, habit.name)
  }, [habit.id, habit.name])

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setState('idle')
    setRemaining(DURATIONS[mode])
    emitSprintState(false, habit.id, habit.name)
  }, [mode, habit.id, habit.name])

  const handleComplete = useCallback(() => {
    setState('done')
    emitSprintState(false, habit.id, habit.name)

    if (mode === 'foco') {
      const newPomodoros = pomodoros + 1
      setPomodoros(newPomodoros)

      // Register session
      const session = { mins: 25, at: new Date().toISOString() }
      const key = `timer-sessions-${habit.id}`
      const next = [session, ...sessions].slice(0, 20)
      setSessions(next)
      localStorage.setItem(key, JSON.stringify(next))

      // Emit IO toast
      emitHabitCompleted(habit.name, POMODORO_IO)

      // Auto-suggest break
      setTimeout(() => {
        const breakMode: TimerMode = newPomodoros % 4 === 0 ? 'pausa_longa' : 'pausa_curta'
        setMode(breakMode)
        setState('idle')
        setRemaining(DURATIONS[breakMode])
      }, 2000)
    } else {
      // Break done → back to focus
      setTimeout(() => {
        setMode('foco')
        setState('idle')
        setRemaining(DURATIONS.foco)
      }, 1500)
    }
  }, [mode, pomodoros, sessions, habit.id, habit.name])

  // Cleanup on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const total      = DURATIONS[mode]
  const isFocus    = mode === 'foco'
  const accentColor = isFocus ? 'var(--c-task-b, #3B82F6)' : 'var(--c-habit-b, #b8a97a)'

  // Pill label: show countdown when running
  const pillLabel = state === 'running'
    ? fmt(remaining)
    : state === 'paused'
      ? `⏸ ${fmt(remaining)}`
      : pomodoros > 0
        ? `Timer · ${pomodoros}🍅`
        : 'Timer'

  return (
    <div>
      <Pill
        label={pillLabel}
        variant="task"
        size="sm"
        selected={open}
        onClick={() => setOpen(o => !o)}
        id="pill-timer"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="13" r="8"/>
            <path d="M12 9v4l2 2"/>
            <path d="M5 3 2 6m20 0-3-3"/>
          </svg>
        }
      />

      {open && (
        <div style={{
          marginTop: 12,
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          background: 'var(--bg2, #fff)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
          {/* ── Header ── */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '2px solid var(--border)',
            background: 'var(--c-task, #6FB8FF)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>
              {habit.icon} Timer · {habit.name}
            </span>
            {pomodoros > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '2px 8px',
                border: '1.5px solid var(--border)', borderRadius: 99,
                background: 'var(--bg2, #fff)',
              }}>
                {pomodoros} 🍅
              </span>
            )}
          </div>

          {/* ── Mode selector ── */}
          <div style={{
            display: 'flex', borderBottom: '2px solid var(--border)',
          }}>
            {(['foco', 'pausa_curta', 'pausa_longa'] as TimerMode[]).map((m, i) => (
              <button
                key={m}
                onClick={() => { if (state === 'idle' || state === 'done') setMode(m) }}
                style={{
                  flex: 1, padding: '8px 0',
                  fontSize: 11, fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  border: 'none',
                  borderRight: i < 2 ? '1.5px solid var(--b2, #ccc)' : 'none',
                  background: mode === m ? 'var(--bg3, #eeebe2)' : 'transparent',
                  color: mode === m ? 'var(--t1)' : 'var(--t3)',
                  cursor: state === 'running' ? 'not-allowed' : 'pointer',
                  transition: 'all .1s',
                }}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* ── Ring + time display ── */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '20px 14px 16px', gap: 0,
          }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <TimerRing remaining={remaining} total={total} mode={mode} state={state} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)',
                  color: state === 'done' ? '#22c55e' : 'var(--t1)',
                  lineHeight: 1,
                }}>
                  {state === 'done' ? '✓' : fmt(remaining)}
                </span>
                <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--t3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {state === 'done' ? (isFocus ? '+'+POMODORO_IO+' IO' : 'descansou') : MODE_LABELS[mode]}
                </span>
              </div>
            </div>

            {/* ── Controls ── */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {state === 'idle' || state === 'done' ? (
                <button
                  onClick={start}
                  style={{
                    padding: '9px 28px', fontSize: 13, fontWeight: 500,
                    border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    background: accentColor, color: '#fff',
                    cursor: 'pointer', boxShadow: '3px 3px 0 var(--border)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {state === 'done' ? 'Novo' : '▶ Iniciar'}
                </button>
              ) : (
                <>
                  <button
                    onClick={state === 'running' ? pause : start}
                    style={{
                      padding: '9px 20px', fontSize: 13, fontWeight: 500,
                      border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                      background: 'var(--main, #ffbf00)', color: 'var(--t1)',
                      cursor: 'pointer', boxShadow: '3px 3px 0 var(--border)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {state === 'running' ? '⏸ Pausar' : '▶ Continuar'}
                  </button>
                  <button
                    onClick={stop}
                    style={{
                      padding: '9px 14px', fontSize: 13, fontWeight: 500,
                      border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg3, #eeebe2)', color: 'var(--t1)',
                      cursor: 'pointer', boxShadow: '2px 2px 0 var(--border)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Session log ── */}
          {sessions.length > 0 && (
            <div style={{
              borderTop: '1px solid var(--b2, #ccc)',
              padding: '10px 14px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                Sessões hoje
              </div>
              {sessions.slice(0, 4).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--t2)' }}>
                  <span>🍅</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{s.mins}min</span>
                  <span style={{ color: 'var(--t3)' }}>
                    {new Date(s.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
