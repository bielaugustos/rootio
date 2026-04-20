import './NbTicker.css'

const Lightning = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
    <path d="M5.5 0L0 7h4l-.5 5L10 4H6L6.5 0z" />
  </svg>
)

export function NbTicker({ value, showIcon = true, variant = 'default', size = 'md', className = '' }) {
  return (
    <span className={['nb-ticker', `nb-ticker--${variant}`, `nb-ticker--${size}`, className].filter(Boolean).join(' ')}>
      {showIcon && <Lightning />}
      {value}
    </span>
  )
}