import { useState, useEffect, useCallback } from 'react'
import { getProfile, updateProfile } from '../../engine/profileDB'
import type { Layout } from 'react-grid-layout'

const DEFAULT_LAYOUT: Layout = [
  { i: 'streak',    x: 0, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'io-hoje',   x: 4, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'progresso', x: 8, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'habitos',   x: 0, y: 2, w: 8, h: 4, minW: 4 },
  { i: 'carteira',  x: 8, y: 2, w: 4, h: 4, minW: 2 },
]

const DEFAULT_MOBILE_HEIGHTS: Record<string, number> = {
  streak: 170,
  'io-hoje': 210,
  progresso: 230,
  habitos: 220,
  carteira: 310,
}

const DEFAULT_MOBILE_ORDER = ['streak', 'io-hoje', 'progresso', 'habitos', 'carteira']

export function useDashboardLayout() {
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT)
  const [loaded, setLoaded] = useState(false)
  const [mobileHeights, setMobileHeights] = useState<Record<string, number>>(DEFAULT_MOBILE_HEIGHTS)
  const [mobileOrder, setMobileOrder] = useState<string[]>(DEFAULT_MOBILE_ORDER)

  useEffect(() => {
    getProfile().then(p => {
      if (p.dashboard_layout?.length) setLayout(p.dashboard_layout)
      if (p.mobile_widget_heights) setMobileHeights(p.mobile_widget_heights)
      if (p.mobile_widget_order) setMobileOrder(p.mobile_widget_order)
      setLoaded(true)
    })
  }, [])

  const saveLayout = useCallback(async (newLayout: Layout) => {
    setLayout(newLayout)
    await updateProfile({ dashboard_layout: newLayout })
  }, [])

  const saveMobileHeights = useCallback(async (heights: Record<string, number>) => {
    setMobileHeights(heights)
    await updateProfile({ mobile_widget_heights: heights })
  }, [])

  const saveMobileOrder = useCallback(async (order: string[]) => {
    setMobileOrder(order)
    await updateProfile({ mobile_widget_order: order })
  }, [])

  const resetLayout = useCallback(async () => {
    setLayout(DEFAULT_LAYOUT)
    setMobileHeights(DEFAULT_MOBILE_HEIGHTS)
    setMobileOrder(DEFAULT_MOBILE_ORDER)
    await updateProfile({ dashboard_layout: null, mobile_widget_heights: null, mobile_widget_order: null })
  }, [])

  return { layout, saveLayout, resetLayout, loaded, mobileHeights, saveMobileHeights, mobileOrder, saveMobileOrder }
}
