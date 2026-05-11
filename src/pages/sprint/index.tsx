import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { Button } from '../../components/Button'
import { getHabits, toggleHabitDone, type Habit } from '../../engine/habitDB'

// ─── Types ────────────────────────────────────────────────────────────────────
type TimerMode = 'focus' | 'short' | 'long'
type TimerState = 'idle' | 'running' | 'paused' | 'done'

interface SprintSession {
  id: string
  date: string
  focusMinutes: number
  completedPomodoros: number
  habitsDone: string[]
}

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short:  5 * 60,
  long:  15 * 60,
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Foco',
  short: 'Pausa curta',
  long:  'Pausa longa',
}

const LS_SESSIONS = 'sprint-sessions-v1'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0') }
function fmtTime(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}` }
function todayISO() { return new Date().toISOString().split('T')[0] }

function useSessions() {
  const [sessions, setSessions] = useState<SprintSession[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_SESSIONS) ?? '[]') } catch { return [] }
  })
  const save = (s: SprintSession[]) => { setSessions(s); localStorage.setItem(LS_SESSIONS, JSON.stringify(s)) }
  const addSession = (sess: SprintSession) => save([sess, ...sessions].slice(0, 60))
  return { sessions, addSession }
}

// ─── Timer component ──────────────────────────────────────────────────────────
function Timer({ onComplete, mode, setMode }: {
  onComplete: (mins: number) => void
  mode: TimerMode
  setMode: (m: TimerMode) => void
}) {
  const [state, setState]     = useState<TimerState>('idle')
  const [remaining, setRem]   = useState(DURATIONS[mode])
  const [pomodoros, setPomos] = useState(0)
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset timer when mode changes
  useEffect(() => {
    clearInterval(interval.current!)
    setState('idle')
    setRem(DURATIONS[mode])
  }, [mode])

  const tick = useCallback(() => {
    setRem(r => {
      if (r <= 1) {
        clearInterval(interval.current!)
        setState('done')
        if (mode === 'focus') {
          setPomos(p => p + 1)
          onComplete(DURATIONS.focus / 60)
        }
        return 0
      }
      return r - 1
    })
  }, [mode, onComplete])

  const start = () => {
    setState('running')
    interval.current = setInterval(tick, 1000)
    localStorage.setItem('sprint-active', '1')
    window.dispatchEvent(new CustomEvent('sprint-state', { detail: { active: true } }))
  }

  const pause = () => {
    clearInterval(interval.current!)
    setState('paused')
  }

  const reset = () => {
    clearInterval(interval.current!)
    setState('idle')
    setRem(DURATIONS[mode])
  }

  useEffect(() => () => clearInterval(interval.current!), [])

  const pct = ((DURATIONS[mode] - remaining) / DURATIONS[mode]) * 100
  const size = 180
  const r = 80
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const ringColor = mode === 'focus' ? 'var(--main)' : mode === 'short' ? '#22c55e' : '#3b82f6'

  return (
    <div style={{
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)',
      boxShadow: '4px 4px 0 var(--border)', padding: '24px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
    }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['focus', 'short', 'long'] as TimerMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: mode === m ? 'var(--main)'             : 'var(--secondary-background)',
            color:      mode === m ? 'var(--main-foreground)' : 'var(--t2)',
            boxShadow:  mode === m ? '2px 2px 0 var(--border)' : 'none',
          }}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* SVG ring */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={10} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ringColor} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 40, color: 'var(--t1)', lineHeight: 1 }}>
            {fmtTime(remaining)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>
            {state === 'done' ? '🎉 Pronto!' : MODE_LABELS[mode]}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {state === 'idle' || state === 'done' ? (
          <Button variant="default" size="lg" onClick={start}>
            <i className="ph ph-play-fill" style={{ fontSize: 18 }} />
            {state === 'done' ? 'Reiniciar' : 'Iniciar'}
          </Button>
        ) : state === 'running' ? (
          <>
            <Button variant="neutral" onClick={pause}>
              <i className="ph ph-pause" style={{ fontSize: 18 }} /> Pausar
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <i className="ph ph-arrow-counter-clockwise" style={{ fontSize: 16 }} />
            </Button>
          </>
        ) : (
          <>
            <Button variant="default" onClick={start}>
              <i className="ph ph-play-fill" style={{ fontSize: 18 }} /> Continuar
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <i className="ph ph-arrow-counter-clockwise" style={{ fontSize: 16 }} />
            </Button>
          </>
        )}
      </div>

      {/* Pomodoro counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: '50%',
            background: i < (pomodoros % 4) ? 'var(--main)' : 'var(--bg3)',
            border: '1.5px solid var(--border)',
          }} />
        ))}
        <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 4 }}>
          {pomodoros} pomodoro{pomodoros !== 1 ? 's' : ''} hoje
        </span>
      </div>
    </div>
  )
}

// ─── Habit quick-toggle ───────────────────────────────────────────────────────
function SprintHabits({ sessionHabits, onToggle }: {
  sessionHabits: Set<string>
  onToggle: (id: string) => void
}) {
  const [habits, setHabits] = useState<Habit[]>([])
  useEffect(() => { getHabits().then(h => setHabits(h.filter(x => !x.hidden && !x.done).slice(0, 8))) }, [])

  if (habits.length === 0) return null
  return (
    <div style={{
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)',
      boxShadow: '4px 4px 0 var(--border)', overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 18px', borderBottom: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontSize: 17, color: 'var(--t1)' }}>Hábitos do Sprint</span>
        <span style={{ fontSize: 12, color: 'var(--t3)' }}>{sessionHabits.size}/{habits.length} feitos</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {habits.map((h, i) => {
          const done = sessionHabits.has(h.id)
          return (
            <button key={h.id} onClick={() => onToggle(h.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: i < habits.length - 1 ? '1px solid var(--b2)' : 'none',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              <i className={`ph ${done ? 'ph-check-circle-fill' : 'ph-circle'}`}
                style={{ fontSize: 20, color: done ? 'var(--main)' : 'var(--b2)', flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: done ? 'var(--t3)' : 'var(--t1)', textDecoration: done ? 'line-through' : 'none' }}>
                {h.icon} {h.name}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--t3)', flexShrink: 0 }}>+{h.pts} IO</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Sessions history ─────────────────────────────────────────────────────────
function SessionHistory({ sessions }: { sessions: SprintSession[] }) {
  const today   = sessions.filter(s => s.date === todayISO())
  const todayPm = today.reduce((sum, s) => sum + s.completedPomodoros, 0)
  const todayFm = today.reduce((sum, s) => sum + s.focusMinutes,       0)
  const weekSessions = sessions.slice(0, 14)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Today summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Pomodoros hoje', value: todayPm, icon: 'timer' },
          { label: 'Min. de foco',   value: todayFm, icon: 'brain' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)', padding: '14px 16px' }}>
            <i className={`ph ph-${s.icon}`} style={{ fontSize: 20, color: 'var(--main)', display: 'block', marginBottom: 6 }} />
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--t1)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      {weekSessions.length > 0 && (
        <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '2px solid var(--border)', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--t3)' }}>
            Sessões recentes
          </div>
          {weekSessions.slice(0, 5).map(s => (
            <div key={s.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--b2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="ph ph-timer" style={{ fontSize: 16, color: 'var(--main)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{s.focusMinutes} min de foco</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: Math.min(s.completedPomodoros, 6) }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--main)', border: '1px solid var(--border)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function SprintPage() {
  const navigate  = useNavigate()
  const [mode, setMode] = useState<TimerMode>('focus')
  const [sessionHabits, setSessionHabits] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<'timer' | 'history'>('timer')
  const { sessions, addSession } = useSessions()

  const onTimerComplete = useCallback((mins: number) => {
    addSession({
      id: Date.now().toString(),
      date: todayISO(),
      focusMinutes: mins,
      completedPomodoros: 1,
      habitsDone: Array.from(sessionHabits),
    })
  }, [sessionHabits, addSession])

  const onToggleHabit = async (id: string) => {
    await toggleHabitDone(id)
    setSessionHabits(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    window.dispatchEvent(new Event('habits-changed'))
  }

  return (
    <PageWrapper maxWidth={720}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Sprint</h1>
        <button onClick={() => navigate('/sprint/settings')} style={iconBtnSm} title="Ajustes do Sprint"
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}>
          <i className="ph ph-gear" style={{ fontSize: 17 }} />
        </button>
      </div>
      <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 20 }}>Ciclos de foco Pomodoro integrados aos seus hábitos.</p>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['timer', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 18px', borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: tab === t ? 'var(--main)'             : 'var(--secondary-background)',
            color:      tab === t ? 'var(--main-foreground)' : 'var(--t2)',
            boxShadow:  tab === t ? '2px 2px 0 var(--border)' : 'none',
          }}>
            <i className={`ph ph-${t === 'timer' ? 'timer' : 'clock-counter-clockwise'}`} style={{ fontSize: 14, marginRight: 6 }} />
            {t === 'timer' ? 'Sessão' : 'Histórico'}
          </button>
        ))}
      </div>

      {tab === 'timer' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Timer mode={mode} setMode={setMode} onComplete={onTimerComplete} />
          <SprintHabits sessionHabits={sessionHabits} onToggle={onToggleHabit} />
        </div>
      ) : (
        <SessionHistory sessions={sessions} />
      )}
    </PageWrapper>
  )
}

const iconBtnSm: React.CSSProperties = {
  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--secondary-background)', border: '2px solid var(--border)',
  borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)',
  cursor: 'pointer', color: 'var(--t2)', transition: 'transform 0.1s, box-shadow 0.1s',
}
