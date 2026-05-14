import { useState } from 'react'
import type { Habit } from '../engine/habitDB'
import { Input } from './Input'
import { Button } from './Button'
import type { FilterState, HabitList } from './searchConstants'

interface MobileSearchBarProps {
  habits: Habit[]
  onSelectHabit: (habit: Habit) => void
  onNewEntry: () => void
  filter: FilterState
  onFilterChange: (f: FilterState) => void
}

const LIST_LABELS: Record<HabitList | 'all', string> = {
  all:   'Todos',
  habit: 'Hábitos',
  task:  'Tarefas',
  goal:  'Metas',
  event: 'Eventos',
}

const LIST_DOTS: Record<HabitList, string> = {
  habit: 'var(--t3)',
  task:  '#4dabf7',
  goal:  '#f97316',
  event: '#a78bfa',
}

export function MobileSearchBar({
  habits,
  onSelectHabit,
  onNewEntry,
  filter,
  onFilterChange,
}: MobileSearchBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search input */}
      <Input
        placeholder="digite o texto buscar e pressione enter para +"
        value={filter.query}
        onChange={q => onFilterChange({ ...filter, query: q })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && filter.query.trim()) {
            onNewEntry()
            onFilterChange({ ...filter, query: '' })
          }
        }}
      />

      {/* Toggle filters button */}
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="ghost"
        size="sm"
        style={{ alignSelf: 'flex-start' }}
      >
        Filtros {showFilters ? '↑' : '↓'}
      </Button>

      {/* Filters */}
      {showFilters && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* List filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['all', 'habit', 'task', 'goal', 'event'] as (HabitList | 'all')[]).map(l => {
              const isActive = filter.list === l
              return (
                <button
                  key={l}
                  onClick={() => onFilterChange({ ...filter, list: l })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--main)' : 'var(--bg2)',
                    color: isActive ? 'var(--main-foreground)' : 'var(--t2)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    boxShadow: isActive ? 'none' : '2px 2px 0 var(--border)',
                    transform: isActive ? 'translate(2px, 2px)' : 'none',
                    transition: 'transform 0.08s, box-shadow 0.08s',
                  }}
                >
                  {l !== 'all' && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: isActive ? 'var(--main-foreground)' : LIST_DOTS[l as HabitList],
                      opacity: isActive ? 0.6 : 1,
                    }} />
                  )}
                  {LIST_LABELS[l]}
                </button>
              )
            })}
          </div>

          {/* Pending toggle */}
          <button
            onClick={() => onFilterChange({ ...filter, onlyPending: !filter.onlyPending })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: filter.onlyPending ? 'var(--main)' : 'var(--bg2)',
              color: filter.onlyPending ? 'var(--main-foreground)' : 'var(--t2)',
              cursor: 'pointer', fontSize: 12, fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              boxShadow: filter.onlyPending ? 'none' : '2px 2px 0 var(--border)',
              transform: filter.onlyPending ? 'translate(2px, 2px)' : 'none',
              transition: 'transform 0.08s, box-shadow 0.08s',
              alignSelf: 'flex-start',
            }}
          >
            <i className="ph ph-circle-dashed" style={{ fontSize: 13 }} />
            Pendentes
          </button>
        </div>
      )}

      {/* Quick results if query */}
      {filter.query && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {habits.filter(h =>
            h.name.toLowerCase().includes(filter.query.toLowerCase()) &&
            (filter.list === 'all' || h.list === filter.list) &&
            (!filter.onlyPending || !h.done)
          ).slice(0, 5).map(h => (
            <button
              key={h.id}
              onClick={() => onSelectHabit(h)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--secondary-background)',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '2px 2px 0 var(--border)',
              }}
            >
              <span style={{ fontSize: 16 }}>{h.icon ?? '⭐'}</span>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--t1)' }}>{h.name}</span>
              <span style={{
                fontSize: 10, padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--b2)',
                color: 'var(--t3)',
              }}>
                {LIST_LABELS[h.list]}
              </span>
            </button>
          ))}
          {habits.filter(h =>
            h.name.toLowerCase().includes(filter.query.toLowerCase()) &&
            (filter.list === 'all' || h.list === filter.list) &&
            (!filter.onlyPending || !h.done)
          ).length === 0 && (
            <button
              onClick={() => { onNewEntry(); onFilterChange({ ...filter, query: '' }) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                background: 'var(--main)',
                color: 'var(--main-foreground)',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                boxShadow: '2px 2px 0 var(--border)',
              }}
            >
              <i className="ph ph-plus" />
              Criar "{filter.query}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}


