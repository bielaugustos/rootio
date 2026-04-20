// Selos decorativos — conquistas, boas-vindas, destaque lendário
export function NbStamp({ children, variant = 'coral', rotate = -4, className = '' }) {
  const BG = {
    coral:  ['#FF6B6B', '#fff'],
    amber:  ['#F59E0B', '#fff'],
    grass:  ['#7CE577', '#111'],
    violet: ['#9B7BFF', '#fff'],
    ink:    ['#111111', '#FFD23F'],
    sun:    ['#FFD23F', '#111'],
  }
  const [bg, color] = BG[variant] ?? BG.coral
  return (
    <span
      className={['nb-stamp', className].filter(Boolean).join(' ')}
      style={{ background: bg, color, transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  )
}