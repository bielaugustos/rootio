import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { getProfile, subscribeProfile, type Profile } from '../engine/profileDB'
import { getEconomy } from '../engine/economyDB'

// ─── Nav definition ───────────────────────────────────────────────────────────
const NAV_MAIN = [
  { to: '/',              label: 'Início',       icon: 'ph-house',          end: true  },
  { to: '/habits',        label: 'Hábitos',      icon: 'ph-check-square',   end: false },
  { to: '/progress',      label: 'Progresso',    icon: 'ph-chart-line-up',  end: false },
  { to: '/career',        label: 'Carreira',     icon: 'ph-briefcase',      end: false },
  { to: '/wallet',         label: 'Carteira',      icon: 'ph-wallet',         end: false },
  { to: '/feed',          label: 'Feed',         icon: 'ph-newspaper',      end: false },
  { to: '/mentor',        label: 'Mentor',       icon: 'ph-users-three',    end: false },
  { to: '/projects',      label: 'Projetos',     icon: 'ph-folder-notch',   end: false },
  { to: '/sprint',        label: 'Sprint',       icon: 'ph-lightning',      end: false },
  { to: '/shop',          label: 'Loja',         icon: 'ph-storefront',     end: false },
]

const NAV_BOTTOM = [
  { to: '/notifications', label: 'Notificações', icon: 'ph-bell',           end: false },
  { to: '/settings',      label: 'Ajustes',      icon: 'ph-gear',           end: false },
]

// ─── 3-state widths ───────────────────────────────────────────────────────────
const WIDTHS = { expanded: 220, collapsed: 56, hidden: 0 } as const
type SidebarState = keyof typeof WIDTHS

const STATE_CYCLE: Record<SidebarState, SidebarState> = {
  expanded:  'collapsed',
  collapsed: 'hidden',
  hidden:    'expanded',
}

const STATE_TITLE: Record<SidebarState, string> = {
  expanded:  'Colapsar',
  collapsed: 'Ocultar',
  hidden:    'Mostrar menu',
}

function setSidebarVar(w: number) {
  document.documentElement.style.setProperty('--sidebar-w', `${w}px`)
}

const MOBILE_BP = 640

// ─── Single nav link ──────────────────────────────────────────────────────────
function NavItem({
  to, label, icon, end = false,
  state,
}: {
  to: string; label: string; icon: string; end?: boolean
  state: SidebarState
}) {
  const location = useLocation()
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to)
  const isExpanded = state === 'expanded'

  return (
    <NavLink
      to={to}
      end={end}
      title={state === 'collapsed' ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: isExpanded ? '8px 12px' : '9px 0',
        margin: '1px 8px',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
        color: isActive ? 'var(--main-foreground)' : 'var(--t2)',
        background: isActive ? 'var(--main)' : 'transparent',
        border: isActive ? '2px solid var(--border)' : '2px solid transparent',
        boxShadow: isActive ? '2px 2px 0 var(--border)' : 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        justifyContent: isExpanded ? 'flex-start' : 'center',
        transition: 'background 0.1s, color 0.1s, box-shadow 0.1s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--bg3)'
          e.currentTarget.style.color = 'var(--t1)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--t2)'
        }
      }}
    >
      <i className={`ph ${icon}`} style={{ fontSize: 18, flexShrink: 0 }} />
      {isExpanded && (
        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{label}</span>
      )}
    </NavLink>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar() {
  const [state, setState] = useState<SidebarState>('collapsed')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pts, setPts] = useState(0)

  const width = WIDTHS[state]
  const isExpanded  = state === 'expanded'
  const isHidden    = state === 'hidden'

  // Persist state across refreshes, force hidden on mobile
  useEffect(() => {
    const mobile = window.innerWidth < MOBILE_BP
    if (mobile) {
      setState('hidden')
    } else {
      const saved = localStorage.getItem('sidebar-state') as SidebarState | null
      if (saved && saved in WIDTHS) setState(saved)
    }
  }, [])

  useEffect(() => {
    const check = () => {
      if (window.innerWidth < MOBILE_BP) setState('hidden')
    }
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setSidebarVar(width)
    localStorage.setItem('sidebar-state', state)
  }, [state, width])

  useEffect(() => {
    getProfile().then(setProfile)
    getEconomy().then(e => setPts(e.io_saldo))
    const unsub = subscribeProfile(() => {
      getProfile().then(setProfile)
      getEconomy().then(e => setPts(e.io_saldo))
    })
    const onHabitsChange = () => getEconomy().then(e => setPts(e.io_saldo))
    window.addEventListener('habits-changed', onHabitsChange)
    return () => { unsub(); window.removeEventListener('habits-changed', onHabitsChange) }
  }, [])

  const cycle = () => setState(s => STATE_CYCLE[s])

  return (
    <>
      {/* ── Toggle button — always visible, tracks sidebar edge ── */}
      <button
        onClick={cycle}
        title={STATE_TITLE[state]}
        style={{
          position: 'fixed',
          top: 14,
          left: `calc(var(--sidebar-w, 56px) + 8px)`,
          zIndex: 200,
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '2px 2px 0 var(--border)',
          cursor: 'pointer',
          color: 'var(--t2)',
          fontSize: 14,
          transition: 'left 0.22s ease',
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
        <i className="ph ph-sidebar" />
      </button>

      {/* ── Sidebar panel ── */}
      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width,
          height: '100dvh',
          background: 'var(--secondary-background)',
          borderRight: isHidden ? 'none' : '2px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.22s ease',
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: isExpanded ? 10 : 0,
          padding: isExpanded ? '12px 14px' : '12px 0',
          borderBottom: '2px solid var(--border)',
          height: 56, flexShrink: 0,
          overflow: 'hidden',
          justifyContent: isExpanded ? 'flex-start' : 'center',
        }}>
          <div style={{
            width: 32, height: 32, flexShrink: 0,
            background: 'var(--foreground)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '2px 2px 0 var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="/logo.svg" alt="Logo" style={{ width: 16, height: 16 }} />
          </div>
          {isExpanded && (
            <span style={{
              fontFamily: 'var(--font-title)', fontSize: 18,
              color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden',
            }}>
              Rootio
            </span>
          )}
        </div>

        {/* Nav — scrollable */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 0' }}>
          {isExpanded && (
            <div style={{ padding: '8px 16px 2px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', whiteSpace: 'nowrap' }}>
              App
            </div>
          )}

          {NAV_MAIN.map(item => (
            <NavItem key={item.to} {...item} state={state} />
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--b2)', margin: isExpanded ? '8px 16px' : '8px 10px' }} />

          {isExpanded && (
            <div style={{ padding: '2px 16px 2px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--t3)', whiteSpace: 'nowrap' }}>
              Sistema
            </div>
          )}

          {NAV_BOTTOM.map(item => (
            <NavItem key={item.to} {...item} state={state} />
          ))}
        </nav>

        {/* Footer — user */}
        <div style={{
          padding: isExpanded ? '10px 12px' : '10px 0',
          borderTop: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          overflow: 'hidden', flexShrink: 0,
          justifyContent: isExpanded ? 'flex-start' : 'center',
        }}>
          <div style={{
            width: 32, height: 32, flexShrink: 0,
            background: profile?.bg_cor ?? 'var(--bg3)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            {profile?.avatar ?? '👤'}
          </div>
          {isExpanded && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.username ?? 'Usuário'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{pts} IO</div>
            </div>
          )}
        </div>
      </aside>

      {/* Spacer — pushes content right */}
      <div style={{ width, flexShrink: 0, transition: 'width 0.22s ease' }} aria-hidden />
    </>
  )
}
