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

export function useDashboardLayout() {
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getProfile().then(p => {
      if (p.dashboard_layout?.length) {
        setLayout(p.dashboard_layout)
      }
      setLoaded(true)
    })
  }, [])

  const saveLayout = useCallback(async (newLayout: Layout) => {
    setLayout(newLayout)
    await updateProfile({ dashboard_layout: newLayout })
  }, [])

  const resetLayout = useCallback(async () => {
    setLayout(DEFAULT_LAYOUT)
    await updateProfile({ dashboard_layout: null })
  }, [])

  return { layout, saveLayout, resetLayout, loaded }
}