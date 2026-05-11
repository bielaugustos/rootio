import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTransactions, calcSummary, getGoals, type FinancialGoal } from '../../../engine/walletDB'
import { Button } from '../../../components/Button'

export function CarteiraWidget() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 })
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      getTransactions().then(txs => setSummary(calcSummary(txs))),
      getGoals().then(setGoals)
    ])
  }, [])

  const fmt = (v: number) => v.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  })

  const isUrgent = (deadline: string | null) => {
    if (!deadline) return false
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days <= 30 && days >= 0
  }

  const isPositive = summary.balance >= 0
  const total = summary.income + summary.expense
  const incomePct = total > 0 ? Math.round((summary.income / total) * 100) : 50
  const expensePct = 100 - incomePct

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--bg3)', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0 var(--border)', flexShrink: 0,
          }}>
            <i className="ph ph-wallet" style={{ fontSize: 18, color: '#10b981' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Carteira</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>finanças pessoais</div>
          </div>
        </div>
        <Button variant="neutral" size="tiny" onClick={() => navigate('/wallet')}>
          <i className="ph ph-arrow-right" style={{ fontSize: 14 }} />
        </Button>
      </div>

      {/* Saldo */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-mono)',
          color: isPositive ? '#15803d' : '#b91c1c', lineHeight: 1,
        }}>
          {fmt(summary.balance)}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: isPositive ? '#16a34a' : '#dc2626',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '2px 7px', borderRadius: 99,
          background: isPositive ? '#dcfce7' : '#fee2e2',
          border: `1.5px solid ${isPositive ? '#86efac' : '#fca5a5'}`,
        }}>
          {isPositive ? '▲ positivo' : '▼ negativo'}
        </span>
      </div>

      {/* Barra income vs expense */}
      {total > 0 && (
        <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', border: '1.5px solid var(--b2)' }}>
          <div style={{ width: `${incomePct}%`, background: '#22c55e', transition: 'width 0.4s ease' }} />
          <div style={{ width: `${expensePct}%`, background: '#f87171', transition: 'width 0.4s ease' }} />
        </div>
      )}

      {/* Income / Expense lado a lado */}
      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <div style={{
          flex: 1, padding: '10px 12px',
          background: 'var(--bg3)', border: '2px solid var(--b2)',
          borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #22c55e',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <i className="ph ph-trend-up" style={{ fontSize: 12, color: '#22c55e' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Entradas</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#15803d' }}>{fmt(summary.income)}</div>
        </div>
        <div style={{
          flex: 1, padding: '10px 12px',
          background: 'var(--bg3)', border: '2px solid var(--b2)',
          borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #f87171',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <i className="ph ph-trend-down" style={{ fontSize: 12, color: '#f87171' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Saídas</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#b91c1c' }}>{fmt(summary.expense)}</div>
        </div>
      </div>

      {/* Metas */}
      {goals.length > 0 && (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Metas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {goals.slice(0, 2).map(goal => {
              const pct = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0
              const urgent = isUrgent(goal.deadline)
              return (
                <div key={goal.id} style={{
                  padding: '8px 10px',
                  background: urgent ? '#fef2f2' : 'var(--bg3)',
                  border: `2px solid ${urgent ? '#fca5a5' : 'var(--b2)'}`,
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `4px solid ${urgent ? '#dc2626' : '#fbbf24'}`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)', marginBottom: 2 }}>{goal.name}</div>
                  <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--t3)', marginBottom: 4 }}>
                    {fmt(goal.saved)} / {fmt(goal.target)} ({pct}%)
                  </div>
                  <div style={{
                    height: 4,
                    borderRadius: 99,
                    overflow: 'hidden',
                    background: 'var(--bg2)',
                    border: '1px solid var(--b2)'
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: urgent ? '#dc2626' : '#fbbf24',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  {urgent && (
                    <div style={{ fontSize: 8, fontWeight: 700, color: '#dc2626', marginTop: 2 }}>
                      Vence em breve
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}