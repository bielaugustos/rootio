import { useState } from 'react'
import { Button, Input } from '../../components'
import { useTheme } from '../../engine/useTheme'

export function OnboardingPage() {
  const { setMode } = useTheme()
  const [currentScreen, setCurrentScreen] = useState(1) // 1: welcome, 2: profile, 3: finance, 4: career, 5: habit, 6: success

  // Profile state
  const [avatar, setAvatar] = useState('🧑')
  const [username, setUsername] = useState('')
  const [handle, setHandle] = useState('')
  const [theme, setTheme] = useState('light')
  const [showPicker, setShowPicker] = useState(false)

  // Finance state
  const [emergencyFund, setEmergencyFund] = useState('')
  const [monthlyInvestment, setMonthlyInvestment] = useState('')

  // Career state
  const [currentRole, setCurrentRole] = useState('')
  const [targetSalary, setTargetSalary] = useState('')

  // Habit state
  const [habitName, setHabitName] = useState('')
  const [habitIcon, setHabitIcon] = useState('📚')

  const [animating, setAnimating] = useState(false)

  const goTo = (screen: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrentScreen(screen)
      setAnimating(false)
    }, 260)
  }

  const saveProgress = () => {
    const data = {
      avatar,
      username,
      handle,
      theme,
      emergencyFund,
      monthlyInvestment,
      currentRole,
      targetSalary,
      habitName,
      habitIcon,
    }
    localStorage.setItem('onboarding-data', JSON.stringify(data))
  }

  const completeOnboarding = () => {
    saveProgress()
    localStorage.setItem('onboarding-completed', 'true')
    window.location.href = '/'
  }

  const pickAvatar = (em: string) => {
    setAvatar(em)
    setShowPicker(false)
  }

  const avatars = ['🧑', '👩', '👨', '🧔', '👩‍💻', '🧑‍🎨', '🦊', '🐺', '🐉', '🌟', '⚡', '🔥']

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: bgColor }}>
            <div style={{ position: 'relative', flexShrink: 0, marginBottom: '2rem' }}>
              <div style={{ width: '176px', height: '176px', borderRadius: '50%', border: '5px solid #000', background: 'var(--secondary-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '70px', boxShadow: '6px 6px 0 #000' }}>🌱</div>
              <div style={{ position: 'absolute', bottom: '-8px', right: '-12px', width: '46px', height: '46px', borderRadius: '50%', background: '#c00100', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', boxShadow: '3px 3px 0 #000' }}>⚡</div>
            </div>
            <h1 style={{ fontSize: 'clamp(28px,8vw,48px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', textAlign: 'center', color: 'var(--foreground)' }}>Sua jornada rumo ao <span style={{ background: '#000', color: 'var(--main)', padding: '0 7px', display: 'inline-block', transform: 'rotate(-1.5deg)', boxShadow: '3px 3px 0 rgba(0,0,0,.3)' }}>topo</span> começa aqui</h1>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.65, textAlign: 'center', maxWidth: '320px', marginBottom: '2rem' }}>O ecossistema definitivo para gerenciar sua carreira, finanças e hábitos — tudo integrado, se reforçando mutuamente.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', border: '2.5px solid #000', borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '3px 3px 0 #000', background: '#3c4dcb', color: '#fff' }}>🚀 Carreira</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', border: '2.5px solid #000', borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '3px 3px 0 #000', background: '#c00100', color: '#fff' }}>💰 Finanças</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', border: '2.5px solid #000', borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '3px 3px 0 #000', background: 'var(--secondary-background)', color: 'var(--foreground)' }}>✅ Hábitos</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', border: '2.5px solid #000', borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '3px 3px 0 #000', background: '#eeebe2', color: '#000' }}>⚡ IO Economy</div>
            </div>
            <div style={{ background: 'var(--secondary-background)', border: '3px solid #000', borderRadius: '6px', boxShadow: '6px 6px 0 #000', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '320px', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--main)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, boxShadow: '3px 3px 0 #000' }}>🎁</div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '2px' }}>Bônus de início</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--foreground)' }}>+10 IO ao completar o setup</div>
              </div>
            </div>
            <Button onClick={() => { saveProgress(); goTo(2) }} style={{ width: '100%', maxWidth: '320px' }}>Começar Jornada →</Button>
          </div>
        )
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: 'var(--background)' }}>
            <div style={{ maxWidth: '400px', padding: '3rem' }}>
              <div style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', border: '2px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 'var(--radius-base)', padding: 'var(--spacing)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px', marginBottom: '2rem' }}>
                  <div style={{
                    position: 'relative',
                    cursor: 'pointer',
                    transform: showPicker ? 'translateY(-15px)' : 'translateY(0)',
                    transition: 'transform 0.5s ease'
                  }} onClick={() => setShowPicker(!showPicker)}>
                    <div style={{ width: '96px', height: '96px', borderRadius: '50%', border: '4px solid #000', background: 'var(--secondary-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '46px', boxShadow: '6px 6px 0 #000', transition: 'transform 0.15s' }}>{avatar}</div>
                    <div style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--main)', border: '2.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', boxShadow: '3px 3px 0 #000' }}>✏️</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#666' }}>Toque para personalizar</span>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '5px',
                    padding: '10px',
                    background: 'var(--secondary-background)',
                    border: '3px solid #000',
                    borderRadius: '6px',
                    boxShadow: '10px 10px 0 #000',
                    maxWidth: '276px',
                    margin: '0 auto',
                    opacity: showPicker ? 1 : 0,
                    pointerEvents: showPicker ? 'auto' : 'none',
                    animation: showPicker ? 'pickerOpen 1s ease' : ''
                  }}>
                    {avatars.map((em, index) => (
                      <div key={em} style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '5px',
                        border: '2px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '19px',
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                        animation: showPicker ? `emojiAppear 0.5s ease ${index * 0.08}s forwards` : ''
                      }} onClick={() => pickAvatar(em)}>{em}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Seu nome</label>
                  <Input placeholder="Ex: Ana Silva" value={username} onChange={setUsername} style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)', boxShadow: '2px 2px 0 var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>@handle</label>
                  <Input placeholder="@seunome" value={handle} onChange={setHandle} style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)', boxShadow: '2px 2px 0 var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '2rem' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tema preferido</label>
                  <div style={{ display: 'flex', gap: '7px' }}>
                    <div style={{ flex: 1, padding: '9px 6px', border: '2.5px solid #000', borderRadius: '6px', background: 'var(--secondary-background)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', boxShadow: theme === 'light' ? '6px 6px 0 #000' : '3px 3px 0 #000', transform: theme === 'light' ? 'translate(-2px, -2px)' : 'none', borderWidth: theme === 'light' ? '3px' : '2.5px' }} onClick={async () => { setTheme('light'); await setMode('light'); localStorage.setItem('theme', 'light') }}>
                      <span>☀️</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', color: '#555' }}>Claro</span>
                    </div>
                    <div style={{ flex: 1, padding: '9px 6px', border: '2.5px solid #000', borderRadius: '6px', background: 'linear-gradient(135deg,var(--secondary-background) 50%,#1a1a1a 50%)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', boxShadow: theme === 'dark' ? '6px 6px 0 #000' : '3px 3px 0 #000', transform: theme === 'dark' ? 'translate(-2px, -2px)' : 'none', borderWidth: theme === 'dark' ? '3px' : '2.5px' }} onClick={async () => { setTheme('dark'); await setMode('dark'); localStorage.setItem('theme', 'dark') }}>
                      <span>🌙</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', color: '#555' }}>Escuro</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button onClick={() => goTo(1)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                  <Button onClick={() => { saveProgress(); goTo(3) }} style={{ flex: 1 }}>Próximo →</Button>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: 'var(--background)' }}>
            <div style={{ maxWidth: '400px', padding: '3rem' }}>
              <div style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', border: '2px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 'var(--radius-base)', padding: 'var(--spacing)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>💰</div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Finanças</h2>
                  <p style={{ fontSize: '15px', color: 'var(--foreground)' }}>Defina seus objetivos financeiros para acompanhar seu progresso.</p>
                </div>
                <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: '6px', boxShadow: '4px 4px 0 #000', padding: '16px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)' }}>Meta de reserva de emergência</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', color: 'var(--foreground)' }}>R$</span>
                    <Input value={emergencyFund} onChange={setEmergencyFund} placeholder="Ex: 10000" type="number" style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)' }} />
                  </div>
                </div>
                <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: '6px', boxShadow: '4px 4px 0 #000', padding: '16px', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)' }}>Objetivo mensal de investimento</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', color: 'var(--foreground)' }}>R$</span>
                    <Input value={monthlyInvestment} onChange={setMonthlyInvestment} placeholder="Ex: 500" type="number" style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button onClick={() => goTo(2)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                  <Button onClick={() => { saveProgress(); goTo(4) }} style={{ flex: 1 }}>Próximo →</Button>
                </div>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: 'var(--background)' }}>
            <div style={{ maxWidth: '400px', padding: '3rem' }}>
              <div style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', border: '2px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 'var(--radius-base)', padding: 'var(--spacing)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🚀</div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Carreira</h2>
                  <p style={{ fontSize: '15px', color: 'var(--foreground)' }}>Conte-nos sobre suas aspirações profissionais.</p>
                </div>
                <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: '6px', boxShadow: '4px 4px 0 #000', padding: '16px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)' }}>Cargo atual ou desejado</div>
                  <Input value={currentRole} onChange={setCurrentRole} placeholder="Ex: Desenvolvedor Fullstack" style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)', boxShadow: '2px 2px 0 var(--border)' }} />
                </div>
                <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: '6px', boxShadow: '4px 4px 0 #000', padding: '16px', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)' }}>Salário alvo mensal</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', color: 'var(--foreground)' }}>R$</span>
                    <Input value={targetSalary} onChange={setTargetSalary} placeholder="Ex: 8000" type="number" style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button onClick={() => goTo(3)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                  <Button onClick={() => { saveProgress(); goTo(5) }} style={{ flex: 1 }}>Próximo →</Button>
                </div>
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: 'var(--background)' }}>
            <div style={{ maxWidth: '400px', padding: '3rem' }}>
              <div style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', border: '2px solid #000', boxShadow: '4px 4px 0 #000', borderRadius: 'var(--radius-base)', padding: 'var(--spacing)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Primeiro Hábito</h2>
                  <p style={{ fontSize: '15px', color: 'var(--foreground)' }}>Crie seu primeiro hábito para começar a jornada.</p>
                </div>
                <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: '6px', boxShadow: '4px 4px 0 #000', padding: '16px', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--foreground)' }}>Nome do hábito</div>
                  <Input value={habitName} onChange={setHabitName} placeholder="Ex: Ler 10 páginas por dia" style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)', boxShadow: '2px 2px 0 var(--border)' }} />
                  <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '12px', marginBottom: '8px', color: 'var(--foreground)' }}>Ícone</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['📚', '🏃', '💻', '🎨', '🎵', '🧘'].map(icon => (
                      <div key={icon} onClick={() => setHabitIcon(icon)} style={{ width: '32px', height: '32px', border: `2px solid ${habitIcon === icon ? 'var(--main)' : '#000'}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', boxShadow: habitIcon === icon ? `4px 4px 0 var(--main)` : '2px 2px 0 #000', background: habitIcon === icon ? 'var(--main)' : 'var(--secondary-background)' }}>{icon}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button onClick={() => goTo(4)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                  <Button onClick={() => { saveProgress(); goTo(6) }} style={{ flex: 1 }}>Finalizar →</Button>
                </div>
              </div>
            </div>
          </div>
        )
      case 6:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: 'var(--background)' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎉</div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '1rem', color: 'var(--foreground)' }}>Bem-vindo ao Rootio!</h1>
              <p style={{ fontSize: '16px', color: 'var(--foreground)', marginBottom: '2rem' }}>Sua jornada rumo ao topo começa agora. Explore o app e conquiste seus objetivos!</p>
              <div style={{ background: 'var(--secondary-background)', border: '3px solid #000', borderRadius: '6px', boxShadow: '6px 6px 0 #000', padding: '16px', marginBottom: '2rem' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '4px', color: 'var(--foreground)' }}>Bônus recebido!</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--main)' }}>+10 IO</div>
              </div>
              <Button onClick={completeOnboarding} style={{ width: '100%', maxWidth: '300px' }}>Explorar Rootio →</Button>
            </div>
          </div>
        )
      default:
        return <div>Onboarding concluído</div>
    }
  }

  const bgColor = 'var(--background)'

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .onboarding * { transition: all 1s ease !important; }
          @keyframes pickerOpen {
            0% { opacity: 0; border-radius: 50%; }
            70% { opacity: 0.9; border-radius: 10px; }
            100% { opacity: 1; border-radius: 6px; }
          }
          @keyframes emojiAppear {
            0% { opacity: 0; transform: scale(0); }
            100% { opacity: 1; transform: scale(1); }
          }
        `
      }} />
      <div className="onboarding" style={{ position: 'fixed', inset: 0, background: 'var(--background)', zIndex: 1000 }}>
        {renderScreen()}
      </div>
    </>
  )
}