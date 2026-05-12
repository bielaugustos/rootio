import { type Habit } from '../../engine/habitDB'

const COLUMNS = [
  { id: 'pendente',   label: 'A Fazer',       color: 'var(--c-task-bg)',  border: 'var(--c-task-b)' },
  { id: 'andamento',  label: 'Em Andamento',   color: 'var(--c-goal-bg)', border: 'var(--c-goal-b)' },
  { id: 'concluido',  label: 'Concluído',      color: 'var(--c-habit)',   border: 'var(--c-habit-b)' },
]

function getColumn(habit: Habit): string {
  if (habit.done) return 'concluido'
  if ((habit.subtasks ?? []).some(s => s.done)) return 'andamento'
  return 'pendente'
}

interface HabitBoardProps {
  habits:   Habit[]
  onToggle: (id: string) => void
  onEdit:   (h: Habit)   => void
}

export function HabitBoard({ habits, onToggle, onEdit }: HabitBoardProps) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
      maxWidth: '100%', width: '100%', boxSizing: 'border-box',
      overflowX: 'auto',
    }}>
      {COLUMNS.map(col => {
        const items = habits.filter(h => getColumn(h) === col.id)
        return (
          <div key={col.id} style={{
            background: col.color,
            border: `2px solid ${col.border}`,
            borderRadius: 'var(--radius-base)',
            minHeight: 200,
          }}>
            <div style={{
              padding: '10px 14px',
              borderBottom: `2px solid ${col.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                {col.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 500,
                background: 'var(--main)', color: 'var(--main-foreground)',
                borderRadius: 99, padding: '1px 7px',
              }}>
                {items.length}
              </span>
            </div>
            <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--t3)', fontStyle: 'italic' }}>
                  Vazio
                </div>
              ) : items.map(h => (
                <div
                  key={h.id}
                  onClick={() => onEdit(h)}
                  style={{
                    background: 'var(--secondary-background)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '2px 2px 0 var(--border)',
                    padding: '10px 12px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{h.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 400, flex: 1 }}>{h.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); onToggle(h.id) }}
                      style={{
                        width: 20, height: 20, borderRadius: 4,
                        border: `2px solid ${h.done ? 'var(--main)' : 'var(--b2)'}`,
                        background: h.done ? 'var(--main)' : 'transparent',
                        cursor: 'pointer', fontSize: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {h.done ? '✓' : ''}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 9, fontWeight: 500, padding: '1px 6px',
                      border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                      color: 'var(--t3)', textTransform: 'uppercase',
                    }}>
                      +{h.pts} IO
                    </span>
                    {(h.subtasks ?? []).length > 0 && (
                      <span style={{ fontSize: 9, color: 'var(--t3)' }}>
                        {(h.subtasks ?? []).filter(s => s.done).length}/{(h.subtasks ?? []).length} subtarefas
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
