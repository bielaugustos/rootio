// Indicadores de status e prioridade
export function NbDot({ color = 'ink', size = 10, className = '' }) {
  const COLORS = {
    ink: '#111111', amber: '#F59E0B', grass: '#7CE577',
    coral: '#FF6B6B', sky: '#6FB8FF', violet: '#9B7BFF',
  }
  return (
    <span
      className={['nb-dot', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, background: COLORS[color] ?? COLORS.ink }}
    />
  )
}