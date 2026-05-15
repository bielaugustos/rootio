import { useState, useEffect } from 'react'
import { getHabitStreak, getHabitLast7Days, type Habit } from '../../engine/habitDB'

export function StreaksPanel({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const [streak, setStreak] = useState(0)
  const [days, setDays] = useState<{ date: string; done: boolean }[]>([])

  useEffect(() => {
    getHabitStreak(habit.id).then(setStreak)
    getHabitLast7Days(habit.id).then(setDays)
  }, [habit.id])

  const best = days.filter(d => d.done).length

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px solid var(--border)', paddingBottom: 12, marginBottom: 16, background: 'var(--main)', margin: '-16px -16px 16px', padding: '12px 16px' }}>
        <span style={{ fontWeight: 700, fontSize: 13, flex: 1, fontFamily: 'var(--font-title)' }}>Streaks • {habit.name}</span>
        <button onClick={onClose} style={{ width: 28, height: 28, border: '1.5px solid var(--b2)', borderRadius: 'var(--radius-sm)', background: 'var(--secondary-background)', cursor: 'pointer', fontSize: 13, color: 'var(--t2)' }}>✕</button>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 36, color: 'var(--t1)' }}>{streak}</div>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>dias de streak atual</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 16 }}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} style={{ fontSize: 9, fontWeight: 500, color: 'var(--t3)', textAlign: 'center' }}>{d}</div>
        ))}
        {days.map(d => {
          const date = new Date(d.date + 'T12:00:00')
          return (
            <div key={d.date} style={{
              width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-sm)',
              background: d.done ? 'var(--main)' : 'var(--bg3)',
              border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: d.done ? 'var(--main-foreground)' : 'var(--t3)',
            }}>
              {date.getDate()}
            </div>
          )
        })}
      </div>

      <div style={{ background: 'var(--bg3)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', padding: 12, marginTop: 'auto' }}>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 4 }}>Melhor marca dos últimos 7 dias</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>{best}/{days.length} dias</div>
      </div>
    </div>
  )
}
