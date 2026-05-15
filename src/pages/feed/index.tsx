import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { FeedOnboarding } from './FeedOnboarding'
import { loadEntries, type DiaryEntry, getMoodLabel } from './data'

function EntryCard({ entry }: { entry: DiaryEntry }) {
  const navigate = useNavigate()
  const mood = getMoodLabel(entry.mood)
  const date = new Date(entry.date + 'T12:00:00')
  const day = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <article
      onClick={() => navigate(`/feed/${entry.id}`)}
      style={{
        background: 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '3px 3px 0 var(--border)',
        padding: 16, cursor: 'pointer',
        transition: 'transform 0.1s, box-shadow 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{mood.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--t1)', marginBottom: 2 }}>{entry.title || 'Sem título'}</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>{day}</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--t3)', whiteSpace: 'nowrap' }}>
          {mood.label}
        </div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.content}
      </p>
      {entry.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
          {entry.tags.map(tag => (
            <span key={tag} style={{ fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--main)', color: 'var(--main-foreground)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

export function FeedPage() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem('feed-onboarding-done') !== '1'
  )
  const [entries] = useState<DiaryEntry[]>(loadEntries)
  const navigate = useNavigate()

  if (showOnboarding) {
    return <FeedOnboarding onDone={() => setShowOnboarding(false)} />
  }

  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(e => e.date === today)

  return (
    <PageWrapper maxWidth={680}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)', margin: 0 }}>Diário</h1>
          <p style={{ fontSize: 14, color: 'var(--t3)', margin: '4px 0 0 0' }}>Registre seus pensamentos e reflexões</p>
        </div>
        <button
          onClick={() => navigate('/feed/settings')}
          style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--secondary-background)', border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)',
            cursor: 'pointer', color: 'var(--t2)',
          }}
          title="Configurações do Diário"
        >
          <i className="ph ph-gear" style={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Hoje - check-in rápido */}
      {todayEntry ? (
        <div style={{
          background: 'var(--secondary-background)', border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)',
          padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>{getMoodLabel(todayEntry.mood).emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Check-in de hoje feito</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>{todayEntry.title || 'Toque para ver detalhes'}</div>
          </div>
          <button onClick={() => navigate(`/feed/${todayEntry.id}`)} style={{
            background: 'none', border: 'none', color: 'var(--main)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
          }}>Ver →</button>
        </div>
      ) : (
        <div style={{
          background: 'var(--secondary-background)', border: '2px solid var(--main)',
          borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)',
          padding: '16px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer',
        }}
          onClick={() => navigate('/feed/new')}
        >
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--main)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-pencil" style={{ fontSize: 18, color: 'var(--main-foreground)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)' }}>Como foi seu dia?</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Registre seu humor e reflexões</div>
          </div>
          <i className="ph ph-arrow-right" style={{ fontSize: 18, color: 'var(--t3)' }} />
        </div>
      )}

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--t3)' }}>
            <i className="ph ph-book-open" style={{ fontSize: 48, display: 'block', marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, marginBottom: 8, color: 'var(--t1)' }}>Nenhuma entrada ainda</div>
            <div style={{ fontSize: 14, marginBottom: 20 }}>Comece a registrar seus dias e acompanhe sua evolução.</div>
            <button onClick={() => navigate('/feed/new')} style={{
              background: 'var(--main)', color: 'var(--main-foreground)',
              border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
              boxShadow: '3px 3px 0 var(--border)', padding: '10px 24px',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>
              <i className="ph ph-plus" style={{ fontSize: 16, marginRight: 6 }} />Primeira entrada
            </button>
          </div>
        ) : (
          entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/feed/new')}
        style={{
          position: 'fixed', bottom: 28, right: 24,
          width: 52, height: 52, borderRadius: 'var(--radius-sm)',
          background: 'var(--main)', border: '2px solid var(--border)',
          boxShadow: '3px 3px 0 var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 50,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)' }}
      >
        <i className="ph ph-plus" style={{ fontSize: 24 }} />
      </button>
    </PageWrapper>
  )
}
