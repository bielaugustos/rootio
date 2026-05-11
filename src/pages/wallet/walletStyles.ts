import type { FinPeriod } from './walletTypes'

export const cardStyle = {
  border: '2px solid var(--border)',
  borderRadius: 'var(--radius-base)',
  background: 'var(--secondary-background)',
  boxShadow: '4px 4px 0 var(--border)',
  overflow: 'hidden',
  width: '100%',
  boxSizing: 'border-box',
} as const

export const listContainerStyle = {
  border: '2px solid var(--border)',
  borderRadius: 'var(--radius-base)',
  overflow: 'hidden',
  boxShadow: '4px 4px 0 var(--border)',
} as const

export const cardInteractiveStyle = {
  ...cardStyle,
  cursor: 'pointer',
  transition: 'box-shadow 0.1s',
} as const

export const headerSecondaryStyle = {
  padding: '10px 16px',
  borderBottom: '1px solid var(--b2)',
  background: 'var(--bg3, #e8e4dc)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
} as const

export const labelStyle = {
  fontSize: 11,
  color: 'var(--t3)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
} as const

export const titleStyle = {
  fontSize: 28,
  fontWeight: 900,
  color: 'var(--t1)',
} as const

export const monoStyle = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 900,
} as const

export const buttonBaseStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '5px 14px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-sans)',
  border: 'var(--border-width) solid',
  transition: 'all 0.1s',
} as const

export function balanceColor(balance: number) {
  return balance >= 0 ? '#22c55e' : '#ef4444'
}

export function incomeExpenseColor(isIncome: boolean) {
  return isIncome ? '#22c55e' : '#ef4444'
}

export const CATEGORY_COLORS: Record<string, string> = {
  Salário: '#22c55e',
  Freelance: '#10b981',
  Investimentos: '#6366f1',
  Presente: '#ec4899',
  Reembolso: '#14b8a6',
  Alimentação: '#f97316',
  Transporte: '#3b82f6',
  Moradia: '#8b5cf6',
  Saúde: '#ef4444',
  Educação: '#f59e0b',
  Lazer: '#06b6d4',
  Roupas: '#d946ef',
  Assinaturas: '#64748b',
  Outros: '#94a3b8',
}

export function categoryColor(category: string, type: 'income' | 'expense'): string {
  return CATEGORY_COLORS[category] ?? (type === 'income' ? '#22c55e' : '#ef4444')
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function periodLabel(period: FinPeriod, month: string, year: number, quarter: number): string {
  if (period === 'month') return monthLabel(month)
  if (period === 'quarter') return `${year} - Q${quarter}`
  return `${year}`
}