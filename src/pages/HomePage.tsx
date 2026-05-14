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
        background: active ? 'var(--main)' : 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: active ? 'none' : '2px 2px 0 var(--border)',
        transform: active ? 'translate(2px,2px)' : 'none',
        cursor: 'pointer',
        color: active ? 'var(--main-foreground)' : 'var(--t2)',
        fontSize: 14,
        transition: 'left 0.22s ease, background 0.15s, transform 0.1s, box-shadow 0.1s',
      }}
      onMouseEnter={e => {
        if (!active) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }
      }}
      onMouseLeave={e => {
        if (!active) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }
      }}
    >
      <i className={`ph ${icon}`} />
    </button>
  )
}

export function HomePage() {
  const [widgetsHidden, setWidgetsHidden] = useState(
    () => localStorage.getItem(LS_KEY) === '1'
  )
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    const handler = () => setWidgetsHidden(localStorage.getItem(LS_KEY) === '1')
    window.addEventListener('widgets-visibility-change', handler)
    return () => window.removeEventListener('widgets-visibility-change', handler)
  }, [])

  return (
    <>
      {!widgetsHidden && (
        <ToggleBtn
          left="calc(var(--sidebar-w, 56px) + 8px + 28px + 6px + 28px + 6px)"
          icon={editMode ? 'ph-check' : 'ph-squares-four'}
          title={editMode ? 'Salvar layout' : 'Editar dashboard'}
          active={editMode}
          onClick={() => setEditMode(e => !e)}
        />
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
            <div style={{ padding: '0 0 40px', textAlign: 'center' }}>
              <Link to="/habits" style={{ textDecoration: 'none' }}>
                <Button size="lg">
                  Iniciar Hábitos <i className="ph ph-arrow-right" />
                </Button>
              </Link>
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
