import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getHabits, createHabit, updateHabit,
  toggleHabitDone, deleteHabit, hardDeleteHabit, restoreHabit,
  getDeletedHabits,
  syncTodayHistory, resetDailyDone,
  type Habit, type HabitList,
} from '../../engine/habitDB'
import { Button }      from '../../components/Button'
import { PageWrapper } from '../../components/PageWrapper'
import { useView }     from '../../components/ViewSwitcher'
import { HabitCard }   from './HabitCard'
import { EntryForm }   from './EntryForm'
import { LIST_LABELS } from './habitConstants'
import { useHabitsLayout } from './useHabitsLayout'
import type { PanelType } from './PanelPortal'
import { CalendarView } from './CalendarView'
import { Input } from '../../components/Input'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

// ─── Panel imports ────────────────────────────────────────────────
import { HistoricoPanel }     from './HistoricoPanel'
import { LembretePanel }      from './LembretePanel'
import { StreaksPanel }       from './StreaksPanel'
import { ProgressoPanel }     from './ProgressoPanel'

// Placeholder genérico para painéis ainda não implementados
function PanelPlaceholder({ type, habitName, onClose }: {
  type:      PanelType
  habitName: string
  onClose:   () => void
}) {
  const LABELS: Record<string, string> = {
    historico:    'Histórico',
    lembrete:     'Lembrete',
    timer:        'Timer',
    anexos:       'Anexos',
    local:        'Local',
    participantes:'Participantes',
    agendar:      'Agendar',
    tabela:       'Tabela',
    progresso:    'Progresso',
    streaks:      'Streaks',
  }
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '2px solid var(--border)', paddingBottom: 12, marginBottom: 16,
        background: 'var(--bg3, #eeebe2)', margin: '-16px -16px 16px', padding: '12px 16px',
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>
          {LABELS[type]} — {habitName}
        </span>
        <button onClick={onClose} style={{
          width: 28, height: 28, border: '1.5px solid var(--b2)', borderRadius: 'var(--radius-sm)',
          background: 'var(--secondary-background)', cursor: 'pointer', fontSize: 13, color: 'var(--t2)',
        }}>✕</button>
      </div>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 10,
        border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
        color: 'var(--t3)', fontSize: 13, padding: 24, textAlign: 'center',
      }}>
        <span style={{ fontSize: 28 }}>🔧</span>
        <span>Painel <strong>{LABELS[type]}</strong> em implementação.<br/>Importe o componente em index.tsx.</span>
      </div>
    </div>
  )
}

// ─── Col2 panel renderer ──────────────────────────────────────────

function Col2Panel({
  habits,
  activePanel,
  onClose,
  onRefresh,
  isMobile,
}: {
  habits:       Habit[]
  activePanel:  { habitId: string; type: PanelType } | null
  onClose:      () => void
  onRefresh:    () => void
  isMobile?:    boolean
}) {
  if (!activePanel) return null
  const habit = habits.find(h => h.id === activePanel.habitId)
  if (!habit) return null

  switch (activePanel.type) {
    case 'historico':
      return <HistoricoPanel habit={habit} isMobile={isMobile ?? false} onRefresh={onRefresh} />
case 'lembrete':
       return <LembretePanel habit={habit} onRefresh={onRefresh} />
    case 'streaks':
      return <StreaksPanel habit={habit} onClose={onClose} />
    case 'progresso':
      return <ProgressoPanel habit={habit} onClose={onClose} />
    default:
      return (
        <PanelPlaceholder
          type={activePanel.type}
          habitName={habit.name}
          onClose={onClose}
        />
      )
  }
}

// ─── Drawer overlay ───────────────────────────────────────────────

function DrawerOverlay({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) return null
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 399,
        background: 'rgba(0,0,0,.4)',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn .2s ease',
      }}
    />
  )
}

// ─── Drawer handle ────────────────────────────────────────────────

function DrawerHandle({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      padding: '10px 16px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <button
        onClick={onClose}
        style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'var(--b2, #ccc)', cursor: 'pointer',
        }}
      />
    </div>
  )
}

// ─── Filter variants ──────────────────────────────────────────────

const FILTER_VARIANTS: Record<string, { bg: string; border: string; text: string }> = {
  all:   { bg: 'var(--secondary-background)', border: 'var(--border)',      text: 'var(--t1)' },
  habit: { bg: 'var(--c-habit, #F5EFDF)',     border: 'var(--c-habit-b, #D4C9A9)', text: 'var(--c-habit-t, #0C0C0C)' },
  task:  { bg: 'var(--c-task-bg, #6FB8FF)',   border: 'var(--c-task-b, #3B82F6)',  text: 'var(--c-task-t, #000000)' },
  goal:  { bg: 'var(--c-goal-bg, #F59E0B)',   border: 'var(--c-goal-b, #D97706)',  text: 'var(--c-goal-t, #000000)' },
  event: { bg: 'var(--c-event-bg, #9B7BFF)',  border: 'var(--c-event-b, #7C5CDB)', text: 'var(--c-event-t, #000000)' },
}

const FILTER_LABELS: Record<string, string> = {
  all: 'Todos', habit: 'Hábito', task: 'Tarefa', goal: 'Meta', event: 'Evento',
}

// ─── HabitsPage ───────────────────────────────────────────────────

export function HabitsPage() {
  // ── Data state ──
  const [habits,       setHabits]       = useState<Habit[]>([])
  const [activeList,   setActiveList]   = useState<HabitList | 'all'>('all')
  const [search,       setSearch]       = useState('')
  const [loading,      setLoading]      = useState(true)
  const { view: currentView } = useView()
  const view = currentView === 'calendario' ? 'calendar' : 'list'

  // ── Trash state ──
  const [showTrash, setShowTrash] = useState(false)
  const [deletedHabits, setDeletedHabits] = useState<Habit[]>([])

  const loadDeletedHabits = useCallback(async () => {
    const d = await getDeletedHabits()
    setDeletedHabits(d)
  }, [])

  // ── Col2 state — MUTEX ──
  const [formOpen,     setFormOpen]     = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [activePanel,  setActivePanel]  = useState<{ habitId: string; type: PanelType } | null>(null)

  // ── Refs ──
  const formRef  = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ── Layout ──
  const layout = useHabitsLayout({
    formOpen,
    panelOpen: activePanel !== null,
  })

  // ── Drag ──
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = filtered.findIndex(h => h.id === active.id)
      const newIndex = filtered.findIndex(h => h.id === over.id)
      const newFiltered = arrayMove(filtered, oldIndex, newIndex)
      // Update order
      newFiltered.forEach((h, i) => {
        updateHabit(h.id, { order: i })
      })
      loadData()
    }
  }

  // ── Data loading ──
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0]
        const lastSession = localStorage.getItem('last-session-date')
        if (lastSession !== todayStr) {
          localStorage.setItem('last-session-date', todayStr)
          await syncTodayHistory()
          await resetDailyDone()
        }
        if (!mounted) return
        const h = await getHabits()
        if (!mounted) return
        setHabits(h); setLoading(false)
      } catch { if (mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [])

  const loadData = useCallback(async () => {
    const h = await getHabits()
    setHabits(h)
  }, [])

  // ── Col2 mutex helpers ──
  const openForm = useCallback((habit: Habit | null = null) => {
    setActivePanel(null)        // close panel
    setEditingHabit(habit)
    setEditingHabitId(habit?.id ?? null)
    setFormOpen(true)
    if (layout.isMobile) setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [layout.isMobile])

  const closeCol2 = useCallback(() => {
    const prevId = editingHabitId
    setFormOpen(false)
    setEditingHabit(null)
    setEditingHabitId(null)
    setActivePanel(null)
    if (layout.isMobile && prevId) {
      setTimeout(() => cardRefs.current[prevId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
  }, [editingHabitId, layout.isMobile])

  const openPanel = useCallback((habitId: string, type: PanelType) => {
    setFormOpen(false)          // close form
    setEditingHabit(null)
    setEditingHabitId(null)
    // Toggle: clicking same panel closes it
    setActivePanel(prev =>
      prev?.habitId === habitId && prev.type === type ? null : { habitId, type }
    )
  }, [])

  // ── Handlers ──
  const handleToggle = useCallback(async (id: string) => {
    await toggleHabitDone(id)
    await loadData()
  }, [loadData])

  const handleSave = useCallback(async (data: Partial<Habit>) => {
    if (editingHabit?.id) await updateHabit(editingHabit.id, data)
    else await createHabit(data)
    await syncTodayHistory()
    closeCol2()
    await loadData()
  }, [editingHabit, closeCol2, loadData])

  const handleEdit = useCallback((habit: Habit) => {
    openForm(habit)
  }, [openForm])

  const handleDelete = useCallback(async (id: string) => {
    await deleteHabit(id)
    await syncTodayHistory()
    if (activePanel?.habitId === id) setActivePanel(null)
    if (editingHabitId === id) closeCol2()
    await loadData()
  }, [activePanel, editingHabitId, closeCol2, loadData])

  const handleRestore = useCallback(async (id: string) => {
    await restoreHabit(id)
    await loadDeletedHabits()
    await loadData()
  }, [loadDeletedHabits, loadData])

  const handleHardDelete = useCallback(async (id: string) => {
    if (!window.confirm('Excluir permanentemente este hábito? Esta ação não pode ser desfeita.')) return
    await hardDeleteHabit(id)
    await loadDeletedHabits()
  }, [loadDeletedHabits])

  // ── Derived ──
  const filteredBySearch = habits.filter(h => h.name.toLowerCase().includes(search.toLowerCase()))
  const filtered    = activeList === 'all' ? filteredBySearch : filteredBySearch.filter(h => h.list === activeList)
  const col2Open    = formOpen || activePanel !== null

  if (loading) return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span style={{ color: 'var(--t3)' }}>Carregando hábitos...</span>
    </main>
  )

  return (
    <>
      {/* ── CSS for col2 slide-in animation ── */}
      <style>{`
        @keyframes col2SlideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* ── Mobile drawer backdrop ── */}
      <DrawerOverlay visible={layout.drawerOpen} onClick={closeCol2} />

      <PageWrapper maxWidth={layout.pageMaxWidth}>
        <div style={{
          display:        'flex',
          gap:            layout.isDesktop ? 20 : 0,
          alignItems:     'flex-start',
          flexDirection:  layout.flexDir,
          position:       'relative',
        }}>

          {/* ══════════════════ COL 1 — LISTA ══════════════════ */}
          <div style={layout.col1Style}>

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: layout.isMobile ? 'stretch' : 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 20, gap: 12,
              flexDirection: layout.isMobile ? 'column' : 'row',
            }}>
              <div>
                <h1 style={{ fontSize: 28, color: 'var(--t1)', marginBottom: 4, fontFamily: 'var(--font-title)' }}>
                  Hábitos
                </h1>
                <p style={{ color: 'var(--t2)', fontSize: 15, margin: 0 }}>
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <Button
                onClick={col2Open && formOpen ? closeCol2 : () => openForm(null)}
                variant={col2Open && formOpen ? 'neutral' : 'default'}
                id="btn-new-habit"
                style={{
                  background:  col2Open && formOpen ? undefined : '#F59E0B',
                  borderColor: col2Open && formOpen ? undefined : 'var(--border)',
                  color:       col2Open && formOpen ? undefined : '#000',
                  flex:        layout.isMobile ? 1 : undefined,
                  padding:     '12px 24px',
                }}
              >
                <i className={`ph ${col2Open && formOpen ? 'ph-x' : 'ph-plus'}`} style={{ fontSize: 16 }} />
                {col2Open && formOpen ? 'Cancelar' : 'Nova entrada'}
              </Button>
            </div>

            {/* Search input */}
            {!showTrash && view === 'list' && (
              <div style={{ marginBottom: 20 }}>
                <Input
                  placeholder="digite o texto buscar e pressione enter para +"
                  value={search}
                  onChange={setSearch}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && search.trim()) {
                      handleSave({
                        name: search.trim(),
                        list: activeList === 'all' ? 'habit' : activeList
                      })
                      setSearch('')
                    }
                  }}
                />
              </div>
            )}

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {!showTrash && view === 'list' && (['all', 'habit', 'task', 'goal', 'event'] as const).map(list => {
                const isActive = activeList === list
                const v = FILTER_VARIANTS[list]
                const count = list === 'all' ? habits.length : habits.filter(h => h.list === list).length
                return (
                  <button
                    key={list}
                    onClick={() => setActiveList(list)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '5px 14px', fontSize: 12, fontWeight: 700,
                      fontFamily: 'var(--font-sans)', cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${isActive ? 'var(--border)' : 'var(--b2)'}`,
                      background: isActive ? v.bg : 'var(--secondary-background)',
                      color: isActive ? v.text : 'var(--t2)',
                      boxShadow: isActive ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
                      transform: isActive ? 'translate(var(--shadow-x), var(--shadow-y))' : 'none',
                      transition: 'all 0.1s',
                    }}
                  >
                    {FILTER_LABELS[list]}
                    <span style={{ opacity: 0.6 }}>{count}</span>
                  </button>
                )
              })}
              {view === 'list' && (
              <button
                onClick={() => {
                  const next = !showTrash
                  setShowTrash(next)
                  if (next) { closeCol2(); setSearch(''); loadDeletedHabits() }
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', fontSize: 12, fontWeight: 700,
                  fontFamily: 'var(--font-sans)', cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${showTrash ? 'var(--border)' : 'var(--b2)'}`,
                  background: showTrash ? '#FF6B6B' : 'var(--secondary-background)',
                  color: showTrash ? '#fff' : 'var(--t2)',
                  boxShadow: showTrash ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
                  transform: showTrash ? 'translate(var(--shadow-x), var(--shadow-y))' : 'none',
                  transition: 'all 0.1s',
                }}
              >
                <i className="ph ph-trash" style={{ fontSize: 14 }} />
                Lixeira
                <span style={{ opacity: 0.6 }}>{deletedHabits.length}</span>
              </button>
              )}
            </div>

            {/* Habit list */}
            {showTrash ? (
              deletedHabits.length === 0 ? (
                <div style={{
                  padding: '48px 24px', textAlign: 'center',
                  border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
                }}>
                  <p style={{ color: 'var(--t2)', fontSize: 15 }}>
                    Nenhum hábito excluído.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {deletedHabits.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map(h => (
                    <div key={h.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      background: 'var(--secondary-background)',
                      border: '2px solid var(--b2)',
                      borderRadius: 'var(--radius-base)',
                      opacity: 0.7,
                    }}>
                      <span style={{ fontSize: 20 }}>{h.icon}</span>
                      <span style={{ flex: 1, fontSize: 14, color: 'var(--t2)', fontFamily: 'var(--font-sans)' }}>
                        {h.name}
                      </span>
                      <button
                        onClick={() => handleRestore(h.id)}
                        style={{
                          padding: '6px 12px', fontSize: 11, fontWeight: 600,
                          fontFamily: 'var(--font-sans)', cursor: 'pointer',
                          border: '2px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--main)', color: '#000',
                          boxShadow: '2px 2px 0 var(--border)',
                          transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() => handleHardDelete(h.id)}
                        style={{
                          width: 28, height: 28,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'transparent', cursor: 'pointer', color: 'var(--t3)',
                          boxShadow: '2px 2px 0 var(--border)',
                          transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
                      >
                        <i className="ph ph-x" style={{ fontSize: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : view === 'calendar' ? (
              <CalendarView
                habits={habits}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onRefresh={loadData}
                isMobile={layout.isMobile}
              />
            ) : filtered.length === 0 ? (
              <div style={{
                padding: '48px 24px', textAlign: 'center',
                border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
              }}>
                <img
                  src='/illustrations/habitsemptystate.png'
                  alt=''
                  style={{ width: 120, height: 120, margin: '0 auto 16px', display: 'block' }}
                  className='invert-element'
                />
                <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 16 }}>
                  {habits.length === 0
                    ? 'Nenhum hábito ainda.'
                    : `Nenhum ${LIST_LABELS[activeList as HabitList] ?? 'item'} nesta categoria.`}
                </p>
                <Button label="Criar primeiro hábito" onClick={() => openForm(null)} />
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={filtered.map(h => h.id)} strategy={verticalListSortingStrategy}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(habit => (
                      <div key={habit.id} ref={el => { cardRefs.current[habit.id] = el }}>
                        <HabitCard
                          habit={habit}
                          onToggle={handleToggle}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onRefresh={loadData}
                          onPanelOpen={openPanel}
                          activePanelType={
                            activePanel?.habitId === habit.id ? activePanel.type : undefined
                          }
                          isMobile={layout.isMobile}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <div style={{ width: '100%', opacity: 0.9, transform: 'rotate(1deg)' }}>
                      <HabitCard
                        habit={filtered.find(h => h.id === activeId)!}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onRefresh={loadData}
                        onPanelOpen={openPanel}
                        isMobile={layout.isMobile}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* ══════════════════ COL 2 — MUTEX ══════════════════ */}

          {/* Desktop: rendered inline */}
          {layout.isDesktop && col2Open && (
            <div ref={formRef} style={{ ...layout.col2Style, marginBottom: 20 }}>
              {formOpen ? (
                <EntryForm
                  habit={editingHabit}
                  onSave={handleSave}
                  onClose={closeCol2}
                  habits={habits}
                  onDelete={handleDelete}
                />
              ) : (
                <Col2Panel
                  habits={habits}
                  activePanel={activePanel}
                  onClose={closeCol2}
                  onRefresh={loadData}
                  isMobile={layout.isMobile}
                />
              )}
            </div>
          )}

          {/* Mobile: rendered as fixed drawer */}
          {layout.isMobile && (
            <div ref={formRef} style={{ ...layout.col2Style, marginBottom: 20 }}>
              <DrawerHandle onClose={closeCol2} />
              {formOpen ? (
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <EntryForm
                    habit={editingHabit}
                    onSave={handleSave}
                    onClose={closeCol2}
                    habits={habits}
                    onDelete={handleDelete}
                  />
                </div>
              ) : (
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <Col2Panel
                    habits={habits}
                    activePanel={activePanel}
                    onClose={closeCol2}
                    onRefresh={loadData}
                    isMobile={layout.isMobile}
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </PageWrapper>
    </>
  )
}
