import { NbProgress } from './NbProgress'
import './NbLevelMeter.css'

export function NbLevelMeter({ nivel = 1, titulo = '', xpAtual = 0, xpProx, streak = 0, compact = false, className = '' }) {
  const pct = xpProx ? Math.min(100, Math.round((xpAtual / xpProx) * 100)) : 100
  const faltam = xpProx ? xpProx - xpAtual : 0

  if (compact) return (
    <div className={['nb-lvl-compact', className].filter(Boolean).join(' ')}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span className="label">{titulo.toUpperCase()}</span>
        <span className="mono" style={{ fontSize:11 }}>{xpAtual} / {xpProx ?? '∞'} XP</span>
      </div>
      <NbProgress value={pct} height={12} />
    </div>
  )

  return (
    <div className={['nb-lvl', className].filter(Boolean).join(' ')}>
      <div className="nb-lvl__badge">
        <span className="nb-lvl__badge-label mono">NÍVEL</span>
        <span className="nb-lvl__badge-num display">{nivel}</span>
      </div>
      <div className="nb-lvl__meta">
        <span className="label">{titulo.toUpperCase()}</span>
        <h4 className="display" style={{ fontSize:20, margin:'4px 0 6px' }}>
          {xpAtual} / {xpProx ?? '∞'} XP
        </h4>
        <NbProgress value={pct} height={18} />
        <div className="nb-lvl__row">
          <span>{faltam > 0 ? `↗ ${faltam} IO até nível ${nivel + 1}` : 'Nível máximo'}</span>
          <span>STREAK {streak}d</span>
        </div>
      </div>
    </div>
  )
}