import { useNavigate, useParams } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { loadEntries, saveEntries, getMoodLabel } from './data'

export function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const entries = loadEntries()
  const entry = entries.find(e => e.id === id)

  if (!entry) return (
    <PageWrapper>
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Entrada não encontrada.</div>
    </PageWrapper>
  )

  const mood = getMoodLabel(entry.mood)
  const date = new Date(entry.date + 'T12:00:00')


  const handleDelete = () => {
    if (!confirm('Excluir esta entrada?')) return
    saveEntries(entries.filter(e => e.id !== entry.id))
    navigate('/feed', { replace: true })
  }

  return (
    <PageWrapper maxWidth={680}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} style={circleBtn}>
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--t1)', flex: 1, margin: 0 }}>Entrada</h2>
        <button onClick={handleDelete} style={{ ...circleBtn, color: '#ef4444' }} title="Excluir">
          <i className="ph ph-trash" style={{ fontSize: 16 }} />
        </button>
      </div>

      <div style={{
        border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)',
        boxShadow: '4px 4px 0 var(--border)', background: 'var(--secondary-background)',
        overflow: 'hidden',
      }}>
        {/* Mood header */}
        <div style={{
          background: 'var(--main)', padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: '2px solid var(--border)',
        }}>
          <div style={{ fontSize: 36 }}>{mood.emoji}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--main-foreground)', opacity: 0.7 }}>Humor</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--main-foreground)' }}>{mood.label}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--main-foreground)', opacity: 0.7 }}>Data</div>
            <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--main-foreground)' }}>{date.toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px' }}>
          {entry.title && (
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--t1)', margin: '0 0 12px 0' }}>{entry.title}</h1>
          )}
          <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
            {entry.content || 'Sem conteúdo.'}
          </p>

          {entry.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 20, flexWrap: 'wrap', borderTop: '1px solid var(--b2)', paddingTop: 16 }}>
              {entry.tags.map(tag => (
                <span key={tag} style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--t3)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
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
