import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'

export function FeedSettingsPage() {
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState(true)
  const [autoplay, setAutoplay] = useState(false)
  const [compact, setCompact] = useState(false)

  return (
    <PageWrapper maxWidth={600}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/feed')} style={{ ...circleBtn }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 26, color: 'var(--t1)', lineHeight: 1 }}>Ajustes do Feed</h1>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>Preferências e configurações da comunidade.</p>
        </div>
      </div>

      {/* Section */}
      {[
        {
          label: 'EXIBIÇÃO',
          rows: [
            { label: 'Visualização compacta', desc: 'Posts menores, mais conteúdo por tela', value: compact, set: setCompact },
            { label: 'Reprodução automática', desc: 'Vídeos iniciam automaticamente', value: autoplay, set: setAutoplay },
          ]
        },
        {
          label: 'NOTIFICAÇÕES',
          rows: [
            { label: 'Novas publicações', desc: 'Notificar quando alguém que você segue postar', value: notifs, set: setNotifs },
          ]
        }
      ].map(section => (
        <div key={section.label} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 8, paddingLeft: 4 }}>
            {section.label}
          </div>
          <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', background: 'var(--secondary-background)', overflow: 'hidden', boxShadow: '3px 3px 0 var(--border)' }}>
            {section.rows.map((row, i) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderTop: i > 0 ? '1px solid var(--b2)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)' }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>{row.desc}</div>
                </div>
                <button
                  onClick={() => row.set(!row.value)}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: row.value ? 'var(--main)' : 'var(--bg3)',
                    border: '2px solid var(--border)',
                    cursor: 'pointer', position: 'relative', flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2,
                    left: row.value ? 22 : 2,
                    width: 16, height: 16, borderRadius: 8,
                    background: 'var(--foreground)',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Categories to follow */}
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 8, paddingLeft: 4 }}>
        CATEGORIAS SEGUIDAS
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Hábitos', 'Carreira', 'Tech', 'Finanças', 'Mentalidade'].map(c => (
          <span key={c} style={{ padding: '6px 14px', borderRadius: 'var(--radius-base)', border: '2px solid var(--border)', fontSize: 13, fontWeight: 400, background: 'var(--main)', color: 'var(--main-foreground)', boxShadow: '2px 2px 0 var(--border)', cursor: 'pointer' }}>
            {c}
          </span>
        ))}
      </div>
    </PageWrapper>
  )
}

const circleBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
  border: '2px solid var(--border)', background: 'var(--secondary-background)',
  boxShadow: '2px 2px 0 var(--border)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer', color: 'var(--t2)', flexShrink: 0,
}
