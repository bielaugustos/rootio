import { useState, useEffect, useCallback } from 'react'
import type { FinancialGoal } from '../../../engine/walletDB'
import { getGoals, saveGoal, updateGoal, deleteGoal } from '../../../engine/walletDB'

const GOALS_CHANGED = 'goals-changed'
const emit = () => window.dispatchEvent(new CustomEvent(GOALS_CHANGED))

export function useGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await getGoals()
    setGoals(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    getGoals().then(data => {
      setGoals(data)
      setIsLoading(false)
    })
    window.addEventListener(GOALS_CHANGED, refresh)
    return () => window.removeEventListener(GOALS_CHANGED, refresh)
  }, [refresh])

  const add = useCallback(async (goal: { name: string; target: number; saved: number; deadline: string | null }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await saveGoal(goal as any)
    emit()
  }, [])

  const update = useCallback(async (id: string, data: Partial<FinancialGoal>) => {
    await updateGoal(id, data)
    emit()
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteGoal(id)
    emit()
  }, [])

  const totalSaved  = goals.reduce((s, g) => s + g.saved, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)
  const totalPct    = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0

  return { goals, isLoading, refresh, add, update, remove, totalSaved, totalTarget, totalPct }
}