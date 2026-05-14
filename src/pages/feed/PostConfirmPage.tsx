import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'

export function PostConfirmPage() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  return (
    <PageWrapper maxWidth={420}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 40, gap: 0,
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ width: 88, height: 88, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: 'var(--main)', boxShadow: '4px 4px 0 var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <i className="ph ph-check-fat" style={{ fontSize: 48, color: 'var(--main-foreground)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)', marginBottom: 10 }}>Salvo!</h1>
        <p style={{ fontSize: 15, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 32 }}>
          Sua entrada foi registrada no diário. Continue acompanhando sua evolução!
        </p>
        <button onClick={() => navigate('/feed')} style={primaryBtn}>
          <i className="ph ph-book-open" style={{ fontSize: 18 }} /> Ver no Diário
        </button>
        <button onClick={() => navigate('/feed/new')} style={{ ...ghostBtn, marginTop: 10 }}>
          Criar outra entrada
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
  padding: '14px 24px', fontWeight: 500, fontSize: 15,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  width: '100%',
}
const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none', padding: '12px', fontSize: 14,
  color: 'var(--t3)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
}
