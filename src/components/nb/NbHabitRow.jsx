import { NbCheck } from './NbCheck'
import './NbHabitRow.css'

const PRIORITY_DOT = { alta: '#FF6B6B', media: '#F59E0B', baixa: '#7CE577' }
const PRIORITY_LABEL = { alta: 'ALTA', media: 'MÉDIA', baixa: 'BAIXA' }

export function NbHabitRow({ name, priority = 'media', freq = 'diario', pts = 10, done = false, onToggle, className = '' }) {
  return (
    <div className={['nb-habit-row', done ? 'nb-habit-row--done' : '', className].filter(Boolean).join(' ')}>
      <NbCheck checked={done} onChange={onToggle} size={20} />

      <div className="nb-habit-row__body">
        <span className="nb-habit-row__name">{name}</span>
        <div className="nb-habit-row__meta">
          <span
            className="nb-habit-row__dot"
            style={{ background: PRIORITY_DOT[priority] }}
          />
          <span className="nb-habit-row__label">
            {PRIORITY_LABEL[priority]} · {freq === 'diario' ? 'DIÁRIO' : freq.toUpperCase()}
          </span>
        </div>
      </div>

      <span className={['nb-habit-row__io', done ? 'nb-habit-row__io--done' : ''].filter(Boolean).join(' ')}>
        +{pts} IO
      </span>
    </div>
  )
}