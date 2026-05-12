import type { HabitList, Priority } from '../../engine/habitDB'
import type { GoalCategory } from '../../engine/careerDB'

export const LIST_COLORS: Record<HabitList, { bg: string; border: string; text: string }> = {
  habit: { bg: 'var(--c-habit, #F5EFDF)',    border: 'var(--c-habit-b, #D4C9A9)', text: 'var(--c-habit-t, #0C0C0C)' },
  task:  { bg: 'var(--c-task-bg, #6FB8FF)',  border: 'var(--c-task-b, #3B82F6)',  text: 'var(--c-task-t, #000)' },
  goal:  { bg: 'var(--c-goal-bg, #F59E0B)',  border: 'var(--c-goal-b, #D97706)',  text: 'var(--c-goal-t, #000)' },
  event: { bg: 'var(--c-event-bg, #9B7BFF)', border: 'var(--c-event-b, #7C5CDB)', text: 'var(--c-event-t, #000)' },
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  baixa: '#22c55e',
  media: '#f59e0b',
  alta:  '#ef4444',
}

export const LIST_LABELS: Record<HabitList, string> = {
  habit: 'Hábito',
  task: 'Tarefa',
  goal: 'Meta',
  event: 'Evento',
}

export const DAYS_LABEL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export const CAREER_HABIT_TEMPLATES: Record<GoalCategory, Partial<import('../../engine/habitDB').Habit>> = {
  cargo:       { name: 'Exercício de liderança técnica para {meta.title}', icon: '💼', est_mins: 30, pts: 15, freq: 'diario', list: 'habit' },
  habilidade:  { name: 'Sessão de estudo para {meta.title}',              icon: '📚', est_mins: 60, pts: 20, freq: 'diario', list: 'habit' },
  network:     { name: 'Contato de networking para {meta.title}',          icon: '🤝', est_mins: 15, pts: 10, freq: 'semanal', days: [1], list: 'habit' },
  projeto:     { name: 'Avanço no projeto {meta.title}',             icon: '🎯', est_mins: 45, pts: 15, freq: 'diario', list: 'habit' },
  educacao:    { name: 'Leitura e aprendizado para {meta.title}',         icon: '🎓', est_mins: 30, pts: 15, freq: 'diario', list: 'habit' },
  financeiro:  { name: 'Controle financeiro para {meta.title}',           icon: '💰', est_mins: 10, pts: 10, freq: 'diario', list: 'habit' },
}