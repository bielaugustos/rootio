import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step {
  step: number
  total: number
  bg: string
  title: string
  subtitle: string
  body: React.ReactNode
  cta: string
  ctaSecondary?: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{
        height: 8,
        background: 'var(--bg3)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 8,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${(step / total) * 100}%`,
          background: 'var(--foreground)',
          borderRadius: 'var(--radius-sm)',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--t3)', textTransform: 'uppercase' }}>
        {step} / {total}
      </div>
    </div>
  )
}

function FeatureRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius-base)',
      padding: '12px 14px',
      boxShadow: '2px 2px 0 var(--border)',
    }}>
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        background: 'var(--main)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={`ph ph-${icon}`} style={{ fontSize: 18, color: 'var(--main-foreground)' }} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--t1)', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.45 }}>{desc}</div>
      </div>
    </div>
  )
}

// ─── Step content ─────────────────────────────────────────────────────────────
const STEPS: Omit<Step, 'step' | 'total'>[] = [
  {
    bg: 'var(--main)',
    title: 'Bem-vindo ao Feed',
    subtitle: 'A comunidade Rootio em tempo real',
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Icon grid */}
        <div style={{
          width: 200, height: 200,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          border: '3px solid var(--border)',
          boxShadow: '6px 6px 0 var(--border)',
          overflow: 'hidden',
          borderRadius: 'var(--radius-sm)',
        }}>
          {[
            { icon: 'newspaper',      bg: '#fff' },
            { icon: 'users-three',    bg: 'var(--foreground)' },
            { icon: 'chart-line-up',  bg: 'var(--main)' },
            { icon: 'heart',          bg: '#fff' },
          ].map((cell, i) => (
            <div key={i} style={{
              background: cell.bg,
              borderRight: i % 2 === 0 ? '2px solid var(--border)' : 'none',
              borderBottom: i < 2 ? '2px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`ph ph-${cell.icon}`} style={{
                fontSize: 44,
                color: cell.bg === 'var(--foreground)' ? 'var(--main)' : 'var(--foreground)',
                opacity: cell.bg === 'var(--main)' ? 1 : 0.8,
              }} />
            </div>
          ))}
        </div>
        <p style={{ fontSize: 15, color: 'var(--t3)', lineHeight: 1.6, textAlign: 'center', maxWidth: 320 }}>
          Onde todas as jornadas de crescimento se conectam. Acompanhe, publique e inspire.
        </p>
      </div>
    ),
    cta: 'Continuar',
  },
  {
    bg: 'var(--background)',
    title: 'Conecte-se com propósito',
    subtitle: 'Sua evolução é compartilhada',
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 400 }}>
        <FeatureRow icon="heart" title="O Coração da Comunidade" desc="Acompanhe vitórias diárias e encontre inspiração no feed coletivo de hábitos." />
        <FeatureRow icon="chats-circle" title="Micro-Comunidades" desc="Grupos temáticos focados no seu momento de vida e objetivos." />
        <FeatureRow icon="trend-up" title="Resultados Reais" desc="Métricas e marcos visíveis toda semana. Progresso que você pode ver." />
      </div>
    ),
    cta: 'Continuar',
    ctaSecondary: 'Voltar',
  },
  {
    bg: 'var(--background)',
    title: 'Ganhe IO Participando',
    subtitle: 'Cada ação gera recompensas',
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 400 }}>
        {/* Hero card */}
        <div style={{
          background: 'var(--foreground)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          padding: '20px 24px',
          boxShadow: '4px 4px 0 var(--border)',
          marginBottom: 4,
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 6 }}>
            POTENCIAL MENSAL
          </div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 32, fontWeight: 500, color: 'var(--main)' }}>
            IO 6.000 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--t3)' }}>/estimado</span>
          </div>
        </div>
        {[
          { icon: 'gift',         title: '100 IO por Indicação',   desc: 'Ao indicar uma pessoa, você recebe 100 IO imediatamente.' },
          { icon: 'pencil-line',  title: '10 IO por post',         desc: 'Ganhe tokens a cada publicação feita no feed.' },
          { icon: 'fire',         title: '10 IO por streak',       desc: 'Mantenha uma sequência de dias ativos e multiplique.' },
        ].map(b => (
          <FeatureRow key={b.title} icon={b.icon} title={b.title} desc={b.desc} />
        ))}
      </div>
    ),
    cta: 'Continuar',
    ctaSecondary: 'Voltar',
  },
  {
    bg: 'var(--background)',
    title: 'Tudo pronto!',
    subtitle: 'Sua jornada no Feed começa agora',
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 400 }}>
        {/* Success card */}
        <div style={{
          width: '100%',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          boxShadow: '4px 4px 0 var(--border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72,
            background: 'var(--main)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '4px 4px 0 var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ph ph-check-fat" style={{ fontSize: 40, color: 'var(--main-foreground)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--t1)', marginBottom: 8 }}>
              Circle desbloqueado!
            </div>
            <div style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.55 }}>
              Explore o feed, siga pessoas, publique conquistas e acumule IO com cada interação.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <FeatureRow icon="check-circle"  title="Hábitos"    desc="Compartilhe suas metas e progresso" />
          <FeatureRow icon="users"         title="Comunidade" desc="Pessoas com os mesmos objetivos" />
        </div>
      </div>
    ),
    cta: 'Entrar no Feed',
    ctaSecondary: 'Voltar',
  },
]

// ─── Main onboarding component ────────────────────────────────────────────────
interface FeedOnboardingProps {
  onDone: () => void
}

export function FeedOnboarding({ onDone }: FeedOnboardingProps) {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const total = STEPS.length
  const step = STEPS[current]
  const isLast = current === total - 1

  const next = () => {
    if (isLast) {
      localStorage.setItem('feed-onboarding-done', '1')
      onDone()
    } else {
      setCurrent(c => c + 1)
    }
  }

  const back = () => {
    if (current === 0) navigate(-1)
    else setCurrent(c => c - 1)
  }

  const skip = () => {
    localStorage.setItem('feed-onboarding-done', '1')
    onDone()
  }

  return (
    <div className="onboarding" style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: step.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '28px 24px 40px',
      overflowY: 'auto',
    }}>

      {/* Top: progress + skip */}
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <ProgressBar step={current + 1} total={total} />
        <button
          onClick={skip}
          style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 400, color: 'var(--t3)', cursor: 'pointer', whiteSpace: 'nowrap', paddingTop: 2, flexShrink: 0 }}
        >
          Pular
        </button>
      </div>

      {/* Content */}
      <main style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 0', flex: 1, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 32, color: 'var(--t1)', lineHeight: 1.2, marginBottom: 6 }}>
            {step.title}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--t3)' }}>{step.subtitle}</p>
        </div>
        {step.body}
      </main>

      {/* Footer buttons */}
      <footer style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={next}
          style={{
            width: '100%', padding: '14px 24px',
            background: 'var(--foreground)',
            color: 'var(--main)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '4px 4px 0 var(--border)',
            fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15,
            cursor: 'pointer', letterSpacing: '0.03em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)' }}
        >
          {step.cta}
          <i className="ph ph-arrow-right" style={{ fontSize: 18 }} />
        </button>
        {step.ctaSecondary && (
          <button
            onClick={back}
            style={{
              width: '100%', padding: '12px 24px',
              background: 'transparent', border: 'none',
              fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14,
              color: 'var(--t3)', cursor: 'pointer',
            }}
          >
            {step.ctaSecondary}
          </button>
        )}
      </footer>
    </div>
  )
}
