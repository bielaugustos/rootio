import './NbCheck.css'

const CheckMark = () => (
  <svg width="12" height="10" viewBox="0 0 14 11">
    <path d="M1 5l4 4 8-8" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="square" />
  </svg>
)

export function NbCheck({ checked = false, onChange, disabled = false, size = 22, className = '' }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={['nb-check', checked ? 'nb-check--on' : '', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    >
      {checked && <CheckMark />}
    </button>
  )
}