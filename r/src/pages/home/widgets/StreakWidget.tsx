import { useState, useEffect } from 'react'
import { getCurrentStreak, getWeekProgress } from '../../../engine/habitDB'

export function StreakWidget() {
  const [streak, setStreak] = useState(0)
  const [weekDays, setWeekDays] = useState<{ date: string; done: number; total: number }[]>([])

  const load = () => {
    getCurrentStreak().then(setStreak)
    getWeekProgress().then(setWeekDays)
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    window.addEventListener('habits-changed', load)
    return () => window.removeEventListener('habits-changed', load)
  }, [])

  const doneThisWeek = weekDays.filter(d => d.total > 0 && d.done === d.total).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--bg3)', border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '3px 3px 0 var(--border)', flexShrink: 0,
        }}>
          <i className="ph ph-fire" style={{ fontSize: 20, color: '#f97316' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Streak</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>dias seguidos</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--t1)', lineHeight: 1 }}>{streak}</span>
        <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 400 }}>dias</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = weekDays[i] ?? { date: '', done: 0, total: 0 }
            const isPerfect = d.total > 0 && d.done === d.total
            const isPartial = d.total > 0 && d.done > 0 && d.done < d.total
            return (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 99,
                background: isPerfect ? '#f97316' : isPartial ? '#fed7aa' : 'var(--bg3)',
                border: `1.5px solid ${isPerfect ? '#ea580c' : isPartial ? '#f97316' : 'var(--b2)'}`,
              }} />
            )
          })}
        </div>
        <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 400 }}>
          {doneThisWeek} de 7 esta semana
        </div>
      </div>
    </div>
  )
}