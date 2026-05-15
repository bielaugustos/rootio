import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import { supabase } from './supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

export type TxType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  type: TxType
  amount: number       // sempre positivo
  description: string
  category: string
  date: string         // "YYYY-MM-DD"
  created_at: string
}

// ── Categories ────────────────────────────────────────────────────────────────

export const CATS_IN  = ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Reembolso', 'Outros']
export const CATS_OUT = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Roupas', 'Assinaturas', 'Outros']

// ── Financial Goals ───────────────────────────────────────────────────────────

export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  target: number
  saved: number
  deadline: string | null
  created_at: string
}

// ── Emergency Reserve ─────────────────────────────────────────────────────────

export interface EmergencyReserve {
  target: number
  current: number
  lastAport: number | null
  aportes: { id: string, date: string, value: number }[]
}

// ── Schema ────────────────────────────────────────────────────────────────────

interface WalletDB extends DBSchema {
  transactions: {
    key: string
    value: Transaction
    indexes: {
      'by-user': string
      'by-date': string
    }
  }
  financial_goals: {
    key: string
    value: FinancialGoal
    indexes: { 'by-user': string }
  }
  emergency_reserve: {
    key: string   // sempre 'local-user'
    value: EmergencyReserve & { id: string }
  }
}

let _db: IDBPDatabase<WalletDB> | null = null

export async function getWalletDB(): Promise<IDBPDatabase<WalletDB>> {
  if (_db) return _db
  _db = await openDB<WalletDB>('wallet-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('transactions', { keyPath: 'id' })
        store.createIndex('by-user', 'user_id')
        store.createIndex('by-date', 'date')
      }
      if (oldVersion < 2) {
        const goalsStore = db.createObjectStore('financial_goals', { keyPath: 'id' })
        goalsStore.createIndex('by-user', 'user_id')
        db.createObjectStore('emergency_reserve', { keyPath: 'id' })
      }
    },
  })
  return _db
}

const LOCAL_USER = 'local-user'

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const db = await getWalletDB()
  const all = await db.getAllFromIndex('transactions', 'by-user', LOCAL_USER)
  return all.sort((a, b) => b.date.localeCompare(a.date))
}

export async function addTransaction(data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
  const db = await getWalletDB()
  const tx: Transaction = {
    id: crypto.randomUUID(),
    user_id: LOCAL_USER,
    created_at: new Date().toISOString(),
    ...data,
  }
  await db.put('transactions', tx)
  return tx
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getWalletDB()
  await db.delete('transactions', id)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function filterByMonth(txs: Transaction[], monthKey: string): Transaction[] {
  return txs.filter(t => t.date.startsWith(monthKey))
}

export function filterByQuarter(txs: Transaction[], year: number, quarter: number): Transaction[] {
  const startMonth = (quarter - 1) * 3 + 1
  const endMonth = startMonth + 2
  return txs.filter(t => {
    const [y, m] = t.date.split('-').map(Number)
    if (y !== year) return false
    return m >= startMonth && m <= endMonth
  })
}

export function filterByYear(txs: Transaction[], year: number): Transaction[] {
  return txs.filter(t => t.date.startsWith(String(year)))
}

export function filterByDateRange(txs: Transaction[], start: Date | null, end: Date | null): Transaction[] {
  if (!start && !end) return txs
  return txs.filter(t => {
    const txDate = new Date(t.date + 'T00:00:00')
    if (start && txDate < start) return false
    if (end && txDate > end) return false
    return true
  })
}

export function calcSummary(txs: Transaction[]) {
  const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { income, expense, balance: income - expense }
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ── Financial Goals ───────────────────────────────────────────────────────────

export async function getGoals(): Promise<FinancialGoal[]> {
  const db = await getWalletDB()
  return db.getAllFromIndex('financial_goals', 'by-user', LOCAL_USER)
}

export async function saveGoal(data: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at'>): Promise<FinancialGoal> {
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id || LOCAL_USER

  const goal: FinancialGoal = {
    id: crypto.randomUUID(),
    user_id: userId,
    created_at: new Date().toISOString(),
    ...data,
  }

  if (session?.user) {
    // Save to Supabase
    const { error } = await supabase
      .from('wallet_goals')
      .insert(goal)

    if (error) {
      console.error('Error saving wallet goal to Supabase:', error)
      // Fallback to local storage
      const db = await getWalletDB()
      await db.put('financial_goals', goal)
    }
  } else {
    // Save locally
    const db = await getWalletDB()
    await db.put('financial_goals', goal)
  }

  return goal
}

export async function updateGoal(id: string, data: Partial<Omit<FinancialGoal, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
  const db = await getWalletDB()
  const existing = await db.get('financial_goals', id)
  if (!existing) throw new Error(`Goal ${id} not found`)
  await db.put('financial_goals', { ...existing, ...data })
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getWalletDB()
  await db.delete('financial_goals', id)
}

// ── Emergency Reserve ─────────────────────────────────────────────────────────

export async function getEmergency(): Promise<EmergencyReserve | null> {
  const db = await getWalletDB()
  const record = await db.get('emergency_reserve', LOCAL_USER)
  if (!record) return null
  const { id: _unused, ...data } = record
  void _unused
  return { ...data, aportes: data.aportes || [] }
}

export async function saveEmergency(data: EmergencyReserve): Promise<void> {
  const db = await getWalletDB()
  await db.put('emergency_reserve', { id: LOCAL_USER, ...data })
}

export async function deleteEmergency(): Promise<void> {
  const db = await getWalletDB()
  await db.delete('emergency_reserve', LOCAL_USER)
}