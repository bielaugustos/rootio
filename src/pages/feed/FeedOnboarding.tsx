import { useState } from 'react'

interface Step {
  title: string
  subtitle: string
  body: React.ReactNode
}

const STEPS: Step[] = [
  {
    title: 'Bem-vindo ao Diário',
    subtitle: 'Seu espaço de reflexão pessoal',
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 160, height: 160, border: '3px solid var(--border)', boxShadow: '6px 6px 0 var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-background)' }}>
          <i className="ph ph-book-open" style={{ fontSize: 64, color: 'var(--main)' }} />
        </div>
        <p style={{ fontSize: 15, color: 'var(--t3)', lineHeight: 1.6, textAlign: 'center', maxWidth: 320 }}>
          Registre seus pensamentos, conquistas e aprendizados do dia. Um diário pessoal para acompanhar sua evolução.
        </p>
      </div>
    ),
  },
  {
    title: 'Como funciona',
    subtitle: 'Simples e privado',
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 400 }}>
        {[
          { icon: 'smiley', title: 'Registre seu humor', desc: 'Selecione como você se sente a cada entrada.' },
          { icon: 'pencil', title: 'Escreva livremente', desc: 'Reflexões, conquistas, desafios — sem regras.' },
          { icon: 'lock', title: 'Privacidade total', desc: 'Seus dados ficam salvos apenas no seu dispositivo.' },
          { icon: 'chart-line-up', title: 'Acompanhe padrões', desc: 'Veja seu histórico e identifique tendências.' },
        ].map(f => (
          <div key={f.icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', padding: '12px 14px', boxShadow: '2px 2px 0 var(--border)' }}>
            <div style={{ width: 36, height: 36, flexShrink: 0, background: 'var(--main)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ph ph-${f.icon}`} style={{ fontSize: 18, color: 'var(--main-foreground)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--t1)', marginBottom: 2 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--t2)' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Tudo pronto!',
    subtitle: 'Comece a escrever',
    body: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 400 }}>
        <div style={{ width: '100%', background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', boxShadow: '4px 4px 0 var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: 'var(--main)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '4px 4px 0 var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-check-fat" style={{ fontSize: 40, color: 'var(--main-foreground)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--t1)', marginBottom: 8 }}>
              Diário desbloqueado!
            </div>
            <div style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.55 }}>
              Registre sua primeira entrada e comece a acompanhar sua jornada.
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

export function FeedOnboarding({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState(0)
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

  const back = () => setCurrent(c => Math.max(0, c - 1))
  const skip = () => {
    localStorage.setItem('feed-onboarding-done', '1')
    onDone()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--background)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: '28px 24px 40px', overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ height: 8, background: 'var(--bg3)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((current + 1) / total) * 100}%`, background: 'var(--foreground)', borderRadius: 'var(--radius-sm)', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--t3)', textTransform: 'uppercase' }}>
            {current + 1} / {total}
          </div>
        </div>
        <button onClick={skip} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--t3)', cursor: 'pointer', whiteSpace: 'nowrap', paddingTop: 2, flexShrink: 0 }}>
          Pular
        </button>
      </div>

      <main style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '24px 0', flex: 1, justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 32, color: 'var(--t1)', lineHeight: 1.2, marginBottom: 6 }}>{step.title}</h1>
          <p style={{ fontSize: 15, color: 'var(--t3)' }}>{step.subtitle}</p>
        </div>
        {step.body}
      </main>

      <footer style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={next} style={{
          width: '100%', padding: '14px 24px', background: 'var(--foreground)', color: 'var(--main)',
          border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
          boxShadow: '4px 4px 0 var(--border)', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {isLast ? 'Começar' : 'Continuar'}
          <i className="ph ph-arrow-right" style={{ fontSize: 18 }} />
        </button>
        {current > 0 && (
          <button onClick={back} style={{ background: 'none', border: 'none', padding: '12px', fontSize: 14, color: 'var(--t3)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Voltar
          </button>
        )}
      </footer>
    </div>
  )
}
