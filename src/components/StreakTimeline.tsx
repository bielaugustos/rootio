import { useState, useEffect } from 'react'
import { getHabits, getHistoryRange } from '../engine/habitDB'
import type { Habit } from '../engine/habitDB'
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineDot, TimelineContent, TimelineOppositeContent } from './TimeLine'
import { Badge } from './Badge'
import { LIST_LABELS, PRIORITY_COLORS } from '../pages/habits/habitConstants'

export function StreakTimeline() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completedHabitIds, setCompletedHabitIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      const h = await getHabits()
      setHabits(h)

      // Get history to find completed habits
      const from = new Date()
      from.setFullYear(from.getFullYear() - 1) // Last year
      const to = new Date()
      const history = await getHistoryRange(from.toISOString().split('T')[0], to.toISOString().split('T')[0])
      const completed = new Set<string>()
      for (const entry of history) {
        for (const habitId of Object.keys(entry.habits ?? {})) {
          if (entry.habits![habitId].done) {
            completed.add(habitId)
          }
        }
      }
      setCompletedHabitIds(completed)
    }

    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      const h = await getHabits()
      setHabits(h)

      // Get history to find completed habits
      const from = new Date()
      from.setFullYear(from.getFullYear() - 1) // Last year
      const to = new Date()
      const history = await getHistoryRange(from.toISOString().split('T')[0], to.toISOString().split('T')[0])
      const completed = new Set<string>()
      for (const entry of history) {
        for (const habitId of Object.keys(entry.habits ?? {})) {
          if (entry.habits![habitId].done) {
            completed.add(habitId)
          }
        }
      }
      setCompletedHabitIds(completed)
    }

    window.addEventListener('habits-changed', load)
    return () => window.removeEventListener('habits-changed', load)
  }, [])

  const filteredHabits = habits.filter(h => h.list === 'habit' && completedHabitIds.has(h.id))

  return (
    <div style={{ padding: 20, background: 'var(--background)', borderTop: '2px solid var(--border)' }}>
      <h3 style={{ marginBottom: 20, fontSize: 18, fontFamily: 'Indie Flower', textAlign: 'center' }}>Histórico de Streaks</h3>
      {filteredHabits.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
        }}>
          <img
            src='/illustrations/habitslogbox.png'
            alt=''
            style={{ width: 120, height: 120, margin: '0 auto 16px', display: 'block' }}
            className='invert-element'
          />
          <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 0 }}>
            Nenhum hábito concluído ainda.<br/>
            Complete um hábito para ver o histórico de streaks aqui.
          </p>
        </div>
      ) : (
        <div style={{ margin: '0 auto', maxWidth: '800px' }}>
          <Timeline>
          {filteredHabits.map((habit, index) => (
           <TimelineItem key={habit.id}>
            <TimelineOppositeContent>
              <div style={{ textAlign: 'right', paddingRight: 16, fontSize: 14, color: 'var(--t2)' }}>
                {new Date(habit.created_at).toLocaleDateString('pt-BR')}
              </div>
            </TimelineOppositeContent>
             <TimelineSeparator>
               <TimelineDot color={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'success'} />
               {index < filteredHabits.length - 1 && <TimelineConnector />}
             </TimelineSeparator>
             <TimelineContent>
               <div style={{
                 background: 'var(--secondary-background)',
                 border: '2px solid var(--border)',
                 borderRadius: 'var(--radius-base)',
                 padding: '12px 16px',
                 boxShadow: '3px 3px 0 var(--border)',
                 maxWidth: '400px', // Limit width for flexibility
               }}>
                 {/* Habit name and icon */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                   <span style={{ fontSize: 20, flexShrink: 0 }}>{habit.icon}</span>
                   <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                     {habit.name}
                   </span>
                 </div>

                 {/* Badges */}
                 <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                   <Badge label={LIST_LABELS[habit.list]} variant="default" style={habit.list === 'habit' ? { background: '#FEF3C7', color: 'black' } : habit.list === 'task' ? { background: '#6FB8FF', color: 'black' } : habit.list === 'goal' ? { color: 'black' } : habit.list === 'event' ? { background: '#9B7BFF', color: 'black' } : undefined} />
                   <Badge label={`Streak: ${habit.streak_goal ?? 0}d`} variant="default" />
                   {habit.pts > 0 && <Badge label={`+${habit.pts} IO`} variant="destructive" />}
                 </div>

                 {/* Priority shield and time */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', background: PRIORITY_COLORS[habit.priority] }}>
                     <span style={{ width: 6, height: 6, borderRadius: '50%', border: '2px solid var(--foreground)', background: PRIORITY_COLORS[habit.priority] }} />
                     <span style={{ fontSize: 10, fontWeight: 500, color: '#000', textTransform: 'capitalize' }}>{habit.priority === 'media' ? 'média' : habit.priority}</span>
                   </div>
                   <span style={{ fontSize: 10, color: 'var(--t3)' }}>
                     {new Date(habit.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </div>
               </div>
             </TimelineContent>
           </TimelineItem>
        ))}
          </Timeline>
        </div>
      )}
    </div>
  )
}