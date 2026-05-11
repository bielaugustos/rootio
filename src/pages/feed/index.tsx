import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { FeedOnboarding } from './FeedOnboarding'
import { POSTS, CATEGORIES } from './data'

// ─── Shared styles ────────────────────────────────────────────────────────────
const iconBtn: React.CSSProperties = {
  width: 36, height: 36,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--secondary-background)',
  border: '2px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  boxShadow: '2px 2px 0 var(--border)',
  cursor: 'pointer', color: 'var(--t2)',
  transition: 'transform 0.1s, box-shadow 0.1s',
}

const ghostBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  background: 'none', border: 'none',
  padding: '5px 10px', borderRadius: 'var(--radius-sm)',
  fontSize: 13, color: 'var(--t3)', cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
}

const actionBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  background: 'none', border: 'none',
  padding: '5px 8px', borderRadius: 'var(--radius-sm)',
  fontSize: 13, fontWeight: 600, color: 'var(--t3)',
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  transition: 'background 0.12s',
}

// ─── Feed page ────────────────────────────────────────────────────────────────
export function FeedPage() {
  // Show onboarding only on first visit (persisted in localStorage)
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem('feed-onboarding-done') !== '1'
  )

  const [activeCategory, setActiveCategory] = useState('Tudo')
  const [likes,  setLikes]  = useState<Record<string, number>>({})
  const [liked,  setLiked]  = useState<Record<string, boolean>>({})
  const navigate = useNavigate()

  const filtered = POSTS.filter(p => activeCategory === 'Tudo' || p.category === activeCategory)

  const toggleLike = (id: string, base: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const isLiked = liked[id]
    setLiked(prev  => ({ ...prev, [id]: !isLiked }))
    setLikes(prev  => ({ ...prev, [id]: (prev[id] ?? base) + (isLiked ? -1 : 1) }))
  }

  // Render onboarding overlay (fullscreen, above everything)
  if (showOnboarding) {
    return <FeedOnboarding onDone={() => setShowOnboarding(false)} />
  }

  return (
    <PageWrapper maxWidth={680}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Feed</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate('/feed/settings')}
            style={iconBtn}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
            title="Configurações do Feed"
          >
            <i className="ph ph-gear" style={{ fontSize: 18 }} />
          </button>
          <button
            style={iconBtn}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
          >
            <i className="ph ph-bell" style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* ── Composer ── */}
      <div style={{
        background: 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '3px 3px 0 var(--border)',
        padding: '12px 16px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--main)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
            EU
          </div>
          <button
            onClick={() => navigate('/feed/new')}
            style={{ flex: 1, background: 'var(--bg2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', padding: '9px 14px', textAlign: 'left', fontSize: 14, color: 'var(--t3)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
          >
            O que você está pensando?
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={ghostBtn}><i className="ph ph-image" style={{ fontSize: 16 }} /> Imagem</button>
          <button style={ghostBtn}><i className="ph ph-link"  style={{ fontSize: 16 }} /> Link</button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => navigate('/feed/new')}
            style={{
              background: 'var(--main)', color: 'var(--main-foreground)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '2px 2px 0 var(--border)',
              padding: '7px 18px', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', letterSpacing: '0.05em',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
          >
            POSTAR
          </button>
        </div>
      </div>

      {/* ── Category pills ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              flexShrink: 0, padding: '6px 16px',
              borderRadius: 'var(--radius-base)',
              border: '2px solid var(--border)',
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeCategory === cat ? 'var(--main)'               : 'var(--secondary-background)',
              color:      activeCategory === cat ? 'var(--main-foreground)'    : 'var(--t2)',
              boxShadow:  activeCategory === cat ? '2px 2px 0 var(--border)'  : 'none',
              transition: 'all 0.12s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Posts ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(post => {
          const likeCount = likes[post.id] ?? post.likes
          const isLiked   = liked[post.id] ?? false
          return (
            <article
              key={post.id}
              onClick={() => navigate(`/feed/${post.id}`)}
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
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: post.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: post.fgColor, flexShrink: 0 }}>
                  {post.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{post.user}</span>
                    {post.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '1px 7px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--main)', color: 'var(--main-foreground)' }}>
                        {post.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>{post.time} atrás · {post.category}</div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4 }} onClick={e => e.stopPropagation()}>
                  <i className="ph ph-dots-three" style={{ fontSize: 18 }} />
                </button>
              </div>

              {/* Text */}
              <p style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.65, marginBottom: post.hasImage ? 12 : 10 }}>
                {post.text}
              </p>

              {/* Image */}
              {post.hasImage && (
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: `linear-gradient(135deg, ${post.bgColor}, var(--bg2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
                  {post.imageSrc
                    ? <img src={post.imageSrc} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <i className="ph ph-image" style={{ fontSize: 40, color: 'var(--t3)', opacity: 0.4 }} />
                  }
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingTop: 8, borderTop: '1px solid var(--b2)' }}>
                <button
                  onClick={e => toggleLike(post.id, post.likes, e)}
                  style={{ ...actionBtn, color: isLiked ? '#ef4444' : 'var(--t3)' }}
                >
                  <i className={`ph ${isLiked ? 'ph-heart-fill' : 'ph-heart'}`} style={{ fontSize: 18 }} />
                  <span>{likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}</span>
                </button>
                <button style={actionBtn} onClick={e => { e.stopPropagation(); navigate(`/feed/${post.id}`) }}>
                  <i className="ph ph-chat-circle" style={{ fontSize: 18 }} />
                  <span>{post.comments}</span>
                </button>
                <div style={{ flex: 1 }} />
                <button style={actionBtn} onClick={e => e.stopPropagation()}>
                  <i className="ph ph-share-network" style={{ fontSize: 18 }} />
                </button>
                <button style={actionBtn} onClick={e => e.stopPropagation()}>
                  <i className="ph ph-bookmark-simple" style={{ fontSize: 18 }} />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => navigate('/feed/new')}
        style={{
          position: 'fixed', bottom: 28, right: 24,
          width: 52, height: 52, borderRadius: 'var(--radius-sm)',
          background: 'var(--main)', border: '2px solid var(--border)',
          boxShadow: '3px 3px 0 var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 50,
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)' }}
      >
        <i className="ph ph-plus" style={{ fontSize: 24 }} />
      </button>
    </PageWrapper>
  )
}
