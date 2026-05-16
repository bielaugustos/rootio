/**
 * HistoricoPanel — Rootio
 * ─────────────────────────────────────────────────────────────────
 * Painel de histórico de um hábito com:
 *   - Mini gráfico de streak (últimos 30 dias em dot-grid)
 *   - Log de sessões com tempo gasto por dia
 *   - Campo de insight por sessão (nota rápida)
 *   - Entrada retroativa (marcar dia passado como feito)
 *
 * Uso em HabitCard.tsx — substitui o <Pill label="Histórico"> atual:
 *   import { HistoricoPanel } from './HistoricoPanel'
 *   <HistoricoPanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
 *
 * Engines:
 *   habitDB.getHabitLast7Days(id) — já existe
 *   habitDB.getHistoryRange(from, to) — já existe
 *   habitDB.updateHabit(id, data) — para salvar insights na entrada
 *
 * Novos campos necessários no Habit (opcional — não quebra se ausente):
 *   session_logs?: SessionLog[]
 *
 * Novo tipo:
 *   interface SessionLog {
 *     date: string        // "YYYY-MM-DD"
 *     mins: number        // tempo de sessão em minutos
 *     insight: string     // nota do usuário
 *     retroativo: boolean // foi adicionado retroativamente
 *   }
 */

import { useState, useEffect, useCallback } from 'react'
import type { Habit } from '../../engine/habitDB'
import { getHabitStreak, getHabitLast7Days, updateHabit } from '../../engine/habitDB'
// import { Pill } from '../../components/Pill'
import { Button } from '../../components/Button'
// import { Badge } from '../../components/Badge'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SessionLog {
  date:       string
  mins:       number
  insight:    string
  retroativo: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function formatMins(mins: number) {
  if (!mins) return '—'
  if (mins < 60) return `${mins}min`
  return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}`
}

// Build last N days array (newest last)
function buildDaysRange(n: number): string[] {
  const dates: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return dates
}

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// ─── StreakDotGrid (últimos 28 dias, 4 semanas × 7) ─────────────────────────

function StreakDotGrid({
  days7,
  streak,
}: {
  days7: { date: string; done: boolean }[]
  streak: number
}) {
  const grid = buildDaysRange(28)
  const doneSet = new Set(days7.filter(d => d.done).map(d => d.date))
  const today   = todayISO()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
      {/* Day labels row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, width: '100%', maxWidth: 460 }}>
        {DAY_LABELS.map((l, i) => (
          <div key={i} style={{ fontSize: 9, fontWeight: 600, color: 'var(--t3)', textAlign: 'center' }}>
            {l}
          </div>
        ))}
      </div>
      {/* 4-week grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, width: '100%', maxWidth: 460 }}>
        {grid.map(date => {
          const done    = doneSet.has(date)
          const isToday = date === today
          const isPast  = date < today && !done

          let bg     = 'transparent'
          let border = '1.5px solid transparent'

          if (done && isToday)  { bg = '#22c55e'; border = '1px solid #15803d' }
          else if (done)        { bg = 'var(--main)'; border = '1px solid var(--main)' }
          else if (isToday)     { border = '1.5px solid var(--main)' }
          else if (isPast)      { /* vazio — sem marcacao */ }

          return (
            <div
              key={date}
              title={`${formatDate(date)} · ${done ? 'Feito ✓' : isToday ? 'Hoje' : 'Não feito'}`}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 2,
                background: bg,
                border,
                transition: 'all .15s',
              }}
            />
          )
        })}
      </div>
      {/* Streak summary */}
      {streak > 0 && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', lineHeight: 1 }}>
            {streak}
          </span>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>
            dias seguidos
            {streak >= 7  && ' · 🔥'}
            {streak >= 30 && ' · 💎'}
          </span>
        </div>
      )}
      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 4, flexWrap: 'wrap' }}>
        {[
          { color: '#22c55e', label: 'Hoje (feito)' },
          { color: 'var(--main)', label: 'Feito' },
          { border: '1.5px solid var(--main)', label: 'Pendente' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 2,
              background: item.color ?? 'transparent',
              border: item.border ?? 'none',
            }} />
            <span style={{ fontSize: 9, color: 'var(--t3)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SessionLogItem ──────────────────────────────────────────────────────────

function SessionLogItem({
  log,
  onUpdate,
  onDelete,
  isToday,
}: {
  log:       SessionLog
  onUpdate:  (updated: Partial<SessionLog>) => void
  onDelete:  () => void
  isToday:   boolean
}) {
  const [editingInsight, setEditingInsight] = useState(false)
  const [editingMins,    setEditingMins]    = useState(false)
  const [insight,        setInsight]        = useState(log.insight)
  const [mins,           setMins]           = useState(log.mins)

  // handleEdit removed — replaced by inline setter

  // Handlers de edição de tempo e insight são inlines nos callbacks

  return (
    <div style={{
      padding: '8px 10px',
      border: `1.5px solid ${isToday ? 'var(--main)' : 'var(--b2, #ccc)'}`,
      borderRadius: 'var(--radius-sm)',
      background: isToday ? 'color-mix(in srgb, var(--main) 8%, transparent)' : 'rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: log.retroativo ? 'var(--t3)' : 'var(--main)',
          border: '1.5px solid var(--border)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--t2)', flex: 1 }}>
          {formatDate(log.date)}
          {isToday && (
            <span style={{
              marginLeft: 6, fontSize: 9, fontWeight: 500, padding: '1px 5px',
              background: 'var(--main)', border: '1px solid var(--border)',
              borderRadius: 3,
            }}>hoje</span>
          )}
          {log.retroativo && (
            <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--t3)' }}>retroativo</span>
          )}
        </span>

        {/* Editable time */}
        {editingMins ? (
          <input
            type="number"
            value={mins}
            min={0}
            max={480}
            onChange={e => setMins(+e.target.value)}
            onBlur={() => { setEditingMins(false); onUpdate({ mins }) }}
            onKeyDown={e => e.key === 'Enter' && (setEditingMins(false), onUpdate({ mins }))}
            autoFocus
            style={{
              width: 60, fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-mono)',
              border: '2px solid var(--border)', borderRadius: 4, padding: '2px 6px',
              color: 'var(--t1)', textAlign: 'right',
            }}
          />
        ) : (
          <button
            onClick={() => setEditingMins(true)}
            title="Editar tempo"
            style={{
              fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-title)',
              padding: '2px 8px', border: '1.5px solid var(--b2)',
              borderRadius: 4, background: 'var(--bg3)', color: 'var(--t2)',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 var(--border)',
              transition: 'all 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
          >
            {formatMins(mins)}
          </button>
        )}
        <button
          onClick={onDelete}
          title="Apagar sessão"
          style={{
            width: 22, height: 22, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #fca5a5', borderRadius: 4,
            background: '#fef2f2', fontSize: 10, cursor: 'pointer', color: '#ef4444',
          }}
        >✕</button>
      </div>

      {/* Insight field */}
      {editingInsight ? (
        <textarea
          value={insight}
          onChange={e => setInsight(e.target.value)}
          onBlur={() => { setEditingInsight(false); onUpdate({ insight }) }}
          autoFocus
          placeholder="O que você aprendeu ou percebeu hoje?"
          rows={2}
          style={{
            fontSize: 12, color: 'var(--t1)', fontFamily: 'var(--font-sans)',
            border: '2px solid #000000', borderRadius: 4, padding: '6px 8px',
            resize: 'none', width: '100%',
            outline: 'none',
          }}
        />
      ) : (
        <button
          onClick={() => setEditingInsight(true)}
          style={{
            textAlign: 'left', fontSize: 12,
            color: insight ? 'var(--t2)' : 'var(--t3)',
            fontStyle: insight ? 'normal' : 'italic',
            background: 'none', border: 'none', padding: 0,
            cursor: 'text', fontFamily: 'var(--font-sans)', lineHeight: 1.5,
          }}
        >
          {insight || '+ Adicionar insight...'}
        </button>
      )}
    </div>
  )
}

// ─── RetroativeEntryModal ────────────────────────────────────────────────────

function RetroEntry({
  habitName,
  logs,
  onAdd,
  onClose,
}: {
  habitName: string
  logs:      SessionLog[]
  onAdd:     (log: SessionLog) => void
  onClose:   () => void
}) {
  const existingDates = new Set(logs.map(l => l.date))
  const options = buildDaysRange(7)
    .filter(d => d !== todayISO() && !existingDates.has(d))
    .reverse()

  const [selected, setSelected] = useState(options[0] ?? '')
  const [mins,     setMins]     = useState(0)
  const [insight,  setInsight]  = useState('')

  const handleAdd = () => {
    onAdd({ date: selected, mins, insight, retroativo: true })
    onClose()
  }

  if (options.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', fontSize: 13, color: 'var(--t3)' }}>
        Nenhum dia retroativo disponível nos últimos 7 dias.
            </div>
           )}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 0 0' }}>
      <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
        Marcar <strong style={{ color: 'var(--t1)' }}>{habitName}</strong> como feito em um dia passado.
        Entradas retroativas não contam para o streak atual.
      </div>

      {/* Date picker */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Dia</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {options.map(d => (
            <button
              key={d}
              onClick={() => setSelected(d)}
              style={{
                padding: '5px 10px', fontSize: 11, fontWeight: 400,
                border: selected === d ? '2px solid var(--border)' : '2px solid var(--b2)',
                borderRadius: 'var(--radius-sm)',
                background: selected === d ? 'var(--main)' : 'var(--bg3)',
                color: 'var(--t1)', cursor: 'pointer',
                boxShadow: 'none',
                transform: selected === d ? 'translate(2px,2px)' : 'none',
              }}
            >
              {formatDate(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Mins */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
          Tempo de sessão (min)
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 15, 30, 45, 60].map(m => (
            <button
              key={m}
              onClick={() => setMins(m)}
              style={{
                padding: '4px 10px', fontSize: 11, fontWeight: 400,
                border: mins === m ? '2px solid var(--border)' : '2px solid var(--b2)',
                borderRadius: 'var(--radius-sm)',
                background: mins === m ? 'var(--main)' : 'var(--bg3)',
                color: 'var(--t1)', cursor: 'pointer',
                transform: mins === m ? 'translate(2px,2px)' : 'none',
              }}
            >
              {m === 0 ? '—' : `${m}min`}
            </button>
          ))}
        </div>
      </div>

      {/* Insight */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
          Insight (opcional)
        </div>
        <textarea
          value={insight}
          onChange={e => setInsight(e.target.value)}
          placeholder="O que você fez nesse dia?"
          rows={2}
          style={{
            fontSize: 12, width: '100%', resize: 'none', fontFamily: 'var(--font-sans)',
            border: '2px solid #000000', borderRadius: 'var(--radius-sm)',
            padding: '8px', color: 'var(--t1)', outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, paddingBottom: 16 }}>
        <Button label="Cancelar" variant="ghost" size="sm" onClick={onClose} />
        <Button label="Registrar" variant="default" size="sm" onClick={handleAdd} />
      </div>
    </div>
  )
}

// ─── HistoricoPanel (main export) ───────────────────────────────────────────

export function HistoricoPanel({
  habit,
  onRefresh,
}: {
  habit:     Habit,
  isMobile?: boolean,
  onRefresh: () => void
}) {
  const [streak,     setStreak]     = useState(0)
  const [days7,      setDays7]      = useState<{ date: string; done: boolean }[]>([])
  const [logs,       setLogs]       = useState<SessionLog[]>([])
  const [showRetro,  setShowRetro]  = useState(false)
  const [saving,     setSaving]     = useState(false)

  const handleEdit = () => setShowRetro(!showRetro)

  // Load streak + last 7 days
  useEffect(() => {
    Promise.all([
      getHabitStreak(habit.id),
      getHabitLast7Days(habit.id),
    ]).then(([s, d]) => {
      setStreak(s)
      setDays7(d)

       // Build session logs from history — merge with saved logs on habit
       const savedLogs: SessionLog[] = habit.session_logs ?? []
      const today = todayISO()

      // Ensure today's log exists if habit is done
      const hasTodayLog = savedLogs.some(l => l.date === today)
      if (habit.done && !hasTodayLog) {
        setLogs([{ date: today, mins: habit.est_mins ?? 0, insight: '', retroativo: false }, ...savedLogs])
      } else {
        setLogs(savedLogs)
      }
    })
  }, [habit.id, habit.done, habit.session_logs, habit.est_mins])

  // Persist logs to habit
   const persistLogs = useCallback(async (next: SessionLog[]) => {
     setSaving(true)
     await updateHabit(habit.id, { ...habit, session_logs: next })
     setSaving(false)
     onRefresh()
   }, [habit, onRefresh])

  const handleLogUpdate = (date: string, delta: Partial<SessionLog>) => {
    const next = logs.map(l => l.date === date ? { ...l, ...delta } : l)
    setLogs(next)
    persistLogs(next)
  }

  const handleAddRetro = (log: SessionLog) => {
    const next = [log, ...logs].sort((a, b) => b.date.localeCompare(a.date))
    setLogs(next)
    persistLogs(next)
  }

  const handleDeleteLog = async (date: string) => {
    const next = logs.filter(l => l.date !== date)
    setLogs(next)
    await persistLogs(next)
  }

  const today = todayISO()

  // Only show logs for days the habit was actually done (days7) + retroactive entries
  const visibleLogs = logs
    .filter(l => days7.some(d => d.date === l.date && d.done) || l.retroativo)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)

   return (
     <div>
        <div style={{
          borderRadius: 'var(--radius-base)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
{/* ── Header ── */}
            <div style={{
              padding: '6px 14px',
              borderBottom: '2px solid var(--border)',
             display: 'flex', alignItems: 'center', gap: 8,
           }}>
             <span style={{ fontSize: 13, fontWeight: 900, flex: 1, fontFamily: 'Indie Flower' }}>Histórico</span>
             {saving && <span style={{ fontSize: 10, color: 'var(--t3)' }}>salvando...</span>}
        <button
          onClick={handleEdit}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500,
            border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
            background: 'var(--secondary-background)',
            boxShadow: '2px 2px 0 var(--border)',
            cursor: 'pointer', color: 'var(--t2)',
            fontFamily: 'var(--font-sans)',
            transition: 'transform 0.08s, box-shadow 0.08s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
        >
          Editar
        </button>
          </div>

{/* ── Dot grid ── */}
            <div style={{ padding: '10px 14px 8px' }}>
             <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, textAlign: 'center' }}>
               Últimas 4 semanas
            </div>
            <StreakDotGrid days7={days7} streak={streak} />
          </div>

           {/* ── Session logs ── */}
          {visibleLogs.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 5, width: '100%', maxWidth: 460 }}>
              <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 1 }}>
                 Sessões recentes
              </div>



              {visibleLogs.map(log => (
                <SessionLogItem
                  key={log.date}
                  log={log}
                  isToday={log.date === today}
                  onUpdate={delta => handleLogUpdate(log.date, delta)}
                  onDelete={() => handleDeleteLog(log.date)}
                />
              ))}
            </div>
            </div>
          )}

          {/* ── Retro entry panel ── */}
          {showRetro && (
            <div style={{
              borderTop: '2px solid var(--border)',
              padding: '0 14px',
            }}>
              <RetroEntry
                habitName={habit.name}
                logs={logs}
                onAdd={handleAddRetro}
                onClose={() => setShowRetro(false)}
              />
            </div>
          )}
      </div>
    </div>
  )
}
