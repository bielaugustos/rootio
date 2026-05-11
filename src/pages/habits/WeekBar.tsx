export function WeekBar({ progress }: { progress: { date: string; done: number; total: number }[] }) {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div style={{
      display: 'flex',
      gap: 6,
      padding: '14px 16px',
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius-base)',
      boxShadow: '4px 4px 0 var(--border)',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {progress.map(({ date, done, total }) => {
        const pct = total > 0 ? done / total : 0
        const isToday = date === todayStr
        const day = new Date(date + 'T12:00:00').getDay()
        return (
          <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontSize: 10,
              color: isToday ? 'var(--main)' : 'var(--t3)',
              fontWeight: isToday ? 700 : 400,
            }}>
              {dayNames[day]}
            </span>
            <div style={{
              width: '100%',
              height: 48,
              background: 'var(--bg3, #e8e4dc)',
              borderRadius: 4,
              border: `2px solid ${isToday ? 'var(--main)' : 'transparent'}`,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: `${pct * 100}%`,
                background: pct === 1 ? 'var(--main)' : pct > 0 ? 'var(--b2)' : 'transparent',
                transition: 'height 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: 10, color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {total > 0 ? `${done}/${total}` : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}