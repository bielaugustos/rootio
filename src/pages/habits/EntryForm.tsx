import { useState, type ReactNode, type CSSProperties } from 'react'
import type { Habit, HabitList, Priority } from '../../engine/habitDB'

import { Button } from '../../components/Button'
import { Toggle } from '../../components/Toggle'
import { Input } from '../../components/Input'
import { Slider } from '../../components/Slider'
import { TimeRangeSlider } from '../../components/TimeRangeSlider'
import { TimePicker } from '../../components/TimePicker'
import type { TimeValue } from '../../components/TimePicker'
import { LIST_COLORS, PRIORITY_COLORS } from './habitConstants'

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '8px 16px',
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--main)' : 'var(--secondary-background)',
        color: active ? '#000' : 'var(--t2)',
        cursor: 'pointer', fontSize: 12, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        boxShadow: active ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)',
        transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  )
}

function FormLabel({ children, tooltip }: { children: ReactNode; tooltip?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <span style={{
        fontSize: 10, fontWeight: 600, color: 'var(--t2)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {children}
      </span>
      {tooltip && (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <button
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            style={{
              background: 'transparent', border: 'none', cursor: 'help',
              color: 'var(--t3)', fontSize: 12, padding: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <i className="ph ph-question" />
          </button>
          {show && (
            <div style={{
              position: 'absolute', bottom: '120%', left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--foreground)',
              color: 'var(--secondary-background)',
              fontSize: 11, padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap', zIndex: 100,
              boxShadow: '2px 2px 0 var(--border)',
              border: '1px solid var(--border)',
              maxWidth: 200,
            } as CSSProperties}>
              {tooltip}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AccordionSection({ id, label, children, openSections, setOpenSections }: {
  id: string; label: string; children: ReactNode
  openSections: Set<string>
  setOpenSections: (updater: (prev: Set<string>) => Set<string>) => void
}) {
  const isOpen = openSections.has(id)
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        onClick={() => {
          setOpenSections(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
          })
        }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '10px 14px',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          cursor: 'pointer', fontSize: 12, fontWeight: 500,
          fontFamily: 'var(--font-sans)', color: 'var(--t1)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          boxShadow: isOpen ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)',
          transition: 'all 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(var(--shadow-x), var(--shadow-y))'; e.currentTarget.style.boxShadow = 'none' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isOpen ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)' }}
      >
        <i className={`ph ${isOpen ? 'ph-caret-down' : 'ph-caret-right'}`} style={{ fontSize: 14 }} />
        {label}
      </button>
      {isOpen && (
        <div style={{ padding: '12px 0' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── Date Picker inline ─────────────────────────────────────────────────────────
function DatePickerField({
  value,
  onChange,
}: {
  value: string | null          // ISO "YYYY-MM-DD" or null = today
  onChange: (v: string | null) => void
}) {
  const todayISO = new Date().toISOString().slice(0, 10)
  const current = value ?? todayISO
  const isToday = current === todayISO

  // format "14 de mai." etc.
  const formatted = new Date(current + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  })

  return (
    <div style={{
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius-base)',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10,
      background: 'var(--secondary-background)',
    }}>
      {/* label + quick badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="ph ph-calendar-blank ph-bold" style={{ fontSize: 18, color: 'var(--border)' }} />
        <span style={{
          fontSize: 14, fontWeight: 400,
          color: 'var(--foreground)', fontFamily: 'var(--font-sans)',
        }}>
          Data
        </span>
        {isToday && (
          <span style={{
            fontSize: 10, fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--main)',
            color: 'var(--main-foreground)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Hoje
          </span>
        )}
      </div>

      {/* right side: formatted date + native input trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* "Hoje" shortcut — only visible when date ≠ today */}
        {!isToday && (
          <button
            onClick={() => onChange(null)}
            style={{
              fontSize: 11, padding: '3px 8px',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg2)',
              color: 'var(--t2)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              boxShadow: '2px 2px 0 var(--border)',
              transition: 'transform 0.08s, box-shadow 0.08s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
          >
            Hoje
          </button>
        )}

        {/* styled date display that wraps a native <input type=date> */}
        <label style={{
          position: 'relative',
          display: 'flex', alignItems: 'center',
          cursor: 'pointer',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: 'var(--t1)', fontFamily: 'var(--font-sans)',
            padding: '4px 10px',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg2)',
            boxShadow: '2px 2px 0 var(--border)',
            userSelect: 'none',
          }}>
            {formatted}
          </span>
          <input
            type="date"
            value={current}
            onChange={e => onChange(e.target.value || null)}
            style={{
              position: 'absolute', inset: 0,
              opacity: 0, cursor: 'pointer',
              width: '100%', height: '100%',
            }}
          />
        </label>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const ICONS = ['⭐', '🔥', '💪', '🧘', '📚', '💧', '🏃', '🎯', '🍎', '😴', '✍️', '🎨', '🎵', '🌿']
const DAYS_LABEL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const DAYS_FULL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const listLabels: Record<HabitList, string> = {
  habit: 'Hábito',
  task: 'Tarefa',
  goal: 'Meta',
  event: 'Evento',
}

const QUICK_TEMPLATES = [
  { name: 'Ler 20 min', icon: '📚', category: 'foco', pts: 10 },
  { name: 'Meditar', icon: '🧘', category: 'mente', pts: 15 },
  { name: 'Beber água', icon: '💧', category: 'saude', pts: 5 },
  { name: 'Exercício', icon: '🏃', category: 'saude', pts: 20 },
  { name: 'Estudar', icon: '📖', category: 'foco', pts: 15 },
] as const

const CATEGORIES = [
  { key: 'saude',  icon: 'ph-heart-straight', label: 'Saúde' },
  { key: 'foco',   icon: 'ph-lightbulb',      label: 'Foco' },
  { key: 'mente',  icon: 'ph-brain',          label: 'Mente' },
  { key: 'outros', icon: 'ph-stars',          label: 'Outros' },
] as const

interface EntryFormProps {
  habit: Partial<Habit> | null
  onSave: (data: Partial<Habit>) => void
  onClose: () => void
  habits: Habit[]
  streak?: number
  onDelete?: (id: string) => void
}

const labelStyle: CSSProperties = {
  fontSize: 10, fontWeight: 600, color: 'var(--t2)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: 8, display: 'block',
  fontFamily: 'var(--font-sans)',
}

// Types that show the date picker
const DATE_PICKER_LISTS: HabitList[] = ['habit', 'task']

export function EntryForm({ habit, onSave, onClose, habits, streak, onDelete }: EntryFormProps) {
  const [mode, setMode] = useState<'simples' | 'avancado'>('simples')
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['nome-icone']))
  const [selectedCategory, setSelectedCategory] = useState('saude')
  const [iconOpen, setIconOpen] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [newTag, setNewTag] = useState('')
  const [form, setForm] = useState<Partial<Habit>>({
    name: '',
    list: 'habit',
    icon: '⭐',
    priority: 'media',
    freq: 'diario',
    days: [0, 1, 2, 3, 4, 5, 6],
    pts: 10,
    notes: '',
    tags: [],
    subtasks: [],
    est_mins: 0,
    deadline: null,
    reminder_enabled: false,
    reminder_time: '08:00',
    ...habit,
  })

  const set = (key: keyof Habit, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }))

  const parseTime = (time: string | TimeValue | null | undefined): TimeValue | null => {
    if (!time) return null
    if (typeof time === 'string') {
      const [h, m] = time.split(':').map(Number)
      return { hours: h, minutes: m }
    }
    return time
  }

  const toggleDay = (day: number) => {
    const days = form.days ?? []
    set('days', days.includes(day) ? days.filter(d => d !== day) : [...days, day])
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    set('subtasks', [...(form.subtasks ?? []), { id: crypto.randomUUID(), title: newSubtask.trim(), done: false }])
    setNewSubtask('')
  }

  const removeSubtask = (id: string) =>
    set('subtasks', (form.subtasks ?? []).filter(s => s.id !== id))

  const toggleSubtask = (id: string) =>
    set('subtasks', (form.subtasks ?? []).map(s => s.id === id ? { ...s, done: !s.done } : s))

  const addTag = () => {
    if (!newTag.trim()) return
    set('tags', [...(form.tags ?? []), newTag.trim()])
    setNewTag('')
  }

  const removeTag = (tag: string) =>
    set('tags', (form.tags ?? []).filter(t => t !== tag))

  const selectedList = form.list ?? 'habit'
  const listColor = LIST_COLORS[selectedList as HabitList]
  const showDatePicker = DATE_PICKER_LISTS.includes(selectedList)

  const filteredHabits = habits.filter(h => h.list === selectedList)
  const doneTodayFiltered = filteredHabits.filter(h => h.done).length
  const totalFiltered = filteredHabits.length
  const filteredPct = totalFiltered > 0 ? Math.round((doneTodayFiltered / totalFiltered) * 100) : 0
  const baixaCount = habits.filter(h => h.priority === 'baixa').length
  const mediaCount = habits.filter(h => h.priority === 'media').length
  const altaCount = habits.filter(h => h.priority === 'alta').length

  const durationMins = form.est_mins ?? 0
  const formatDuration = (mins: number) => {
    if (mins === 0) return '0min'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
  }

  const iconBtnStyle = {
    width: 36, height: 36,
    display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--main)',
    color: 'var(--main-foreground)',
    cursor: 'pointer',
    boxShadow: '2px 2px 0 var(--border)',
    flexShrink: 0,
    fontSize: 16,
    transition: 'transform 0.1s, box-shadow 0.1s',
  }

  const totalPts = form.pts ?? 10

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '32px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--secondary-background)',
              cursor: 'pointer',
              boxShadow: '2px 2px 0 var(--border)',
              color: 'var(--foreground)', fontSize: 16,
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
          >
            <i className="ph ph-arrow-left" />
          </button>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--font-title)',
            fontSize: 26,
            color: 'var(--foreground)',
            flex: 1,
          }}>
            {habit?.id ? 'Editar Hábito' : 'Novo Hábito'}
          </h2>
          {habit?.id && onDelete && (
            <button
              onClick={() => { onDelete(habit.id!); onClose() }}
              style={{
                width: 28, height: 28, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: '#FF6B6B',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 var(--border)',
                color: 'white', fontSize: 16,
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
            >
              <i className="ph ph-trash" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tipo pills ── */}
      <div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['habit', 'task', 'goal', 'event'] as HabitList[]).map(l => {
            const isActive = form.list === l
            return (
              <button
                key={l}
                onClick={() => set('list', l)}
                style={{
                  padding: '4px 8px',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--main)' : 'var(--bg2)',
                  color: isActive ? 'var(--main-foreground)' : 'var(--t1)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  boxShadow: isActive ? 'none' : '2px 2px 0 var(--border)',
                  transform: isActive ? 'translate(2px, 2px)' : 'none',
                  transition: 'transform 0.08s, box-shadow 0.08s',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
              >
                {listLabels[l]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab toggle ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <TabButton active={mode === 'simples'} onClick={() => setMode('simples')}>Simples</TabButton>
        <TabButton active={mode === 'avancado'} onClick={() => setMode('avancado')}>Avançado</TabButton>
      </div>

      {/* ════════════════ SIMPLES ════════════════ */}
      {mode === 'simples' && (
        <>
          {/* Templates de início rápido */}
          <div>
            <span style={labelStyle}>Início rápido</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_TEMPLATES.map(t => (
                <button
                  key={t.name}
                  onClick={() => { set('name', t.name); set('icon', t.icon); setSelectedCategory(t.category); set('pts', t.pts) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 8px',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg2)',
                    color: 'var(--t1)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap',
                    boxShadow: '2px 2px 0 var(--border)',
                    transition: 'transform 0.08s, box-shadow 0.08s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ícone + Nome */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIconOpen(o => !o)}
                  style={{
                    width: 36, height: 36, fontSize: 18,
                    border: `2px solid ${iconOpen ? 'var(--main)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-base)',
                    background: 'var(--secondary-background)',
                    cursor: 'pointer', flexShrink: 0,
                    boxShadow: iconOpen ? 'none' : '3px 3px 0 var(--border)',
                    transition: 'all 0.1s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => { if (!iconOpen) { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none' } }}
                  onMouseLeave={e => { if (!iconOpen) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)' } }}
                >
                  {form.icon ?? '⭐'}
                </button>
                {iconOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 20,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 28px)',
                    gap: 2, padding: 6,
                    background: 'var(--background)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-base)',
                    boxShadow: '4px 4px 0 var(--border)',
                  }}>
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => { set('icon', icon); setIconOpen(false) }}
                        style={{
                          width: 28, height: 28, fontSize: 14,
                          border: `2px solid ${form.icon === icon ? 'var(--border)' : 'transparent'}`,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg3)',
                          cursor: 'pointer',
                          boxShadow: form.icon === icon ? '2px 2px 0 var(--border)' : 'none',
                          transition: 'all 0.1s',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  value={form.name ?? ''}
                  onChange={v => set('name', v)}
                  placeholder="Ex: Ler 20 min"
                />
              </div>
            </div>
          </div>

          {/* ── DATE PICKER — só para Hábito e Tarefa ── */}
          {showDatePicker && (
            <DatePickerField
              value={form.deadline ?? null}
              onChange={v => set('deadline', v)}
            />
          )}

          {/* Frequência */}
          <div style={{
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={labelStyle}>Frequência</span>
              <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--font-sans)' }}>
                {(form.days ?? []).length === 7
                  ? 'Todos os dias'
                  : (form.days ?? []).map(i => DAYS_FULL[i]).join(', ')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {DAYS_LABEL.map((d, i) => {
                const isActive = (form.days ?? []).includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    title={DAYS_FULL[i]}
                    style={{
                      flex: 1, height: 40,
                      borderRadius: 'var(--radius-sm)',
                      border: '2px solid var(--border)',
                      background: isActive ? 'var(--main)' : 'var(--bg2)',
                      color: isActive ? 'var(--main-foreground)' : 'var(--t1)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500,
                      fontFamily: 'var(--font-sans)',
                      boxShadow: isActive ? 'none' : '2px 2px 0 var(--border)',
                      transform: isActive ? 'translate(2px, 2px)' : 'none',
                      transition: 'transform 0.08s, box-shadow 0.08s',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' } }}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lembrete */}
          <div style={{
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ph ph-bell ph-bold" style={{ fontSize: 18, color: 'var(--border)' }} />
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }}>
                  Lembrete
                </span>
              </div>
              <Toggle checked={form.reminder_enabled || false} onChange={(checked) => set('reminder_enabled', checked)} />
            </div>
            {form.reminder_enabled && (
              <>
                <div style={{ margin: '12px 0px 0', borderTop: '2px solid var(--b2)' }} />
                <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', fontFamily: 'var(--font-sans)' }}>Horário</span>
                  <TimePicker
                    value={parseTime(form.reminder_time) || { hours: 8, minutes: 0 }}
                    onChange={(time) => set('reminder_time', time ? `${time.hours.toString().padStart(2,'0')}:${time.minutes.toString().padStart(2,'0')}` : null)}
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <Button size="sm" label="Cancelar" variant="neutral" onClick={onClose} />
            <Button size="sm" label={habit?.id ? 'Salvar alterações' : 'Criar hábito'} onClick={() => onSave(form)} />
          </div>
        </>
      )}

      {/* ════════════════ AVANÇADO ════════════════ */}
      {mode === 'avancado' && (
        <>
          <AccordionSection id="categoria" label="Categoria" openSections={openSections} setOpenSections={setOpenSections}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 16px',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius-base)',
                      background: isActive ? 'var(--main)' : 'var(--background)',
                      color: isActive ? 'var(--main-foreground)' : 'var(--t3)',
                      cursor: 'pointer',
                      opacity: isActive ? 1 : 0.6,
                      boxShadow: isActive ? 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)' : 'none',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isActive ? 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)' : 'none' }}
                  >
                    <i className={`ph ${cat.icon}`} style={{ fontSize: 20 }} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </AccordionSection>

          <AccordionSection id="nome" label="Nome" openSections={openSections} setOpenSections={setOpenSections}>
            <Input placeholder="Ex: Meditar 10 minutos" value={form.name ?? ''} onChange={v => set('name', v)} />
          </AccordionSection>

          <AccordionSection id="prioridade" label="Prioridade" openSections={openSections} setOpenSections={setOpenSections}>
            <FormLabel>Prioridade</FormLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['baixa', 'media', 'alta'] as Priority[]).map(p => {
                const isActive = form.priority === p
                const color = PRIORITY_COLORS[p]
                return (
                  <button key={p} onClick={() => set('priority', p)} style={{
                    flex: 1, padding: '8px 16px',
                    border: '2px solid var(--foreground)',
                    borderRadius: 'var(--radius-sm)',
                    background: color, color: '#000',
                    cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    textTransform: 'capitalize',
                    boxShadow: isActive ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)',
                    transform: isActive ? 'translate(var(--shadow-x), var(--shadow-y))' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'all 0.1s',
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid var(--foreground)', background: color, flexShrink: 0 }} />
                    {p === 'media' ? 'média' : p}
                  </button>
                )
              })}
            </div>
          </AccordionSection>

          <AccordionSection id="io" label="IO (pts)" openSections={openSections} setOpenSections={setOpenSections}>
            <FormLabel tooltip="IO é a moeda do app. Ganhe IO completando hábitos e use para desbloquear avatares e cores.">
              IO — {totalPts} pts
            </FormLabel>
            <Slider value={totalPts} onChange={v => set('pts', v)} min={0} max={50} />
          </AccordionSection>

          {form.list !== 'goal' && (
            <AccordionSection id="duracao" label="Duração" openSections={openSections} setOpenSections={setOpenSections}>
              <FormLabel>Duração — {formatDuration(durationMins)}</FormLabel>
              <TimeRangeSlider
                startMinutes={0}
                endMinutes={durationMins}
                step={15}
                onChange={(_start, end) => set('est_mins', end)}
                onReset={() => set('est_mins', 0)}
              />
            </AccordionSection>
          )}

          {form.list === 'habit' && (
            <AccordionSection id="streak" label="Meta de streak" openSections={openSections} setOpenSections={setOpenSections}>
              <FormLabel tooltip="Quantos dias seguidos você quer manter este hábito?">
                Meta de streak — {form.streak_goal ? `${form.streak_goal} dias` : 'sem meta'}
              </FormLabel>
              <Slider value={form.streak_goal ?? 0} onChange={v => set('streak_goal', v === 0 ? null : v)} min={0} max={365} />
            </AccordionSection>
          )}

          {form.list === 'goal' && (
            <AccordionSection id="goal" label="Meta" openSections={openSections} setOpenSections={setOpenSections}>
              <FormLabel tooltip="Unidade de medida da meta (R$, km, livros, etc.)">Unidade</FormLabel>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['R$', 'km', 'kg', 'h', 'dias', '%'].map(u => (
                  <button key={u} onClick={() => set('goal_unit', u)} style={{
                    padding: '8px 16px', fontSize: 12, fontWeight: 500,
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    background: form.goal_unit === u ? 'var(--main)' : 'var(--bg3)',
                    color: form.goal_unit === u ? 'var(--main-foreground)' : 'var(--t2)',
                    border: `2px solid ${form.goal_unit === u ? 'var(--border)' : 'var(--b2)'}`,
                    boxShadow: form.goal_unit === u ? '2px 2px 0 var(--border)' : 'none',
                  }}>{u}</button>
                ))}
                <Input
                  placeholder="outro..."
                  value={!['R$','km','kg','h','dias','%'].includes(form.goal_unit ?? '') ? (form.goal_unit ?? '') : ''}
                  onChange={v => set('goal_unit', v)}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <FormLabel tooltip="Valor atual de progresso">Progresso atual — {form.goal_unit} {form.goal_current ?? 0}</FormLabel>
                <Slider value={form.goal_current ?? 0} onChange={v => set('goal_current', v)} min={0} max={form.goal_target ?? 1000} />
              </div>
              <div style={{ marginTop: 16 }}>
                <FormLabel tooltip="Valor alvo da meta">Valor alvo — {form.goal_unit} {(form.goal_target ?? 0).toLocaleString('pt-BR')}</FormLabel>
                <Input
                  placeholder={`Valor alvo em ${form.goal_unit || 'R$'}...`}
                  value={form.goal_target != null ? String(form.goal_target) : ''}
                  onChange={v => { const n = parseFloat(v.replace(',', '.')); set('goal_target', isNaN(n) ? null : n) }}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <FormLabel>Período de acompanhamento</FormLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['mensal', 'semanal', 'anual'] as const).map(p => (
                    <button key={p} onClick={() => set('goal_period', form.goal_period === p ? null : p)} style={{
                      padding: '8px 16px', fontSize: 12, fontWeight: 500,
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      background: form.goal_period === p ? 'var(--main)' : 'var(--bg3)',
                      color: form.goal_period === p ? 'var(--main-foreground)' : 'var(--t2)',
                      border: `2px solid ${form.goal_period === p ? 'var(--border)' : 'var(--b2)'}`,
                      boxShadow: form.goal_period === p ? '2px 2px 0 var(--border)' : 'none',
                      textTransform: 'capitalize',
                    }}>{p}</button>
                  ))}
                </div>
              </div>
            </AccordionSection>
          )}

          {form.list !== 'goal' && (
            <AccordionSection id="subtasks" label="Subtarefas" openSections={openSections} setOpenSections={setOpenSections}>
              <FormLabel>Subtarefas</FormLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(form.subtasks ?? []).map(sub => (
                  <div key={sub.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--b2)',
                  }}>
                    <button onClick={() => toggleSubtask(sub.id)} style={{
                      width: 20, height: 20, flexShrink: 0,
                      borderRadius: 4,
                      border: `2px solid ${sub.done ? 'var(--main)' : 'var(--b2)'}`,
                      background: sub.done ? 'var(--main)' : 'transparent',
                      cursor: 'pointer', fontSize: 11,
                      color: 'var(--main-foreground)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {sub.done ? <i className="ph ph-check" style={{ fontSize: 12 }} /> : ''}
                    </button>
                    <span style={{
                      fontSize: 14, flex: 1, fontFamily: 'var(--font-sans)',
                      color: sub.done ? 'var(--t3)' : 'var(--t2)',
                      textDecoration: sub.done ? 'line-through' : 'none',
                    }}>{sub.title}</span>
                    <button onClick={() => removeSubtask(sub.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 14, padding: 0 }}>
                      <i className="ph ph-x" />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}>
                    <Input value={newSubtask} onChange={setNewSubtask} placeholder="Nova subtarefa..." />
                  </div>
                  <button onClick={addSubtask} style={iconBtnStyle}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}>
                    <i className="ph ph-plus" />
                  </button>
                </div>
              </div>
            </AccordionSection>
          )}

          <AccordionSection id="tags" label="Tags" openSections={openSections} setOpenSections={setOpenSections}>
            <FormLabel>Tags</FormLabel>
            {(form.tags ?? []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {(form.tags ?? []).map(tag => (
                  <span key={tag} style={{
                    fontSize: 12, padding: '3px 10px',
                    background: listColor.bg, color: listColor.text,
                    border: `2px solid ${listColor.border}`,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontWeight: 400, fontFamily: 'var(--font-sans)',
                  }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: listColor.text, fontSize: 10, padding: 0, opacity: 0.7 }}>
                      <i className="ph ph-x" style={{ fontSize: 12 }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}>
                <Input value={newTag} onChange={setNewTag} placeholder="Nova tag..." />
              </div>
              <button onClick={addTag} style={iconBtnStyle}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}>
                <i className="ph ph-plus" />
              </button>
            </div>
          </AccordionSection>

          <AccordionSection id="notas" label="Notas" openSections={openSections} setOpenSections={setOpenSections}>
            <FormLabel>Notas</FormLabel>
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              placeholder="Observações, motivação, contexto..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', fontSize: 16,
                fontFamily: 'var(--font-sans)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                background: 'var(--secondary-background)',
                color: 'var(--foreground)',
                resize: 'vertical', outline: 'none',
                boxShadow: '4px 4px 0 var(--border)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--main)'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--main)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)' }}
            />
          </AccordionSection>
        </>
      )}

      {mode === 'avancado' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          <Button size="sm" label="Cancelar" variant="neutral" onClick={onClose} />
          <Button size="sm" label={habit?.id ? 'Salvar alterações' : 'Criar hábito'} onClick={() => onSave(form)} />
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 4, marginBottom: 20 }}>
        {[
          { value: `${doneTodayFiltered}/${totalFiltered}`, label: 'Feitos hoje' },
          { value: `${streak ?? 0}d`, label: 'Sequência' },
          { value: `${filteredPct}%`, label: 'Progresso' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '12px 14px', background: 'var(--secondary-background)',
            border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
            boxShadow: '3px 3px 0 var(--border)', display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>{s.value}</span>
            <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
        {[
          { count: altaCount, color: '#FF6B6B', label: '🔴 Crítico' },
          { count: mediaCount, color: 'var(--main)', label: '🟡 Importante' },
          { count: baixaCount, color: '#22c55e', label: '🟢 Estratégico' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '14px 16px', background: 'var(--secondary-background)',
            border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
            boxShadow: '4px 4px 0 var(--border)', display: 'flex', flexDirection: 'column', gap: 4,
            boxSizing: 'border-box',
          }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</span>
            <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}