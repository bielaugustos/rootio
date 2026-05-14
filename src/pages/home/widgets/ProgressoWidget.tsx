import { useState, useEffect } from 'react'
import { getWeekProgress } from '../../../engine/habitDB'

export function ProgressoWidget() {
  const [weekData, setWeekData] = useState<{ date: string; done: number; total: number }[]>([])

  const load = () => getWeekProgress().then(setWeekData)
  useEffect(() => { load() }, [])
  useEffect(() => {
    window.addEventListener('habits-changed', load)
    return () => window.removeEventListener('habits-changed', load)
  }, [])

  const weekTotal = weekData.reduce((s, d) => s + d.total, 0)
  const weekDone = weekData.reduce((s, d) => s + d.done, 0)
  const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 14, gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--bg3)', border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '3px 3px 0 var(--border)', flexShrink: 0,
        }}>
          <i className="ph ph-chart-line" style={{ fontSize: 16, color: '#7c3aed' }} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Indie Flower', color: 'var(--t1)', lineHeight: 1 }}>{weekPct}%</div>
          <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>semana completa</div>
        </div>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flex: 1 }}>
        {weekData.map((day) => {
          const pct = day.total > 0 ? (day.done / day.total) * 100 : 0
          const isToday = day.date === new Date().toISOString().split('T')[0]
          const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase().slice(0, 1)
          const fillColor = pct === 100 ? '#7c3aed' : pct > 0 ? '#c4b5fd' : 'var(--b2)'

          return (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: '100%', height: 36,
                background: 'var(--background)',
                border: '2px solid var(--border)',
                borderRadius: 6, position: 'relative', overflow: 'hidden',
                boxShadow: isToday ? '2px 2px 0 #7c3aed' : 'none',
              }}>
                <div style={{
                  width: '100%', height: `${Math.max(pct, pct > 0 ? 8 : 0)}%`,
                  background: fillColor, position: 'absolute', bottom: 0,
                  borderRadius: '4px 4px 0 0',
                }} />
              </div>
              <div style={{
                fontSize: 9, fontWeight: isToday ? 800 : 600,
                color: isToday ? '#7c3aed' : 'var(--t3)',
              }}>
                {dayLabel}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        textAlign: 'center', padding: '5px 10px',
        background: 'var(--background)', border: '2px solid var(--b2)',
        borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--t2)', fontWeight: 400,
        marginBottom: 8,
      }}>
        {weekDone} de {weekTotal} completados
      </div>
    </div>
  )
}