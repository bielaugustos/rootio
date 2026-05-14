/**
 * PanelPortal — Rootio · habits/PanelPortal.tsx
 * ─────────────────────────────────────────────────────────────────
 * Context + hook que desacopla os pills do HabitCard do layout da
 * HabitsPage. Em vez de os painéis expandirem DENTRO do card,
 * eles aparecem na coluna 2 (desktop) ou num drawer bottom (mobile).
 *
 * Fluxo:
 *   1. HabitCard recebe `onPanelOpen` como prop (via HabitsPage)
 *   2. Ao clicar num pill, chama onPanelOpen(habitId, 'historico')
 *   3. HabitsPage atualiza `activePanel` e renderiza <PanelColumn>
 *   4. PanelColumn renderiza o painel correto com o habit correto
 *
 * Col 2 é MUTEX: form e painel não coexistem.
 * Abrir painel fecha o form. Abrir form fecha o painel.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────

export type PanelType = 'historico' | 'lembrete' | 'timer' | 'anexos' | 'local' | 'participantes' | 'agendar' | 'tabela' | 'progresso' | 'streaks'

export interface ActivePanel {
  habitId:  string
  type:     PanelType
}

interface PanelCtx {
  activePanel:   ActivePanel | null
  openPanel:     (habitId: string, type: PanelType) => void
  closePanel:    () => void
  togglePanel:   (habitId: string, type: PanelType) => void
  isPanelActive: (habitId: string, type: PanelType) => boolean
}

// ─── Context ──────────────────────────────────────────────────────

const Ctx = createContext<PanelCtx | null>(null)

export function PanelProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null)

  const openPanel = useCallback((habitId: string, type: PanelType) => {
    setActivePanel({ habitId, type })
  }, [])

  const closePanel = useCallback(() => {
    setActivePanel(null)
  }, [])

  const togglePanel = useCallback((habitId: string, type: PanelType) => {
    setActivePanel(prev =>
      prev?.habitId === habitId && prev.type === type ? null : { habitId, type }
    )
  }, [])

  const isPanelActive = useCallback((habitId: string, type: PanelType) => {
    return activePanel?.habitId === habitId && activePanel.type === type
  }, [activePanel])

  return (
    <Ctx.Provider value={{ activePanel, openPanel, closePanel, togglePanel, isPanelActive }}>
      {children}
    </Ctx.Provider>
  )
}

export function usePanelPortal() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePanelPortal must be inside <PanelProvider>')
  return ctx
}
