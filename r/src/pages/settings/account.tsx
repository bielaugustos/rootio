import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { PageWrapper } from '../../components/PageWrapper'
import { getProfile, updateProfile, type Profile } from '../../engine/profileDB'
import { Section } from './Section'
import { Row } from './Row'
import { Toggle } from './Toggle'
import { AvatarPicker, BgColorPicker } from './AvatarPicker'

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

export function AccountPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saved, setSaved] = useState(false)
  const [bioFocused, setBioFocused] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    getProfile().then(setProfile)
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

  return (
    <PageWrapper>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
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
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)' }}
          >
            <i className="ph ph-arrow-left" />
          </button>
          <div>
            <h1 style={{ fontSize: 28, color: 'var(--t1)', marginBottom: 4, fontFamily: 'var(--font-title)' }}>Conta</h1>
            <p style={{ color: 'var(--t2)', fontSize: 15 }}>Gerencie suas informações pessoais.</p>
          </div>
        </div>
        {saved && (
          <span style={{
            fontSize: 13, fontWeight: 400,
            color: 'var(--main-foreground)', background: 'var(--main)',
            border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '4px 12px', boxShadow: '2px 2px 0 var(--border)',
          }}>✓ Salvo</span>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }`}</style>
      <div style={{
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--border)',
        background: 'var(--secondary-background)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
      }}>
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
        >
          <div style={{
            width: 96, height: 96, fontSize: 48,
            borderRadius: 'var(--radius-base)',
            border: '2px solid var(--border)',
            boxShadow: '4px 4px 0 var(--border)',
            background: profile.bg_cor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}>
            {profile.avatar}
          </div>
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 28, height: 28,
            background: 'var(--main)',
            border: '2px solid var(--border)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 2px 0 var(--border)',
            padding: 6,
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
          >
            <i className="ph ph-notches" style={{ fontSize: 12, color: 'var(--main-foreground)', animation: 'pulse 2s ease-in-out infinite' }} />
          </div>
        </div>
        {showAvatarPicker && (
          <div style={{ width: '100%', marginTop: 8 }}>
            <AvatarPicker profile={profile} onUpdate={update} />
            <div style={{ marginTop: 12 }}>
              <BgColorPicker profile={profile} onUpdate={update} />
            </div>
          </div>
        )}
      </div>

      <Section title="Informações pessoais">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--b2)', background: 'var(--secondary-background)' }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)', marginBottom: 2 }}>Nome de usuário</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>Como você quer ser chamado</div>
          <Input
            placeholder="seu_nome"
            value={profile.username ?? ''}
            onChange={v => setProfile(p => p ? { ...p, username: v } : p)}
          />
        </div>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--b2)', background: 'var(--secondary-background)' }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)', marginBottom: 2 }}>@Username</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>Seu identificador único</div>
          <Input
            placeholder="@seu_username"
            value={profile.handle ?? ''}
            onChange={v => setProfile(p => p ? { ...p, handle: v } : p)}
          />
        </div>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--b2)', background: 'var(--secondary-background)' }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)', marginBottom: 2 }}>E-mail</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>Seu endereço de e-mail</div>
          <Input
            placeholder="email@exemplo.com"
            value={email}
            type="email"
            onChange={setEmail}
          />
        </div>
        <div style={{ padding: '14px 20px', background: 'var(--secondary-background)' }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)', marginBottom: 2 }}>Bio</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>Uma breve descrição sobre você</div>
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
              boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'right', marginTop: 4 }}>
            {(profile.bio ?? '').length}/300
          </div>
        </div>

        {/* Bio preview como aparece nos ajustes */}
        <div style={{
          padding: '14px 20px', background: 'var(--secondary-background)',
          borderTop: '1px solid var(--b2)',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: 'var(--t3)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
          }}>
            Pré-visualização nos ajustes
          </div>
          <div style={{
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            overflow: 'hidden',
            background: 'var(--secondary-background)',
          }}>
            <div style={{ padding: '12px 16px' }}>
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
          </div>
        </div>
      </Section>

      <Section title="Segurança">
        <Row label="Redefinir senha" desc="Altere sua senha atual">
          <NavButton onClick={() => navigate('/settings/password')} />
        </Row>
        <Row label="Autenticação em duas etapas" desc="Adicione uma camada extra de segurança" last>
          <Toggle value={false} onChange={() => {}} />
        </Row>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 32 }}>
        <Button label="Salvar alterações" size="lg" onClick={() => {
          update({ username: profile.username, handle: profile.handle, bio: profile.bio })
        }} />
      </div>
    </PageWrapper>
  )
}
