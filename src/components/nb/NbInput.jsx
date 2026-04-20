import './NbInput.css'

export function NbInput({ value, onChange, placeholder, type = 'text', disabled = false, className = '', ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value, e)}
      placeholder={placeholder}
      disabled={disabled}
      className={['nb-input', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}