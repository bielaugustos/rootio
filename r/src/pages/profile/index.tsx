import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { getProfile, subscribeProfile, type Profile } from '../../engine/profileDB'
import { getEconomy, labelNivel, type EconomyData } from '../../engine/economyDB'
import { getCurrentStreak, getHabits } from '../../engine/habitDB'

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatPill({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      flex: 1, padding: '14px 8px',
      borderRight: '1px solid var(--b2)',
    }}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 18, color: 'var(--main)' }} />
      <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 500, color: 'var(--t1)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>{label}</div>
    </div>
  )
}

function ProgressBar({ pct, color = 'var(--main)' }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 8, background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 'var(--radius-sm)', transition: 'width 0.5s ease' }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [eco, setEco] = useState<EconomyData | null>(null)
  const [streak, setStreak] = useState(0)
  const [habitCount, setHabitCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [p, e, s, habits] = await Promise.all([
        getProfile(),
        getEconomy(),
        getCurrentStreak(),
        getHabits(),
      ])
      setProfile(p)
      setEco(e)
      setStreak(s)
      setHabitCount(habits.length)
      setLoading(false)
    }
    load()
    return subscribeProfile(() => { getProfile().then(setProfile); getEconomy().then(setEco) })
  }, [])

  if (loading || !profile || !eco) {
    return (
      <PageWrapper maxWidth={720}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', color: 'var(--t3)', fontSize: 14 }}>
          Carregando...
        </div>
      </PageWrapper>
    )
  }

  const level = labelNivel(eco.nivel)
  const memberSince = new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })

  return (
    <PageWrapper maxWidth={720}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Perfil</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/profile/settings')} style={iconBtn} title="Ajustes do perfil"
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}>
            <i className="ph ph-pencil-simple" style={{ fontSize: 17 }} />
          </button>
          <button onClick={() => navigate('/settings')} style={iconBtn} title="Ajustes gerais"
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}>
            <i className="ph ph-gear" style={{ fontSize: 17 }} />
          </button>
        </div>
      </div>

      {/* ── Identity card ── */}
      <div style={{
        background: 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '4px 4px 0 var(--border)',
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        {/* Top: avatar + name + level */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 64, height: 64, flexShrink: 0,
            background: profile.bg_cor,
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '3px 3px 0 var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
          }}>
            {profile.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--t1)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile.username ?? 'Usuário'}
            </div>
            {profile.handle && (
              <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 6 }}>@{profile.handle}</div>
            )}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--main)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)' }}>
              <i className="ph ph-medal" style={{ fontSize: 13, color: 'var(--main-foreground)' }} />
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--main-foreground)' }}>
                Nível {eco.nivel} · {level}
              </span>
            </div>
          </div>
          {/* Score badge */}
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            background: 'var(--bg3)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: 18, lineHeight: 1, color: 'var(--t1)' }}>{eco.xp_total}</span>
            <span style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--t3)' }}>XP</span>
          </div>
        </div>

        {/* XP progress */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>Progresso para nível {eco.nivel + 1}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)' }}>{eco.progresso_nivel}%</span>
          </div>
          <ProgressBar pct={eco.progresso_nivel} />
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
            {eco.xp_total - eco.xp_nivel_atual} / {eco.xp_proximo_nivel - eco.xp_nivel_atual} XP
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div style={{ padding: '12px 20px 0', fontSize: 14, color: 'var(--t2)', lineHeight: 1.55 }}>
            {profile.bio}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', marginTop: 16, borderTop: '2px solid var(--border)' }}>
          <StatPill label="Streak"      value={`${streak}d`}    icon="fire" />
          <StatPill label="Hábitos"     value={habitCount}       icon="check-square" />
          <StatPill label="IO"          value={eco.io_saldo}     icon="coin" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, padding: '14px 8px' }}>
            <i className="ph ph-calendar-blank" style={{ fontSize: 18, color: 'var(--main)' }} />
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 500, color: 'var(--t1)', lineHeight: 1 }}>{memberSince}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>Membro</div>
          </div>
        </div>
      </div>

      {/* ── Plan card ── */}
      <div style={{
        background: profile.plan === 'pro' ? 'var(--foreground)' : 'var(--secondary-background)',
        border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
        boxShadow: '3px 3px 0 var(--border)', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
        cursor: profile.plan === 'free' ? 'pointer' : 'default',
      }}
        onClick={() => profile.plan === 'free' && navigate('/shop')}
      >
        <i className={`ph ph-${profile.plan === 'pro' ? 'crown-simple' : 'lock-simple'}`}
          style={{ fontSize: 22, color: profile.plan === 'pro' ? '#f59e0b' : 'var(--t3)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: profile.plan === 'pro' ? 'var(--background)' : 'var(--t1)', marginBottom: 2 }}>
            {profile.plan === 'pro' ? 'Plano Pro ativo' : 'Plano Free'}
          </div>
          <div style={{ fontSize: 12, color: profile.plan === 'pro' ? 'var(--bg3)' : 'var(--t3)' }}>
            {profile.plan === 'pro' ? 'Acesso vitalício a todos os recursos' : 'Faça upgrade para desbloquear tudo'}
          </div>
        </div>
        {profile.plan === 'free' && (
          <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 10px', background: 'var(--main)', color: 'var(--main-foreground)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            PRO →
          </span>
        )}
      </div>

      {/* ── Quick links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {[
          { label: 'Progresso',   icon: 'chart-line-up',  to: '/progress',  desc: 'XP, nível e desafios' },
          { label: 'Hábitos',     icon: 'check-square',   to: '/habits',    desc: 'Sua rotina diária' },
          { label: 'Carteira',    icon: 'wallet',         to: '/wallet',    desc: 'Finanças e metas' },
          { label: 'Indicação',   icon: 'users-three',    to: '/mentor',    desc: 'Convide e ganhe IO' },
        ].map(link => (
          <button key={link.to} onClick={() => navigate(link.to)} style={{
            background: 'var(--secondary-background)',
            border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
            boxShadow: '3px 3px 0 var(--border)', padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 6,
            cursor: 'pointer', textAlign: 'left',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)' }}
          >
            <i className={`ph ph-${link.icon}`} style={{ fontSize: 22, color: 'var(--main)' }} />
            <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--t1)' }}>{link.label}</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>{link.desc}</div>
          </button>
        ))}
      </div>

    </PageWrapper>
  )
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--secondary-background)',
  border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
  boxShadow: '2px 2px 0 var(--border)', cursor: 'pointer', color: 'var(--t2)',
  transition: 'transform 0.1s, box-shadow 0.1s',
}
