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
import { DesktopSearchBar } from '../../components/DesktopSearchBar'
import { MobileSearchBar } from '../../components/MobileSearchBar'
import { defaultFilter, type FilterState } from '../../components/searchConstants'
import { StreakTimeline } from '../../components/StreakTimeline'
import type { PanelType } from './PanelPortal'
import { CalendarView } from './CalendarView'

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
import { TimerPanel }         from './panels/TimerPanel'
import { AnexosPanel }        from './panels/AnexosPanel'
import { ParticipantesPanel, TabelaPanel } from './panels/ParticipantesPanel'

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
    case 'timer':
      return <TimerPanel habit={habit} isMobile={isMobile ?? false} onRefresh={onRefresh} />
    case 'anexos':
      return <AnexosPanel habit={habit} isMobile={isMobile ?? false} onRefresh={onRefresh} />
    case 'participantes':
      return <ParticipantesPanel habit={habit} onRefresh={onRefresh} />
    case 'tabela':
      return <TabelaPanel habit={habit} onRefresh={onRefresh} />
    default:
      return null
  }
}

// ─── Drawer overlay ───────────────────────────────────────────────

function DrawerOverlay({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) return null
  const isMobile = window.innerWidth < 640
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 399,
        background: 'rgba(0,0,0,.4)',
        backdropFilter: isMobile ? undefined : 'blur(2px)',
        WebkitBackdropFilter: isMobile ? undefined : 'blur(2px)',
        animation: 'fadeIn .2s ease',
      }}
    />
  )
}

// ─── Drawer handle ────────────────────────────────────────────────

function DrawerHandle({ onClose }: { onClose: () => void }) {
  const [touchStart, setTouchStart] = useState(0)
  const [dragging, setDragging] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)

  const onTouchStartHandler = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
    setDragging(true)
  }

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    if (!dragging) return
    const diff = e.touches[0].clientY - touchStart
    if (diff > 100) {
      setDragging(false)
      onClose()
    }
  }

  const onTouchEndHandler = () => {
    setDragging(false)
  }

  return (
    <div
      ref={handleRef}
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
      style={{
        padding: '14px 16px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, cursor: 'grab',
        touchAction: 'none',
        minHeight: 44,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Fechar painel"
        style={{
          width: 48, height: 6, borderRadius: 3,
          background: 'var(--b2, #ccc)', cursor: 'pointer',
          border: 'none', padding: 0,
        }}
      />
    </div>
  )
}



// ─── HabitsPage ───────────────────────────────────────────────────

export function HabitsPage() {
  // ── Data state ──
  const [habits,       setHabits]       = useState<Habit[]>([])
  const [filter,       setFilter]       = useState<FilterState>(defaultFilter)
  const [loading,      setLoading]      = useState(true)
  const { view: currentView } = useView()
  const view = currentView === 'calendario' ? 'calendar' : 'list'

  // ── Trash state ──
  const [showTrash] = useState(false)
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
  const filteredByFilter = habits.filter(h => {
    const matchList = filter.list === 'all' || h.list === filter.list
    const matchQuery = h.name.toLowerCase().includes(filter.query.toLowerCase())
    const matchPending = !filter.onlyPending || !h.done
    return matchList && matchQuery && matchPending
  })
  const filtered = filteredByFilter
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

      <PageWrapper maxWidth={view === 'calendar' ? 900 : layout.pageMaxWidth}>
        <div style={{
          display:        'flex',
          gap:            0,
          alignItems:     'flex-start',
          flexDirection:  layout.flexDir,
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
                {view !== 'calendar' && (
                  <p style={{ color: 'var(--t2)', fontSize: 15, margin: 0 }}>
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                )}
              </div>
              {!(layout.isMobile && view === 'calendar') && !(layout.isMobile === false && view === 'list') && (
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
              )}
            </div>

            {/* Search & filters */}
            {!showTrash && view === 'list' && (
              <div style={{ marginBottom: 20 }}>
                {layout.isMobile ? (
                  <MobileSearchBar
                    habits={habits}
                    filter={filter}
                    onFilterChange={setFilter}
                    onSelectHabit={handleEdit}
                    onNewEntry={() => { setFilter(defaultFilter); openForm(null) }}
                  />
                ) : (
                  <DesktopSearchBar
                    habits={habits}
                    filter={filter}
                    onFilterChange={setFilter}
                    onSelectHabit={handleEdit}
                    onNewEntry={() => { setFilter(defaultFilter); openForm(null) }}
                  />
                )}
              </div>
            )}



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
                    : `Nenhum ${LIST_LABELS[filter.list as HabitList] ?? 'item'} nesta categoria.`}
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
            <div ref={formRef} style={{
              ...layout.col2Style,
              marginBottom: 0,
              WebkitOverflowScrolling: 'touch',
            }}>
              <DrawerHandle onClose={closeCol2} />
              {formOpen ? (
                <div style={{
                  flex: 1, overflow: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: 16,
                }}>
                  <EntryForm
                    habit={editingHabit}
                    onSave={handleSave}
                    onClose={closeCol2}
                    habits={habits}
                    onDelete={handleDelete}
                  />
                </div>
              ) : (
                <div style={{
                  flex: 1, overflow: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: 16,
                }}>
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

      {/* Streak Timeline */}
      <StreakTimeline />
    </>
  )
}
