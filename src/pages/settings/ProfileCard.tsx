import { useState, useEffect } from 'react'
import type { Profile } from '../../engine/profileDB'
import { Button } from '../../components/Button'
import { getHabits, getCurrentStreak, getWeekProgress } from '../../engine/habitDB'

interface ProfileCardProps {
  profile: Profile
  onEdit: () => void
}

interface RealData {
  streak: number
  total: number
  done: number
  goals: number
  pts: number
  weekDays: number
  totalTime: number
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
      <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--t1)' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--t3)', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const [statsTab, setStatsTab] = useState<'io' | 'time'>('io')
  const [realData, setRealData] = useState<RealData | null>(null)

  useEffect(() => {
    const load = async () => {
      const [habits, streak, week] = await Promise.all([
        getHabits(),
        getCurrentStreak(),
        getWeekProgress(),
      ])
      const done = habits.filter(h => h.done).length
      const goals = habits.filter(h => h.list === 'goal').length
      const pts = habits.filter(h => h.done).reduce((sum, h) => sum + h.pts, 0)
      const weekDays = week.filter(d => d.done > 0).length
      const totalTime = habits.reduce((sum, h) => sum + (h.est_mins ?? 0), 0)
      setRealData({ streak, total: habits.length, done, goals, pts, weekDays, totalTime })
    }
    load()
  }, [])

  const IO_ITEMS = realData ? [
    { id: '1', icon: 'ph-star',      label: 'Streak atual',    value: `${realData.streak} dias`, color: 'var(--main)' },
    { id: '2', icon: 'ph-fire',      label: 'Hábitos feitos',  value: String(realData.done),     color: '#ef593b' },
    { id: '3', icon: 'ph-target',    label: 'Metas ativas',    value: String(realData.goals),    color: '#9B7BFF' },
  ] : []

  const TIME_ITEMS = realData ? [
    { id: '2', icon: 'ph-timer',          label: 'Tempo estimado',  value: `${realData.totalTime}min`, color: 'var(--main)' },
    { id: '3', icon: 'ph-calendar-check', label: 'Dias ativos',     value: String(realData.weekDays),  color: '#7CE577' },
    { id: '4', icon: 'ph-check-square',   label: 'Total hábitos',   value: String(realData.total),     color: '#ef593b' },
  ] : []

  const currentStats = statsTab === 'io' ? IO_ITEMS : TIME_ITEMS

  const joinDate = new Date(profile.created_at).toLocaleDateString('pt-BR', {
    month: 'short', year: 'numeric',
  })

  return (
    <div style={{
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius-base)',
      overflow: 'hidden',
      boxShadow: '4px 4px 0 var(--border)',
      background: 'var(--secondary-background)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 16,
        padding: '20px 20px 16px', borderBottom: '1px solid var(--b2)',
      }}>
        <div style={{
          width: 64, height: 64, fontSize: 36,
          borderRadius: 'var(--radius-base)', border: '2px solid var(--border)',
          boxShadow: '3px 3px 0 var(--border)', background: profile.bg_cor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {profile.avatar}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)' }}>
              {profile.username ?? 'Usuário'}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              background: profile.plan === 'pro' ? 'var(--main)' : 'var(--bg3, #e8e4dc)',
              color: profile.plan === 'pro' ? 'var(--main-foreground)' : 'var(--t3)',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
              boxShadow: '1px 1px 0 var(--border)', textTransform: 'uppercase',
              letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {profile.plan === 'pro' ? '⭐' : '✓'} Verificado · {profile.plan}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)' }}>Membro desde {joinDate}</div>
        </div>

        <button
          onClick={onEdit} title="Editar perfil"
          style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--secondary-background)', border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)',
            cursor: 'pointer', color: 'var(--t2)', fontSize: 14, flexShrink: 0,
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
        >
          <i className="ph ph-pencil-simple" />
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', padding: '14px 20px', borderBottom: '1px solid var(--b2)' }}>
        <StatItem label="@Username" value={profile.handle ? `@${profile.handle}` : '—'} />
        <div style={{ width: 1, background: 'var(--b2)', margin: '0 8px' }} />
        <StatItem label="IO hoje" value={`${realData?.pts ?? 0}`} />
        <div style={{ width: 1, background: 'var(--b2)', margin: '0 8px' }} />
        <StatItem label="Plano" value={profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} />
      </div>

      {/* About */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--b2)' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'var(--t3)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
        }}>
          Sobre
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(profile.bio
            ? profile.bio.split(/[.!?]\s*/).filter((s: string) => s.trim())
            : [
              'Construindo hábitos consistentes para alcançar meus objetivos.',
              'Foco em produtividade, saúde e desenvolvimento pessoal.',
              'Pequenas ações diárias criam grandes transformações.',
            ]
          ).slice(0, 3).map((line: string, i: number) => (
            <div key={i} style={{
              minHeight: 16,
              background: i === 0 ? 'var(--bg3, #e8e4dc)' : 'var(--b2)',
              borderRadius: 4,
              width: i === 0 ? '100%' : i === 1 ? '85%' : '65%',
              display: 'flex', alignItems: 'center', padding: '4px 8px',
            }}>
              <span style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.3 }}>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '14px 20px 20px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Button label="IO" variant={statsTab === 'io' ? 'default' : 'neutral'} size="sm" onClick={() => setStatsTab('io')} />
          <Button label="Time" variant={statsTab === 'time' ? 'default' : 'neutral'} size="sm" onClick={() => setStatsTab('time')} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 10,
        }}>
          {currentStats.map(stat => (
            <div key={stat.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              background: 'var(--secondary-background)', border: '2px solid var(--border)',
              borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)',
            }}>
              <i className={`ph ${stat.icon}`} style={{ fontSize: 20, color: stat.color }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--t1)' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}