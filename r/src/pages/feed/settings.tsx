import { PageWrapper } from '../../components/PageWrapper'
import { useNavigate } from 'react-router-dom'

export function FeedSettingsPage() {
  const navigate = useNavigate()
  return (
    <PageWrapper maxWidth={600}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/feed')}
          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)', cursor: 'pointer', color: 'var(--t2)', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
        >
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </button>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Ajustes · Feed</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: 'Notificações do feed', desc: 'Receber alertas de novos posts', icon: 'ph-bell' },
          { label: 'Posts recomendados', desc: 'Mostrar conteúdo personalizado', icon: 'ph-sparkle' },
          { label: 'Filtro de categorias padrão', desc: 'Categoria exibida ao abrir o feed', icon: 'ph-funnel' },
          { label: 'Mostrar contagem de likes', desc: 'Exibir número de curtidas nos posts', icon: 'ph-heart' },
        ].map(row => (
          <div key={row.label} style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '2px 2px 0 var(--border)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <i className={`ph ${row.icon}`} style={{ fontSize: 20, color: 'var(--main)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)' }}>{row.label}</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>{row.desc}</div>
            </div>
            <div style={{ width: 40, height: 24, background: 'var(--main)', border: '2px solid var(--border)', borderRadius: 100, cursor: 'pointer', position: 'relative' }}>
              <div style={{ position: 'absolute', right: 2, top: 2, width: 16, height: 16, background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
