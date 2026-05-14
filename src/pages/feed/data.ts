export type Mood = 1 | 2 | 3 | 4 | 5

export interface DiaryEntry {
  id: string
  date: string
  mood: Mood
  title: string
  content: string
  tags: string[]
  habitIds: string[]
  created_at: string
}

const MOOD_LABELS: Record<Mood, { emoji: string; label: string }> = {
  1: { emoji: '😞', label: 'Ruim' },
  2: { emoji: '😐', label: 'Regular' },
  3: { emoji: '🙂', label: 'Bom' },
  4: { emoji: '😊', label: 'Ótimo' },
  5: { emoji: '🤩', label: 'Incrível' },
}

export function getMoodLabel(mood: Mood) { return MOOD_LABELS[mood] }

const LS_KEY = 'diary-entries-v1'

export function loadEntries(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

export function saveEntries(entries: DiaryEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries))
}

export function createEntry(data: Omit<DiaryEntry, 'id' | 'created_at'>): DiaryEntry {
  const entry: DiaryEntry = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() }
  const entries = loadEntries()
  saveEntries([entry, ...entries])
  return entry
}
