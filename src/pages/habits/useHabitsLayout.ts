/**
 * useHabitsLayout — Rootio · habits/useHabitsLayout.ts
 * ─────────────────────────────────────────────────────────────────
 * Hook que centraliza toda a lógica de layout responsivo da
 * HabitsPage: breakpoints, larguras, col2 mutex, drawer mobile.
 *
 * Substitui os if(isMobile) espalhados pelo index.tsx.
 *
 * Uso:
 *   const layout = useHabitsLayout({ formOpen, panelOpen })
 *   // layout.col2Open, layout.pageMaxWidth, layout.col2Width, etc.
 */

import { useState, useEffect } from 'react'

// ─── Breakpoints ──────────────────────────────────────────────────
// Mobile: < 640px  (sidebar hidden)
// Tablet: 640–900  (sidebar collapsed 56px)
// Desktop: > 900   (sidebar expanded 220px, or collapsed)

const BP_MOBILE  = 640
const BP_TABLET  = 900

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

function getBreakpoint(w: number): Breakpoint {
  if (w < BP_MOBILE) return 'mobile'
  if (w < BP_TABLET) return 'tablet'
  return 'desktop'
}

// ─── Layout values ────────────────────────────────────────────────

interface LayoutInput {
  formOpen:   boolean
  panelOpen:  boolean
}

export interface HabitsLayout {
  bp:          Breakpoint
  isMobile:    boolean       // mobile OR tablet (single-column)
  isDesktop:   boolean

  // Col2 (form or panel)
  col2Open:    boolean       // formOpen || panelOpen
  col2Width:   number        // 320px fixed on desktop
  col2IsDrawer: boolean      // bottom drawer on mobile/tablet

  // PageWrapper maxWidth
  pageMaxWidth: number

  // Outer flex direction
  flexDir: 'row' | 'column'

  // Col1 style
  col1Style: React.CSSProperties

  // Col2 wrapper style (sticky on desktop, fixed drawer on mobile)
  col2Style: React.CSSProperties

  // Drawer overlay visible
  drawerOpen: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useHabitsLayout({ formOpen, panelOpen }: LayoutInput): HabitsLayout {
  const [bp, setBp] = useState<Breakpoint>(() => getBreakpoint(window.innerWidth))

  useEffect(() => {
    const handler = () => setBp(getBreakpoint(window.innerWidth))
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const isMobile   = bp === 'mobile' || bp === 'tablet'
  const isDesktop  = bp === 'desktop'
  const col2Open   = formOpen || panelOpen
  const col2IsDrawer = isMobile

  // PageWrapper maxWidth:
  // - nothing open → 760px (single column, focused reading)
  // - col2 open → 1100px (two columns, no overflow)
  const pageMaxWidth = col2Open && isDesktop ? 1100 : 760

  // Col2 width: fixed 400px on desktop
  const col2Width = 400

  // Col1 style
  const col1Style: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    // On mobile with drawer open, slightly dim the list
    transition: 'opacity .2s',
    opacity: col2IsDrawer && col2Open ? 0.4 : 1,
    pointerEvents: col2IsDrawer && col2Open ? 'none' : undefined,
  }

  // Col2 wrapper style
  const col2Style: React.CSSProperties = isDesktop ? {
    // Desktop: sticky sidebar
    width:        col2Width,
    flexShrink:   0,
    position:     'sticky',
    alignSelf:    'flex-start',
    maxHeight:    'calc(100vh - 48px)',
    display:      'flex',
    flexDirection:'column',
     background:   'var(--bg)',
    border:       '2px solid var(--border)',
    borderRadius: 'var(--radius-base)',
    boxShadow:    '4px 4px 0 var(--border)',
    overflowY:    'auto',
    // Animate in/out
    animation:    col2Open ? 'col2SlideIn .2s ease' : undefined,
  } : {
    // Mobile/Tablet: bottom drawer
    position:     'fixed',
    bottom:       0,
    left:         0,
    right:        0,
    zIndex:       400,
    height:       '80vh',
     background:   'var(--bg)',
    borderTop:    '3px solid var(--border)',
    borderRadius: '12px 12px 0 0',
    boxShadow:    '0 -4px 24px rgba(0,0,0,.15)',
    display:      'flex',
    flexDirection:'column',
    overflow:     'hidden',
    transform:    col2Open ? 'translateY(0)' : 'translateY(100%)',
    transition:   'transform .28s cubic-bezier(.32,0,.67,0)',
  }

  return {
    bp,
    isMobile,
    isDesktop,
    col2Open,
    col2Width,
    col2IsDrawer,
    pageMaxWidth,
    flexDir: isDesktop ? 'row' : 'column',
    col1Style,
    col2Style,
    drawerOpen: isMobile && col2Open,
  }
}
