// Slots de itens equipados (avatar / tema / elite) na tela de Perfil
export function NbProfileEquipped({ avatar, theme, themeBg, elite, onTrocar, className = '' }) {
  const slots = [
    { label: 'avatar', value: avatar,  bg: null,    empty: !avatar },
    { label: 'tema',   value: theme,   bg: themeBg, empty: !theme },
    { label: 'elite',  value: elite,   bg: null,    empty: !elite },
  ]
  return (
    <div className={['nb-equipped', className].filter(Boolean).join(' ')}>
      <div className="nb-equipped__header">
        <span className="label">EQUIPADO</span>
        {onTrocar && (
          <button className="nb-equipped__trocar" onClick={onTrocar}>
            Trocar →
          </button>
        )}
      </div>
      <div className="nb-equipped__grid">
        {slots.map(s => (
          <div
            key={s.label}
            className={['nb-equipped__slot', s.empty ? 'nb-equipped__slot--empty' : ''].filter(Boolean).join(' ')}
            style={s.bg && !s.empty ? { background: s.bg } : undefined}
          >
            <span className="nb-equipped__slot-icon">{s.empty ? '＋' : s.value}</span>
            <span className="nb-equipped__slot-label mono">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}