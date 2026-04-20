// Barra de topo de cada tela — logo + título + slot direito
export function NbAppBar({ title, end, logoVariant = 'sun', logoContent, className = '' }) {
  const logoBg = logoVariant === 'violet' ? 'var(--violet)' : 'var(--sun)'
  const logoColor = logoVariant === 'violet' ? '#fff' : 'var(--ink)'
  return (
    <header className={['nb-appbar', className].filter(Boolean).join(' ')}>
      <div className="nb-appbar__logo" style={{ background: logoBg, color: logoColor }}>
        {logoContent ?? 'Ю'}
      </div>
      <span className="nb-appbar__title display">{title}</span>
      {end && <div className="nb-appbar__end">{end}</div>}
    </header>
  )
}