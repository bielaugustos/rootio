import './NbSwitch.css'

export function NbSwitch({ checked = false, onCheckedChange, disabled = false, className = '' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={['nb-switch', checked ? 'nb-switch--on' : '', className].filter(Boolean).join(' ')}
    >
      <span className="nb-switch__thumb" />
    </button>
  )
}