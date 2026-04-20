import './NbProgress.css'

export function NbProgress({ value = 0, color = 'amber', height = 18, className = '' }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div
      className={['nb-prog', `nb-prog--${color}`, className].filter(Boolean).join(' ')}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i style={{ width: `${pct}%` }} />
    </div>
  )
}