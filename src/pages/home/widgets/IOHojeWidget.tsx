import { useState, useEffect } from 'react'
import { getTodayHistory } from '../../../engine/habitDB'

export function IOHojeWidget() {
  const [today, setToday] = useState({ done: 0, total: 0 })

  const load = () => {
    getTodayHistory().then(entry => {
      if (entry) setToday({ done: entry.done, total: entry.total })
    })
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    window.addEventListener('habits-changed', load)
    return () => window.removeEventListener('habits-changed', load)
  }, [])

  const pct = today.total > 0 ? Math.round((today.done / today.total) * 100) : 0
  const isComplete = pct === 100
  const statusLabel = isComplete ? 'completo!' : today.total === 0 ? 'sem hábitos' : 'em andamento'
  const statusBg = isComplete ? 'var(--grass)' : today.done > 0 ? '#dbeafe' : 'var(--background)'
  const statusColor = isComplete ? '#000000' : today.done > 0 ? '#1e40af' : 'var(--t3)'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10}}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--bg3)', border: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '3px 3px 0 var(--border)', flexShrink: 0,
        }}>
          <i className="ph ph-chart-bar" style={{ fontSize: 20, color: '#3b82f6' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', fontFamily: 'Indie Flower' }}>Hoje</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>progresso diário</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Ring */}
        <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
          <svg width="64" height="64" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg3)" strokeWidth="4" />
            <circle
              cx="18" cy="18" r="14" fill="none"
              stroke={isComplete ? '#22c55e' : '#3b82f6'}
              strokeWidth="4"
              strokeDasharray={`${pct} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, fontFamily: 'Indie Flower', color: 'var(--t1)',
          }}>
            {pct}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Indie Flower', color: 'var(--t1)' }}>
            {today.done}<span style={{ fontSize: 14, color: 'var(--t3)' }}>/{today.total}</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>hábitos feitos</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8,
            padding: '3px 10px', borderRadius: 99,
            background: statusBg,           border: `2px solid var(--border)`,
            fontSize: 11, fontWeight: 500, color: statusColor,
          }}>
            <i className={`ph ${isComplete ? 'ph-check-circle' : 'ph-clock'}`} style={{ fontSize: 11 }} />
            {statusLabel}
          </div>
        </div>
      </div>
    </div>
  )
}