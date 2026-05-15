import { useState, useRef, useEffect } from 'react'
import type { Habit, HabitList } from '../engine/habitDB'
import type { FilterState } from './searchConstants'

interface DesktopSearchBarProps {
  habits: Habit[]
  /** Called when user selects a result — opens that habit in the entry form */
  onSelectHabit: (habit: Habit) => void
  /** Called when user wants to create a new entry from the search bar */
  onNewEntry: () => void
  /** External filter state so the parent can filter the list view */
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
  habit: 'var(--t3)',       // white-ish (matches calendar legend)
  task:  '#4dabf7',
  goal:  '#f97316',
  event: '#a78bfa',
}

// ── Component ─────────────────────────────────────────────────────────────────
export function DesktopSearchBar({
  habits,
  onSelectHabit,
  onNewEntry,
  filter,
  onFilterChange,
}: DesktopSearchBarProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setFocused(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Filter results
  const results = habits.filter(h => {
    const matchList = filter.list === 'all' || h.list === filter.list
    const matchQuery = !filter.query || h.name.toLowerCase().includes(filter.query.toLowerCase())
    const matchPending = !filter.onlyPending || !h.done
    return matchList && matchQuery && matchPending
  }).slice(0, 8)

  const showDropdown = focused && filter.query.length > 0



  return (
    <>
      {/* Mobile: hidden via CSS class — parent controls visibility */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-search-bar { display: flex !important; flex-direction: column; gap: 8; width: 100%; }
        }
        @media (max-width: 767px) {
          .desktop-search-bar { display: none !important; }
        }
      `}</style>

      <div className="desktop-search-bar" ref={wrapRef} style={{ position: 'relative', width: '100%' }}>

        {/* ── Search input row ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          border: `2px solid ${focused ? 'var(--main)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-base)',
          background: 'var(--secondary-background)',
          transition: 'border-color 0.1s, box-shadow 0.1s',
          boxShadow: focused ? '3px 3px 0 var(--border)' : 'none',
        }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 16, color: 'var(--t3)', flexShrink: 0 }} />

          <input
            ref={inputRef}
            type="text"
            value={filter.query}
            onChange={e => onFilterChange({ ...filter, query: e.target.value })}
            onFocus={() => setFocused(true)}
            placeholder="Buscar entradas..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 14, fontFamily: 'var(--font-sans)',
              color: 'var(--foreground)',
            }}
          />

          {/* Clear button */}
          {filter.query && (
            <button
              onClick={() => { onFilterChange({ ...filter, query: '' }); inputRef.current?.focus() }}
              style={{
                background: 'transparent', border: 'none',
                cursor: 'pointer', color: 'var(--t3)', fontSize: 14,
                display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0,
              }}
            >
              <i className="ph ph-x" />
            </button>
          )}

          {/* Kbd hint */}
          {!filter.query && (
            <kbd style={{
              fontSize: 10, padding: '2px 6px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              background: 'var(--bg2)',
              color: 'var(--t3)',
              fontFamily: 'var(--font-sans)',
              flexShrink: 0,
            }}>⌘K</kbd>
          )}
        </div>

        {/* ── Filter pills row ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* List type filters */}
          {(['all', 'habit', 'task', 'goal', 'event'] as (HabitList | 'all')[]).map(l => {
            const isActive = filter.list === l
            return (
              <button
                key={l}
                onClick={() => onFilterChange({ ...filter, list: l })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--main)' : 'var(--bg2)',
                  color: isActive ? 'var(--main-foreground)' : 'var(--t2)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  transform: isActive ? 'translate(2px, 2px)' : 'none',
                  transition: 'transform 0.08s, box-shadow 0.08s',
                  marginTop: 6,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
              >
                {l !== 'all' && (
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? 'var(--main-foreground)' : LIST_DOTS[l as HabitList],
                    opacity: isActive ? 0.6 : 1,
                  }} />
                )}
                {LIST_LABELS[l]}
              </button>
            )
          })}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Pending only toggle */}
          <button
            onClick={() => onFilterChange({ ...filter, onlyPending: !filter.onlyPending })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 10px',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: filter.onlyPending ? 'var(--main)' : 'var(--bg2)',
              color: filter.onlyPending ? 'var(--main-foreground)' : 'var(--t2)',
              cursor: 'pointer', fontSize: 12, fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              boxShadow: filter.onlyPending ? 'none' : '2px 2px 0 var(--border)',
              transform: filter.onlyPending ? 'translate(2px, 2px)' : 'none',
              transition: 'transform 0.08s, box-shadow 0.08s',
            }}
            onMouseEnter={e => { if (!filter.onlyPending) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
            onMouseLeave={e => { if (!filter.onlyPending) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
          >
            <i className="ph ph-circle-dashed" style={{ fontSize: 13 }} />
            Pendentes
          </button>
        </div>

        {/* ── Search results dropdown ── */}
        {showDropdown && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            marginTop: 6, zIndex: 50,
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)',
            overflow: 'hidden',
          }}>
            {results.length === 0 ? (
              <div style={{
                padding: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 13, color: 'var(--t3)', fontFamily: 'var(--font-sans)' }}>
                  Nenhum resultado para "{filter.query}"
                </span>
                <button
                  onClick={() => { setFocused(false); onNewEntry() }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--main)',
                    color: 'var(--main-foreground)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '2px 2px 0 var(--border)',
                  }}
                >
                  <i className="ph ph-plus" />
                  Criar "{filter.query}"
                </button>
              </div>
            ) : (
              results.map(h => (
                <button
                  key={h.id}
                  onClick={() => { setFocused(false); onSelectHabit(h) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 14px',
                    border: 'none', borderBottom: '1px solid var(--b2)',
                    background: 'transparent',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.08s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary-background)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{h.icon ?? '⭐'}</span>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--t1)', fontFamily: 'var(--font-sans)' }}>
                    {h.name}
                  </span>
                  <span style={{
                    fontSize: 10, padding: '2px 7px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--b2)',
                    color: 'var(--t3)',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {LIST_LABELS[h.list]}
                  </span>
                  {h.done && (
                    <i className="ph ph-check-circle" style={{ fontSize: 14, color: '#22c55e', flexShrink: 0 }} />
                  )}
                </button>
              ))
            )}
          </div>
        )}

      </div>
    </>
  )
}

