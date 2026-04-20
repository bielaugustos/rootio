import './NbCard.css'

export function NbCard({
  children,
  variant = 'default',  // default | dark | amber | sun | grass | violet | paper
  padding = 16,
  shadow = 'lg',        // sm | md | lg | xl
  className = '',
  style = {},
  onClick,
}) {
  return (
    <div
      className={['nb-card', `nb-card--${variant}`, `nb-card--sh-${shadow}`, onClick ? 'nb-card--clickable' : '', className].filter(Boolean).join(' ')}
      style={{ padding, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}