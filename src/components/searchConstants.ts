import type { HabitList } from '../engine/habitDB'

export type { HabitList }

export type FilterState = {
  query: string
  list: HabitList | 'all'
  onlyPending: boolean
}

export const defaultFilter: FilterState = {
  query: '',
  list: 'all',
  onlyPending: false,
}