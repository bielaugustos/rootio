import { PageWrapper } from '../../components/PageWrapper'
import { Button } from '../../components/Button'
import { useNavigate } from 'react-router-dom'

export function MentorPage() {
  const navigate = useNavigate()
  return (
    <PageWrapper maxWidth={860}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 36, color: 'var(--t1)', marginBottom: 6 }}>Mentor</h1>
          <p style={{ fontSize: 15, color: 'var(--t3)', maxWidth: 480 }}>Conecte-se com mentores e acompanhe sua evolução guiada.</p>
        </div>
        <button
          onClick={() => navigate('settings')}
          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)', cursor: 'pointer', color: 'var(--t2)', flexShrink: 0 }}
          title="Configurações de Mentor"
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
        >
          <i className="ph ph-gear" style={{ fontSize: 18 }} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
        <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '4px 4px 0 var(--border)', padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <i className="ph ph-users-three" style={{ fontSize: 48, color: 'var(--main)' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--t1)', marginBottom: 8 }}>Em construção</div>
            <div style={{ fontSize: 14, color: 'var(--t3)', maxWidth: 320 }}>Esta seção está sendo desenvolvida. Em breve estará disponível.</div>
          </div>
          <Button variant="default" onClick={() => navigate('/')}>
            <i className="ph ph-house" style={{ fontSize: 16 }} />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
