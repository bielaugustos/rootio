/**
 * AgendarPanel — Rootio · panels/AgendarPanel.tsx
 * ─────────────────────────────────────────────────────────────────
 * Agendamento de eventos e tarefas com integração ao CalendárioView.
 *
 * Funcionalidades:
 *   • Mover para data futura (retira do "hoje", cria deadline)
 *   • Presets rápidos: amanhã, próxima semana, próxima segunda
 *   • "Hoje" — reset para hoje
 *   • Exibe contagem regressiva de dias até o evento
 *   • Emite evento 'habit-rescheduled' para CalendárioView sincronizar
 *
 * Usa o DatePicker existente em src/components/DatePicker.tsx.
 * Persiste em habit.deadline via updateHabit().
 *
 * Uso:
 *   <AgendarPanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
 */

import { useState, useCallback } from 'react'
import type { Habit } from '../../../engine/habitDB'
import { updateHabit } from '../../../engine/habitDB'
import { DatePicker } from '../../../components/DatePicker'
import { Pill } from '../../../components/Pill'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PanelProps {
  habit:     Habit
  isMobile?: boolean
  onRefresh: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function offsetDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function nextWeekday(weekday: number): string {
  // weekday: 0=dom, 1=seg, ..., 6=sab
  const d = new Date()
  const current = d.getDay()
  const diff = (weekday - current + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function daysUntil(iso: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(iso + 'T12:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function formatDeadline(iso: string): string {
  const diff = daysUntil(iso)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff === -1) return 'Ontem'
  if (diff < 0) return `${Math.abs(diff)} dias atrás`
  if (diff <= 7) return `Em ${diff} dias`
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  })
}

function deadlineColor(iso: string): string {
  const diff = daysUntil(iso)
  if (diff < 0) return '#ef4444'
  if (diff === 0) return '#f97316'
  if (diff <= 2) return '#f59e0b'
  return 'var(--t2)'
}

// Presets
const PRESETS = [
  { label: 'Amanhã',       fn: () => offsetDate(1)     },
  { label: 'Em 3 dias',    fn: () => offsetDate(3)     },
  { label: 'Próxima Seg',  fn: () => nextWeekday(1)    },
  { label: 'Próxima Sem',  fn: () => offsetDate(7)     },
]

// ─── AgendarPanel ────────────────────────────────────────────────────────────

export function AgendarPanel({ habit, onRefresh }: PanelProps) {
  const [open,   setOpen]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [date,   setDate]   = useState<string>(habit.deadline ?? '')

  const today = todayISO()

  const save = useCallback(async (iso: string) => {
    setSaving(true)
    await updateHabit(habit.id, { deadline: iso || null })
    setSaving(false)
    onRefresh()

    // Notify calendar view
    window.dispatchEvent(new CustomEvent('habit-rescheduled', {
      detail: { habitId: habit.id, deadline: iso || null },
    }))
  }, [habit.id, onRefresh])

  const handleDateChange = async (iso: string) => {
    setDate(iso)
    await save(iso)
  }

  const handlePreset = async (iso: string) => {
    setDate(iso)
    await save(iso)
  }

  const handleClear = async () => {
    setDate('')
    await save('')
  }

  // Pill label
  const deadline = habit.deadline
  const pillLabel = deadline
    ? formatDeadline(deadline)
    : 'Agendar'

  const isOverdue = deadline && daysUntil(deadline) < 0

  return (
    <div>
      <Pill
        label={pillLabel}
        variant="event"
        size="sm"
        selected={open || !!deadline}
        onClick={() => setOpen(o => !o)}
        id="pill-agendar"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
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
            background: 'var(--c-event, #9B7BFF)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Agendar</span>
            {saving && (
              <span style={{ fontSize: 10, color: 'var(--t2)' }}>salvando...</span>
            )}
            {deadline && (
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '2px 8px',
                border: '1.5px solid var(--border)',
                borderRadius: 99, background: 'var(--bg2, #fff)',
                color: deadlineColor(deadline),
              }}>
                {formatDeadline(deadline)}
              </span>
            )}
          </div>

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* ── Overdue warning ── */}
            {isOverdue && (
              <div style={{
                padding: '8px 12px',
                background: '#fde8e3', border: '1.5px solid #ef4444',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11, fontWeight: 500, color: '#c0392b',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                ⚠ Atrasado em {Math.abs(daysUntil(deadline!))} dia(s). Reagende ou conclua.
              </div>
            )}

            {/* ── Quick presets ── */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 7 }}>
                Atalhos
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {/* Today button */}
                <button
                  onClick={() => handlePreset(today)}
                  style={{
                    padding: '5px 12px', fontSize: 11, fontWeight: 500,
                    border: `2px solid ${date === today ? 'var(--border)' : 'var(--b2)'}`,
                    borderRadius: 'var(--radius-sm)',
                    background: date === today ? 'var(--main, #ffbf00)' : 'var(--bg3)',
                    color: 'var(--t1)', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: date === today ? '2px 2px 0 var(--border)' : 'none',
                    transform: date === today ? 'translate(2px,2px)' : 'none',
                  }}
                >
                  Hoje
                </button>

                {PRESETS.map(p => {
                  const iso = p.fn()
                  const active = date === iso
                  return (
                    <button
                      key={p.label}
                      onClick={() => handlePreset(iso)}
                      style={{
                        padding: '5px 12px', fontSize: 11, fontWeight: 500,
                        border: `2px solid ${active ? 'var(--border)' : 'var(--b2)'}`,
                        borderRadius: 'var(--radius-sm)',
                        background: active ? 'var(--main, #ffbf00)' : 'var(--bg3)',
                        color: 'var(--t1)', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        boxShadow: active ? '2px 2px 0 var(--border)' : 'none',
                        transform: active ? 'translate(2px,2px)' : 'none',
                      }}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Date picker ── */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 7 }}>
                Data específica
              </div>
              <DatePicker
                value={date}
                onChange={handleDateChange}
                placeholder="Escolher data..."
                minDate={today}
              />
            </div>

            {/* ── Clear ── */}
            {deadline && (
              <button
                onClick={handleClear}
                style={{
                  padding: '7px', fontSize: 11, fontWeight: 500,
                  border: '1.5px dashed var(--b2)', borderRadius: 'var(--radius-sm)',
                  background: 'transparent', color: 'var(--t3)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  width: '100%',
                }}
              >
                Remover data agendada
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
