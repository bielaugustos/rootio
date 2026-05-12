import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/PageWrapper'
import { getEconomy, labelNivel, type EconomyData, addIO } from '../../engine/economyDB'
import { getCurrentStreak, getHistoryRange, getHabits } from '../../engine/habitDB'
import { initChallenges, type Challenge, todayISO, syncChallengeProgress } from '../../engine/challengeDB'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'nivel' | 'desafios' | 'historico' | 'jornada'

// ── Constants ─────────────────────────────────────────────────────────────────

const CONQUISTAS = [
  { id: 'c1', titulo: 'Primeiro passo', desc: 'Criou seu primeiro hábito', icon: '🌱', gatilho: 'habit_1', raro: false },
  { id: 'c2', titulo: 'Semana perfeita', desc: '7 dias de streak', icon: '🔥', gatilho: 'streak_7', raro: false },
  { id: 'c3', titulo: '30 dias seguidos', desc: '30 dias de streak consecutivos', icon: '🏅', gatilho: 'streak_30', raro: true },
  { id: 'c4', titulo: 'Iniciante', desc: 'Atingiu o Nível 2', icon: '🔗', gatilho: 'nivel_2', raro: false },
  { id: 'c5', titulo: 'Avançado', desc: 'Atingiu o Nível 5', icon: '🔭', gatilho: 'nivel_5', raro: true },
  { id: 'c6', titulo: '500 XP', desc: 'Acumulou 500 XP total', icon: '⚡', gatilho: 'io_500', raro: false },
  { id: 'c7', titulo: 'Mestre IO', desc: 'Acumulou 1500 XP total', icon: '💎', gatilho: 'io_1500', raro: true },
]

const DESBLOQUEIOS = [
  { nivel: 1, items: ['Registro básico', 'Tela de Progresso', 'Carteira'] },
  { nivel: 2, items: ['Widget de estatísticas', 'Temas intermediários', 'Hub IO'] },
  { nivel: 5, items: ['Previsão de tendências', 'Temas dinâmicos', 'Exportação avançada'] },
]

function yesterdayISO() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0] }

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 64, color = '#f59e0b', strokeWidth = 6 }: { pct: number; size?: number; color?: string; strokeWidth?: number }) {
  const r = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--b2)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

function StatCard({ label, value, icon, color = 'var(--t1)' }: { label: string; value: string | number; icon: string; color?: string }) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 0, padding: '14px 16px',
      border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
      background: 'var(--secondary-background)', boxShadow: '4px 4px 0 var(--border)',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

function ProgressBar({ value, color = 'var(--main)' }: { value: number; color?: string }) {
  return (
    <div style={{ height: 8, background: 'var(--b2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--b2)' }}>
      <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
    </div>
  )
}

// ── RPG Map data ──────────────────────────────────────────────────────────────

interface MapArea {
  id: number
  name: string
  icon: string
  desc: string
  requiredStreak: number
  color: string
  reward: string
}

const MAP_AREAS: MapArea[] = [
  { id: 1, name: 'Vila do Início',     icon: '🏡', desc: 'Todo herói começa aqui.',                requiredStreak: 0,  color: '#22c55e', reward: '+10 XP' },
  { id: 2, name: 'Floresta da Rotina', icon: '🌲', desc: '3 dias seguidos desbloqueiam a floresta.', requiredStreak: 3,  color: '#16a34a', reward: '+25 XP' },
  { id: 3, name: 'Rio da Disciplina',  icon: '🌊', desc: 'Só os focados cruzam estas águas.',        requiredStreak: 7,  color: '#2563eb', reward: '+50 XP + avatar' },
  { id: 4, name: 'Cavernas do Hábito', icon: '⛏️', desc: 'Consistência de 14 dias abre a caverna.',   requiredStreak: 14, color: '#7c3aed', reward: '+100 XP' },
  { id: 5, name: 'Castelo do Mestre',  icon: '🏰', desc: '30 dias — o lendário castelo te espera.',   requiredStreak: 30, color: '#f59e0b', reward: '+250 XP + título' },
]

// Avatar evolves at streak milestones
function getAvatar(streak: number, profile_avatar: string): { emoji: string; title: string; aura: string } {
  if (streak >= 30) return { emoji: '🦁', title: 'Mestre', aura: '#f59e0b' }
  if (streak >= 14) return { emoji: '🧙', title: 'Guardião', aura: '#7c3aed' }
  if (streak >= 7)  return { emoji: '⚔️', title: 'Guerreiro', aura: '#2563eb' }
  if (streak >= 3)  return { emoji: '🌱', title: 'Aventureiro', aura: '#22c55e' }
  return { emoji: profile_avatar || '🐣', title: 'Iniciante', aura: 'var(--b2)' }
}

function getMapPosition(streak: number): number {
  // Returns 0-100 position on the road between areas
  const maxStreak = 30
  return Math.min(100, Math.round((streak / maxStreak) * 100))
}

interface TabJornadaProps {
  streak: number
  historyDays: { date: string; done: number; total: number }[]
}

function TabJornada({ streak, historyDays }: TabJornadaProps) {
  const avatar = getAvatar(streak, '🐣')
  const position = getMapPosition(streak)

  // Penalty detection: look for 2+ consecutive missed days in last 7
  // Only consider days that are actually past (not today with 0 done - user may still do habits)
  const today = todayISO()
  const last7 = historyDays.slice(0, 7)
  const firstDay = last7[0]?.date
  const isTodayRecorded = firstDay === today && last7[0].total > 0 && last7[0].done === 0
  const checkDays = isTodayRecorded ? last7.slice(1) : last7.filter(d => d.date !== today)
  let consecutiveMissed = 0
  let maxMissed = 0
  for (const day of checkDays) {
    if (day.total > 0 && day.done === 0) {
      consecutiveMissed++
      maxMissed = Math.max(maxMissed, consecutiveMissed)
    } else {
      consecutiveMissed = 0
    }
  }
  const hasPenalty = maxMissed >= 2
  const penaltySteps = Math.min(maxMissed - 1, 3) // max 3 steps back shown

  // Current area
  const currentArea = [...MAP_AREAS].reverse().find(a => streak >= a.requiredStreak) ?? MAP_AREAS[0]
  const nextArea = MAP_AREAS.find(a => a.requiredStreak > streak)
  const daysToNext = nextArea ? nextArea.requiredStreak - streak : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Penalty warning */}
      {hasPenalty && (
        <div style={{
          padding: '12px 16px',
          border: '2px solid #ef4444', borderRadius: 'var(--radius-base)',
          background: '#ef444412',
          boxShadow: '4px 4px 0 #ef4444',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 2 }}>
              Penalidade ativa — {penaltySteps} casa{penaltySteps > 1 ? 's' : ''} perdida{penaltySteps > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
              Você ficou {maxMissed} dias sem registrar hábitos. Complete hábitos hoje para parar o recuo e recuperar sua posição.
            </div>
          </div>
        </div>
      )}

      {/* Avatar card */}
      <div style={{
        padding: '20px',
        border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
        background: 'var(--secondary-background)', boxShadow: '4px 4px 0 var(--border)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* Avatar with aura */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 72, height: 72,
            border: `3px solid ${avatar.aura}`,
            borderRadius: '50%',
            background: `${avatar.aura}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
            boxShadow: `0 0 16px ${avatar.aura}44`,
            transition: 'all 0.4s',
          }}>
            {avatar.emoji}
          </div>
          <div style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            fontSize: 9, fontWeight: 700, padding: '1px 8px',
            background: avatar.aura, color: '#fff',
            borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap',
            border: '1.5px solid var(--border)',
          }}>
            {avatar.title}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Localização atual
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
            {currentArea.icon} {currentArea.name}
          </div>
          {nextArea ? (
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>
              <span style={{ color: avatar.aura, fontWeight: 500 }}>{daysToNext} dia{daysToNext !== 1 ? 's' : ''}</span> para {nextArea.icon} {nextArea.name}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>🏆 Área máxima desbloqueada!</div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: avatar.aura }}>{streak}</div>
          <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>dias</div>
        </div>
      </div>

      {/* Road map */}
      <div style={{
        border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
        background: 'var(--secondary-background)', boxShadow: '4px 4px 0 var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '10px 16px', background: 'var(--bg3)', borderBottom: '1px solid var(--b2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>🗺️</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mapa da Jornada</span>
        </div>

        {/* Progress road */}
        <div style={{ padding: '16px' }}>
          <div style={{ position: 'relative', height: 8, background: 'var(--b2)', borderRadius: 4, marginBottom: 20 }}>
            <div style={{
              height: '100%', width: `${position}%`,
              background: `linear-gradient(90deg, #22c55e, ${avatar.aura})`,
              borderRadius: 4, transition: 'width 0.6s ease',
            }} />
            {/* Avatar position marker */}
            <div style={{
              position: 'absolute', top: '50%',
              left: `${Math.max(0, Math.min(96, position))}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: 18,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              transition: 'left 0.6s ease',
            }}>
              {avatar.emoji}
            </div>
          </div>

          {/* Area markers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MAP_AREAS.map(area => {
              const unlocked = streak >= area.requiredStreak
              const isCurrent = area.id === currentArea.id
              return (
                <div key={area.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  border: `2px solid ${isCurrent ? area.color : unlocked ? 'var(--b2)' : 'var(--b2)'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: isCurrent ? `${area.color}12` : 'transparent',
                  opacity: unlocked ? 1 : 0.5,
                  filter: unlocked ? 'none' : 'grayscale(0.6)',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{area.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: unlocked ? 'var(--t1)' : 'var(--t3)' }}>
                        {area.name}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', background: area.color, color: '#fff', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
                          AQUI
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{area.desc}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {unlocked ? (
                      <div style={{ fontSize: 11, fontWeight: 500, color: area.color }}>{area.reward}</div>
                    ) : (
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                        🔒 {area.requiredStreak}d
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 7-day widget */}
      <div style={{
        border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
        background: 'var(--secondary-background)', boxShadow: '4px 4px 0 var(--border)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '10px 16px',
          background: 'var(--bg3)',
          borderBottom: '1px solid var(--b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ph ph-calendar-blank" style={{ fontSize: 14, color: 'var(--t2)' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Últimos 7 dias</span>
          </div>
          {(() => {
            const perfectDays = Array.from({ length: 7 }).filter((_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (6 - i))
              const dateStr = d.toISOString().split('T')[0]
              const entry = historyDays.find(h => h.date === dateStr)
              return entry && entry.total > 0 && entry.done === entry.total
            }).length
            return perfectDays > 0 ? (
              <span style={{
                fontSize: 11, fontWeight: 500, color: '#166534',
                background: '#dcfce7', border: '1.5px solid #22c55e',
                borderRadius: 99, padding: '2px 10px',
              }}>
                {perfectDays} perfeito{perfectDays > 1 ? 's' : ''}
              </span>
            ) : null
          })()}
        </div>

        {/* Day grid */}
        <div style={{ padding: '16px 16px 12px', display: 'flex', gap: 8 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i))
            const dateStr = d.toISOString().split('T')[0]
            const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()
            const dayNum = d.getDate()
            const entry = historyDays.find(h => h.date === dateStr)
            const pct = entry && entry.total > 0 ? Math.round((entry.done / entry.total) * 100) : 0
            const isToday = i === 6
            const isPerfect = pct === 100
            const isPartial = pct > 0 && pct < 100
            const isLost = !!entry && entry.total > 0 && pct === 0
            const hasNoData = !entry || entry.total === 0

            const bgColor = isPerfect ? '#22c55e' : isPartial ? '#f59e0b' : isLost ? '#ef4444' : 'var(--bg3)'
            const borderColor = isPerfect ? '#16a34a' : isPartial ? '#d97706' : isLost ? '#dc2626' : isToday ? 'var(--border)' : 'var(--b2)'
            const textColor = isPerfect || isPartial || isLost ? '#fff' : 'var(--t3)'
            const shadow = isToday ? `3px 3px 0 ${borderColor}` : isPerfect ? '3px 3px 0 #16a34a' : 'none'

            const icon = isPerfect ? 'ph-check-circle' : isPartial ? 'ph-circle-half' : isLost ? 'ph-x-circle' : null

            return (
              <div key={dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {/* day label */}
                <span style={{
                  fontSize: 9, fontWeight: isToday ? 800 : 600,
                  color: isToday ? 'var(--t1)' : 'var(--t3)',
                  letterSpacing: '0.06em',
                }}>
                  {dayLabel}
                </span>

                {/* day card */}
                <div style={{
                  width: '100%', aspectRatio: '1',
                  borderRadius: 10,
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  boxShadow: shadow,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 3,
                  position: 'relative',
                  transition: 'transform 0.1s',
                }}>
                  {icon && (
                    <i className={`ph ${icon}`} style={{ fontSize: 18, color: textColor }} />
                  )}
                  {!hasNoData && (
                    <span style={{ fontSize: 10, fontWeight: 500, color: textColor, fontFamily: 'var(--font-mono)' }}>
                      {pct}%
                    </span>
                  )}
                  {hasNoData && (
                    <span style={{ fontSize: 16, color: 'var(--t4)', lineHeight: 1 }}>—</span>
                  )}
                  {/* today indicator dot */}
                  {isToday && (
                    <div style={{
                      position: 'absolute', top: 5, right: 5,
                      width: 6, height: 6, borderRadius: '50%',
                      background: hasNoData ? 'var(--main)' : '#fff',
                      opacity: 0.8,
                    }} />
                  )}
                </div>

                {/* day number */}
                <span style={{
                  fontSize: 9, color: isToday ? 'var(--t1)' : 'var(--t4)',
                  fontWeight: isToday ? 700 : 400,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {dayNum}
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ padding: '0 16px 14px', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {([
            ['#22c55e', '#16a34a', 'Dia perfeito'],
            ['#f59e0b', '#d97706', 'Parcial'],
            ['#ef4444', '#dc2626', 'Perdido'],
            ['var(--bg3)', 'var(--b2)', 'Sem dados'],
          ] as const).map(([bg, border, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 12, height: 12, borderRadius: 4,
                background: bg, border: `1.5px solid ${border}`,
              }} />
              <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules box */}
      <div style={{
        padding: '14px 16px',
        border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
        background: 'transparent',
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', marginBottom: 8 }}>📜 Regras da Jornada</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['✅', 'Cada dia com hábitos completos avança 1 casa no mapa'],
            ['🔥', '7 dias seguidos transforma seu avatar e desbloqueia nova área'],
            ['⚠️', '2 dias sem registrar ativa penalidade — você recua casas'],
            ['💎', 'Áreas desbloqueadas concedem XP e recompensas permanentes'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ProgressPage() {
  const [tab, setTab] = useState<Tab>('nivel')
  const [economy, setEconomy] = useState<EconomyData | null>(null)
  const [streak, setStreak] = useState(0)
  const [challenges, setChallenges] = useState<Challenge[]>(initChallenges)
  const [ioToday, setIoToday] = useState(0)
  const [historyDays, setHistoryDays] = useState<{ date: string; done: number; total: number; pts: number }[]>([])
  const [habitsCount, setHabitsCount] = useState(0)

  useEffect(() => {
    Promise.all([
      getEconomy(),
      getCurrentStreak(),
      getHabits(),
    ]).then(([eco, str, habits]) => {
      setEconomy(eco)
      setStreak(str)
      setHabitsCount(habits.length)
    })

    ;(async () => {
      // Load history — last 30 days
      const from = new Date(); from.setDate(from.getDate() - 29)
      const fromStr = from.toISOString().split('T')[0]
      const entries = await getHistoryRange(fromStr, todayISO())
      // Deduplicate by date — keep the entry with the highest `done` count per date
      const byDate = new Map<string, typeof entries[0]>()
      for (const e of entries) {
        const existing = byDate.get(e.date)
        if (!existing || e.done > existing.done) byDate.set(e.date, e)
      }
      const days = Array.from(byDate.values()).map(e => ({
        date: e.date,
        done: e.done,
        total: e.total,
        pts: Object.values(e.habits).reduce((s, h) => s + (h.done ? h.pts : 0), 0),
      })).sort((a, b) => b.date.localeCompare(a.date))
      setHistoryDays(days)

      const todayEntry = entries.find(e => e.date === todayISO())
      if (todayEntry) {
        const pts = Object.values(todayEntry.habits).reduce((s, h) => s + (h.done ? h.pts : 0), 0)
        setIoToday(pts)
      }

      // Sync challenge progress from real history
      const synced = await syncChallengeProgress(days)
      setChallenges(synced.updated)
      if (synced.rewards > 0) {
        await addIO(synced.rewards)
      }
    })()
  }, [])

  if (!economy) return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <span style={{ color: 'var(--t3)', fontSize: 14 }}>Carregando progresso...</span>
    </main>
  )

  const nivel = economy.nivel
  const nivelLabel = labelNivel(nivel)
  const pct = economy.progresso_nivel
  const xpProximo = economy.xp_proximo_nivel
  const faltam = Math.max(0, xpProximo - economy.xp_total)
  const pctDia = Math.min(100, Math.round((ioToday / 200) * 100))

  const tabStyle = (t: Tab) => ({
    flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 500,
    fontFamily: 'var(--font-sans)', cursor: 'pointer',
    border: `2px solid ${tab === t ? 'var(--border)' : 'var(--b2)'}`,
    background: tab === t ? 'var(--main)' : 'var(--secondary-background)',
    color: tab === t ? 'var(--main-foreground)' : 'var(--t2)',
    boxShadow: tab === t ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)',
    transform: tab === t ? 'translate(var(--shadow-x), var(--shadow-y))' : 'none',
    transition: 'all 0.1s',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties)

  return (
    <PageWrapper>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, color: 'var(--t1)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-title)' }}>
          <i className="ph ph-chart-line-up" style={{ fontSize: 26 }} /> Progresso
        </h1>
        <p style={{ color: 'var(--t2)', fontSize: 15 }}>Nível, desafios e histórico de IO.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {([['nivel', 'Nível', 'ph-medal'], ['desafios', 'Desafios', 'ph-flag'], ['historico', 'Histórico', 'ph-clock-clockwise'], ['jornada', 'Jornada', 'ph-map-trifold']] as const).map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)} style={tabStyle(id)}>
            <i className={`ph ${icon}`} style={{ marginRight: 6, fontSize: 13 }} />{label}
          </button>
        ))}
      </div>

      {/* ── Tab: Nível ── */}
      {tab === 'nivel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Hero card */}
          <div style={{
            padding: '20px', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
            background: 'var(--secondary-background)', boxShadow: '4px 4px 0 var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {/* Level ring */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <ProgressRing pct={pct} size={72} color="#f59e0b" strokeWidth={6} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f59e0b', lineHeight: 1 }}>
                    {String(nivel).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 8, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>nível</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Título atual</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>{nivelLabel}</div>
                <ProgressBar value={pct} color="#f59e0b" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>{economy.xp_total} XP</span>
                  <span style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>→ {xpProximo} XP</span>
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 12, borderTop: '1px solid var(--b2)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>PRÓXIMO: {labelNivel(nivel + 1)}</span>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '2px 10px',
                background: '#f59e0b18', color: '#f59e0b',
                border: '1.5px solid #f59e0b', borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
              }}>{faltam} XP restantes</span>
            </div>
          </div>

          {/* Stats grid — 2 cols on mobile, 4 on desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <StatCard label="XP Total" value={economy.xp_total} icon="⭐" color="#f59e0b" />
            <StatCard label="Saldo IO" value={economy.io_saldo} icon="⚡" />
            <StatCard label="Streak"   value={`${streak}d`}     icon="🔥" color="#f97316" />
            <StatCard label="IO hoje"  value={`+${ioToday}`}    icon="🎯" />
          </div>

          {/* IO today bar */}
          <div style={{
            padding: '16px 20px', border: '2px solid #f59e0b',
            borderRadius: 'var(--radius-base)', background: '#f59e0b12',
            boxShadow: '4px 4px 0 #f59e0b',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ph ph-lightning" style={{ fontSize: 14, color: '#f59e0b' }} />
                <span style={{ fontSize: 12, fontWeight: 400, color: '#92400e' }}>IO ganho hoje</span>
              </div>
              <span style={{ fontSize: 11, color: '#92400e', fontFamily: 'var(--font-mono)' }}>{ioToday} / 200</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#92400e', marginBottom: 8, lineHeight: 1 }}>+{ioToday}</div>
            <ProgressBar value={pctDia} color="#f59e0b" />
            <div style={{ fontSize: 11, color: '#92400e', marginTop: 6 }}>{200 - ioToday} IO disponíveis até o limite diário</div>
          </div>

          {/* Desbloqueios */}
          <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', overflow: 'hidden', boxShadow: '4px 4px 0 var(--border)' }}>
            <div style={{ padding: '10px 16px', background: 'var(--bg3)', borderBottom: '1px solid var(--b2)' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Desbloqueios</span>
            </div>
            <div style={{ background: 'var(--secondary-background)', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {DESBLOQUEIOS.flatMap(({ nivel: n, items }) =>
                items.map(item => {
                  const unlocked = nivel >= n
                  return (
                    <div key={item} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', borderBottom: '1px solid var(--b2)',
                      background: unlocked ? '#22c55e0a' : 'transparent',
                      opacity: unlocked ? 1 : 0.6,
                    }}>
                      <i className={`ph ${unlocked ? 'ph-check-circle' : 'ph-lock'}`}
                        style={{ fontSize: 16, color: unlocked ? '#22c55e' : 'var(--t3)', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 400, color: unlocked ? 'var(--t1)' : 'var(--t3)', flex: 1 }}>{item}</span>
                      {!unlocked && (
                        <span style={{
                          fontSize: 10, fontWeight: 500, padding: '1px 6px',
                          border: '1.5px solid var(--b2)', borderRadius: 'var(--radius-sm)',
                          color: 'var(--t3)',
                        }}>Nível {n}</span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Conquistas */}
          <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', overflow: 'hidden', boxShadow: '4px 4px 0 var(--border)' }}>
            <div style={{ padding: '10px 16px', background: 'var(--bg3)', borderBottom: '1px solid var(--b2)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ph ph-medal" style={{ color: '#f59e0b', fontSize: 14 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conquistas</span>
            </div>
            <div style={{ background: 'var(--secondary-background)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, padding: 12 }}>
              {CONQUISTAS.map(c => {
                let unlocked = false
                if (c.gatilho === 'habit_1') unlocked = habitsCount > 0
                if (c.gatilho === 'nivel_2') unlocked = nivel >= 2
                if (c.gatilho === 'nivel_5') unlocked = nivel >= 5
                if (c.gatilho === 'io_500') unlocked = economy.xp_total >= 500
                if (c.gatilho === 'io_1500') unlocked = economy.xp_total >= 1500
                if (c.gatilho === 'streak_7') unlocked = streak >= 7
                if (c.gatilho === 'streak_30') unlocked = streak >= 30
                return (
                  <div key={c.id} style={{
                    padding: '10px 12px', border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', background: 'var(--secondary-background)',
                    boxShadow: unlocked ? '2px 2px 0 var(--border)' : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    opacity: unlocked ? 1 : 0.4,
                    filter: unlocked ? 'none' : 'grayscale(1)',
                  }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t1)' }}>{c.titulo}</span>
                        {c.raro && (
                          <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', background: '#f59e0b', color: '#fff', borderRadius: 'var(--radius-sm)' }}>RARO</span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--t3)', lineHeight: 1.4 }}>{c.desc}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Desafios ── */}
      {tab === 'desafios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {(['semanal', 'mensal'] as const).map(type => (
            <div key={type}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Desafios {type === 'semanal' ? 'da semana' : 'do mês'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {challenges.filter(c => c.type === type).map(c => {
                  const cpct = Math.min(100, Math.round((c.progress / c.total) * 100))
                  return (
                    <div key={c.id} style={{
                      border: `2px solid ${c.done ? '#22c55e' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-base)', overflow: 'hidden',
                      background: c.done ? '#22c55e0a' : 'var(--secondary-background)',
                      boxShadow: `4px 4px 0 ${c.done ? '#22c55e' : 'var(--border)'}`,
                    }}>
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: c.done ? 0 : 12 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <span style={{ fontSize: 28, flexShrink: 0 }}>{c.icon}</span>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 500, color: c.done ? '#22c55e' : 'var(--t1)', marginBottom: 2 }}>{c.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--t3)' }}>{c.desc}</div>
                            </div>
                          </div>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: '3px 10px', flexShrink: 0,
                            background: c.done ? '#22c55e' : '#f59e0b18',
                            color: c.done ? '#fff' : '#92400e',
                            border: `1.5px solid ${c.done ? '#22c55e' : '#f59e0b'}`,
                            borderRadius: 'var(--radius-sm)',
                          }}>
                            {c.done ? '✓ ' : ''}{c.reward} IO
                          </span>
                        </div>
                        {!c.done && (
                          <>
                            <ProgressBar value={cpct} color="#f59e0b" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                              <span style={{ fontSize: 10, color: 'var(--t3)' }}>{c.progress} / {c.total}</span>
                              <span style={{ fontSize: 10, color: 'var(--t3)' }}>expira {c.expiresAt}</span>
                            </div>
                          </>
                        )}
                        {c.done && (
                          <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 400, marginTop: 6 }}>
                            Desafio concluído! +{c.reward} IO recebidos 🎉
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Histórico ── */}
      {tab === 'historico' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {historyDays.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '64px 24px', textAlign: 'center',
              border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)', gap: 12,
            }}>
              <i className="ph ph-chart-line-up" style={{ fontSize: 48, color: 'var(--t3)' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--t1)', marginBottom: 6 }}>Nenhuma ação ainda</div>
                <div style={{ fontSize: 13, color: 'var(--t3)' }}>Complete hábitos para ver seu histórico de IO</div>
              </div>
            </div>
          ) : historyDays.map(day => {
            const label = day.date === todayISO() ? 'Hoje'
              : day.date === yesterdayISO() ? 'Ontem'
              : new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
            const pctDay = day.total > 0 ? Math.round((day.done / day.total) * 100) : 0
            const color = pctDay === 100 ? '#22c55e' : pctDay > 0 ? '#f59e0b' : 'var(--t3)'

            return (
              <div key={day.date}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>{label}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '2px 10px',
                    background: '#f59e0b', color: '#000',
                    border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    boxShadow: '2px 2px 0 var(--border)', fontFamily: 'var(--font-mono)',
                  }}>+{day.pts} IO</span>
                </div>
                <div style={{
                  border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
                  background: 'var(--secondary-background)', boxShadow: '4px 4px 0 var(--border)',
                  padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <ProgressBar value={pctDay} color={color} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-mono)', color, flexShrink: 0 }}>
                      {day.done}/{day.total}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                      <i className="ph ph-check" style={{ marginRight: 3 }} />{day.done} hábitos concluídos
                    </span>
                    <span style={{ fontSize: 11, color }}>
                      {pctDay}% do dia
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tab: Jornada ── */}
      {tab === 'jornada' && (
        <TabJornada streak={streak} historyDays={historyDays} />
      )}

    </PageWrapper>
  )
}