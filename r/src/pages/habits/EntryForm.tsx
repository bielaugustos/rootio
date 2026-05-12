import { useState, useEffect, type ReactNode, type CSSProperties } from 'react'
import type { Habit, HabitList, Priority } from '../../engine/habitDB'
import type { CareerGoal } from '../../engine/careerDB'
import { getActiveGoals } from '../../engine/careerDB'
import { Button } from '../../components/Button'
import { Toggle } from '../../components/Toggle'
import { Input } from '../../components/Input'
import { Slider } from '../../components/Slider'
import { TimeRangeSlider } from '../../components/TimeRangeSlider'
import { TimePicker } from '../../components/TimePicker'
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
        boxShadow: active ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
        transition: 'all 0.1s',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.borderColor = 'var(--border)'
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.borderColor = 'var(--border)'
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
        fontSize: 10, fontWeight: 500, color: 'var(--t3)',
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

function AccordionSection({ id, label, children, openSections, setOpenSections }: { id: string; label: string; children: ReactNode; openSections: Set<string>; setOpenSections: (updater: (prev: Set<string>) => Set<string>) => void }) {
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
          boxShadow: isOpen ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
          transition: 'all 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(var(--shadow-x), var(--shadow-y))'; e.currentTarget.style.boxShadow = 'none' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isOpen ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--border)' }}
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
  { key: 'saude',    icon: 'ph-heart-straight', label: 'Saúde' },
  { key: 'foco',     icon: 'ph-lightbulb',      label: 'Foco' },
  { key: 'mente',    icon: 'ph-brain',          label: 'Mente' },
  { key: 'outros',   icon: 'ph-stars',          label: 'Outros' },
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
  fontSize: 10, fontWeight: 500, color: 'var(--t3)',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: 8, display: 'block',
  fontFamily: 'var(--font-sans)',
}

export function EntryForm({ habit, onSave, onClose, habits, streak, onDelete }: EntryFormProps) {
  const [mode, setMode] = useState<'simples' | 'avancado'>('simples')
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['nome-icone']))
  const [selectedCategory, setSelectedCategory] = useState('saude')
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<string>('')

  useEffect(() => {
    getActiveGoals().then(setCareerGoals)
  }, [])

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

  const habitSuggestions: Record<string, string[]> = {
    habilidade: ['Estudar 30min/dia', 'Praticar projetos pessoais', 'Ler artigos técnicos'],
    educacao: ['Cursar online 1h/semana', 'Fazer exercícios de matemática', 'Aprender idioma'],
    cargo: ['Networking 15min/dia', 'Atualizar currículo', 'Preparar para entrevistas'],
    network: ['Conectar com 2 pessoas/semana', 'Participar de eventos', 'Mentoria reversa'],
    projeto: ['Trabalhar no projeto 1h/dia', 'Revisar código', 'Planejar features'],
    financeiro: ['Economizar R$50/dia', 'Investir 10%/salário', 'Criar reserva de emergência'],
  }

  const selectedGoalObj = careerGoals.find(g => g.id === selectedGoal)
  const suggestions = selectedGoalObj ? habitSuggestions[selectedGoalObj.category] || [] : []

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 4px 16px' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        background: 'var(--background)',
        paddingBottom: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
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
              onClick={() => onDelete(habit.id!)}
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

      {/* ── Tipo pills — always visible ── */}
      <div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['habit', 'task', 'goal', 'event'] as HabitList[]).map(l => {
            const isActive = form.list === l
            return (
              <button
                key={l}
                onClick={() => set('list', l)}
                style={{
                  padding: '6px 14px',
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
                onMouseEnter={e => {
                  if (!isActive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }
                }}
                onMouseLeave={e => {
                  if (!isActive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }
                }}
              >
                {listLabels[l]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab toggle ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <TabButton active={mode === 'simples'} onClick={() => setMode('simples')}>
          Simples
        </TabButton>
        <TabButton active={mode === 'avancado'} onClick={() => setMode('avancado')}>
          Avançado
        </TabButton>
      </div>

      {/* ════════════════ SIMPLES ════════════════ */}
      {mode === 'simples' && (
        <>

          {/* 0. Templates de início rápido */}
          <div>
            <span style={labelStyle}>Início rápido</span>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
            }}>
              {QUICK_TEMPLATES.map(t => (
                <button
                  key={t.name}
                  onClick={() => {
                    set('name', t.name)
                    set('icon', t.icon)
                    setSelectedCategory(t.category)
                    set('pts', t.pts)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px',
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

          {/* Ícone + Nome do Hábito */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIconOpen(o => !o)}
                  style={{
                    width: 44, height: 44, fontSize: 22,
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
                    gridTemplateColumns: 'repeat(7, 36px)',
                    gap: 4, padding: 8,
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
                          width: 36, height: 36, fontSize: 18,
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

          {/* Link to Career Goal */}
          {careerGoals.length > 0 && (
            <div>
              <label style={labelStyle}>Meta de carreira (opcional)</label>
              <select
                value={selectedGoal}
                onChange={e => setSelectedGoal(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px',
                  background: 'var(--bg2)', border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--t1)',
                  fontFamily: 'var(--font-sans)', outline: 'none',
                }}
              >
                <option value="">Nenhuma</option>
                {careerGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <label style={labelStyle}>Sugestões baseadas na meta</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => set('name', suggestion)}
                    style={{
                      padding: '6px 12px',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg3)',
                      color: 'var(--t2)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 400,
                      boxShadow: '2px 2px 0 var(--border)',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Frequência */}
          <div style={{
            background: 'var(--background)',
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
                    onMouseEnter={e => {
                      if (!isActive) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }
                    }}
                  >
                    {d}
                  </button>
                )
              })}
            </div>

          </div>

          {/* 4. Lembrete */}
          <div style={{
            background: 'var(--background)',
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
                <div style={{
                  display: 'flex', justifyContent: 'left', alignItems: 'center', gap: 8,
                  marginTop: 12,
                }}>
                <span style={{ fontSize: 13, color: 'var(--t3)', fontFamily: 'var(--font-sans)' }}>
                  Horário
                </span>
                  <TimePicker
                    value={form.reminder_time || '08:00'}
                    onChange={(time) => set('reminder_time', time)}
                    id="reminder-time"
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <Button label="Cancelar" variant="neutral" onClick={onClose} />
            <Button label={habit?.id ? 'Salvar alterações' : 'Criar hábito'} onClick={() => onSave(form)} />
          </div>





        </>
      )}

      {/* ════════════════ AVANÇADO ════════════════ */}
      {mode === 'avancado' && (
        <>
          <AccordionSection id="categoria" label="Categoria" openSections={openSections} setOpenSections={setOpenSections}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}>
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: 14,
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius-base)',
                      background: isActive ? 'var(--main)' : 'var(--background)',
                      color: isActive ? 'var(--main-foreground)' : 'var(--t3)',
                      cursor: 'pointer',
                      opacity: isActive ? 1 : 0.6,
                      boxShadow: isActive ? 'var(--shadow-x) var(--shadow-y) 0 var(--border)' : 'none',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translate(2px,2px)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = isActive ? 'var(--shadow-x) var(--shadow-y) 0 var(--border)' : 'none'
                    }}
                  >
                    <i className={`ph ${cat.icon}`} style={{
                      fontSize: 20,
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </AccordionSection>

          <AccordionSection id="nome" label="Nome" openSections={openSections} setOpenSections={setOpenSections}>
            <Input
              placeholder="Ex: Meditar 10 minutos"
              value={form.name ?? ''}
              onChange={v => set('name', v)}
            />
          </AccordionSection>

          <AccordionSection id="prioridade" label="Prioridade" openSections={openSections} setOpenSections={setOpenSections}>
            <FormLabel>Prioridade</FormLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['baixa', 'media', 'alta'] as Priority[]).map(p => {
                const isActive = form.priority === p
                return (
                  <button
                    key={p}
                    onClick={() => set('priority', p)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? PRIORITY_COLORS[p] + '18' : 'transparent',
                      color: isActive ? PRIORITY_COLORS[p] : 'var(--t3)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 500,
                      fontFamily: 'var(--font-sans)',
                      textTransform: 'capitalize',
                      borderBottom: isActive ? `2px solid ${PRIORITY_COLORS[p]}` : `2px solid transparent`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      transition: 'all 0.1s',
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: PRIORITY_COLORS[p], flexShrink: 0,
                    }} />
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
            <Slider value={totalPts} onChange={v => set('pts', v)} min={0} max={50} id="slider-pts" />
          </AccordionSection>

          {form.list !== 'goal' && (
            <AccordionSection id="duracao" label="Duração" openSections={openSections} setOpenSections={setOpenSections}>
              <FormLabel>
                Duração — {formatDuration(durationMins)}
              </FormLabel>
              <TimeRangeSlider
                startMinutes={0}
                endMinutes={durationMins}
                step={15}
                onChange={(_start, end) => set('est_mins', end)}
                onReset={() => { set('est_mins', 0) }}
              />
            </AccordionSection>
          )}

          {form.list === 'habit' && (
            <AccordionSection id="streak" label="Meta de streak" openSections={openSections} setOpenSections={setOpenSections}>
              <FormLabel tooltip="Quantos dias seguidos você quer manter este hábito?">
                Meta de streak — {form.streak_goal ? `${form.streak_goal} dias` : 'sem meta'}
              </FormLabel>
              <Slider
                value={form.streak_goal ?? 0}
                onChange={v => set('streak_goal', v === 0 ? null : v)}
                min={0}
                max={365}
                id="slider-streak-goal"
              />
            </AccordionSection>
          )}

          {form.list === 'goal' && (
            <AccordionSection id="goal" label="Meta" openSections={openSections} setOpenSections={setOpenSections}>
              <FormLabel tooltip="Unidade de medida da meta (R$, km, livros, etc.)">
                Unidade
              </FormLabel>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['R$', 'km', 'kg', 'h', 'dias', '%'].map(u => (
                  <button
                    key={u}
                    onClick={() => set('goal_unit', u)}
                    style={{
                      padding: '4px 12px', fontSize: 12, fontWeight: 500,
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      background: form.goal_unit === u ? 'var(--main)' : 'var(--bg3)',
                      color: form.goal_unit === u ? 'var(--main-foreground)' : 'var(--t2)',
                      border: `2px solid ${form.goal_unit === u ? 'var(--border)' : 'var(--b2)'}`,
                      boxShadow: form.goal_unit === u ? '2px 2px 0 var(--border)' : 'none',
                    }}
                  >
                    {u}
                  </button>
                ))}
                <Input
                  placeholder="outro..."
                  value={!['R$','km','kg','h','dias','%'].includes(form.goal_unit ?? '') ? (form.goal_unit ?? '') : ''}
                  onChange={v => set('goal_unit', v)}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <FormLabel tooltip="Valor atual de progresso">
                  Progresso atual — {form.goal_unit} {form.goal_current ?? 0}
                </FormLabel>
                <Slider
                  value={form.goal_current ?? 0}
                  onChange={v => set('goal_current', v)}
                  min={0}
                  max={form.goal_target ?? 1000}
                  id="slider-goal-current"
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <FormLabel tooltip="Valor alvo da meta">
                  Valor alvo — {form.goal_unit} {(form.goal_target ?? 0).toLocaleString('pt-BR')}
                </FormLabel>
                <Input
                  placeholder={`Valor alvo em ${form.goal_unit || 'R$'}...`}
                  value={form.goal_target != null ? String(form.goal_target) : ''}
                  onChange={v => {
                    const n = parseFloat(v.replace(',', '.'))
                    set('goal_target', isNaN(n) ? null : n)
                  }}
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <FormLabel>Período de acompanhamento</FormLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['mensal', 'semanal', 'anual'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => set('goal_period', form.goal_period === p ? null : p)}
                      style={{
                        padding: '4px 14px', fontSize: 12, fontWeight: 500,
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        background: form.goal_period === p ? 'var(--main)' : 'var(--bg3)',
                        color: form.goal_period === p ? 'var(--main-foreground)' : 'var(--t2)',
                        border: `2px solid ${form.goal_period === p ? 'var(--border)' : 'var(--b2)'}`,
                        boxShadow: form.goal_period === p ? '2px 2px 0 var(--border)' : 'none',
                        textTransform: 'capitalize',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </AccordionSection>
          )}

          {form.list !== 'goal' && (
            <AccordionSection id="subtasks" label="Subtarefas" openSections={openSections} setOpenSections={setOpenSections}>
              <FormLabel>Subtarefas</FormLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(form.subtasks ?? []).map(sub => (
                  <div key={sub.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px',
                    background: 'var(--bg3, #e8e4dc)',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--b2)',
                  }}>
                    <button
                      onClick={() => toggleSubtask(sub.id)}
                      style={{
                        width: 20, height: 20, flexShrink: 0,
                        borderRadius: 4,
                        border: `2px solid ${sub.done ? 'var(--main)' : 'var(--b2)'}`,
                        background: sub.done ? 'var(--main)' : 'transparent',
                        cursor: 'pointer', fontSize: 11,
                        color: 'var(--main-foreground)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {sub.done ? <i className="ph ph-check" style={{ fontSize: 12 }} /> : ''}
                    </button>
                    <span style={{
                      fontSize: 14, flex: 1,
                      fontFamily: 'var(--font-sans)',
                      color: sub.done ? 'var(--t3)' : 'var(--t2)',
                      textDecoration: sub.done ? 'line-through' : 'none',
                    }}>
                      {sub.title}
                    </span>
                    <button
                      onClick={() => removeSubtask(sub.id)}
                      style={{
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', color: 'var(--t3)',
                        fontSize: 14, padding: 0,
                      }}
                    >
                      <i className="ph ph-x" />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addSubtask() }
                      }}
                    >
                      <Input
                        value={newSubtask}
                        onChange={setNewSubtask}
                        placeholder="Nova subtarefa..."
                      />
                    </div>
                  </div>
                  <button
                    onClick={addSubtask}
                    style={iconBtnStyle}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
                  >
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
                    background: listColor.bg,
                    color: listColor.text,
                    border: `2px solid ${listColor.border}`,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontWeight: 400, fontFamily: 'var(--font-sans)',
                  }}>
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', color: listColor.text,
                        fontSize: 10, padding: 0, opacity: 0.7,
                      }}
                    >
                      <i className="ph ph-x" style={{ fontSize: 12 }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag() }
                  }}
                >
                  <Input
                    value={newTag}
                    onChange={setNewTag}
                    placeholder="Nova tag..."
                  />
                </div>
              </div>
              <button
                onClick={addTag}
                style={iconBtnStyle}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
              >
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
                width: '100%', padding: '10px 12px',
                fontSize: 16,
                fontFamily: 'var(--font-sans)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                background: 'var(--secondary-background)',
                color: 'var(--foreground)',
                resize: 'vertical', outline: 'none',
                boxShadow: '4px 4px 0 var(--border)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--main)'
                e.currentTarget.style.boxShadow = '4px 4px 0 var(--main)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
              }}
            />

          </AccordionSection>

        </>
      )}

      {mode === 'avancado' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, flexWrap: 'wrap' }}>
          <Button label="Cancelar" variant="neutral" onClick={onClose} />
          <Button label={habit?.id ? 'Salvar alterações' : 'Criar hábito'} onClick={() => onSave(form)} />
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, marginTop: 4, marginBottom: 8,
      }}>
        <div style={{
          padding: '12px 14px',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '3px 3px 0 var(--border)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>
            {doneTodayFiltered}/{totalFiltered}
          </span>
          <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 500 }}>
            Feitos hoje
          </span>
        </div>
        <div style={{
          padding: '12px 14px',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '3px 3px 0 var(--border)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>
            {streak ?? 0}d
          </span>
          <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 500 }}>
            Sequência
          </span>
        </div>
        <div style={{
          padding: '12px 14px',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '3px 3px 0 var(--border)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.2 }}>
            {filteredPct}%
          </span>
          <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 500 }}>
            Progresso
          </span>
        </div>
        <div style={{
          padding: '14px 16px',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          display: 'flex', flexDirection: 'column', gap: 4,
          boxSizing: 'border-box',
        }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>{altaCount}</span>
          <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>🔴 Crítico</span>
        </div>
        <div style={{
          padding: '14px 16px',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          display: 'flex', flexDirection: 'column', gap: 4,
          boxSizing: 'border-box',
        }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{mediaCount}</span>
          <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>🟡 Importante</span>
        </div>
        <div style={{
          padding: '14px 16px',
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          display: 'flex', flexDirection: 'column', gap: 4,
          boxSizing: 'border-box',
        }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#22c55e', lineHeight: 1 }}>{baixaCount}</span>
          <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>🟢 Estratégico</span>
        </div>
      </div>

    </div>
  )
}
