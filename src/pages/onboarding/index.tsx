import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components'
import { useTheme } from '../../engine/useTheme'
import { updateProfile } from '../../engine/profileDB'
import { createHabit } from '../../engine/habitDB'
import { saveGoal as saveWalletGoal } from '../../engine/walletDB'
import { saveGoal as saveCareerGoal, type GoalCategory } from '../../engine/careerDB'

const AVATARS = ['🌻', '👩', '👨', '🧔', '👩‍💻', '🧑‍🎨', '🦊', '🐺', '🐉', '🌟', '⚡', '🔥']
const HABIT_ICONS = ['📚', '🏃', '💻', '🎨', '🎵', '🧘', '✍️', '💪']

const FINANCE_EXAMPLES = [
  { name: 'Guardar R$200/mês', target: 2400, saved: 200 },
  { name: 'Reserva de emergência', target: 6000, saved: 500 },
  { name: 'Viagem dos sonhos', target: 5000, saved: 300 },
  { name: 'Curso/assinatura', target: 1200, saved: 0 },
]

const CAREER_EXAMPLES = [
  { title: 'Conseguir promoção', category: 'cargo' as const },
  { title: 'Aprender nova tecnologia', category: 'habilidade' as const },
  { title: 'Fazer networking', category: 'network' as const },
  { title: 'Certificação profissional', category: 'educacao' as const },
  { title: 'Projeto pessoal', category: 'projeto' as const },
  { title: 'Aumento de salário', category: 'financeiro' as const },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { setMode } = useTheme()
  const [step, setStep] = useState(1)
  const [animating, setAnimating] = useState(false)

  const [avatar, setAvatar] = useState('🌻')
  const [username, setUsername] = useState('')
  const [handle, setHandle] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showPicker, setShowPicker] = useState(false)

  const [habitName, setHabitName] = useState('')
  const [habitIcon, setHabitIcon] = useState('📚')

  const [financeGoal, setFinanceGoal] = useState<{ name: string; target: number; saved: number } | null>(null)

  const [careerTitle, setCareerTitle] = useState('')
  const [careerCategory, setCareerCategory] = useState<GoalCategory>('cargo')

  const goTo = (s: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => { setStep(s); setAnimating(false) }, 100)
  }

  const saveProfile = async () => {
    await updateProfile({
      avatar,
      username: username || 'Usuário',
      handle: handle || `@${username.toLowerCase().replace(/\s/g, '')}` || '@usuario',
    })
  }

  const createFirstHabit = async () => {
    if (!habitName.trim()) return
    await createHabit({
      name: habitName.trim(),
      icon: habitIcon,
      list: 'habit',
      freq: 'diario',
      days: [0, 1, 2, 3, 4, 5, 6],
      pts: 10,
      priority: 'media',
      order: 0,
      tags: [],
      subtasks: [],
      notes: '',
      est_mins: null,
      deadline: null,
      hidden: false,
      streak_goal: null,
      goal_target: null,
      goal_current: null,
      goal_unit: null,
      goal_period: null,
    })
  }

  const finish = async () => {
    await saveProfile()
    if (habitName.trim()) await createFirstHabit()
    if (financeGoal) {
      await saveWalletGoal({
        name: financeGoal.name,
        target: financeGoal.target,
        saved: financeGoal.saved,
        deadline: null,
      })
    }
    if (careerTitle.trim()) {
      await saveCareerGoal({
        title: careerTitle.trim(),
        category: careerCategory,
        active: true,
        targetSalary: undefined,
        salaryCurrency: undefined,
      })
    }
    localStorage.setItem('onboarding-completed', 'true')
    navigate('/', { replace: true })
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes emojiPop { 0% { opacity: 0; transform: scale(0) rotate(-15deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
        .onboarding-step { animation: fadeIn 0.35s ease both; }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, background: 'var(--background)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="onboarding-step" style={{ width: '100%', maxWidth: 360 }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 160, height: 160, borderRadius: '50%', border: '5px solid #000', background: 'var(--secondary-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, boxShadow: '8px 8px 0 #000' }}>🌱</div>
                <div style={{ position: 'absolute', bottom: -4, right: -8, width: 44, height: 44, borderRadius: '50%', background: '#c00100', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '4px 4px 0 #000' }}>⚡</div>
              </div>
              <h1 style={{ fontSize: 'clamp(28px,7vw,42px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', textAlign: 'center', color: 'var(--foreground)', margin: 0 }}>
                Sua jornada rumo ao{' '}
                <span style={{ background: '#000', color: 'var(--main)', padding: '0 7px', display: 'inline-block', transform: 'rotate(-1.5deg)', boxShadow: '4px 4px 0 rgba(0,0,0,.25)' }}>topo</span>
                {' '}começa aqui
              </h1>
              <p style={{ fontFamily: 'Indie Flower', fontSize: 15, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.65, textAlign: 'center', margin: 0 }}>
                Crie hábitos, acompanhe seu progresso e evolua todos os dias.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Pill>✅ Hábitos</Pill>
                <Pill>📊 Progresso</Pill>
                <Pill>💰 Carteira</Pill>
                <Pill>⚡ IO Economy</Pill>
              </div>
              <div style={{ background: 'var(--secondary-background)', border: '3px solid #000', borderRadius: 6, boxShadow: '6px 6px 0 #000', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--main)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: '3px 3px 0 #000' }}>🎁</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: 2 }}>Bônus de início</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--foreground)' }}>+10 IO ao completar o setup</div>
                </div>
              </div>
              <Button onClick={() => goTo(2)} style={{ width: '100%' }}>Começar Jornada →</Button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Indie Flower', color: 'var(--foreground)', margin: '0 0 4px' }}>Seu Perfil</h2>
                <p style={{ fontSize: 14, color: 'var(--t3)', margin: 0 }}>Como você quer ser conhecide?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowPicker(!showPicker)}>
                  <div style={{ width: 76, height: 76, borderRadius: '20%', border: '4px solid #000', background: 'var(--secondary-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, boxShadow: '6px 6px 0 #000' }}>{avatar}</div>
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: 'var(--main)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, boxShadow: '3px 3px 0 #000', cursor: 'pointer' }}>
                    <i className="ph-bold ph-notches"></i>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#666' }}>Toque para personalizar</span>
                {showPicker && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, padding: 10, background: 'var(--secondary-background)', border: '3px solid #000', borderRadius: 6, boxShadow: '6px 6px 0 #000', maxWidth: 276 }}>
                    {AVATARS.map((em, i) => (
                      <div key={em} onClick={() => { setAvatar(em); setShowPicker(false) }} style={{ width: 36, height: 36, borderRadius: 4, border: '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, cursor: 'pointer', animation: `emojiPop 0.3s ease ${i * 0.05}s both` }}>{em}</div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Seu nome</label>
                <Input placeholder="Ex: Ana Silva" value={username} onChange={setUsername} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>@handle</label>
                <Input placeholder="@seunome" value={handle} onChange={setHandle} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tema</label>
                <div style={{ display: 'flex', gap: 7 }}>
                  {[{ id: 'light' as const, label: 'Claro', icon: '☀️' }, { id: 'dark' as const, label: 'Escuro', icon: '🌙' }].map(t => (
                    <div key={t.id} onClick={async () => { setTheme(t.id); await setMode(t.id); localStorage.setItem('theme', t.id) }} style={{
                      flex: 1, padding: '9px 6px', border: '2.5px solid #000', borderRadius: 6, background: 'var(--secondary-background)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      boxShadow: theme === t.id ? '6px 6px 0 #000' : '3px 3px 0 #000',
                      transform: theme === t.id ? 'translate(-2px, -2px)' : 'none',
                      borderWidth: theme === t.id ? '3px' : '2.5px',
                    }}>
                      <span>{t.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: '#555' }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <Button onClick={() => goTo(1)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                <Button onClick={() => { saveProfile(); goTo(3) }} style={{ flex: 1 }}>Próximo →</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Indie Flower', color: 'var(--foreground)', margin: '0 0 4px' }}>Primeiro Hábito</h2>
                <p style={{ fontSize: 14, color: 'var(--t3)', margin: 0 }}>Crie seu primeiro hábito para começar a jornada.</p>
              </div>

              <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: 6, boxShadow: '4px 4px 0 #000', padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Escolha rápido</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                  {[
                    { icon: '📚', name: 'Ler 10 páginas' },
                    { icon: '🏃', name: 'Correr 15 min' },
                    { icon: '💻', name: 'Estudar 1h' },
                    { icon: '🧘', name: 'Meditar 5 min' },
                    { icon: '✍️', name: 'Escrever no diário' },
                    { icon: '💪', name: 'Treinar academia' },
                    { icon: '🎵', name: 'Praticar instrumento' },
                    { icon: '🌱', name: 'Beber 2L água' },
                  ].map(ex => (
                    <button
                      key={ex.name}
                      onClick={() => { setHabitName(ex.name); setHabitIcon(ex.icon) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', fontSize: 11, fontWeight: 600,
                        border: '2px solid #000', borderRadius: 99,
                        background: habitName === ex.name ? 'var(--main)' : 'var(--secondary-background)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        color: 'var(--foreground)',
                        boxShadow: '3px 3px 0 #000',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #000' }}
                    >
                      <span>{ex.icon}</span>
                      {ex.name}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--foreground)' }}>Nome do hábito</div>
                <Input value={habitName} onChange={setHabitName} placeholder="Ex: Ler 10 páginas por dia" style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)', boxShadow: '2px 2px 0 var(--border)' }} />
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 12, marginBottom: 8, color: 'var(--foreground)' }}>Ícone</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {HABIT_ICONS.map(ic => (
                    <div key={ic} onClick={() => setHabitIcon(ic)} style={{
                      width: 36, height: 36,
                      border: `2px solid ${habitIcon === ic ? 'var(--t1)' : '#000'}`,
                      borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: 18,
                      boxShadow: '3px 3px 0 #000',
                      background: habitIcon === ic ? 'var(--main)' : 'var(--secondary-background)',
                      transition: 'transform 0.1s, box-shadow 0.1s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #000' }}
                    >{ic}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button onClick={() => goTo(2)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                <Button onClick={() => goTo(4)} style={{ flex: 1 }}>Próximo →</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>💰</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Indie Flower', color: 'var(--foreground)', margin: '0 0 4px' }}>Suas Finanças</h2>
                <p style={{ fontSize: 14, color: 'var(--t3)', margin: 0 }}>Defina uma meta financeira para começar.</p>
              </div>

              <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: 6, boxShadow: '4px 4px 0 #000', padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Escolha uma meta</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {FINANCE_EXAMPLES.map(ex => (
                    <button
                      key={ex.name}
                      onClick={() => setFinanceGoal(prev => prev?.name === ex.name ? null : ex)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px',
                        border: `2px solid ${financeGoal?.name === ex.name ? 'var(--t1)' : '#000'}`,
                        borderRadius: 6,
                        background: financeGoal?.name === ex.name ? 'var(--main)' : 'var(--secondary-background)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        textAlign: 'left', width: '100%',
                        boxShadow: financeGoal?.name === ex.name ? 'none' : '3px 3px 0 #000',
                        transform: financeGoal?.name === ex.name ? 'translate(3px,3px)' : 'none',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                      }}
                      onMouseEnter={e => { if (financeGoal?.name !== ex.name) { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none' } }}
                      onMouseLeave={e => { if (financeGoal?.name !== ex.name) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #000' } }}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{financeGoal?.name === ex.name ? '✅' : '🎯'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{ex.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                          {ex.saved > 0 ? `R$ ${ex.saved.toLocaleString('pt-BR')} guardados` : 'Ainda não começou'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button onClick={() => goTo(3)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                <Button onClick={() => goTo(5)} style={{ flex: 1 }}>Próximo →</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🚀</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Indie Flower', color: 'var(--foreground)', margin: '0 0 4px' }}>Sua Carreira</h2>
                <p style={{ fontSize: 14, color: 'var(--t3)', margin: 0 }}>Qual seu próximo objetivo profissional?</p>
              </div>

              <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: 6, boxShadow: '4px 4px 0 #000', padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Escolha rápido</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {CAREER_EXAMPLES.map(ex => (
                    <button
                      key={ex.title}
                      onClick={() => { setCareerTitle(ex.title); setCareerCategory(ex.category) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px',
                        border: `2px solid ${careerTitle === ex.title ? 'var(--t1)' : '#000'}`,
                        borderRadius: 6,
                        background: careerTitle === ex.title ? 'var(--main)' : 'var(--secondary-background)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        textAlign: 'left', width: '100%',
                        boxShadow: careerTitle === ex.title ? 'none' : '3px 3px 0 #000',
                        transform: careerTitle === ex.title ? 'translate(3px,3px)' : 'none',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                      }}
                      onMouseEnter={e => { if (careerTitle !== ex.title) { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none' } }}
                      onMouseLeave={e => { if (careerTitle !== ex.title) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #000' } }}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{careerTitle === ex.title ? '✅' : '🎯'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{ex.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2, textTransform: 'capitalize' }}>
                          {ex.category === 'cargo' ? 'Cargo' : ex.category === 'habilidade' ? 'Habilidade' : ex.category === 'network' ? 'Networking' : ex.category === 'educacao' ? 'Educação' : ex.category === 'projeto' ? 'Projeto' : 'Financeiro'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--foreground)' }}>Ou escreva seu próprio objetivo</div>
                <Input value={careerTitle} onChange={setCareerTitle} placeholder="Ex: Me tornar tech lead" style={{ background: 'var(--secondary-background)', color: 'var(--foreground)', borderColor: 'var(--border)', boxShadow: '2px 2px 0 var(--border)' }} />

                {careerTitle && !CAREER_EXAMPLES.some(e => e.title === careerTitle) && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Categoria</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(['cargo', 'habilidade', 'network', 'projeto', 'educacao', 'financeiro'] as GoalCategory[]).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCareerCategory(cat)}
                          style={{
                            padding: '4px 10px', fontSize: 11, fontWeight: 700,
                            border: `2px solid ${careerCategory === cat ? 'var(--main)' : '#000'}`,
                            borderRadius: 99,
                            background: careerCategory === cat ? 'var(--main)' : 'var(--secondary-background)',
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                            color: 'var(--foreground)',
                            boxShadow: '2px 2px 0 #000',
                          }}
                        >
                          {cat === 'cargo' ? 'Cargo' : cat === 'habilidade' ? 'Habilidade' : cat === 'network' ? 'Networking' : cat === 'educacao' ? 'Educação' : cat === 'projeto' ? 'Projeto' : 'Financeiro'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button onClick={() => goTo(4)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                <Button onClick={() => goTo(6)} style={{ flex: 1 }}>Revisar →</Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Indie Flower', color: 'var(--foreground)', margin: '0 0 4px' }}>Resumo</h2>
                <p style={{ fontSize: 14, color: 'var(--t3)', margin: 0 }}>Confira seus dados antes de começar.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Perfil */}
                <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: 6, boxShadow: '4px 4px 0 #000', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{username || 'Usuário'}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{handle || '@usuario'} · {theme === 'light' ? '☀️ Claro' : '🌙 Escuro'}</div>
                  </div>
                </div>

                {/* Hábito */}
                {habitName && (
                  <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: 6, boxShadow: '4px 4px 0 #000', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{habitIcon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{habitName}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>Primeiro hábito</div>
                    </div>
                  </div>
                )}

                {/* Finanças */}
                {financeGoal && (
                  <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: 6, boxShadow: '4px 4px 0 #000', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>💰</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{financeGoal.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>R$ {financeGoal.target.toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                )}

                {/* Carreira */}
                {careerTitle && (
                  <div style={{ background: 'var(--secondary-background)', border: '2px solid #000', borderRadius: 6, boxShadow: '4px 4px 0 #000', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>🚀</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{careerTitle}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'capitalize' }}>
                        {careerCategory === 'cargo' ? 'Cargo' : careerCategory === 'habilidade' ? 'Habilidade' : careerCategory === 'network' ? 'Networking' : careerCategory === 'educacao' ? 'Educação' : careerCategory === 'projeto' ? 'Projeto' : 'Financeiro'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Empty state se nada foi preenchido */}
              {!habitName && !financeGoal && !careerTitle && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--t3)', fontSize: 13 }}>
                  Nenhum dado foi preenchido — você pode começar do zero.
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <Button onClick={() => goTo(5)} variant="neutral" style={{ flex: 1 }}>← Voltar</Button>
                <Button onClick={finish} style={{ flex: 1 }}>Começar Jornada 🚀</Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '2.5px solid #000', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '3px 3px 0 #000', background: 'var(--secondary-background)', color: 'var(--foreground)' }}>
      {children}
    </div>
  )
}
