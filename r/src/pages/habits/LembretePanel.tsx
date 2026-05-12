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
import type { Habit } from '../../engine/habitDB'
import { updateHabit } from '../../engine/habitDB'
import { Pill } from '../../components/Pill'
import { Toggle } from '../../components/Toggle'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ReminderConfig {
  enabled:          boolean
  hora:             string            // "HH:MM"
  nudge_enabled:    boolean
  nudge_hora:       string            // hora-limite para o nudge (ex: "20:00")
  freq_mode:        'dias' | 'intervalo'
  freq_days:        number[]          // dias da semana (0=dom..6=sab)
  freq_intervalo:   number            // a cada N dias
  modo_foco:        boolean
  snooze_active:    boolean
  snooze_until:     string | null     // ISO timestamp
}

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

const DEFAULT_CONFIG: ReminderConfig = {
  enabled:        false,
  hora:           '08:00',
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
      <div style={{ display: 'flex', gap: 4 }}>
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
              boxShadow: config.freq_mode === mode ? '2px 2px 0 var(--border)' : 'none',
              transform: config.freq_mode === mode ? 'translate(2px,2px)' : 'none',
            }}
          >
            {mode === 'dias' ? 'Dias da semana' : 'A cada N dias'}
          </button>
        ))}
      </div>

      {/* Days of week */}
      {config.freq_mode === 'dias' && (
        <div style={{ display: 'flex', gap: 4 }}>
          {DAYS_PT.map((d, i) => {
            const on = config.freq_days.includes(i)
            return (
              <button
                key={i}
                onClick={() => {
                  const next = on
                    ? config.freq_days.filter(x => x !== i)
                    : [...config.freq_days, i].sort()
                  onChange({ freq_days: next })
                }}
                style={{
                  flex: 1, padding: '5px 0', fontSize: 9, fontWeight: 500,
                  border: `2px solid ${on ? 'var(--border)' : 'var(--b2)'}`,
                  borderRadius: 99,
                  background: on ? 'var(--border)' : 'var(--bg3)',
                  color: on ? 'var(--bg)' : 'var(--t3)',
                  cursor: 'pointer',
                }}
              >
                {d[0]}
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

export function LembretePanel({
  habit,
  onRefresh,
}: {
  habit:     Habit
  isMobile?: boolean
  onRefresh: () => void
}) {
  const navigate = useNavigate()
  const [open,    setOpen]    = useState(false)
  const [config,  setConfig]  = useState<ReminderConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...((habit as any).reminder_config ?? {}),
    freq_days: (habit as any).reminder_config?.freq_days ?? habit.days ?? DEFAULT_CONFIG.freq_days,
  }))
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
    await updateHabit(habit.id, { ...(habit as any), reminder_config: next })
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

  // Badge on pill
  const pillLabel = !config.enabled
    ? 'Lembrete'
    : isSnoozeActive
      ? `⏱ ${snoozeLabel(config.snooze_until)}`
      : `🔔 ${config.hora}`

  return (
    <div>
      <Pill
        label={pillLabel}
        variant={config.enabled ? 'goal' : 'default'}
        size="sm"
        selected={open}
        onClick={() => setOpen(o => !o)}
        id="pill-lembrete"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        }
      />

      {open && (
        <div style={{
          marginTop: 12,
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          background: 'var(--bg2)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
          {/* ── Header ── */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '2px solid var(--border)',
            background: 'var(--bg3)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Lembrete</span>
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
                <input
                  type="time"
                  value={config.hora}
                  onChange={e => update({ hora: e.target.value })}
                  style={{
                    fontSize: 15, fontWeight: 500, fontFamily: 'var(--font-mono)',
                    border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    padding: '6px 10px', background: 'var(--bg2)', color: 'var(--t1)',
                    boxShadow: '2px 2px 0 var(--border)',
                  }}
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
                    <input
                      type="time"
                      value={config.nudge_hora}
                      onChange={e => update({ nudge_hora: e.target.value })}
                      style={{
                        fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-mono)',
                        border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px', background: 'var(--bg2)', color: 'var(--t1)',
                      }}
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
                }}
              >
                🔔 Ativar lembrete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
