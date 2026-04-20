import './NbButton.css'

export function NbButton({
  children,
  variant = 'sun',   // sun | primary | ink | ghost | danger | violet | grass
  size = 'md',       // sm | md | lg
  block = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        'nb-btn',
        `nb-btn--${variant}`,
        `nb-btn--${size}`,
        block ? 'nb-btn--block' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}