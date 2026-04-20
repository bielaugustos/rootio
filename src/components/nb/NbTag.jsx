import './NbTag.css'

export function NbTag({ children, variant = 'default', size = 'md', className = '' }) {
  return (
    <span className={['nb-tag', `nb-tag--${variant}`, `nb-tag--${size}`, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}