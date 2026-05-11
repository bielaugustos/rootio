import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'

const CATEGORIES = ['Hábitos', 'Finanças', 'Carreira', 'Tech', 'Mentalidade', 'Dica']
const MAX = 500

export function NewPostPage() {
  const [text, setText] = useState('')
  const [cat, setCat] = useState('Hábitos')
  const [posting, setPosting] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = async () => {
    if (!text.trim()) return
    setPosting(true)
    await new Promise(r => setTimeout(r, 700))
    navigate('/feed/confirm')
  }

  return (
    <PageWrapper maxWidth={680}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/feed')} style={{ ...circleBtn }}>
          <i className="ph ph-x" style={{ fontSize: 18 }} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--t1)', flex: 1 }}>Nova Publicação</h2>
        <button
          onClick={submit}
          disabled={!text.trim() || posting}
          style={{
            background: text.trim() && !posting ? 'var(--main)' : 'var(--bg3)',
            color: text.trim() && !posting ? 'var(--main-foreground)' : 'var(--t3)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: text.trim() && !posting ? '2px 2px 0 var(--border)' : 'none',
            padding: '8px 20px', fontWeight: 700, fontSize: 14,
            cursor: text.trim() && !posting ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          {posting ? 'Publicando…' : 'Publicar'}
        </button>
      </div>

      {/* Author + category */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: 'var(--main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>EU</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 8 }}>Usuário</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: '4px 12px', borderRadius: 'var(--radius-base)',
                border: '2px solid var(--border)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                background: cat === c ? 'var(--main)' : 'var(--secondary-background)',
                color: cat === c ? 'var(--main-foreground)' : 'var(--t3)',
                boxShadow: cat === c ? '2px 2px 0 var(--border)' : 'none',
              }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', background: 'var(--secondary-background)', overflow: 'hidden', marginBottom: 16 }}>
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX))}
          placeholder="O que você está pensando?"
          autoFocus
          rows={6}
          style={{ width: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none', fontSize: 15, color: 'var(--t1)', lineHeight: 1.65, fontFamily: 'var(--font-body)', padding: '14px 16px', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 14px', borderTop: '1px solid var(--b2)', fontSize: 12, color: text.length > MAX * 0.8 ? '#ef4444' : 'var(--t3)' }}>
          {MAX - text.length} restantes
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[['ph-image','Imagem'],['ph-link','Link'],['ph-poll','Enquete'],['ph-hash','Hashtag']].map(([icon, label]) => (
          <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 13, color: 'var(--t2)', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'transform 0.1s, box-shadow 0.1s', boxShadow: '2px 2px 0 var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
          >
            <i className={`ph ${icon}`} style={{ fontSize: 16 }} />
            <span>{label}</span>
          </button>
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
