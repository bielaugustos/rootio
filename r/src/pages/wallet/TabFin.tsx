import { useState, useMemo } from 'react'
import { PeriodPicker, type PeriodValue } from '../../components/PeriodPicker'
import { Button } from '../../components/Button'
import { calcSummary, filterByMonth, filterByQuarter, filterByYear, formatBRL } from '../../engine/walletDB'
import type { Transaction } from '../../engine/walletDB'
import { CATEGORY_COLORS, listContainerStyle, cardStyle } from './walletStyles'

type FinSubTab = 'lista' | 'detalhes'

export function TabFin({ txs, onRefresh, onDelete, isMobile }: { txs: Transaction[]; onRefresh: () => void; onDelete: (id: string) => void; isMobile: boolean }) {
  const [period, setPeriod] = useState<PeriodValue>(() => ({
    type: 'month', year: new Date().getFullYear(), month: new Date().getMonth() + 1, quarter: Math.floor(new Date().getMonth() / 3) + 1
  }))
  const [subTab, setSubTab] = useState<FinSubTab>('lista')

  // Memoizar filtragem para performance e pureza
  const { filteredTxs, summary, categories } = useMemo(() => {
    const filtered = period.type === 'month'
      ? filterByMonth(txs, `${period.year}-${String(period.month).padStart(2, '0')}`)
      : period.type === 'quarter' ? filterByQuarter(txs, period.year, period.quarter)
      : filterByYear(txs, period.year)

    const summary = calcSummary(filtered)

    // Agrupamento por categoria
    const byCat: Record<string, { total: number; type: 'income' | 'expense'; count: number }> = {}
    filtered.forEach(tx => {
      if (!byCat[tx.category]) byCat[tx.category] = { total: 0, type: tx.type, count: 0 }
      byCat[tx.category].total += tx.amount
      byCat[tx.category].count += 1
    })

    return {
      filteredTxs: filtered,
      summary,
      categories: Object.entries(byCat).sort((a, b) => b[1].total - a[1].total)
    }
  }, [txs, period])

  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      {/* Resumo Rápido */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <SummaryCard label="Entradas" value={summary.income} color="#10b981" />
        <SummaryCard label="Saídas" value={summary.expense} color="#f43f5e" />
      </div>

      <PeriodPicker value={period} onChange={setPeriod} id="tabfin-period" />

      {/* Navegação Interna */}
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <SubTabBtn active={subTab === 'lista'} onClick={() => setSubTab('lista')} icon="ph-list" label="Movimentações" />
        <SubTabBtn active={subTab === 'detalhes'} onClick={() => setSubTab('detalhes')} icon="ph-chart-bar" label="Detalhes" />
      </div>

      {subTab === 'lista' ? (
        <TransactionList txs={filteredTxs} onDelete={(id) => { onDelete(id); onRefresh() }} />
      ) : (
        <CategoryDetails categories={categories} totalIncome={summary.income} />
      )}
    </div>
  )
}

// Sub-componentes para limpeza visual
const SummaryCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{ ...cardStyle, flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
    <span style={labelStyle}>{label}</span>
    <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{formatBRL(value)}</span>
  </div>
)

const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--t3)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.06em' }

const SubTabBtn = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '5px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
      borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)',
      border: `var(--border-width) solid ${active ? 'var(--border)' : 'var(--b2)'}`,
      background: active ? 'var(--main)' : 'var(--secondary-background)',
      color: active ? 'var(--main-foreground)' : 'var(--t2)',
      boxShadow: active ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
      transform: active ? 'translate(var(--shadow-x), var(--shadow-y))' : 'none',
      transition: 'all 0.1s',
    }}
  >
    <i className={`ph ${icon}`} style={{ fontSize: 13 }} />
    {label}
  </button>
)

const TransactionList = ({ txs, onDelete }: { txs: Transaction[]; onDelete: (id: string) => void }) => (
  <div style={{ ...listContainerStyle }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--b2)', background: 'var(--bg3)' }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Movimentações · {txs.length}
      </span>
    </div>
    {txs.length === 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center', background: 'var(--secondary-background)' }}>
        <img src='/illustrations/walletmirrormoves.png' alt='' style={{ width: 120, height: 120, margin: 'auto' }} className='invert-element' />
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--t1)', marginBottom: 6 }}>Sem movimentações</div>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Registre entradas e saídas para acompanhar seu saldo.</div>
      </div>
    ) : (
      <div style={{ background: 'var(--secondary-background)' }}>
        {txs.map(tx => {
          const isIncome = tx.type === 'income'
          const color = isIncome ? '#22c55e' : '#ef4444'
          return (
            <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--b2)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: color + '18', border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color }}>
                <i className={`ph ph-arrow-${isIncome ? 'up' : 'down'}`} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{tx.category} · {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{isIncome ? '+' : '-'}{formatBRL(tx.amount)}</span>
              <Button variant="destructive" size="tiny" onClick={() => onDelete(tx.id)}>
                <i className="ph ph-trash" />
              </Button>
            </div>
          )
        })}
      </div>
    )}
  </div>
)

const CategoryDetails = ({ categories, totalIncome }: { categories: [string, { total: number; type: 'income' | 'expense'; count: number }][]; totalIncome: number }) => {
  const maxCatValue = categories.length > 0 ? Math.max(...categories.map(([, v]) => v.total)) : 1

  return (
    <div style={{ ...listContainerStyle }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--b2)', background: 'var(--bg3)' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resumo por categoria</span>
      </div>

      {categories.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>Nenhuma movimentação neste período.</div>
      ) : (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(['income', 'expense'] as const).map(type => {
            const cats = categories.filter(([, v]) => v.type === type)
            if (cats.length === 0) return null
            const isIncome = type === 'income'
            const dotColor = isIncome ? '#22c55e' : '#ef4444'
            return (
              <div key={type}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {isIncome ? 'Entradas' : 'Saídas'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cats.map(([cat, info]) => {
                    const pct = Math.round((info.total / maxCatValue) * 100)
                    const catColor = CATEGORY_COLORS[cat] ?? dotColor
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: catColor + '20', border: `1.5px solid ${catColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <i className={`ph ph-arrow-${isIncome ? 'up' : 'down'}`} style={{ fontSize: 12, color: catColor }} />
                            </div>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--t1)' }}>{cat}</span>
                              <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 6 }}>{info.count}x</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: catColor, fontFamily: 'var(--font-mono)' }}>
                              {isIncome ? '+' : '-'}{formatBRL(info.total)}
                            </div>
                            {!isIncome && totalIncome > 0 && (
                              <div style={{ fontSize: 10, color: 'var(--t3)' }}>{Math.round((info.total / totalIncome) * 100)}% da renda</div>
                            )}
                          </div>
                        </div>
                        <div style={{ height: 6, background: 'var(--b2)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: catColor, borderRadius: 4, transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div style={{ paddingTop: 12, borderTop: '1px solid var(--b2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--t3)' }}>{categories.reduce((sum, [, v]) => sum + v.count, 0)} transaç{categories.reduce((sum, [, v]) => sum + v.count, 0) === 1 ? 'ão' : 'ões'}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: categories.reduce((sum, [, v]) => sum + (v.type === 'income' ? v.total : -v.total), 0) >= 0 ? '#22c55e' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
              Saldo: {formatBRL(categories.reduce((sum, [, v]) => sum + (v.type === 'income' ? v.total : -v.total), 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}