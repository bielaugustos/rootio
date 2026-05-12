import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/PageWrapper'
import { Button } from '../../components/Button'
import { getProfile, updateProfile, type Profile } from '../../engine/profileDB'
import { getHabits, getHabitStreak, type Habit } from '../../engine/habitDB'

// ── Types ─────────────────────────────────────────────────────────────────────

interface NotifItem {
  id: string
  icon: string
  title: string
  desc: string
  time: string
  read: boolean
  type: 'habit' | 'achievement' | 'reminder' | 'system' | 'streak' | 'goal'
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        border: '2px solid var(--border)',
        background: value ? 'var(--main)' : 'var(--bg3, #e8e4dc)',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.15s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: value ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: 'var(--foreground)',
        transition: 'left 0.15s',
      }} />
    </button>
  )
}

// ── Permission Row ────────────────────────────────────────────────────────────

function PermRow({
  icon, title, desc, enabled, onToggle, last,
}: {
  icon: string; title: string; desc: string
  enabled: boolean; onToggle: () => void; last?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 16,
      padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid var(--b2)',
      background: 'var(--secondary-background)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: enabled ? 'var(--main)' : 'var(--bg3, #e8e4dc)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '2px 2px 0 var(--border)',
          flexShrink: 0,
          transition: 'background 0.2s',
        }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{desc}</div>
        </div>
      </div>
      <Toggle value={enabled} onChange={onToggle} />
    </div>
  )
}

// ── Notification Item ─────────────────────────────────────────────────────────

function NotifRow({ item, onRead }: { item: NotifItem; onRead: (id: string) => void }) {
  const typeColors: Record<NotifItem['type'], string> = {
    habit:       'var(--main)',
    achievement: '#f59e0b',
    reminder:    '#6FB8FF',
    system:      'var(--t3)',
    streak:      'var(--destructive, #e05c4b)',
    goal:        'var(--c-goal, #F59E0B)',
  }

  const isStreak = item.type === 'streak'

  return (
    <div
      onClick={() => onRead(item.id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 20px',
        background: isStreak && !item.read
          ? 'color-mix(in srgb, var(--destructive, #e05c4b) 8%, transparent)'
          : item.read ? 'transparent' : 'var(--secondary-background)',
        borderBottom: '1px solid var(--b2)',
        cursor: 'pointer',
        transition: 'background 0.1s',
        position: 'relative',
      }}
    >
      {/* Unread dot */}
      {!item.read && (
        <div style={{
          position: 'absolute', top: 18, left: 8,
          width: 6, height: 6, borderRadius: '50%',
          background: isStreak ? 'var(--destructive, #e05c4b)' : 'var(--main)',
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: 40, height: 40, fontSize: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: typeColors[item.type] + '18',
        border: `2px solid ${typeColors[item.type]}`,
        borderRadius: 'var(--radius-sm)',
        flexShrink: 0,
      }}>
        {item.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: item.read ? 500 : 700,
          color: isStreak && !item.read ? 'var(--destructive, #e05c4b)' : 'var(--t1)',
        }}>
          {item.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{item.desc}</div>
      </div>

      {/* Time */}
      <div style={{ fontSize: 11, color: 'var(--t3)', flexShrink: 0, marginTop: 2 }}>
        {item.time}
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onSettings }: { onSettings: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', textAlign: 'center',
      border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
    }}>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <img
          src="/illustrations/notificationbell.png"
          alt="Notificações"
          style={{ width: 100, height: 100, objectFit: 'contain' }}
        />
        <div style={{
          position: 'absolute', top: -4, right: -4,
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--main)',
          border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 500, color: 'var(--main-foreground)',
        }}>
          0
        </div>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
        Nada por aqui!
      </h3>
      <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 24, maxWidth: 240 }}>
        Ative as notificações e volte aqui para ver seus alertas e lembretes.
      </p>
      <Button label="Configurações de notificação" variant="neutral" onClick={onSettings} />
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATIC_NOTIFS: NotifItem[] = [
  { id: 's1', icon: '🔥', title: 'Sequência de 7 dias!', desc: 'Você completou hábitos por 7 dias seguidos.', time: 'agora', read: false, type: 'achievement' },
  { id: 's2', icon: '✅', title: 'Meta atingida', desc: 'Parabéns! Você completou 100% dos hábitos ontem.', time: '1d', read: true, type: 'habit' },
  { id: 's3', icon: '⭐', title: 'Nova conquista', desc: 'Desbloqueou "Iniciante disciplinado" — 30 dias ativos.', time: '3d', read: true, type: 'achievement' },
]

function buildStreakNotif(habit: Habit, streak: number): NotifItem {
  return {
    id: `streak-risk-${habit.id}`,
    icon: '⚡',
    title: `Streak em risco — ${habit.icon} ${habit.name}`,
    desc: `${streak} dia${streak > 1 ? 's' : ''} seguido${streak > 1 ? 's' : ''} — conclua hoje para não perder!`,
    time: 'hoje',
    read: false,
    type: 'streak',
  }
}

const GOAL_MILESTONES = [10, 50, 100] as const

function getReachedMilestone(pct: number): number | null {
  for (let i = GOAL_MILESTONES.length - 1; i >= 0; i--) {
    if (pct >= GOAL_MILESTONES[i]) return GOAL_MILESTONES[i]
  }
  return null
}

function buildGoalNotif(habit: Habit, milestone: number): NotifItem {
  const unit = habit.goal_unit ?? ''
  const current = (habit.goal_current ?? 0).toLocaleString('pt-BR')
  const target = (habit.goal_target ?? 0).toLocaleString('pt-BR')
  const periodLabel = habit.goal_period ? ` · acompanhamento ${habit.goal_period}` : ''
  const titles: Record<number, string> = {
    10:  `Meta iniciada — ${habit.icon} ${habit.name}`,
    50:  `Metade do caminho — ${habit.icon} ${habit.name}`,
    100: `Meta concluída! — ${habit.icon} ${habit.name}`,
  }
  const descs: Record<number, string> = {
    10:  `${unit} ${current} de ${unit} ${target}${periodLabel}`,
    50:  `${unit} ${current} de ${unit} ${target}${periodLabel} — continue assim!`,
    100: `${unit} ${current} atingido${periodLabel}. Parabéns!`,
  }
  const icons: Record<number, string> = { 10: '🎯', 50: '📈', 100: '🏆' }
  return {
    id: `goal-${habit.id}-${milestone}`,
    icon: icons[milestone],
    title: titles[milestone],
    desc: descs[milestone],
    time: 'hoje',
    read: milestone < 100,
    type: 'goal',
  }
}

function getSeenMilestones(habitId: string): number[] {
  try {
    const raw = localStorage.getItem(`goal-notifs-${habitId}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function markMilestoneSeen(habitId: string, milestone: number) {
  const seen = getSeenMilestones(habitId)
  if (!seen.includes(milestone)) {
    localStorage.setItem(`goal-notifs-${habitId}`, JSON.stringify([...seen, milestone]))
  }
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')
  const [showSettings, setShowSettings] = useState(false)
  const [staticNotifs, setStaticNotifs] = useState<NotifItem[]>(STATIC_NOTIFS)
  const [streakNotifs, setStreakNotifs] = useState<NotifItem[]>([])
  const [goalNotifs, setGoalNotifs] = useState<NotifItem[]>([])
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [achievementEnabled, setAchievementEnabled] = useState(true)
  const [allMarkedRead, setAllMarkedRead] = useState(false)

  useEffect(() => {
    getProfile().then(setProfile)
    if ('Notification' in window) {
      Promise.resolve(Notification.permission).then(setBrowserPermission)
    }

    // Detecta hábitos com streak em risco (streak > 0, não concluído, ≥ 20h)
    const hour = new Date().getHours()
    const loadStreakRisks = async () => {
      const habits = await getHabits('habit')
      const atRisk = habits.filter(h => !h.done)
      if (atRisk.length === 0 || hour < 20) return
      const results = await Promise.all(
        atRisk.map(async h => {
          const streak = await getHabitStreak(h.id)
          return streak > 0 ? buildStreakNotif(h, streak) : null
        })
      )
      setStreakNotifs(results.filter(Boolean) as NotifItem[])
    }
    loadStreakRisks()

    // Detecta metas com milestones atingidos (10%, 50%, 100%) ainda não notificados
    const loadGoalMilestones = async () => {
      const goals = await getHabits('goal')
      const notifs: NotifItem[] = []
      for (const habit of goals) {
        const target = habit.goal_target ?? 0
        if (target === 0) continue
        const pct = Math.min(100, Math.round(((habit.goal_current ?? 0) / target) * 100))
        const milestone = getReachedMilestone(pct)
        if (milestone === null) continue
        const seen = getSeenMilestones(habit.id)
        // Gera notificação para cada milestone atingido ainda não visto
        for (const m of GOAL_MILESTONES) {
          if (m <= milestone && !seen.includes(m)) {
            notifs.push(buildGoalNotif(habit, m))
            markMilestoneSeen(habit.id, m)
          }
        }
      }
      if (notifs.length > 0) setGoalNotifs(notifs)
    }
    loadGoalMilestones()
  }, [])

  const update = async (data: Partial<Profile>) => {
    if (!profile) return
    const updated = await updateProfile(data)
    setProfile(updated)
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setBrowserPermission(result)
  }

  // Streak notifs ficam sempre no topo, não lidas
  const allNotifs = [...streakNotifs, ...goalNotifs, ...staticNotifs]

  const markRead = (id: string) => {
    setStreakNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setGoalNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setStaticNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setStreakNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setGoalNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setStaticNotifs(prev => prev.map(n => ({ ...n, read: true })))
    setAllMarkedRead(true)
  }

  const deleteAllRead = () => {
    setStreakNotifs([])
    setGoalNotifs([])
    setStaticNotifs([])
    setAllMarkedRead(false)
  }

  const unreadCount = allNotifs.filter(n => !n.read).length
  const browserGranted = browserPermission === 'granted'
  const browserDenied = browserPermission === 'denied'

  if (!profile) return null

  return (
    <PageWrapper>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ fontSize: 28, color: 'var(--t1)', marginBottom: 4, fontFamily: 'var(--font-title)' }}>
            Notificações
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 10, fontSize: 14,
                padding: '2px 8px',
                background: streakNotifs.some(n => !n.read) ? 'var(--destructive, #e05c4b)' : 'var(--main)',
                color: 'var(--main-foreground)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '2px 2px 0 var(--border)',
                verticalAlign: 'middle',
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: 15 }}>Alertas e lembretes.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {allMarkedRead && (
            <Button label="Excluir todas" variant="destructive" size="sm" onClick={deleteAllRead} />
          )}
          {unreadCount > 0 && !allMarkedRead && (
            <Button label="Marcar todos" variant="neutral" size="sm" onClick={markAllRead} />
          )}
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: showSettings ? 'var(--main)' : 'var(--secondary-background)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '2px 2px 0 var(--border)',
              cursor: 'pointer',
              color: showSettings ? 'var(--main-foreground)' : 'var(--t2)',
              fontSize: 16,
              transition: 'all 0.1s',
            }}
            title="Configurações"
          >
            <i className="ph ph-sliders" />
          </button>
        </div>
      </div>

      {/* Browser permission banner */}
      {!browserGranted && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '14px 20px', marginBottom: 20,
          background: browserDenied ? '#fff1f0' : 'var(--main)',
          border: `2px solid ${browserDenied ? '#ef4444' : 'var(--border)'}`,
          borderRadius: 'var(--radius-base)',
          boxShadow: `4px 4px 0 ${browserDenied ? '#ef4444' : 'var(--border)'}`,
        }}>
          <span style={{ fontSize: 22 }}>{browserDenied ? '🚫' : '🔔'}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 500,
              color: browserDenied ? '#ef4444' : 'var(--main-foreground)',
            }}>
              {browserDenied ? 'Notificações bloqueadas' : 'Ativar notificações do navegador'}
            </div>
            <div style={{
              fontSize: 12, marginTop: 2, opacity: 0.85,
              color: browserDenied ? '#ef4444' : 'var(--main-foreground)',
            }}>
              {browserDenied
                ? 'Acesse as configurações do navegador para desbloquear.'
                : 'Receba lembretes de hábitos diretamente no seu dispositivo.'}
            </div>
          </div>
          {!browserDenied && (
            <Button label="Permitir" variant="neutral" size="sm" onClick={requestPermission} />
          )}
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div style={{
          marginBottom: 24,
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
          <div style={{
            padding: '10px 20px',
            background: 'var(--main)',
            borderBottom: '2px solid var(--border)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--main-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Permissões
            </span>
          </div>
          <PermRow
            icon="🔔" title="Notificações"
            desc="Alertas e lembretes do app"
            enabled={profile.notifications_on}
            onToggle={() => update({ notifications_on: !profile.notifications_on })}
          />
          <PermRow
            icon="🔊" title="Sons"
            desc="Tocar sons ao completar ações"
            enabled={profile.sound_on}
            onToggle={() => update({ sound_on: !profile.sound_on })}
          />
          <PermRow
            icon="⏰" title="Lembretes diários"
            desc="Lembrete matinal para revisar hábitos"
            enabled={reminderEnabled}
            onToggle={() => setReminderEnabled(v => !v)}
          />
          <PermRow
            icon="🏆" title="Conquistas"
            desc="Notificar ao atingir metas e sequências"
            enabled={achievementEnabled}
            onToggle={() => setAchievementEnabled(v => !v)}
            last
          />
        </div>
      )}

      {/* Notifications list */}
      {allNotifs.length === 0 || !profile.notifications_on ? (
        <EmptyState onSettings={() => setShowSettings(true)} />
      ) : (
        <div style={{
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
          {allNotifs.map(n => (
            <NotifRow key={n.id} item={n} onRead={markRead} />
          ))}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--b2)',
            background: 'var(--bg3, #e8e4dc)',
            display: 'flex', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>
              Mostrando {allNotifs.length} notificação{allNotifs.length !== 1 ? 'ões' : ''}
            </span>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}