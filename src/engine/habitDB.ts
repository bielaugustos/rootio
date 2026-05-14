import { openDB, type IDBPDatabase, type DBSchema } from 'idb'

// ── Types ─────────────────────────────────────────────────────────────────────

export type Priority = 'baixa' | 'media' | 'alta'
export type Frequency = 'diario' | 'semanal' | 'personalizado'
export type HabitList = 'habit' | 'task' | 'goal' | 'event'

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface ReminderConfig {
  enabled:          boolean
  hora:             string            // "HH:MM"
  nudge_enabled:    boolean
  nudge_hora:       string            // hora-limite para o nudge (ex: "20:00")
  freq_mode:        'dias' | 'intervalo'
  freq_days:        number[]          // dias da semana (0=dom..6=sab)
  freq_intervalo:   number            // a cada N dias
  modo_foco:        boolean
  snooze_active:    boolean
  snooze_until:     string | null     // ISO timestamp
}

export interface Habit {
  id: string
  user_id: string
  name: string
  list: HabitList
  done: boolean
  pts: number
  icon: string
  priority: Priority
  freq: Frequency
  days: number[]        // 0=dom, 1=seg, ..., 6=sab
  subtasks: Subtask[]
  notes: string
  est_mins: number | null
  deadline: string | null
  tags: string[]
  hidden: boolean
  order: number
  streak_goal: number | null
  goal_target: number | null
  goal_current: number | null
  goal_unit: string | null
  goal_period: 'mensal' | 'semanal' | 'anual' | null
  reminder_enabled?: boolean
  reminder_time?: string
  reminder_config?: ReminderConfig
  session_logs?: any[]   // logs de sessão (opcional — preenchido em memória)
  created_at: string
  updated_at: string
}

export interface HabitHistoryEntry {
  id: string
  user_id: string
  date: string          // "YYYY-MM-DD"
  done: number
  total: number
  habits: Record<string, { name: string; done: boolean; pts: number; icon: string }>
  list: HabitList
  created_at: string
}

// ── Schema ────────────────────────────────────────────────────────────────────

interface HabitDB extends DBSchema {
  habits: {
    key: string
    value: Habit
    indexes: {
      'by-user': string
      'by-list': string
      'by-user-list': string
    }
  }
  habit_history: {
    key: string
    value: HabitHistoryEntry
    indexes: {
      'by-user': string
      'by-date': string
      'by-user-date': string
    }
  }
}

// ── DB singleton ──────────────────────────────────────────────────────────────

let _db: IDBPDatabase<HabitDB> | null = null
let _dbInitFailed = false

export async function getHabitDB(): Promise<IDBPDatabase<HabitDB>> {
  if (_dbInitFailed) {
    throw new Error('IndexedDB unavailable (likely Safari private browsing)')
  }
  if (_db) return _db

  try {
    _db = await openDB<HabitDB>('habit-db', 1, {
      upgrade(db) {
        const habitStore = db.createObjectStore('habits', { keyPath: 'id' })
        habitStore.createIndex('by-user', 'user_id')
        habitStore.createIndex('by-list', 'list')
        habitStore.createIndex('by-user-list', ['user_id', 'list'] as never)

        const histStore = db.createObjectStore('habit_history', { keyPath: 'id' })
        histStore.createIndex('by-user', 'user_id')
        histStore.createIndex('by-date', 'date')
        histStore.createIndex('by-user-date', ['user_id', 'date'] as never)
      },
    })
  } catch (err) {
    _dbInitFailed = true
    console.error('Failed to open habit-db:', err)
    throw err
  }

  return _db
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOCAL_USER = 'local-user'

/** Retorna a data local no formato "YYYY-MM-DD" (sem bug de fuso UTC). */
function today(): string {
  return dateToLocalString(new Date())
}

/** Converte um Date para "YYYY-MM-DD" usando o fuso local do dispositivo. */
function dateToLocalString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Recua uma data string "YYYY-MM-DD" por 1 dia, sem bug de fuso. */
function subtractDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return dateToLocalString(d)
}

function newId(): string {
  return crypto.randomUUID()
}

// ── Habits CRUD ───────────────────────────────────────────────────────────────

export async function getHabits(list?: HabitList): Promise<Habit[]> {
  const db = await getHabitDB()
  const all = await db.getAllFromIndex('habits', 'by-user', LOCAL_USER)
  const visible = all.filter(h => !h.hidden).sort((a, b) => a.order - b.order)
  if (list) return visible.filter(h => h.list === list)
  return visible
}

export async function getHabitById(id: string): Promise<Habit | undefined> {
  const db = await getHabitDB()
  return db.get('habits', id)
}

export async function createHabit(data: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Habit> {
  const db = await getHabitDB()
  const now = new Date().toISOString()
  const habit: Habit = {
    id: newId(),
    user_id: LOCAL_USER,
    name: data.name ?? 'Novo hábito',
    list: data.list ?? 'habit',
    done: false,
    pts: data.pts ?? 10,
    icon: data.icon ?? '⭐',
    priority: data.priority ?? 'media',
    freq: data.freq ?? 'diario',
    days: data.days ?? [0, 1, 2, 3, 4, 5, 6],
    subtasks: data.subtasks ?? [],
    notes: data.notes ?? '',
    est_mins: data.est_mins ?? null,
    deadline: data.deadline ?? null,
    tags: data.tags ?? [],
    hidden: false,
    order: data.order ?? 0,
    streak_goal: data.streak_goal ?? null,
    goal_target: data.goal_target ?? null,
    goal_current: data.goal_current ?? null,
    goal_unit: data.goal_unit ?? null,
    goal_period: data.goal_period ?? null,
    reminder_enabled: data.reminder_enabled,
    reminder_time: data.reminder_time,
    reminder_config: data.reminder_config,
    created_at: now,
    updated_at: now,
  }
  await db.put('habits', habit)

  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent('habits-changed'))

  return habit
}

export async function updateHabit(id: string, data: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>): Promise<Habit> {
  const db = await getHabitDB()
  const existing = await db.get('habits', id)
  if (!existing) throw new Error(`Habit ${id} not found`)
  const updated: Habit = { ...existing, ...data, updated_at: new Date().toISOString() }
  await db.put('habits', updated)

  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent('habits-changed'))

  return updated
}

export async function deleteHabit(id: string): Promise<void> {
  await updateHabit(id, { hidden: true })
  // Note: updateHabit already dispatches the event
}

export async function hardDeleteHabit(id: string): Promise<void> {
  const db = await getHabitDB()
  await db.delete('habits', id)
}

export async function getDeletedHabits(): Promise<Habit[]> {
  const db = await getHabitDB()
  const all = await db.getAllFromIndex('habits', 'by-user', LOCAL_USER)
  return all.filter(h => h.hidden)
}

export async function restoreHabit(id: string): Promise<Habit> {
  return updateHabit(id, { hidden: false })
}

// ── Toggle done ───────────────────────────────────────────────────────────────

export async function toggleHabitDone(id: string): Promise<Habit> {
  const habit = await getHabitById(id)
  if (!habit) throw new Error(`Habit ${id} not found`)
  const updated = await updateHabit(id, { done: !habit.done })
  await syncTodayHistory()

  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent('habits-changed'))

  return updated
}

// ── Subtasks ──────────────────────────────────────────────────────────────────

export async function toggleSubtask(habitId: string, subtaskId: string): Promise<Habit> {
  const habit = await getHabitById(habitId)
  if (!habit) throw new Error(`Habit ${habitId} not found`)
  const subtasks = habit.subtasks.map(s =>
    s.id === subtaskId ? { ...s, done: !s.done } : s
  )
  return updateHabit(habitId, { subtasks })
  // Note: updateHabit already dispatches the event
}

export async function addSubtask(habitId: string, title: string): Promise<Habit> {
  const habit = await getHabitById(habitId)
  if (!habit) throw new Error(`Habit ${habitId} not found`)
  const subtasks = [...habit.subtasks, { id: newId(), title, done: false }]
  return updateHabit(habitId, { subtasks })
  // Note: updateHabit already dispatches the event
}

// ── History ───────────────────────────────────────────────────────────────────

export async function getTodayHistory(): Promise<HabitHistoryEntry | undefined> {
  const db = await getHabitDB()
  const all = await db.getAllFromIndex('habit_history', 'by-date', today())
  return all.find(h => h.user_id === LOCAL_USER)
}

export async function getHistoryByDate(date: string): Promise<HabitHistoryEntry | undefined> {
  const db = await getHabitDB()
  const all = await db.getAllFromIndex('habit_history', 'by-date', date)
  return all.find(h => h.user_id === LOCAL_USER)
}

export async function getHistoryRange(from: string, to: string): Promise<HabitHistoryEntry[]> {
  const db = await getHabitDB()
  const all = await db.getAllFromIndex('habit_history', 'by-user', LOCAL_USER)
  const filtered = all.filter(h => h.date >= from && h.date <= to)
  // Deduplicate by date — if there are multiple entries per date, keep the most complete one
  const byDate = new Map<string, HabitHistoryEntry>()
  for (const e of filtered) {
    const existing = byDate.get(e.date)
    if (!existing || e.done > existing.done) byDate.set(e.date, e)
  }
  return Array.from(byDate.values())
}

export async function syncTodayHistory(): Promise<HabitHistoryEntry> {
  const db = await getHabitDB()
  const habits = await getHabits()
  const todayHabits = habits.filter(h => {
    if (h.freq === 'diario') return true
    const dayOfWeek = new Date().getDay()
    return h.days.includes(dayOfWeek)
  })

  const habitsSnapshot: HabitHistoryEntry['habits'] = {}
  for (const h of todayHabits) {
    habitsSnapshot[h.id] = { name: h.name, done: h.done, pts: h.done ? h.pts : 0, icon: h.icon }
  }

  const doneCount = todayHabits.filter(h => h.done).length
  const existing = await getTodayHistory()

  const entry: HabitHistoryEntry = {
    id: existing?.id ?? newId(),
    user_id: LOCAL_USER,
    date: today(),
    done: doneCount,
    total: todayHabits.length,
    habits: habitsSnapshot,
    list: 'habit',
    created_at: existing?.created_at ?? new Date().toISOString(),
  }

  await db.put('habit_history', entry)
  return entry
}

// ── Per-habit streak ──────────────────────────────────────────────────────────

export async function getHabitStreak(habitId: string): Promise<number> {
  const db = await getHabitDB()
  const all = await db.getAllFromIndex('habit_history', 'by-user', LOCAL_USER)
  const byDate = new Map<string, typeof all[0]>()
  for (const e of all) {
    const existing = byDate.get(e.date)
    if (!existing || e.done > existing.done) byDate.set(e.date, e)
  }
  const sorted = Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date))

  let streak = 0
  let cursor = today()

  for (const entry of sorted) {
    if (entry.date !== cursor) break
    const h = entry.habits?.[habitId]
    if (!h?.done) break
    streak++
    cursor = subtractDay(cursor)
  }

  return streak
}

export async function getHabitLast7Days(habitId: string): Promise<{ date: string; done: boolean }[]> {
  const result: { date: string; done: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = dateToLocalString(d)
    const entry = await getHistoryByDate(dateStr)
    result.push({ date: dateStr, done: !!entry?.habits?.[habitId]?.done })
  }
  return result
}

// ── Streak (global) ───────────────────────────────────────────────────────────

export async function getCurrentStreak(): Promise<number> {
  const db = await getHabitDB()
  const all = await db.getAllFromIndex('habit_history', 'by-user', LOCAL_USER)
  const byDate = new Map<string, typeof all[0]>()
  for (const e of all) {
    const existing = byDate.get(e.date)
    if (!existing || e.done > existing.done) byDate.set(e.date, e)
  }
  const sorted = Array.from(byDate.values())
    .filter(h => h.total > 0)
    .sort((a, b) => b.date.localeCompare(a.date))

  let streak = 0
  let cursor = today()

  for (const entry of sorted) {
    if (entry.date !== cursor) break
    if (entry.done === 0) break
    streak++
    cursor = subtractDay(cursor)
  }

  return streak
}

export async function getWeekProgress(): Promise<{ date: string; done: number; total: number }[]> {
  const result: { date: string; done: number; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = dateToLocalString(d)
    const entry = await getHistoryByDate(dateStr)
    result.push({ date: dateStr, done: entry?.done ?? 0, total: entry?.total ?? 0 })
  }
  return result
}

// ── Reset done (midnight) ─────────────────────────────────────────────────────

export async function resetDailyDone(): Promise<void> {
  const habits = await getHabits()
  for (const habit of habits) {
    if (habit.done) {
      await updateHabit(habit.id, { done: false })
    }
  }
}