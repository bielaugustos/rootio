import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardGrid } from './home/DashboardGrid'
import { Button } from '../components/Button'

const LS_KEY = 'dashboard-widgets-hidden'

// Small toggle button — sits right next to the sidebar toggle
function WidgetsToggle({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={hidden ? 'Mostrar widgets' : 'Ocultar widgets'}
      style={{
        position: 'fixed',
        top: 14,
        // sidebar toggle is at calc(--sidebar-w + 8px), width 28px + 8px gap = +44px
        left: 'calc(var(--sidebar-w, 56px) + 8px + 36px)',
        zIndex: 200,
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hidden ? 'var(--main)' : 'var(--secondary-background)',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '2px 2px 0 var(--border)',
        cursor: 'pointer',
        color: hidden ? 'var(--main-foreground)' : 'var(--t2)',
        fontSize: 14,
        transition: 'left 0.22s ease, background 0.15s',
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
      <i className={`ph ${hidden ? 'ph-squares-four' : 'ph-minus-square'}`} />
    </button>
  )
}

export function HomePage() {
  const [widgetsHidden, setWidgetsHidden] = useState(
    () => localStorage.getItem(LS_KEY) === '1'
  )

  useEffect(() => {
    localStorage.setItem(LS_KEY, widgetsHidden ? '1' : '0')
  }, [widgetsHidden])

  return (
    <>
      <WidgetsToggle
        hidden={widgetsHidden}
        onToggle={() => setWidgetsHidden(h => !h)}
      />

      <main style={{
        flex: 1,
        padding: '24px',
        paddingTop: widgetsHidden ? '24px' : 'max(24px, 60px)',
        paddingBottom: 'max(40px, calc(env(safe-area-inset-bottom) + 40px))',
        minHeight: 0,
      }}>
        {widgetsHidden ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '40vh',
            gap: '16px',
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
            <Link to="/habits" style={{ textDecoration: 'none' }}>
              <Button size="lg">
                Iniciar Hábitos <i className="ph ph-arrow-right" />
              </Button>
            </Link>
          </div>
        ) : (
          <DashboardGrid />
        )}
      </main>
    </>
  )
}
