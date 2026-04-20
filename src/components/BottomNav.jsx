// src/components/BottomNav.jsx
// ══════════════════════════════════════
// Navegação inferior — visível apenas no
// mobile (< 768px via CSS). Em tablet/desktop
// o SideNav substitui este componente.
//
// ACESSIBILIDADE:
//   • <nav aria-label="Navegação principal">
//   • aria-current="page" no link ativo
//   • Ícones com aria-hidden
//   • Badge "Novo" com aria-label
// ══════════════════════════════════════
import { NavLink, useLocation } from 'react-router-dom'
import {
  PiHouseBold,          PiHouseFill,
  PiCheckSquareBold,    PiCheckSquareFill,
  PiUserCircleBold,     PiUserCircleFill,
  PiChartBarBold,       PiChartBarFill,
  PiBriefcaseBold,
  PiRocketLaunchBold,
  PiRobotBold,
} from 'react-icons/pi'
import { useUnlockableItem } from '../hooks/useNav'
import styles from './BottomNav.module.css'

// Custom Finance Icon SVG
function FinanceIcon({ size = 21 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 2v14M4 6h8M3 11h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square"></path>
    </svg>
  );
}

// Wrapper for finance icon to handle active/inactive states
function FinanceIconWrapper({ size }) {
  return <FinanceIcon size={size} />;
}

// Custom Experience Icon SVG
function ExperienceIcon({ size = 21 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M5 2h8l-1 8H6L5 2zM4 14h10M9 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"></path>
    </svg>
  );
}

// Wrapper for experience icon to handle active/inactive states
function ExperienceIconWrapper({ size }) {
  return <ExperienceIcon size={size} />;
}

// ── Itens de navegação ──

const BASE_NAV = [
  { to: '/',        label: 'Hoje',     Icon: PiHouseBold,          IconA: PiHouseFill          },
  { to: '/habits',  label: 'Hábitos',  Icon: PiCheckSquareBold,    IconA: PiCheckSquareFill    },
  { to: '/finance', label: 'Finanças', Icon: FinanceIconWrapper,  IconA: FinanceIconWrapper  },
  { to: '/profile', label: 'Perfil',   Icon: PiUserCircleBold,     IconA: PiUserCircleFill     },
]

const UNLOCKABLE = [
  { id: 'util_progress',   to: '/progress',   label: 'Experiência', Icon: ExperienceIconWrapper, IconA: ExperienceIconWrapper },
  { id: 'util_career',     to: '/career',     label: 'Carreira',    Icon: PiBriefcaseBold,    IconA: PiBriefcaseBold    },
  { id: 'util_projects',   to: '/projects',   label: 'Projetos',    Icon: PiRocketLaunchBold, IconA: PiRocketLaunchBold },
  { id: 'util_mentor',     to: '/mentor',     label: 'Mentor',      Icon: PiRobotBold,        IconA: PiRobotBold        },
]

// ── BottomNavBtn — botão base (sem animação) ──
function BottomNavBtn({ to, label, Icon, IconA }) {
  const { pathname } = useLocation()
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <NavLink
      to={to}
      className={`${styles.btn} ${isActive ? styles.active : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span aria-hidden="true">
        {isActive ? <IconA size={21} /> : <Icon size={21} />}
      </span>
      <span>{label}</span>
    </NavLink>
  )
}

// ── UnlockableNavBtn — item com animação de entrada ──
function UnlockableNavBtn({ item }) {
  const { visible, animCls } = useUnlockableItem(item.id)
  const { pathname } = useLocation()

  if (!visible && animCls === 'hidden') return null

  const isActive = pathname.startsWith(item.to)
  const cls = [
    styles.btn,
    isActive               ? styles.active        : '',
    animCls === 'entering' ? styles.unlockEnter   : '',
    animCls === 'leaving'  ? styles.unlockLeave   : '',
    animCls === 'visible'  ? styles.unlockVisible : '',
  ].filter(Boolean).join(' ')

  return (
    <NavLink
      to={item.to}
      className={cls}
      aria-current={isActive ? 'page' : undefined}
    >
      <span aria-hidden="true">
        {isActive ? <item.IconA size={21} /> : <item.Icon size={21} />}
      </span>
      <span>{item.label}</span>
      {animCls === 'entering' && (
        <span className={styles.newDot} aria-label="Novo" />
      )}
    </NavLink>
  )
}

// ── Componente principal ──
export function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {BASE_NAV.slice(0, 3).map(item => (
        <BottomNavBtn key={item.to} {...item} />
      ))}

      {/* Desbloqueáveis — inseridos entre Finanças e Perfil */}
      {UNLOCKABLE.map(item => (
        <UnlockableNavBtn key={item.id} item={item} />
      ))}

      <BottomNavBtn {...BASE_NAV[3]} />
    </nav>
  )
}
