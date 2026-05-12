import { useState, useEffect } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { PageWrapper } from '../../components/PageWrapper'
import { Pill } from '../../components/Pill'
import { useTheme } from '../../engine/useTheme'
import { getProfile, updateProfile, type Profile } from '../../engine/profileDB'
import { themeEngine } from '../../engine/ThemeEngine'
import { getEconomy, labelNivel, type EconomyData } from '../../engine/economyDB'
import { getHabits, getCurrentStreak } from '../../engine/habitDB'
import { Section } from './Section'
import { Row } from './Row'
import { Toggle } from './Toggle'
import { AvatarPicker, BgColorPicker } from './AvatarPicker'
import { useNavigate } from 'react-router-dom'

function NavButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '4px 4px 0 var(--border)',
        cursor: 'pointer',
        color: 'var(--foreground)',
        fontSize: 16,
        transition: 'transform 0.1s, box-shadow 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = 'none' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)' }}
    >
      <i className="ph ph-caret-right" />
    </button>
  )
}

function PlanCard({ plan, onNavigateShop }: { plan: Profile['plan']; onNavigateShop: () => void }) {
  const goldenMist = 'radial-gradient(ellipse 80% 50% at 90% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)'

  if (plan === 'pro') {
    return (
      <div style={{
        border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
        overflow: 'hidden', boxShadow: '4px 4px 0 var(--border)', marginBottom: 32,
      }}>
        <div style={{
          padding: '14px 20px', background: 'var(--secondary-background)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <i className="ph ph-crown-simple" style={{ color: '#f59e0b', fontSize: 22, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)' }}>Plano Pro ativo</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Acesso vitalício a todos os recursos</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px',
            background: '#f59e0b', color: '#fff',
            border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
            boxShadow: '2px 2px 0 var(--border)', letterSpacing: '0.05em',
          }}>PRO</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
      overflow: 'hidden', boxShadow: '4px 4px 0 var(--border)',
      background: `#9B7BFF ${goldenMist}`,
    }}>
      <div style={{
        padding: '18px 22px',
        background: 'transparent',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <div style={{
          fontFamily: 'var(--font-title)',
          fontSize: 28, fontWeight: 400, color: '#fff',
          background: '#121212', padding: '2px 22px', margin: '-18px -22px 0',
        }}><i className="ph ph-crown-simple" style={{ fontSize: 22, marginRight: 6 }} /> Pro vitalício</div>
        <div style={{
          fontFamily: '"DM Sans", var(--font-sans)',
          fontSize: 28, fontWeight: 700, color: '#000', lineHeight: 1.2,
          marginTop: 8,
        }}>
          R$ 12,90
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'rgba(0,0,0,0.4)', marginLeft: 6 }}>/ único</span>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 22px' }} />

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, padding: '14px 22px',
      }}>
        {['Hábitos ilimitados', 'Sync entre dispositivos', 'Todos os temas', 'Acesso vitalício', 'IA em breve', 'Suporte prioritário'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>
            <span style={{
              width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
              border: '1.5px solid #f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 7, fontWeight: 700, color: '#f59e0b',
            }}>✓</span>
            {f}
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 22px' }} />

      <div style={{ padding: '14px 22px 18px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button label="Ativar Pro" size="sm" variant="ghost" onClick={onNavigateShop} />
        <Button size="sm" variant="ghost" onClick={() => window.open('https://wa.me/?text=Quero+ativar+o+Pro+do+Rootio', '_blank')}>
          <i className="ph ph-whatsapp-logo" style={{ fontSize: 14 }} />
          WhatsApp
        </Button>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [economy, setEconomy] = useState<EconomyData | null>(null)
  const [saved, setSaved] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [bioFocused, setBioFocused] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [stats, setStats] = useState<{ streak: number; done: number; goals: number } | null>(null)
  const { mode, toggleMode } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    getProfile().then(setProfile)
    getEconomy().then(setEconomy)
    const loadStats = async () => {
      const [habits, streak] = await Promise.all([getHabits(), getCurrentStreak()])
      setStats({
        streak,
        done: habits.filter(h => h.done).length,
        goals: habits.filter(h => h.list === 'goal').length,
      })
    }
    loadStats()
    const check = () => setIsMobile(window.innerWidth < 600)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const update = async (data: Partial<Profile>) => {
    if (!profile) return
    const updated = await updateProfile(data)
    setProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <span style={{ color: 'var(--t3)', fontSize: 14 }}>Carregando perfil...</span>
    </main>
  )

  const rowProps = { isMobile }

  return (
    <PageWrapper>

      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        marginBottom: 32, gap: isMobile ? 12 : 0,
      }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)', marginBottom: 4 }}>Configurações</h1>
            <p style={{ color: 'var(--t3)', fontSize: 14, marginBottom: 24 }}>Preferências e configurações da conta.</p>
          </div>
        {saved && (
          <span style={{
            fontSize: 13, fontWeight: 400,
            color: 'var(--main-foreground)', background: 'var(--main)',
            border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '4px 12px', boxShadow: '2px 2px 0 var(--border)',
            alignSelf: isMobile ? 'flex-start' : 'auto',
          }}>✓ Salvo</span>
        )}
      </div>

      {/* Profile Card */}
      <div style={{
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        overflow: 'hidden',
        boxShadow: '4px 4px 0 var(--border)',
        background: 'var(--secondary-background)',
        marginBottom: 32,
      }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>
                {profile.username ?? 'Usuário'}
              </span>
              <Pill
                label={profile.plan === 'pro' ? '⭐ PRO' : 'Free'}
                size="sm"
              />
            </div>
            <div style={{ fontSize: 13, color: 'var(--t3)' }}>
              @{profile.handle ?? 'sem handle'}
            </div>
          </div>
          <button
            onClick={() => {
              setEditingProfile(true)
              setTimeout(() => document.getElementById('edit-profile-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
            }}
            title="Editar perfil"
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

        {/* About */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--b2)' }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: 'var(--t3)',
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

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0, padding: '14px 20px',
        }}>
          {[
            { label: 'Streak atual', value: stats ? `${stats.streak} dias` : '—', icon: 'ph-star', color: 'var(--main)' },
            { label: 'Hábitos feitos', value: stats ? String(stats.done) : '—', icon: 'ph-fire', color: '#ef593b' },
            { label: 'Metas ativas', value: stats ? String(stats.goals) : '—', icon: 'ph-target', color: '#9B7BFF' },
          ].map((item, i) => (
            <div key={item.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 4px',
              borderRight: i < 2 ? '1px solid var(--b2)' : 'none',
            }}>
              <i className={`ph ${item.icon}`} style={{ fontSize: 20, color: item.color }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{item.value}</span>
              <span style={{ fontSize: 11, color: 'var(--t3)', whiteSpace: 'nowrap' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      {editingProfile && (
        <div id="edit-profile-section" style={{ marginBottom: 32 }}>
          <Section title="Editar perfil">
            <Row label="Avatar" desc="Escolha um emoji para representar você" fullWidth {...rowProps}>
              <AvatarPicker profile={profile} onUpdate={update} />
            </Row>
            <Row label="Cor de fundo do avatar" desc="Cor de fundo do seu avatar" fullWidth {...rowProps}>
              <BgColorPicker profile={profile} onUpdate={update} />
            </Row>
            <Row label="Nome de usuário" desc="Como você quer ser chamado" fullWidth {...rowProps}>
              <div style={{ width: '100%' }}>
                <Input placeholder="seu_nome" value={profile.username ?? ''} onChange={v => setProfile(p => p ? { ...p, username: v } : p)} id="input-username" />
              </div>
            </Row>
            <Row label="@Username" desc="Seu identificador único (ex: @rootio)" fullWidth {...rowProps}>
              <div style={{ width: '100%' }}>
                <Input placeholder="@seu_username" value={profile.handle ?? ''} onChange={v => setProfile(p => p ? { ...p, handle: v } : p)} id="input-handle" />
              </div>
            </Row>
            <Row label="Bio" desc="Uma breve descrição sobre você" fullWidth last {...rowProps}>
              <textarea
                placeholder="Conte um pouco sobre você..."
                value={profile.bio ?? ''}
                maxLength={300}
                onChange={e => setProfile(p => p ? { ...p, bio: e.target.value } : p)}
                onFocus={() => setBioFocused(true)}
                onBlur={() => setBioFocused(false)}
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 16,
                  fontFamily: 'var(--font-sans)',
                  border: bioFocused ? '2px solid var(--main)' : '2px solid var(--border)',
                  borderRadius: 'var(--radius-base)', background: 'var(--secondary-background)',
                  color: 'var(--foreground)', resize: 'vertical', outline: 'none',
                  boxShadow: bioFocused ? '4px 4px 0 var(--main)' : 'none',
                  transition: 'box-shadow 0.1s, border-color 0.1s',
                }}
              />
              <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'right', marginTop: 4 }}>
                {(profile.bio ?? '').length}/300
              </div>
            </Row>
          </Section>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            <Button label="Salvar alterações" onClick={() => {
              update({ username: profile.username, handle: profile.handle, bio: profile.bio })
              setEditingProfile(false)
            }} />
          </div>
        </div>
      )}

      {/* Plan + illustration */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src='/illustrations/settingscat.png' alt='purple cat' style={{ width: 'auto', height: 'auto', maxWidth: 120, maxHeight: 120 }} />
        </div>
        <div style={{ flex: 1 }}>
          <PlanCard plan={profile.plan} onNavigateShop={() => window.open('https://buy.stripe.com/cNi3cufptc2t8AhgWf6g802', '_blank')} />
        </div>
      </div>


      {/* Aparência */}
      <Section title="Aparência">
        <Row label="Modo escuro" desc="Alternar entre tema claro e escuro" isMobile={false}>
          <Toggle value={mode === 'dark'} onChange={() => { toggleMode(); update({ theme: mode === 'dark' ? 'light' : 'dark' }) }} />
        </Row>
        <Row label="Editor de temas" desc="Personalizar, exportar ou resetar o tema" last {...rowProps}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Toggle value={profile.show_editor ?? true} onChange={v => update({ show_editor: v })} />
            <Button
              label="Exportar" variant="neutral" size="sm"
              onClick={async () => {
                const json = await themeEngine.exportTheme()
                const blob = new Blob([json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = `nb-theme-${mode}.json`; a.click()
                URL.revokeObjectURL(url)
              }}
            />
            <Button label="Resetar" variant="destructive" size="sm" onClick={() => themeEngine.resetGlobalTokens()} />
          </div>
        </Row>
      </Section>

      {/* Notificações */}
      <Section title="Notificações">
        <Row label="Notificações" desc="Receber alertas e lembretes" isMobile={false}>
          <Toggle value={profile.notifications_on} onChange={v => update({ notifications_on: v })} />
        </Row>
        <Row label="Sons" desc="Tocar sons ao realizar ações" isMobile={false}>
          <Toggle value={profile.sound_on} onChange={v => update({ sound_on: v })} />
        </Row>
        <Row label="Gerenciar notificações" desc="Permissões e configurações detalhadas" last isMobile={false}>
          <NavButton onClick={() => navigate('/notifications')} />
        </Row>
      </Section>

      {/* Hub IO */}
      <Section title="Hub IO">
        <Row label="Hub" desc={economy ? `${economy.io_saldo} IO disponíveis para gastar` : 'Carregando...'} isMobile={false}>
          <NavButton onClick={() => navigate('/hub')} />
        </Row>
        <Row
          label="Experiência e conquistas"
          desc={economy ? `Nível ${economy.nivel} · ${labelNivel(economy.nivel)} · ${economy.xp_total} XP total` : 'Carregando...'}
          last isMobile={false}
        >
          {economy && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ width: 80, height: 6, background: 'var(--b2)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--b2)' }}>
                <div style={{ height: '100%', width: `${economy.progresso_nivel}%`, background: 'var(--main)', borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>{economy.progresso_nivel}% p/ nível {economy.nivel + 1}</span>
            </div>
          )}
        </Row>
      </Section>

      {/* Dados */}
      <Section title="Dados">
        <Row label="Conta" desc={profile.handle ? `@${profile.handle}` : 'Gerencie suas credenciais'} {...rowProps}>
          <NavButton onClick={() => navigate('/settings/account')} />
        </Row>
        <Row label="Privacidade e segurança" desc="Termos, LGPD e proteção de dados" {...rowProps}>
          <NavButton onClick={() => navigate('/privacidade')} />
        </Row>
        <Row label="Sync e dispositivos" desc="Dados na nuvem via Supabase" {...rowProps}>
          <NavButton onClick={() => navigate('/sync')} />
        </Row>
        <Row label="Versão" desc="Rootio" last {...rowProps}>
          <code style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--font-mono)' }}>v1.0.0</code>
        </Row>
      </Section>

      {/* Footer — logo + logout */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 16, paddingTop: 8, paddingBottom: 32,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}>
          <img src="/logo.svg" alt="Rootio" style={{ width: 24, height: 24 }} onError={e => { e.currentTarget.style.display = 'none' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
            rootio
          </span>
        </div>
        <Button
          label="Sair da conta"
          variant="destructive"
          onClick={() => {
            // placeholder — conectar com auth quando Supabase for integrado
            alert('Logout não disponível na versão local.')
          }}
        />
      </div>

    </PageWrapper>
  )
}
