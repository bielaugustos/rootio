import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Challenge {
  id: string
  title: string
  desc: string
  icon: string
  reward: number
  progress: number
  total: number
  done: boolean
  type: 'semanal' | 'mensal'
  expiresAt: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const DESAFIOS_BASE = [
  { title: '20 hábitos esta semana', desc: 'Conclua 20 hábitos de segunda a domingo', icon: '🔥', reward: 100, total: 20, type: 'semanal' as const },
  { title: '3 dias perfeitos', desc: '100% dos hábitos em 3 dias diferentes', icon: '💧', reward: 150, total: 3, type: 'semanal' as const },
  { title: 'Streak de 3 dias', desc: 'Mantenha 3 dias ativos seguidos', icon: '⚡', reward: 20, total: 3, type: 'semanal' as const },
  { title: 'Registrar 3 aprendizados', desc: 'Adicione 3 conteúdos na aba Carreira', icon: '📚', reward: 200, total: 3, type: 'mensal' as const },
  { title: 'Primeiro projeto criado', desc: 'Crie seu primeiro projeto de vida', icon: '🚀', reward: 150, total: 1, type: 'mensal' as const },
]

// ── Helpers ───────────────────────────────────────────────────────────────────────

function getWeeklyExpiry() {
  const d = new Date(); d.setDate(d.getDate() + (7 - d.getDay()))
  return d.toISOString().split('T')[0]
}

function getMonthlyExpiry() {
  const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(0)
  return d.toISOString().split('T')[0]
}

function todayISO() { return new Date().toISOString().split('T')[0] }

export { todayISO }

// ── Core functions ───────────────────────────────────────────────────────

export function initChallenges(): Challenge[] {
  const stored = localStorage.getItem('io_challenges')
  if (stored) return JSON.parse(stored) as Challenge[]

  const initial = DESAFIOS_BASE.map((c, i) => ({
    ...c,
    id: `c${i}`,
    progress: 0,
    done: false,
    expiresAt: c.type === 'semanal' ? getWeeklyExpiry() : getMonthlyExpiry(),
  }))

  localStorage.setItem('io_challenges', JSON.stringify(initial))
  return initial
}

interface HistoryDay { date: string; done: number; total: number; pts: number }

export async function syncChallengeProgress(historyDays: HistoryDay[]): Promise<{ updated: Challenge[]; rewards: number }> {
  if (!historyDays.length) return { updated: initChallenges(), rewards: 0 }

  const stored = localStorage.getItem('io_challenges')
  let challenges: Challenge[] = stored ? JSON.parse(stored) : []

  if (!challenges.length) {
    challenges = initChallenges()
  }

  const last7Days = historyDays.slice(0, 7)
  let rewards = 0

  const updated = challenges.map(c => {
    if (c.done) return c

    let progress = 0

    switch (c.id) {
      case 'c0':
        progress = last7Days.reduce((sum, d) => sum + d.done, 0)
        break
      case 'c1':
        progress = last7Days.filter(d => d.done === d.total && d.total > 0).length
        break
      case 'c2': {
        let streak = 0
        for (const day of last7Days) {
          if (day.done > 0) streak++
          else break
        }
        progress = streak
        break
      }
      default:
        progress = c.progress
    }

    const isDone = progress >= c.total
    if (isDone && !c.done) {
      rewards += c.reward
    }

    return { ...c, progress, done: isDone }
  })

  localStorage.setItem('io_challenges', JSON.stringify(updated))
  return { updated, rewards }
}

// ── Hook ────────────────────────────────────────────────────────

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])

  useEffect(() => {
    setChallenges(initChallenges())
  }, [])

  return { challenges, setChallenges }
}