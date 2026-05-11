import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { PageWrapper } from '../../components/PageWrapper'
import { POSTS } from './data'

const COMMENTS = [
  { initials: 'JD', name: 'João D.', time: '15 min', text: 'Essa abordagem é realmente interessante. O neo-brutalismo traz personalidade de volta ao design digital.', likes: 12 },
  { initials: 'AR', name: 'Ana Rosa', time: '1h',     text: 'O maior desafio é manter a acessibilidade com essas cores. Mas concordo que visualmente é impactante!', likes: 8 },
  { initials: 'CS', name: 'Carlos S.', time: '3h',   text: 'Já apliquei esse estilo no meu portfólio e os feedbacks foram incríveis.', likes: 23 },
]

export function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const post = POSTS.find(p => p.id === id)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0)
  const [reply, setReply] = useState('')

  if (!post) return (
    <PageWrapper><div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>Post não encontrado.</div></PageWrapper>
  )

  return (
    <PageWrapper maxWidth={680}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} style={{ ...circleBtn }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 18 }} />
        </button>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--t1)' }}>Detalhes do Post</h2>
        <div style={{ flex: 1 }} />
        <button style={{ ...circleBtn }}><i className="ph ph-dots-three-vertical" style={{ fontSize: 18 }} /></button>
      </div>

      {/* Post card */}
      <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '4px 4px 0 var(--border)', background: 'var(--secondary-background)', overflow: 'hidden', marginBottom: 16 }}>
        {/* Hero */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: `linear-gradient(135deg, ${post.bgColor}, var(--bg2))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ph ph-image" style={{ fontSize: 64, color: 'var(--t3)', opacity: 0.3 }} />
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: post.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: post.fgColor }}>
              {post.initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{post.handle}</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>{post.time} atrás · {post.category}</div>
            </div>
          </div>
          <p style={{ fontSize: 15, color: 'var(--t1)', lineHeight: 1.7, marginBottom: 16 }}>{post.text}</p>
          {/* Engagement */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 14, borderTop: '1px solid var(--b2)' }}>
            <button onClick={() => { setLiked(!liked); setLikeCount(n => n + (liked ? -1 : 1)) }} style={{ ...actionBtn2, color: liked ? '#ef4444' : 'var(--t3)' }}>
              <i className={`ph ${liked ? 'ph-heart-fill' : 'ph-heart'}`} style={{ fontSize: 20 }} />
              <span style={{ fontWeight: 700 }}>{likeCount >= 1000 ? `${(likeCount/1000).toFixed(1)}k` : likeCount}</span>
            </button>
            <button style={{ ...actionBtn2 }}>
              <i className="ph ph-chat-circle" style={{ fontSize: 20 }} />
              <span style={{ fontWeight: 700 }}>{post.comments}</span>
            </button>
            <div style={{ flex: 1 }} />
            <button style={{ ...actionBtn2 }}><i className="ph ph-bookmark-simple" style={{ fontSize: 20 }} /></button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', background: 'var(--secondary-background)', padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 12 }}>Seu Progresso</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--t1)' }}>Módulo de Design Digital</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--main-foreground)' }}>75%</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 100, overflow: 'hidden', border: '1.5px solid var(--border)' }}>
          <div style={{ width: '75%', height: '100%', background: 'var(--main)' }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 6 }}>Faltam 2 lições para completar o nível.</p>
      </div>

      {/* Comments */}
      <div style={{ marginBottom: 80 }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--t1)', marginBottom: 16 }}>Comentários ({post.comments})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {COMMENTS.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: 'var(--t2)', flexShrink: 0 }}>
                {c.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--t1)' }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--t3)' }}>{c.time} atrás</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 6 }}>{c.text}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: 'var(--main-foreground)', cursor: 'pointer' }}>Responder</button>
                  <span style={{ fontSize: 12, color: 'var(--t3)' }}>👍 {c.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 'var(--sidebar-w, 56px)', right: 0, background: 'var(--secondary-background)', borderTop: '2px solid var(--border)', padding: '10px 20px', zIndex: 40 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: 'var(--main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>EU</div>
          <input
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && reply.trim()) { setReply('') } }}
            placeholder="Adicione um comentário..."
            style={{ flex: 1, background: 'var(--bg2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', padding: '8px 14px', fontSize: 14, color: 'var(--t1)', fontFamily: 'var(--font-sans)', outline: 'none' }}
          />
          <button style={{ background: 'var(--main)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <i className="ph ph-paper-plane-tilt" style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}

const circleBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
  border: '2px solid var(--border)', background: 'var(--secondary-background)',
  boxShadow: '2px 2px 0 var(--border)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer', color: 'var(--t2)',
  flexShrink: 0,
}
const actionBtn2: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 14, color: 'var(--t3)', fontFamily: 'var(--font-sans)',
  padding: '4px 6px', borderRadius: 'var(--radius-sm)',
}
