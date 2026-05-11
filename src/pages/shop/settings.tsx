import { PageWrapper } from '../../components/PageWrapper'
import { useNavigate } from 'react-router-dom'

export function ShopSettingsPage() {
  const navigate = useNavigate()
  return (
    <PageWrapper maxWidth={600}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/shop')}
          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)', cursor: 'pointer', color: 'var(--t2)', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
        >
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Ajustes · Shop</h1>
      </div>

      <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '4px 4px 0 var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--b2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)' }}>
          PREFERÊNCIAS
        </div>
        <div style={{ padding: '20px', color: 'var(--t3)', fontSize: 14, fontStyle: 'italic' }}>
          Configurações específicas de Shop serão adicionadas aqui.
        </div>
      </div>
    </PageWrapper>
  )
}
