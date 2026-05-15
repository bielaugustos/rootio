import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import { supabase } from './supabase'

const LOCAL_USER = 'local-user'

// ── Types ─────────────────────────────────────────────────────────────────────

export type GoalCategory = 'cargo' | 'habilidade' | 'network' | 'projeto' | 'educacao' | 'financeiro'

export interface CareerGoal {
  id: string
  user_id: string
  title: string
  category: GoalCategory
  active: boolean
  targetSalary?: number
  salaryCurrency?: string
  created_at: string
  updated_at: string
}

// ── DB Schema ─────────────────────────────────────────────────────────────────

interface CareerDBSchema extends DBSchema {
  goals: {
    key: string
    value: CareerGoal
    indexes: { 'by-user': string }
  }
}

// ── DB Instance ───────────────────────────────────────────────────────────────

let _db: IDBPDatabase<CareerDBSchema> | null = null

async function getCareerDB(): Promise<IDBPDatabase<CareerDBSchema>> {
  if (_db) return _db
  _db = await openDB<CareerDBSchema>('rootio-career', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('goals')) {
        const store = db.createObjectStore('goals', { keyPath: 'id' })
        store.createIndex('by-user', 'user_id')
      }
    },
  })
  return _db
}

// ── Migration ─────────────────────────────────────────────────────────────────

async function migrateFromLocalStorage() {
  const raw = localStorage.getItem('career-goals')
  if (!raw) return
  try {
    const goals: CareerGoal[] = JSON.parse(raw)
    const db = await getCareerDB()
    for (const goal of goals) {
      await db.put('goals', { ...goal, user_id: LOCAL_USER })
    }
    localStorage.removeItem('career-goals')
  } catch {}
}

// ── API ───────────────────────────────────────────────────────────────────────

export async function getActiveGoals(): Promise<CareerGoal[]> {
  await migrateFromLocalStorage()
  const db = await getCareerDB()
  const all = await db.getAllFromIndex('goals', 'by-user', LOCAL_USER)
  return all.filter(g => g.active)
}

export async function saveGoal(goal: Omit<CareerGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id || LOCAL_USER

  const now = new Date().toISOString()
  const fullGoal: CareerGoal = {
    ...goal,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    user_id: userId,
  }

  if (session?.user) {
    // Save to Supabase
    const { error } = await supabase
      .from('career_goals')
      .insert(fullGoal)

    if (error) {
      console.error('Error saving career goal to Supabase:', error)
      // Fallback to local storage
      const db = await getCareerDB()
      await db.put('goals', fullGoal)
    }
  } else {
    // Save locally
    const db = await getCareerDB()
    await db.put('goals', fullGoal)
  }
}

export async function updateGoal(id: string, updates: Partial<CareerGoal>): Promise<void> {
  const db = await getCareerDB()
  const existing = await db.get('goals', id)
  if (existing) {
    await db.put('goals', { ...existing, ...updates, updated_at: new Date().toISOString() })
  }
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getCareerDB()
  await db.delete('goals', id)
}