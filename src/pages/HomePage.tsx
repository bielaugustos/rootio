import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardGrid } from './home/DashboardGrid'
import { Button } from '../components/Button'

const LS_KEY = 'dashboard-widgets-hidden'

function ToggleBtn({ left, icon, title, active, onClick }: {
  left: string; icon: string; title: string; active?: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        position: 'fixed',
        top: 14,
        left,
        zIndex: 200,
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '2px 2px 0 var(--border)',
        cursor: 'pointer',
        color: 'var(--t2)',
        fontSize: 14,
        transition: 'left 0.22s ease, transform 0.08s, box-shadow 0.08s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translate(2px,2px)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)'
      }}
    >
      <i className={`ph ${icon}`} />
    </button>
  )
}

export function HomePage() {
  const [widgetsHidden, setWidgetsHidden] = useState(() => {
    // Para usuários novos (primeira visita), ocultar widgets por padrão
    const hasVisited = localStorage.getItem('has-visited-dashboard')
    const savedHidden = localStorage.getItem(LS_KEY) === '1'

    if (!hasVisited) {
      // Primeira visita - ocultar widgets e marcar como visitado
      localStorage.setItem('has-visited-dashboard', 'true')
      localStorage.setItem(LS_KEY, '1') // 1 = hidden
      return true
    }

    return savedHidden
  })
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const handler = () => setWidgetsHidden(localStorage.getItem(LS_KEY) === '1')
    window.addEventListener('widgets-visibility-change', handler)
    return () => window.removeEventListener('widgets-visibility-change', handler)
  }, [])

  return (
    <>
      {!widgetsHidden && (
        <>
          <ToggleBtn
            left="calc(var(--sidebar-w, 56px) + 8px + 28px + 6px + 28px + 6px)"
            icon={editMode ? 'ph-check' : 'ph-squares-four'}
            title={editMode ? 'Salvar layout' : 'Editar dashboard'}
            active={editMode}
            onClick={() => setEditMode(e => !e)}
          />
          {editMode && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('reset-dashboard-layout'))}
              title="Redefinir layout"
              style={{
                position: 'fixed',
                top: 14,
                left: 'calc(var(--sidebar-w, 56px) + 8px + 28px + 6px + 28px + 6px + 28px + 6px)',
                zIndex: 200,
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '2px 2px 0 var(--border)',
                cursor: 'pointer',
                color: 'var(--t2)',
                fontSize: 14,
                transition: 'left 0.22s ease, transform 0.08s, box-shadow 0.08s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(2px,2px)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)'
              }}
            >
              <i className="ph ph-arrow-counter-clockwise" />
            </button>
          )}
        </>
      )}

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        paddingTop: widgetsHidden ? '24px' : 'max(24px, 60px)',
        paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 40px))',
        minHeight: 0,
      }}>
        {widgetsHidden ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
            }}>
              <img
                src="/illustrations/homestart.png"
                alt="Home"
                style={{
                  display: 'block',
                  maxWidth: '300px',
                  height: 'auto',
                }}
              />
              <h1 style={{
                fontSize: '4rem',
                fontFamily: 'var(--font-title)',
                color: 'var(--t1)',
                textAlign: 'center',
              }}>Rootio</h1>
              <p style={{
                fontSize: '0.725rem',
                color: 'var(--t2)',
                textAlign: 'center',
              }}>Aplicativo de produtividade gamificado</p>
            </div>
            <div style={{ padding: '0 0 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch', maxWidth: 280, margin: '0 auto', width: '100%' }}>
              <Link to="/habits" style={{ textDecoration: 'none', width: '100%' }}>
                <Button size="lg" style={{ width: '100%' }}>
                  Iniciar Hábitos <i className="ph ph-arrow-right" />
                </Button>
              </Link>
              <Button
                variant="neutral"
                style={{ width: '100%' }}
                onClick={() => {
                  localStorage.setItem(LS_KEY, '0') // 0 = show
                  setWidgetsHidden(false)
                  window.dispatchEvent(new CustomEvent('widgets-visibility-change'))
                }}
              >
                Ver Dashboard <i className="ph ph-squares-four" />
              </Button>
            </div>
          </div>
        ) : (
          <DashboardGrid
            editMode={editMode}
            onToggleEdit={() => setEditMode(e => !e)}
          />
        )}
      </main>
    </>
  )
}
