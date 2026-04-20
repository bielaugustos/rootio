// Navegação inferior mobile — 5 abas
// Icons: SVG paths inline extraídos do storybook
const ICONS = {
  hoje: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 8l7-6 7 6v8H2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square"/>
    </svg>
  ),
  habitos: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square"/>
    </svg>
  ),
  financas: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v14M4 6h8M3 11h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
    </svg>
  ),
  progresso: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 2h8l-1 8H6L5 2zM4 14h10M9 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none"/>
    </svg>
  ),
  perfil: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 16c1-3 3-5 6-5s5 2 6 5" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
}

export function NbBottomNav({ active = 'hoje', onNavigate, className = '' }) {
  const tabs = [
    { id: 'hoje',      label: 'Hoje'     },
    { id: 'habitos',   label: 'Hábitos'  },
    { id: 'financas',  label: '$'        },
    { id: 'progresso', label: 'Prog.'    },
    { id: 'perfil',    label: 'Perfil'   },
  ]
  return (
    <nav
      className={['nb-bottom-nav', className].filter(Boolean).join(' ')}
      style={{ boxShadow: '0 -3px 0 0 #111111' }}
    >
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onNavigate?.(t.id)}
          className={['nb-bottom-nav__tab', t.id === active ? 'nb-bottom-nav__tab--active' : ''].filter(Boolean).join(' ')}
        >
          {ICONS[t.id]}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}