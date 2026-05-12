import { createContext } from 'react'

export type Mode = 'light' | 'dark'

export interface ThemeContextType {
  mode: Mode
  toggleMode: () => Promise<void>
  setMode: (mode: Mode) => Promise<void>
  setGlobalToken: (key: string, value: string) => Promise<void>
  getGlobalToken: (key: string) => string
  getAllGlobalTokens: () => Promise<Record<string, string>>
  resetGlobalTokens: () => Promise<void>
}

export const ThemeContext = createContext<ThemeContextType | null>(null)