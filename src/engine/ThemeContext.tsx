import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './ThemeContextDef'
import { themeEngine } from './ThemeEngine'

const defaultValue = {
  mode: 'light' as const,
  toggleMode: async () => {},
  setGlobalToken: async () => {},
  getGlobalToken: () => '',
  getAllGlobalTokens: async () => ({} as Record<string, string>),
  resetGlobalTokens: async () => {},
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    themeEngine.init().then(() => {
      setMode(themeEngine.getMode())
      setReady(true)
    })
    return themeEngine.onChange(() => setMode(themeEngine.getMode()))
  }, [])

  const value = ready ? {
    mode,
    toggleMode: async () => {
      await themeEngine.toggleMode()
      setMode(themeEngine.getMode())
    },
    setMode: async (mode: Mode) => {
      await themeEngine.setMode(mode)
      setMode(themeEngine.getMode())
    },
    setGlobalToken: (key: string, value: string) => themeEngine.setGlobalToken(key, value),
    getGlobalToken: (key: string) => themeEngine.getGlobalToken(key),
    getAllGlobalTokens: () => themeEngine.getAllGlobalTokens(),
    resetGlobalTokens: () => themeEngine.resetGlobalTokens(),
  } : { ...defaultValue, setMode: async () => {} }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}