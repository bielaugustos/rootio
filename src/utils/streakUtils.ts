import type { Habit } from '../engine/habitDB'
import type { TimelineEvent } from '../pages/habits/HabitsTimeline'

const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90]

/** Call this when a streak milestone is reached */
export function recordStreakMilestone(habit: Habit, streakDays: number) {
  if (!STREAK_MILESTONES.includes(streakDays)) return
  try {
    const key  = 'rootio-streak-events'
    const prev = JSON.parse(localStorage.getItem(key) ?? '[]') as TimelineEvent[]
    const id   = `streak-${habit.id}-${streakDays}`
    if (prev.some(e => e.id === id)) return   // already recorded
    const next: TimelineEvent = {
      id,
      type: 'streak',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString().split('T')[1].substring(0, 5),
      habitId: habit.id,
      habitName: habit.name,
      habitIcon: habit.icon,
      list: habit.list,
      meta: {
        note: `Alcançou ${streakDays} dias de streak!`,
        streakDays,
      },
    }
    localStorage.setItem(key, JSON.stringify([...prev, next]))
    window.dispatchEvent(new Event('timeline-updated'))
  } catch {}
}