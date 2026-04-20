// Gráfico de linha jagged para histórico de IO — sem biblioteca externa
export function NbSparkline({ data = [], label = 'HOJE', startLabel, className = '' }) {
  if (!data.length) return null
  const W = 280, H = 80
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * W,
    y: H - ((v - min) / range) * (H - 8) - 4,
  }))

  const stroke = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  ).join(' ')

  const fill = stroke
    + ` L${points[points.length - 1].x.toFixed(1)},${H} L0,${H} Z`

  return (
    <div className={['nb-spark-wrap', className].filter(Boolean).join(' ')}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        width="100%"
        height="90"
        className="nb-spark-svg"
      >
        {/* Área preenchida amber */}
        <path d={fill} fill="#F59E0B" fillOpacity="0.6" stroke="none" />
        {/* Linha jagged ink — sem curvas Bezier */}
        <path d={stroke} fill="none" stroke="#111111" strokeWidth="3" strokeLinejoin="miter" />
      </svg>
      <div className="nb-spark-labels">
        <span>{startLabel ?? ''}</span>
        <span>{label}</span>
      </div>
    </div>
  )
}