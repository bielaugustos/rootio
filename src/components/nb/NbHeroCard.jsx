import { NbButton } from './NbButton'
import './NbHeroCard.css'

export function NbHeroCard({ kicker, title, description, actionLabel, onAction, className = '' }) {
  return (
    <div className={['nb-hero', className].filter(Boolean).join(' ')}>
      <div className="nb-hero__deco" aria-hidden />
      <div className="nb-hero__content">
        {kicker && <p className="nb-hero__kicker">{kicker}</p>}
        <h3 className="nb-hero__title display">{title}</h3>
        {description && <p className="nb-hero__desc">{description}</p>}
        {actionLabel && onAction && (
          <NbButton variant="primary" block onClick={onAction}>
            <span>{actionLabel}</span>
            <span>→</span>
          </NbButton>
        )}
      </div>
    </div>
  )
}