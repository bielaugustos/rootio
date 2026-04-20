export function NbSwitch({ 
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn('relative flex-shrink-0', className)}
      style={{
        width:        56,
        height:       28,
        background:   checked ? '#F59E0B' : '#111111',
        border:       '3px solid #111111',
        borderRadius: 0,
        boxShadow:    '4px 4px 0 0 #111111',
        cursor:       disabled ? 'not-allowed' : 'pointer',
        opacity:      disabled ? 0.45 : 1,
        transition:   'background 0.12s ease',
        padding:      0,
        outline:      'none',
      }}
    >
      {/* Thumb */}
      <span
        aria-hidden
        style={{
          position:   'absolute',
          top:        -3,                          // sobrepõe borda superior
          left:       checked ? 28 : -3,           // -3 = sobrepõe borda esquerda
          width:      28,
          height:     28,
          background: checked ? '#FFD23F' : '#FFFFFF',
          border:     '3px solid #111111',
          borderRadius: 0,
          transition: 'left 0.12s ease, background 0.12s ease',
          display:    'block',
        }}
      />
    </button>
  )
}