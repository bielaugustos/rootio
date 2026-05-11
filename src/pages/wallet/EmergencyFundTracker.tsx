import { useState } from 'react'
import { Button } from '../../components/Button'

interface Aporte {
  id: string
  date: string
  value: number
}

interface EmergencyFundTrackerProps {
  totalGoal: number
  currentSavings: number
  aportes: Aporte[]
  aportPreview?: number   // valor digitado no form em tempo real
  onUndoAport: () => void
  onRemove: () => void
  onEdit: () => void
  onAport: (amount: number) => Promise<void>
  onOpenForm: (mode: 'emergency' | 'aport') => void
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function progressColor(pct: number) {
  if (pct <= 30) return '#ef4444'
  if (pct <= 70) return '#f59e0b'
  return '#22c55e'
}

export function EmergencyFundTracker({
  totalGoal, currentSavings, aportes,
  aportPreview = 0,
  onUndoAport, onRemove,
  onEdit, onAport, onOpenForm,
}: EmergencyFundTrackerProps) {
  const [showHistory, setShowHistory] = useState(false)

  const pct = totalGoal > 0 ? Math.min(100, (currentSavings / totalGoal) * 100) : 0
  const pctPreview = totalGoal > 0 ? Math.min(100, ((currentSavings + aportPreview) / totalGoal) * 100) : pct
  const color = progressColor(pct)
  const remaining = Math.max(0, totalGoal - currentSavings)
  const monthsLeft = remaining > 0 ? Math.ceil(remaining / 1500) : 0

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Barra de progresso principal */}
      <div style={{
        padding: '20px', border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)', background: 'var(--secondary-background)',
        boxShadow: '4px 4px 0 var(--border)',
      }}>
        {/* Valores */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Guardado</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-mono)', color, lineHeight: 1 }}>{fmtBRL(currentSavings)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Meta</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--t2)' }}>{fmtBRL(totalGoal)}</div>
          </div>
        </div>

        {/* Barra */}
        <div style={{ height: 10, background: 'var(--bg3)', border: '1.5px solid var(--b2)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
          {aportPreview > 0 && (
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${pctPreview}%`, background: '#86efac',
              transition: 'width 0.3s ease',
            }} />
          )}
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${pct}%`, background: color,
            marginTop: aportPreview > 0 ? '-100%' : 0,
          }} />
        </div>

        {/* % e restante */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
            {Math.round(pct)}% concluído
          </span>
          {remaining > 0 && (
            <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
              Faltam {fmtBRL(remaining)} · ~{monthsLeft} {monthsLeft === 1 ? 'mês' : 'meses'}
            </span>
          )}
          {remaining === 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#15803d',
              background: '#dcfce7', border: '1.5px solid #86efac',
              padding: '2px 8px', borderRadius: 99,
            }}>
              ✓ Meta atingida!
            </span>
          )}
        </div>
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" onClick={() => aportPreview > 0 ? onAport(aportPreview) : onOpenForm('aport')} style={{ flex: 1 }}>
          <i className="ph ph-piggy-bank" style={{ fontSize: 14 }} />
          Aportar
        </Button>
        <Button size="sm" variant="neutral" onClick={onEdit}>
          <i className="ph ph-pencil-simple" style={{ fontSize: 14 }} />
          Meta
        </Button>
        <Button size="sm" variant="destructive" onClick={onRemove}>
          <i className="ph ph-trash" style={{ fontSize: 14 }} />
        </Button>
      </div>

      {/* Histórico de aportes */}
      {aportes.length > 0 && (
        <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', background: 'var(--secondary-background)', boxShadow: '4px 4px 0 var(--border)', overflow: 'hidden' }}>
          <button
            onClick={() => setShowHistory(h => !h)}
            style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--bg3)', border: 'none',
              borderBottom: showHistory ? '1px solid var(--b2)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ph ph-clock-clockwise" style={{ fontSize: 14, color: 'var(--t2)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Histórico de aportes ({aportes.length})
              </span>
            </div>
            <i className={`ph ph-caret-${showHistory ? 'up' : 'down'}`} style={{ fontSize: 12, color: 'var(--t3)' }} />
          </button>

          {showHistory && (
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {[...aportes].reverse().map((a, idx) => {
                const isLast = idx === 0
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: idx < aportes.length - 1 ? '1px solid var(--b2)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#22c55e', flexShrink: 0,
                      }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--font-mono)' }}>
                          {fmtBRL(a.value)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{fmtDate(a.date)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px',
                        background: '#dcfce7', color: '#15803d',
                        border: '1.5px solid #86efac', borderRadius: 99,
                      }}>aporte</span>
                      {isLast && (
                        <button
                          onClick={onUndoAport}
                          title="Desfazer último aporte"
                          style={{
                            width: 24, height: 24, border: '1.5px solid var(--b2)',
                            background: 'var(--bg3)', borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <i className="ph ph-arrow-counter-clockwise" style={{ fontSize: 12, color: 'var(--t3)' }} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}