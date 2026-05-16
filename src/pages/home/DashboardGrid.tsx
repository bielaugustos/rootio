import { useMemo, useEffect, useState, useCallback } from 'react'
import { useContainerWidth } from 'react-grid-layout'
import ReactGridLayout from 'react-grid-layout'
import { GridBackground } from 'react-grid-layout/extras'
import { useDashboardLayout } from './useDashboardLayout'
import { MobileSortableWidgets } from './MobileSortableWidgets'
import { StreakWidget } from './widgets/StreakWidget'
import { IOHojeWidget } from './widgets/IOHojeWidget'
import { ProgressoWidget } from './widgets/ProgressoWidget'
import { HabitosWidget } from './widgets/HabitosWidget'
import { CarteiraWidget } from './widgets/CarteiraWidget'

const LAYOUTS = {
  lg: [
    { i: 'streak',    x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'io-hoje',   x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'progresso', x: 8, y: 0, w: 4, h: 3, minW: 4, minH: 3 },
    { i: 'habitos',   x: 0, y: 2, w: 8, h: 3, minW: 6, minH: 2 },
    { i: 'carteira',  x: 8, y: 2, w: 4, h: 4, minW: 4, minH: 3 },
  ],
  md: [
    { i: 'streak',    x: 0, y: 0, w: 5,  h: 2, minW: 3, minH: 2 },
    { i: 'io-hoje',   x: 5, y: 0, w: 5,  h: 2, minW: 3, minH: 2 },
    { i: 'progresso', x: 0, y: 2, w: 5,  h: 4, minW: 5, minH: 3 },
    { i: 'carteira',  x: 5, y: 2, w: 5,  h: 3, minW: 5, minH: 3 },
    { i: 'habitos',   x: 0, y: 5, w: 10, h: 3, minW: 8, minH: 2 },
  ],
}

function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return windowWidth
}

function Widget({ children, editMode }: { children: React.ReactNode; editMode?: boolean }) {
  return (
    <div style={{
      height: '100%',
      border: '3px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--secondary-background)',
      boxShadow: '6px 6px 0 var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      {editMode && (
        <div className="widget-drag-handle" style={{
          position: 'absolute', top: 10, right: 10,
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--bg3)', border: '2px solid var(--border)',
          cursor: 'grab', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 10, userSelect: 'none',
        }}>
          <i className="ph ph-dots-six" style={{ fontSize: 12, color: 'var(--t3)' }} />
        </div>
      )}
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

const WIDGETS: Record<string, React.ReactNode> = {
  streak:    <StreakWidget />,
  'io-hoje': <IOHojeWidget />,
  progresso: <ProgressoWidget />,
  habitos:   <HabitosWidget />,
  carteira:  <CarteiraWidget />,
}

export function DashboardGrid({ editMode, onToggleEdit }: {
  editMode: boolean
  onToggleEdit: () => void
}) {
  const { layout, saveLayout, resetLayout, loaded, mobileHeights, saveMobileHeights, mobileOrder, saveMobileOrder } = useDashboardLayout()
  const { width, containerRef, mounted } = useContainerWidth()
  const windowWidth = useWindowWidth()

  useEffect(() => {
    const handler = () => { resetLayout(); onToggleEdit() }
    window.addEventListener('reset-dashboard-layout', handler)
    return () => window.removeEventListener('reset-dashboard-layout', handler)
  }, [resetLayout, onToggleEdit])

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1200

  const cols = isTablet ? 10 : 12
  const rowHeight = 85
  const margin: [number, number] = isTablet ? [14, 14] : [16, 16]
  const currentLayout = isTablet ? LAYOUTS.md : layout

  const gridChildren = useMemo(() => [
    <div key="streak"><Widget editMode={editMode}><StreakWidget /></Widget></div>,
    <div key="io-hoje"><Widget editMode={editMode}><IOHojeWidget /></Widget></div>,
    <div key="progresso"><Widget editMode={editMode}><ProgressoWidget /></Widget></div>,
    <div key="habitos"><Widget editMode={editMode}><HabitosWidget /></Widget></div>,
    <div key="carteira"><Widget editMode={editMode}><CarteiraWidget /></Widget></div>,
  ], [editMode])

  const handleMobileOrderChange = useCallback((order: string[]) => {
    saveMobileOrder(order)
  }, [saveMobileOrder])

  const handleMobileHeightChange = useCallback((id: string, height: number) => {
    saveMobileHeights({ ...mobileHeights, [id]: height })
  }, [mobileHeights, saveMobileHeights])

  if (!loaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', color: 'var(--t3)', fontSize: 13 }}>
      Carregando...
    </div>
  )

  return (
    <div>

      {/* ── MOBILE: sortable + resize ── */}
      {isMobile && (
        <MobileSortableWidgets
          order={mobileOrder}
          heights={mobileHeights}
          editMode={editMode}
          widgets={WIDGETS}
          onOrderChange={handleMobileOrderChange}
          onHeightChange={handleMobileHeightChange}
        />
      )}

      {/* ── DESKTOP / TABLET: RGL ── */}
      {!isMobile && (
        <div ref={containerRef} style={{ position: 'relative' }}>
          {mounted && (
            <>
              <ReactGridLayout
                layout={currentLayout}
                width={width}
                gridConfig={{ cols, rowHeight, margin }}
                dragConfig={{ enabled: editMode, handle: '.widget-drag-handle' }}
                resizeConfig={{ enabled: editMode, handles: ['se'] }}
                onLayoutChange={newLayout => { if (editMode) saveLayout(newLayout) }}
              >
                {gridChildren}
              </ReactGridLayout>

              {editMode && (
                <GridBackground
                  width={width} cols={cols} rowHeight={rowHeight} margin={margin}
                  rows={20} color="var(--b2)" borderRadius={12}
                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: -1 }}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
