import { useState, useEffect, useCallback } from 'react'
import type { EmergencyReserve } from '../../../engine/walletDB'
import { getEmergency, saveEmergency, deleteEmergency } from '../../../engine/walletDB'

const EMERGENCY_CHANGED = 'emergency-changed'
const emit = () => window.dispatchEvent(new CustomEvent(EMERGENCY_CHANGED))

export function useEmergency() {
  const [emergency, setEmergency] = useState<EmergencyReserve | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await getEmergency()
    setEmergency(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    getEmergency().then(data => {
      setEmergency(data)
      setIsLoading(false)
    })
    window.addEventListener(EMERGENCY_CHANGED, refresh)
    return () => window.removeEventListener(EMERGENCY_CHANGED, refresh)
  }, [refresh])

  const save = useCallback(async (data: EmergencyReserve) => {
    await saveEmergency(data)
    emit()
  }, [])

  const remove = useCallback(async () => {
    await deleteEmergency()
    emit()
  }, [])

  const aport = useCallback(async (amount: number) => {
    if (!emergency) return
    const newAporte = { id: crypto.randomUUID(), date: new Date().toISOString(), value: amount }
    await saveEmergency({
      ...emergency,
      current: emergency.current + amount,
      lastAport: amount,
      aportes: [...emergency.aportes, newAporte],
    })
    emit()
  }, [emergency])

  const undoLastAport = useCallback(async () => {
    if (!emergency?.lastAport) return
    await saveEmergency({
      ...emergency,
      current: Math.max(0, emergency.current - emergency.lastAport),
      lastAport: null,
      aportes: emergency.aportes.slice(0, -1),
    })
    emit()
  }, [emergency])

  const pct = emergency && emergency.target > 0
    ? Math.min(100, Math.round((emergency.current / emergency.target) * 100))
    : 0

  return { emergency, isLoading, refresh, save, remove, aport, undoLastAport, pct }
}