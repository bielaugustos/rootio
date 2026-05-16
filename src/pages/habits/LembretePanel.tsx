/**
 * LembretePanel — Rootio
 * ─────────────────────────────────────────────────────────────────
 * Painel de lembretes adaptativos para um hábito:
 *   - Nudge inteligente (alerta por ociosidade, ex: "se não marcar até 20h")
 *   - Snooze rápido (15min / 1h / amanhã)
 *   - Frequência modular (dias da semana ou a cada N dias)
 *   - Modo Foco (ativa DND + abre Sprint)
 *
 * Uso em HabitCard.tsx — substitui o <Pill label="Lembrete"> atual:
 *   import { LembretePanel } from './LembretePanel'
 *   <LembretePanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
 *
 * Notificações:
 *   Web Notifications API (browser) — funciona no PWA
 *   Capacitor PushNotifications — para notificações nativas (v2)
 *   Para schedule notifications, usar @capacitor/local-notifications (v2)
 *
 * Persistência: salva config em habit.reminder_config (campo novo no Habit)
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Habit, ReminderConfig } from '../../engine/habitDB'
import { updateHabit } from '../../engine/habitDB'
import { Toggle } from '../../components/Toggle'
import { TimePicker } from '../../components/TimePicker'
import type { TimeValue } from '../../components/TimePicker'

// ─── Types ─────────────────────────────────────────────────────────────────

const snoozeOptions = [
  { l: '+5min',   ms: 5 * 60 * 1000 },
  { l: '+15min',  ms: 15 * 60 * 1000 },
  { l: '+30min',  ms: 30 * 60 * 1000 },
  { l: '+1h',     ms: 60 * 60 * 1000 },
  { l: 'Amanhã',  ms: (() => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(8, 0, 0, 0)
      return tomorrow.getTime() - now.getTime()
    })() },
]

function getDefaultHora(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const DEFAULT_CONFIG: ReminderConfig = {
  enabled:        true,
  hora:           getDefaultHora(),
  nudge_enabled:  false,
  nudge_hora:     '20:00',
  freq_mode:      'dias',
  freq_days:      [1, 2, 3, 4, 5],  // seg-sex
  freq_intervalo: 1,
  modo_foco:      false,
  snooze_active:  false,
  snooze_until:   null,
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function scheduleWebNotification(title: string, body: string, delayMs: number) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  setTimeout(() => {
    new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `rootio-habit-${title}`,
    })
  }, delayMs)
}

function snoozeLabel(until: string | null): string {
  if (!until) return ''
  const diff = new Date(until).getTime() - Date.now()
  if (diff <= 0) return ''
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `${mins}min`
  if (mins < 1440) return `${Math.round(mins / 60)}h`
  return 'amanhã'
}

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const parseTime = (time: string | null): TimeValue | null => {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  return { hours: h, minutes: m }
}

// ─── FrequencyPicker ────────────────────────────────────────────────────────

function FrequencyPicker({
  config,
  onChange,
}: {
  config:   ReminderConfig
  onChange: (delta: Partial<ReminderConfig>) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 12 }}>
        {(['dias', 'intervalo'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => onChange({ freq_mode: mode })}
            style={{
              flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 500,
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: config.freq_mode === mode ? 'var(--main)' : 'var(--bg3)',
              cursor: 'pointer', color: 'var(--t1)',
              boxShadow: config.freq_mode === mode ? 'none' : '2px 2px 0 var(--border)',
              transform: config.freq_mode === mode ? 'translate(2px,2px)' : 'none',
            }}
          >
            {mode === 'dias' ? 'Dias da semana' : 'A cada N dias'}
          </button>
        ))}
      </div>

      {/* Days of week */}
      {config.freq_mode === 'dias' && (
        <div style={{ display: 'flex', gap: 6 }}>
          {DAYS_PT.map((d, i) => {
            const isActive = config.freq_days.includes(i)
            return (
              <button
                key={i}
                onClick={() => {
                  const next = isActive
                    ? config.freq_days.filter(x => x !== i)
                    : [...config.freq_days, i].sort()
                  onChange({ freq_days: next })
                }}
                style={{
                  flex: 1, height: 40,
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border)',
                  background: isActive ? 'var(--main)' : 'var(--bg2)',
                  color: isActive ? 'var(--main-foreground)' : 'var(--t1)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  boxShadow: isActive ? 'none' : '2px 2px 0 var(--border)',
                  transform: isActive ? 'translate(2px, 2px)' : 'none',
                  transition: 'transform 0.08s, box-shadow 0.08s',
                }}
                onMouseEnter={e => {
                  if (!isActive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }
                }}
                onMouseLeave={e => {
                  if (!isActive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }
                }}
              >
                {d}
              </button>
            )
          })}
        </div>
      )}

      {/* Interval */}
      {config.freq_mode === 'intervalo' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--t2)' }}>A cada</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 5, 7].map(n => (
              <button
                key={n}
                onClick={() => onChange({ freq_intervalo: n })}
                style={{
                  width: 32, height: 32, fontSize: 11, fontWeight: 500,
                  border: `2px solid ${config.freq_intervalo === n ? 'var(--border)' : 'var(--b2)'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: config.freq_intervalo === n ? 'var(--main)' : 'var(--bg3)',
                  cursor: 'pointer', color: 'var(--t1)',
                  boxShadow: config.freq_intervalo === n ? 'none' : '2px 2px 0 var(--border)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--t2)' }}>dias</span>
        </div>
      )}
    </div>
  )
}

// ─── SnoozeBar ──────────────────────────────────────────────────────────────

function SnoozeBar({
  active,
  until,
  onSnooze,
  onCancel,
}: {
  active:    boolean
  until:     string | null
  onSnooze:  (label: string, ms: number) => void
  onCancel:  () => void
}) {
  const label = snoozeLabel(until)

  return (
    <div style={{
      padding: '10px 12px',
      background: active ? 'color-mix(in srgb, var(--main) 15%, var(--bg))' : 'var(--bg3)',
      border: `1.5px solid ${active ? 'var(--main)' : 'var(--b2)'}`,
      borderRadius: 'var(--radius-sm)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {active && label ? `Snooze ativo — lembra em ${label}` : 'Soneca rápida'}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {snoozeOptions.map(opt => (
          <button
            key={opt.l}
            onClick={() => onSnooze(opt.l, opt.ms)}
            style={{
              padding: '5px 12px', fontSize: 11, fontWeight: 500,
              border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg2)', cursor: 'pointer', color: 'var(--t1)',
              boxShadow: '2px 2px 0 var(--border)',
            }}
          >
            {opt.l}
          </button>
        ))}
        {active && (
          <button
            onClick={onCancel}
            style={{
              padding: '5px 12px', fontSize: 11, fontWeight: 400,
              border: '1.5px solid var(--b2)', borderRadius: 'var(--radius-sm)',
              background: 'transparent', cursor: 'pointer', color: 'var(--t3)',
            }}
          >
            Cancelar soneca
          </button>
        )}
      </div>
    </div>
  )
}

// ─── ModoFocoCard ────────────────────────────────────────────────────────────

function ModoFocoCard({
  enabled,
  onChange,
  onActivate,
}: {
  enabled:    boolean
  onChange:   (v: boolean) => void
  onActivate: () => void
}) {
  return (
    <div style={{
      padding: '10px 12px',
      border: `2px solid ${enabled ? 'var(--border)' : 'var(--b2)'}`,
      borderRadius: 'var(--radius-sm)',
      background: enabled ? 'var(--bg2)' : 'var(--bg3)',
      boxShadow: enabled ? '3px 3px 0 var(--border)' : 'none',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>Modo Foco</div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1, lineHeight: 1.4 }}>
            Ao ativar, silencia outras notificações e abre o Sprint
          </div>
        </div>
        <Toggle
          checked={enabled}
          onChange={onChange}
          id="modo-foco-toggle"
        />
      </div>
      {enabled && (
        <button
          onClick={onActivate}
          style={{
            width: '100%', padding: '8px', fontSize: 12, fontWeight: 500,
            border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
            background: 'var(--main)', cursor: 'pointer', color: 'var(--t1)',
            boxShadow: '2px 2px 0 var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          ⚡ Ativar Modo Foco agora
        </button>
      )}
    </div>
  )
}

// ─── LembretePanel (main export) ────────────────────────────────────────────

export interface HabitWithConfig extends Habit {
  reminder_config?: ReminderConfig
}

export function LembretePanel({
  habit,
  onRefresh,
}: {
  habit:     HabitWithConfig
  onRefresh: () => void
}) {
  const navigate = useNavigate()

  const [config,  setConfig]  = useState<ReminderConfig>(() => {
    const saved: Partial<ReminderConfig> = habit.reminder_config ?? {}
    return {
      ...DEFAULT_CONFIG,
      ...saved,
      hora: saved.hora || DEFAULT_CONFIG.hora,
      nudge_hora: saved.nudge_hora || DEFAULT_CONFIG.nudge_hora,
      freq_days: saved.freq_days ?? habit.days ?? DEFAULT_CONFIG.freq_days,
    }
  })
  const [saving,  setSaving]  = useState(false)
  const [permErr, setPermErr] = useState(false)

  // Snooze countdown label refresh
  const [, forceUpdate] = useState(0)


  useEffect(() => {
    if (!config.snooze_active) return
    const t = setInterval(() => forceUpdate(n => n + 1), 30_000)
    return () => clearInterval(t)
  }, [config.snooze_active])

  const persist = useCallback(async (next: ReminderConfig) => {
    setSaving(true)
    await updateHabit(habit.id, { ...habit, reminder_config: next })
    setSaving(false)
    onRefresh()
  }, [habit, onRefresh])

  const update = useCallback((delta: Partial<ReminderConfig>) => {
    setConfig(c => {
      const next = { ...c, ...delta }
      persist(next)
      return next
    })
  }, [persist])

  // Enable/disable main reminder
  const handleToggleEnabled = async (v: boolean) => {
    if (v) {
      const granted = await requestNotificationPermission()
      if (!granted) { setPermErr(true); return }
      setPermErr(false)
    }
    update({ enabled: v })
  }

  // Snooze
  const handleSnooze = (label: string, ms: number) => {
    const until = new Date(Date.now() + ms).toISOString()
    update({ snooze_active: true, snooze_until: until })
    scheduleWebNotification(
      `Rootio — ${habit.icon} ${habit.name}`,
      `Seu snooze de ${label} terminou. Hora de fazer!`,
      ms,
    )
  }

  // Modo Foco
  const handleActivateFocus = () => {
    // Solicita DND via Notifications API (best-effort)
    scheduleWebNotification(
      '🎯 Modo Foco ativado',
      `Foque em: ${habit.name}`,
      500,
    )
    navigate('/sprint')
  }

  const isSnoozeActive = config.snooze_active &&
    config.snooze_until != null &&
    new Date(config.snooze_until) > new Date()



  return (
    <div>
        <div style={{
          borderRadius: 'var(--radius-base)',
          overflow: 'hidden',
        }}>
          {/* ── Header ── */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 900, flex: 1, fontFamily: 'Indie Flower' }}>Lembrete</span>
            {saving && <span style={{ fontSize: 10, color: 'var(--t3)' }}>salvando...</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 400 }}>
                {config.enabled ? 'Ativo' : 'Inativo'}
              </span>
              <Toggle
                checked={config.enabled}
                onChange={handleToggleEnabled}
                id="reminder-main-toggle"
              />
            </div>
          </div>

          {/* Permission error */}
          {permErr && (
            <div style={{
              padding: '8px 14px', fontSize: 11, fontWeight: 400,
              background: '#fde8e3', color: '#c0392b',
              borderBottom: '1px solid #f5c6bc',
            }}>
              ⚠ Permissão de notificação negada. Habilite nas configurações do navegador.
            </div>
          )}

          {config.enabled && (
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* ── Horário ── */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
                  Horário do lembrete
                </div>
                <TimePicker
                  value={parseTime(config.hora)}
                  onChange={(time) => update({ hora: time ? `${time.hours.toString().padStart(2,'0')}:${time.minutes.toString().padStart(2,'0')}` : '' })}
                />
              </div>

              {/* ── Nudge inteligente ── */}
              <div style={{
                padding: '10px 12px',
                border: `1.5px solid ${config.nudge_enabled ? 'var(--main)' : 'var(--b2)'}`,
                borderRadius: 'var(--radius-sm)',
                background: config.nudge_enabled ? 'color-mix(in srgb, var(--main) 10%, var(--bg))' : 'var(--bg3)',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>🧠</span> Nudge inteligente
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2, lineHeight: 1.4 }}>
                      Alerta se você não marcar até o horário limite
                    </div>
                  </div>
                   <Toggle
                     checked={config.nudge_enabled}
                     onChange={(v: boolean) => update({ nudge_enabled: v })}
                     id="nudge-toggle"
                   />
                </div>
                {config.nudge_enabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--t2)' }}>Se não fizer até</span>
                    <TimePicker
                      value={parseTime(config.nudge_hora)}
                      onChange={(time) => update({ nudge_hora: time ? `${time.hours.toString().padStart(2,'0')}:${time.minutes.toString().padStart(2,'0')}` : '' })}
                    />
                    <span style={{ fontSize: 12, color: 'var(--t2)' }}>→ me avise</span>
                  </div>
                )}
              </div>

              {/* ── Frequência ── */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                  Frequência
                </div>
                <FrequencyPicker config={config} onChange={update} />
              </div>

              {/* ── Snooze ── */}
              <SnoozeBar
                active={isSnoozeActive}
                until={config.snooze_until}
                onSnooze={handleSnooze}
                onCancel={() => update({ snooze_active: false, snooze_until: null })}
              />

              {/* ── Modo Foco ── */}
              <ModoFocoCard
                enabled={config.modo_foco}
                onChange={v => update({ modo_foco: v })}
                onActivate={handleActivateFocus}
              />

            </div>
          )}

          {/* Inactive state CTA */}
          {!config.enabled && !permErr && (
            <div style={{ padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 10 }}>
                Sem lembrete ativo. Ative para receber nudges inteligentes baseados na sua rotina.
              </div>
              <button
                onClick={() => handleToggleEnabled(true)}
                style={{
                  padding: '8px 20px', fontSize: 12, fontWeight: 500,
                  border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--main)', cursor: 'pointer', color: 'var(--t1)',
                  boxShadow: '2px 2px 0 var(--border)',
                  transition: 'transform 0.08s, box-shadow 0.08s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translate(2px, 2px)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)';
                }}
              >
                🔔 Ativar lembrete
              </button>
            </div>
          )}
        </div>
    </div>
  )
}
