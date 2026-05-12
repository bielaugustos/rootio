import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHabits } from '../../../engine/habitDB'
import type { Habit } from '../../../engine/habitDB'
import { Button } from '../../../components/Button'

export function HabitosWidget() {
  const [habits, setHabits] = useState<Habit[]>([])
  const navigate = useNavigate()

  const load = () => getHabits().then(h => setHabits(h.slice(0, 6)))
  useEffect(() => { load() }, [])
  useEffect(() => {
    window.addEventListener('habits-changed', load)
    return () => window.removeEventListener('habits-changed', load)
  }, [])

  const doneCount = habits.filter(h => h.done).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--bg3)', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0 var(--border)', flexShrink: 0,
          }}>
            <i className="ph ph-check-square" style={{ fontSize: 18, color: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Hábitos</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {doneCount}/{habits.length} concluídos hoje
            </div>
          </div>
        </div>
        <Button
          variant="neutral"
          size="tiny"
          onClick={() => navigate('/habits')}
        >
          <i className="ph ph-arrow-right" style={{ fontSize: 14 }} />
        </Button>
      </div>

      {/* Habit list */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
        {habits.length === 0 ? (
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)', fontSize: 12 }}>
            Nenhum hábito cadastrado
          </div>
        ) : habits.map(habit => (
          <div
            key={habit.id}
            onClick={() => navigate('/habits')}
            style={{
              padding: '8px 10px',
              background: habit.done ? 'var(--bg3)' : 'var(--secondary-background)',
              border: `2px solid ${habit.done ? '#22c55e' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              boxShadow: habit.done ? '2px 2px 0 #22c55e' : '2px 2px 0 var(--border)',
              display: 'flex', alignItems: 'center', gap: 7,
              cursor: 'pointer', transition: 'transform 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = habit.done ? '2px 2px 0 #22c55e' : '2px 2px 0 var(--border)'
            }}
          >
            {/* Status dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: habit.done ? '#22c55e' : '#f59e0b',
            }} />
            <div style={{
              fontSize: 11, fontWeight: 400,
              color: habit.done ? 'var(--t3)' : 'var(--t1)',
              textDecoration: habit.done ? 'line-through' : 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {habit.icon} {habit.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}