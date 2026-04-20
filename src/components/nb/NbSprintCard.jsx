import { NbProgress } from './NbProgress'
import { NbTag } from './NbTag'

export function NbSprintCard({ name, period, currentDay, totalDays, description, pct, onClick, className = '' }) {
  const daysLeft = totalDays - currentDay
  return (
    <div
      className={['nb-sprint-card', onClick ? 'nb-sprint-card--clickable' : '', className].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <div className="nb-sprint-card__header">
        <span className="label">{period}</span>
        <NbTag variant="amber" size="sm">DIA {currentDay}/{totalDays}</NbTag>
      </div>
      <h5 className="nb-sprint-card__name display">{name}</h5>
      {description && <p className="nb-sprint-card__desc">{description}</p>}
      <NbProgress value={pct} height={12} />
      <div className="nb-sprint-card__footer">
        <span className="mono" style={{ fontSize: 11 }}>{pct}% concluído</span>
        <span className="mono" style={{ fontSize: 11 }}>{daysLeft} dias restantes</span>
      </div>
    </div>
  )
}