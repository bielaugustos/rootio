import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'

export function PostConfirmPage() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  return (
    <PageWrapper maxWidth={420}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 40, gap: 0, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ width: 88, height: 88, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: 'var(--main)', boxShadow: '4px 4px 0 var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <i className="ph ph-check-fat" style={{ fontSize: 48, color: 'var(--main-foreground)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)', marginBottom: 10 }}>Publicado!</h1>
        <p style={{ fontSize: 15, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 32 }}>
          Seu post já está disponível para a comunidade. Compartilhe e inspire mais pessoas!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', marginBottom: 32 }}>
          {[
            { icon: 'ph-eye', label: 'Visibilidade', value: 'Pública' },
            { icon: 'ph-users-three', label: 'Comunidade', value: 'Hábitos' },
            { icon: 'ph-bell', label: 'Notificações', value: 'Ativas' },
            { icon: 'ph-star', label: 'Impacto', value: '+12 IO' },
          ].map(item => (
            <div key={item.label} style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)', background: 'var(--secondary-background)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <i className={`ph ${item.icon}`} style={{ fontSize: 22, color: 'var(--t2)' }} />
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{item.label}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/feed')} style={{ ...primaryBtn, width: '100%', marginBottom: 10 }}>
          <i className="ph ph-newspaper" style={{ fontSize: 18 }} /> Ver no Feed
        </button>
        <button onClick={() => navigate('/feed/new')} style={{ ...ghostBtn, width: '100%' }}>
          Criar outra publicação
        </button>
      </div>
    </PageWrapper>
  )
}

const primaryBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  background: 'var(--main)', color: 'var(--main-foreground)',
  border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
  boxShadow: '3px 3px 0 var(--border)',
  padding: '14px 24px', fontWeight: 700, fontSize: 15,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  transition: 'transform 0.1s, box-shadow 0.1s',
}
const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none',
  padding: '12px', fontSize: 14, color: 'var(--t3)',
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
}
