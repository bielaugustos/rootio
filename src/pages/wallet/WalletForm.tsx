import { useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { DatePicker } from '../../components/DatePicker'
import { useTheme } from '../../engine/useTheme'
import { type TxType, type FinancialGoal } from '../../engine/walletDB'

export type WalletFormMode = 'transaction' | 'goal' | 'emergency' | 'aport'

export interface WalletFormData {
  mode: WalletFormMode
  type?: TxType
  amount?: string
  description?: string
  category?: string
  date?: string
  goalName?: string
  goalTarget?: string
  goalSaved?: string
  goalUnit?: string
  goalDeadline?: string
  emergencyTarget?: string
  emergencyCurrent?: string
}

interface WalletFormProps {
  mode: WalletFormMode
  initialType?: TxType
  editGoal?: FinancialGoal
  initialEmergency?: { current: number; target: number }
  onSave: (data: WalletFormData) => void
  onClose: () => void
  onAportPreviewChange?: (value: number) => void
  title?: string
  isMobile?: boolean
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: 'var(--t3)',
      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function FormField({ children, label, last }: { children: React.ReactNode; label?: string; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 20 }}>
      {label && <FormLabel>{label}</FormLabel>}
      {children}
    </div>
  )
}

function ValueField({ label, value, onChange, id, error }: {
  label: string; value: number; onChange: (v: number) => void; id?: string; error?: string
}) {
  return (
    <FormField label={label}>
      <Input
        id={id}
        placeholder="Valor em R$..."
        value={value > 0 ? String(value) : ''}
        error={error}
        onChange={v => { const n = parseFloat(v.replace(',', '.')); onChange(isNaN(n) ? 0 : n) }}
      />
    </FormField>
  )
}

// Tags pill estilo action — clicáveis, selecionáveis
function ActionPills({ items, selected, onSelect, color }: {
  items: string[]
  selected: string
  onSelect: (v: string) => void
  color?: string
}) {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
      {items.map(item => {
        const active = selected === item
        return (
          <button
            key={item}
            onClick={() => onSelect(active ? '' : item)}
            style={{
              padding: '5px 12px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', borderRadius: 99, fontFamily: 'var(--font-sans)',
              border: `2px solid ${active ? (color ?? 'var(--border)') : 'var(--b2)'}`,
              background: active ? (color ? color + '18' : 'var(--main)') : 'var(--bg3)',
              color: active ? (color ?? 'var(--main-foreground)') : 'var(--t2)',
              boxShadow: active ? `2px 2px 0 ${color ?? 'var(--border)'}` : 'none',
              transition: 'all 0.12s',
            }}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

const GOAL_SUGGESTIONS = ['Viagem', 'Carro', 'Casa', 'Casamento', 'Formatura', 'Emergência', 'Aposentadoria', 'Eletrônico']
const SUGGESTED_EMERGENCY = [3000, 5000, 10000, 15000, 20000]

export function WalletForm({ mode, initialType = 'expense', editGoal, initialEmergency, onSave, onClose, onAportPreviewChange, title, isMobile }: WalletFormProps) {
  const { mode: themeMode } = useTheme()
  const iconColor = themeMode === 'dark' ? '#fff' : '#000'

  const [txType, setTxType]   = useState<TxType>(initialType)
  const [amount, setAmount]   = useState(0)
  const [desc, setDesc]       = useState('')
  const [goalName, setGoalName]         = useState(editGoal?.name ?? '')
  const [goalTarget, setGoalTarget]     = useState(editGoal?.target ?? 0)
  const [goalSaved, setGoalSaved]       = useState(editGoal?.saved ?? 0)
  const [goalDeadline, setGoalDeadline] = useState(editGoal?.deadline ?? '')
  const [emergencyTarget, setEmergencyTarget]   = useState(initialEmergency?.target ?? 0)
  const [emergencyCurrent, setEmergencyCurrent] = useState(initialEmergency?.current ?? 0)
  const [saveError, setSaveError] = useState('')

  const remaining = initialEmergency ? initialEmergency.target - initialEmergency.current : 0
  const aportError = mode === 'aport' && emergencyTarget > remaining
    ? 'O aporte não pode ser maior que o valor restante' : undefined

  const handleSave = () => {
    if (mode === 'aport' && aportError) { setSaveError(aportError); return }
    setSaveError('')
    onSave({
      mode, type: txType,
      amount: String(amount), description: desc, category: 'Outros',
      date: new Date().toISOString().split('T')[0],
      goalName, goalTarget: String(goalTarget), goalSaved: String(goalSaved),
      goalUnit: 'R$', goalDeadline,
      emergencyTarget: String(emergencyTarget), emergencyCurrent: String(emergencyCurrent),
    })
  }

  const formTitle = title ?? (
    mode === 'transaction' ? 'Nova transação' :
    mode === 'goal' ? (editGoal ? 'Editar meta' : 'Nova meta') :
    mode === 'aport' ? 'Novo aporte' : 'Reserva de emergência'
  )

  const modeIcon: Record<WalletFormMode, string> = {
    transaction: 'ph-arrows-left-right',
    goal: 'ph-target',
    aport: 'ph-piggy-bank',
    emergency: 'ph-shield-check',
  }

  const isIncome = txType === 'income'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 1,
        background: 'var(--secondary-background)',
        borderBottom: '2px solid var(--border)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className={`ph ${modeIcon[mode]}`} style={{ fontSize: 18, color: iconColor }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{formTitle}</span>
        </div>
        <Button size="tiny" variant="neutral" onClick={onClose}>
          <i className="ph ph-x" style={{ fontSize: 14 }} />
        </Button>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>

        {/* ── Transação ── */}
        {mode === 'transaction' && (
          <>
            <FormField label="Tipo">
              <div style={{
                display: 'flex', border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)', overflow: 'hidden',
                boxShadow: '4px 4px 0 var(--border)',
              }}>
                {([['income', '+ Entrada', '#22c55e'], ['expense', '− Saída', '#ef4444']] as const).map(([t, label, color]) => (
                  <button key={t} onClick={() => { setTxType(t); setDesc(''); setAmount(0) }} style={{
                    flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 800,
                    cursor: 'pointer', border: 'none', outline: 'none',
                    borderRight: t === 'income' ? '2px solid var(--border)' : 'none',
                    background: txType === t ? color : 'var(--secondary-background)',
                    color: txType === t ? '#fff' : 'var(--t3)',
                    transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                  }}>{label}</button>
                ))}
              </div>
            </FormField>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
              padding: '8px 12px',
              background: isIncome ? '#f0fdf4' : '#fef2f2',
              border: `1.5px solid ${isIncome ? '#86efac' : '#fca5a5'}`,
              borderRadius: 'var(--radius-sm)',
            }}>
              <i className={`ph ${isIncome ? 'ph-trend-up' : 'ph-trend-down'}`}
                style={{ fontSize: 14, color: isIncome ? '#16a34a' : '#dc2626' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: isIncome ? '#15803d' : '#b91c1c' }}>
                {isIncome ? 'Vai aumentar seu saldo' : 'Vai reduzir seu saldo'}
              </span>
            </div>

            <FormField label="Valor">
              <Input id="tx-amount" placeholder="Valor em R$..."
                value={amount > 0 ? String(amount) : ''}
                onChange={v => { const n = parseFloat(v.replace(',', '.')); setAmount(isNaN(n) ? 0 : n) }}
              />
              <ActionPills
                items={(isIncome ? [500, 1000, 2000, 3000, 5000] : [20, 50, 100, 200, 500]).map(v => `R$ ${v.toLocaleString('pt-BR')}`)}
                selected={amount > 0 ? `R$ ${amount.toLocaleString('pt-BR')}` : ''}
                onSelect={v => { const n = parseInt(v.replace(/\D/g, '')); setAmount(isNaN(n) ? 0 : n) }}
                color={isIncome ? '#22c55e' : '#ef4444'}
              />
            </FormField>

            <FormField label="Descrição">
              <Input id="tx-desc" placeholder="Ex: Mercado, Salário..." value={desc} onChange={setDesc} />
              <ActionPills
                items={isIncome
                  ? ['Salário', 'Freelance', 'Aluguel', 'Dividendos', 'Bônus', 'Presente']
                  : ['Mercado', 'Aluguel', 'Transporte', 'Saúde', 'Lazer', 'Restaurante', 'Assinatura']
                }
                selected={desc}
                onSelect={setDesc}
              />
            </FormField>

            <FormField label="Data (opcional)">
              <DatePicker value={goalDeadline} onChange={setGoalDeadline} placeholder="Selecionar data..." />
            </FormField>
          </>
        )}

        {/* ── Meta ── */}
        {mode === 'goal' && (
          <>
            <FormField label="Nome da meta">
              <Input id="goal-name" placeholder="Ex: Viagem" value={goalName} onChange={setGoalName} />
              <ActionPills items={GOAL_SUGGESTIONS} selected={goalName} onSelect={setGoalName} />
            </FormField>
            <ValueField label="Valor atual" value={goalSaved} onChange={setGoalSaved} id="goal-saved" />
            <ValueField label="Valor alvo" value={goalTarget} onChange={setGoalTarget} id="goal-target" />
            {goalTarget > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                  <span>Progresso</span>
                  <span>{Math.min(100, Math.round((goalSaved / goalTarget) * 100))}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg3)', border: '1.5px solid var(--b2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99, background: 'var(--main)',
                    width: `${Math.min(100, (goalSaved / goalTarget) * 100)}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
            <FormField label="Prazo (opcional)">
              <DatePicker value={goalDeadline} onChange={setGoalDeadline} placeholder="Selecionar prazo..." />
            </FormField>
          </>
        )}

        {/* ── Reserva ── */}
        {mode === 'emergency' && (
          <>
            <ValueField label="Valor inicial" value={emergencyCurrent} onChange={setEmergencyCurrent} id="em-current" />
            <FormField label="Valor alvo">
              <Input id="em-target" placeholder="Valor em R$..."
                value={emergencyTarget > 0 ? String(emergencyTarget) : ''}
                onChange={v => { const n = parseFloat(v.replace(',', '.')); setEmergencyTarget(isNaN(n) ? 0 : n) }}
              />
              <ActionPills
                items={SUGGESTED_EMERGENCY.map(v => `R$ ${v.toLocaleString('pt-BR')}`)}
                selected={emergencyTarget > 0 ? `R$ ${emergencyTarget.toLocaleString('pt-BR')}` : ''}
                onSelect={v => { const n = parseInt(v.replace(/\D/g, '')); setEmergencyTarget(isNaN(n) ? 0 : n) }}
              />
            </FormField>
          </>
        )}

        {/* ── Aporte ── */}
        {mode === 'aport' && (
          <>
            {/* Contexto — meta ou reserva */}
            {(editGoal || initialEmergency) && (() => {
              const isMeta = !!editGoal
              const name    = isMeta ? editGoal!.name : 'Reserva de emergência'
              const current = isMeta ? (editGoal!.saved ?? 0) : (initialEmergency!.current)
              const target  = isMeta ? editGoal!.target : initialEmergency!.target
              const remaining = Math.max(0, target - current)
              const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0

              return (
                <div style={{
                  padding: '12px 14px', marginBottom: 20,
                  background: 'var(--bg3)', border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', boxShadow: '3px 3px 0 var(--border)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>{name}</div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Guardado</div>
                      <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#22c55e', marginTop: 2 }}>
                        {current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div style={{ width: 1, background: 'var(--b2)' }} />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Restante</div>
                      <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--t1)', marginTop: 2 }}>
                        {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div style={{ width: 1, background: 'var(--b2)' }} />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Meta</div>
                      <div style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--t2)', marginTop: 2 }}>
                        {target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg3)', border: '1.5px solid var(--b2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#22c55e', borderRadius: 99 }} />
                  </div>
                </div>
              )
            })()}

            <FormField label="Valor do aporte">
              <Input
                id="aport-amount"
                placeholder="Valor em R$..."
                value={emergencyTarget > 0 ? String(emergencyTarget) : ''}
                error={aportError}
                onChange={v => {
                  const n = parseFloat(v.replace(',', '.'))
                  const val = isNaN(n) ? 0 : n
                  setEmergencyTarget(val)
                  onAportPreviewChange?.(val)
                }}
              />
              <ActionPills
                items={[50, 100, 200, 500, 1000].map(v => `R$ ${v.toLocaleString('pt-BR')}`)}
                selected={emergencyTarget > 0 ? `R$ ${emergencyTarget.toLocaleString('pt-BR')}` : ''}
                onSelect={v => {
                  const n = parseInt(v.replace(/\D/g, ''))
                  const val = isNaN(n) ? 0 : n
                  setEmergencyTarget(val)
                  onAportPreviewChange?.(val)
                }}
                color="#22c55e"
              />
            </FormField>

            {/* Preview da barra após aporte */}
            {emergencyTarget > 0 && (() => {
              const isMeta = !!editGoal
              const current = isMeta ? (editGoal!.saved ?? 0) : (initialEmergency?.current ?? 0)
              const target  = isMeta ? editGoal!.target : (initialEmergency?.target ?? 0)
              if (target <= 0) return null
              const pctBefore = Math.min(100, (current / target) * 100)
              const pctAfter  = Math.min(100, ((current + emergencyTarget) / target) * 100)
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', fontWeight: 600, marginBottom: 6 }}>
                    <span>Após este aporte</span>
                    <span style={{ color: '#22c55e' }}>
                      {(current + emergencyTarget).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })} · {Math.round(pctAfter)}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg3)', border: '1.5px solid var(--b2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: `${pctAfter}%`, background: '#86efac', transition: 'width 0.3s ease' }} />
                    <div style={{ height: '100%', borderRadius: 99, width: `${pctBefore}%`, background: '#22c55e', marginTop: '-100%' }} />
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {saveError && (
          <div style={{
            padding: '10px 14px', marginBottom: 16,
            background: '#fef2f2', border: '2px solid #f87171',
            borderRadius: 'var(--radius-sm)', fontSize: 12, color: '#b91c1c', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ph ph-warning" style={{ fontSize: 14 }} />
            {saveError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 20, marginTop: 4, borderTop: '1px solid var(--b2)' }}>
          <Button label="Cancelar" variant="neutral" onClick={onClose} />
          <Button label="Salvar" onClick={handleSave} style={{ flex: isMobile ? 1 : undefined }} />
        </div>
      </div>
    </div>
  )
}