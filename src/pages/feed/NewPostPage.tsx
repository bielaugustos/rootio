import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { createEntry, type Mood } from './data'

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: 1, emoji: '😞', label: 'Ruim' },
  { value: 2, emoji: '😐', label: 'Regular' },
  { value: 3, emoji: '🙂', label: 'Bom' },
  { value: 4, emoji: '😊', label: 'Ótimo' },
  { value: 5, emoji: '🤩', label: 'Incrível' },
]

const MAX = 2000

export function NewPostPage() {
  const navigate = useNavigate()
  const [mood, setMood] = useState<Mood>(3)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const submit = () => {
    if (!content.trim() && !title.trim()) return
    createEntry({
      date: new Date().toISOString().split('T')[0],
      mood,
      title: title.trim(),
      content: content.trim(),
      tags: [],
      habitIds: [],
    })
    navigate('/feed/confirm')
  }

  return (
    <PageWrapper maxWidth={680}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/feed')} style={circleBtn}>
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--t1)', flex: 1, margin: 0 }}>Nova entrada</h2>
        <button
          onClick={submit}
          disabled={!content.trim() && !title.trim()}
          style={{
            background: content.trim() || title.trim() ? 'var(--main)' : 'var(--bg3)',
            color: content.trim() || title.trim() ? 'var(--main-foreground)' : 'var(--t3)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: content.trim() || title.trim() ? '2px 2px 0 var(--border)' : 'none',
            padding: '8px 20px', fontWeight: 500, fontSize: 14,
            cursor: content.trim() || title.trim() ? 'pointer' : 'default',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Salvar
        </button>
      </div>

      {/* Mood picker */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Como você está?</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {MOODS.map(m => (
            <button key={m.value} onClick={() => setMood(m.value)} style={{
              flex: 1, padding: '10px 6px', borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--border)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: mood === m.value ? 'var(--main)' : 'var(--secondary-background)',
              boxShadow: mood === m.value ? '2px 2px 0 var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 22 }}>{m.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 500, color: mood === m.value ? 'var(--main-foreground)' : 'var(--t3)' }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>Título (opcional)</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ex: Dia produtivo!"
          style={{
            width: '100%', padding: '10px 14px',
            background: 'var(--secondary-background)', border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)', fontSize: 15, color: 'var(--t1)',
            fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
            boxShadow: '2px 2px 0 var(--border)',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', background: 'var(--secondary-background)', overflow: 'hidden', marginBottom: 16 }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, MAX))}
          placeholder="O que aconteceu hoje? Como você se sente? O que aprendeu?"
          autoFocus
          rows={8}
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            resize: 'none', fontSize: 15, color: 'var(--t1)', lineHeight: 1.65,
            fontFamily: 'var(--font-body)', padding: '14px 16px', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 14px', borderTop: '1px solid var(--b2)', fontSize: 12, color: content.length > MAX * 0.8 ? '#ef4444' : 'var(--t3)' }}>
          {MAX - content.length} restantes
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--t3)', margin: 0 }}>
        <i className="ph ph-lock" style={{ fontSize: 14, marginRight: 4 }} />
        Suas entradas são privadas e armazenadas localmente.
      </p>
    </PageWrapper>
  )
}

const circleBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
  border: '2px solid var(--border)', background: 'var(--secondary-background)',
  boxShadow: '2px 2px 0 var(--border)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer', color: 'var(--t2)', flexShrink: 0,
}
