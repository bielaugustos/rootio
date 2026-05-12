import type { ReactNode } from 'react'

interface PieSlice {
  label: string
  value: number
  color: string
}

interface PieChartProps {
  data: PieSlice[]
  size?: number
  innerRadius?: number
  showLabels?: boolean
  centerValue?: string
  centerLabel?: string
}

// Cores estilo Accruo - vibrantes e modernas
const ACCRUO_COLORS = {
  income: '#10b981',
  expense: '#f43f5e',
}

// Cores mais vibrantes para categorias
const VIBRANT_COLORS: Record<string, string> = {
  'Salário': '#10b981',
  'Freelance': '#14b8a6',
  'Investimentos': '#8b5cf6',
  'Presente': '#ec4899',
  'Reembolso': '#06b6d4',
  'Alimentação': '#f97316',
  'Transporte': '#3b82f6',
  'Moradia': '#a855f7',
  'Saúde': '#f43f5e',
  'Educação': '#eab308',
  'Lazer': '#06b6d4',
  'Roupas': '#d946ef',
  'Assinaturas': '#64748b',
  'Outros': '#94a3b8',
}

export function getVibrantColor(category: string, fallback: string): string {
  return VIBRANT_COLORS[category] || fallback
}

export function PieChart({ data, size = 160, innerRadius = 40, showLabels = true, centerValue, centerLabel }: PieChartProps) {
  const total = data.reduce((sum, s) => sum + s.value, 0)
  
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={(size - 8) / 2} fill="none" stroke="var(--b2)" strokeWidth={4} />
      </svg>
    )
  }

  const radius = (size - 8) / 2
  const centerX = size / 2
  const centerY = size / 2
  const innerR = innerRadius

  let currentAngle = -90
  const slices: ReactNode[] = []
  const labels: ReactNode[] = []

  data.forEach((slice) => {
    const percentage = (slice.value / total) * 100
    if (percentage <= 0) return

    const angle = (slice.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)

    const x3 = centerX + innerR * Math.cos(endRad)
    const y3 = centerY + innerR * Math.sin(endRad)
    const x4 = centerX + innerR * Math.cos(startRad)
    const y4 = centerY + innerR * Math.sin(startRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathD = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`

    slices.push(
      <path
        key={slice.label}
        d={pathD}
        fill={slice.color}
      />
    )

    if (showLabels && percentage >= 8) {
      const midAngle = startAngle + angle / 2
      const midRad = (midAngle * Math.PI) / 180
      const labelRadius = (radius + innerR) / 2
      const labelX = centerX + labelRadius * Math.cos(midRad)
      const labelY = centerY + labelRadius * Math.sin(midRad)

      labels.push(
        <text
          key={`label-${slice.label}`}
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: size > 150 ? 12 : 10,
            fontWeight: 500,
            fill: '#fff',
            pointerEvents: 'none',
          }}
        >
          {Math.round(percentage)}%
        </text>
      )
    }
  })

  const fontSize = size > 150 ? 20 : 16

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
        {labels}
      </svg>
      {centerValue && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.1,
            color: 'var(--t1)',
          }}>
            {centerValue}
          </div>
          {centerLabel && (
            <div style={{
              fontSize: 10,
              fontWeight: 400,
              color: 'var(--t3)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 2,
            }}>
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { ACCRUO_COLORS }