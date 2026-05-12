import React, { useState, useEffect } from 'react'
import {
  getHabits, createHabit, updateHabit,
  toggleHabitDone, deleteHabit, restoreHabit, hardDeleteHabit,
  getDeletedHabits,
  getCurrentStreak, getHistoryRange,
  syncTodayHistory, resetDailyDone,
  type Habit, type HabitList,
} from '../../engine/habitDB'
import { getActiveGoals, type CareerGoal } from '../../engine/careerDB'
import { CAREER_HABIT_TEMPLATES } from './habitConstants'
import { Button } from '../../components/Button'
import { addIO, removeIO } from '../../engine/economyDB'
import { PageWrapper } from '../../components/PageWrapper'

import { HabitCard } from './HabitCard'
import { LIST_LABELS } from './habitConstants'
import { EntryForm } from './EntryForm'
import { ViewRenderer } from '../../components/ViewSwitcher'
import { HabitBoard } from './HabitBoard'
import { HistoricoPanel } from './HistoricoPanel'



const FILTER_LABELS: Record<string, string> = {
  all: 'Todos', habit: 'Hábito', task: 'Tarefa', goal: 'Meta', event: 'Evento',
}

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [streak, setStreak] = useState(0)
  const [activeList, setActiveList] = useState<HabitList | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const [selectedHabitForHistorico, setSelectedHabitForHistorico] = useState<Habit | null>(null)
  const [deletedHabits, setDeletedHabits] = useState<Habit[]>([])
  const [deletedSectionOpen, setDeletedSectionOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [activeGoals, setActiveGoals] = useState<CareerGoal[]>([])
  const [_historyDays, setHistoryDays] = useState<{ date: string; done: number; total: number }[]>([])
  const formRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    let mounted = true
    let timeoutId: ReturnType<typeof setTimeout>
    const fetchData = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (mounted) {
            setLoading(false)
          }
        }, 8000)

        const todayStr = new Date().toISOString().split('T')[0]
        const lastSession = localStorage.getItem('last-session-date')
        if (lastSession !== todayStr) {
          localStorage.setItem('last-session-date', todayStr)
          await syncTodayHistory()
          await resetDailyDone()
        }

        if (!mounted) return
        const [h, str, deleted] = await Promise.all([
          getHabits(),
          getCurrentStreak(),
          getDeletedHabits(),
        ])
        if (!mounted) return
        setHabits(h)
        setStreak(str)
        setDeletedHabits(deleted)

        const from = new Date(); from.setDate(from.getDate() - 29)
        const fromStr = from.toISOString().split('T')[0]
        const entries = await getHistoryRange(fromStr, new Date().toISOString().split('T')[0])
        const byDate = new Map<string, typeof entries[0]>()
        for (const e of entries) {
          const existing = byDate.get(e.date)
          if (!existing || e.done > existing.done) byDate.set(e.date, e)
        }
        const days = Array.from(byDate.values()).map(e => ({
          date: e.date, done: e.done, total: e.total,
        })).sort((a, b) => b.date.localeCompare(a.date))
        setHistoryDays(days)

        const goals = await getActiveGoals()
        setActiveGoals(goals)

        clearTimeout(timeoutId)
        setLoading(false)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        if (mounted) setLoading(false)
      }
    }
    fetchData()

    const check = () => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => {
      mounted = false
      clearTimeout(timeoutId)
      window.removeEventListener('resize', check)
    }
  }, [])

  const load = async () => {
    const [h, str, deleted] = await Promise.all([
      getHabits(),
      getCurrentStreak(),
      getDeletedHabits(),
    ])
    setHabits(h)
    setStreak(str)
    setDeletedHabits(deleted)

    const from = new Date(); from.setDate(from.getDate() - 29)
    const fromStr = from.toISOString().split('T')[0]
    const entries = await getHistoryRange(fromStr, new Date().toISOString().split('T')[0])
    const byDate = new Map<string, typeof entries[0]>()
    for (const e of entries) {
      const existing = byDate.get(e.date)
      if (!existing || e.done > existing.done) byDate.set(e.date, e)
    }
    const days = Array.from(byDate.values()).map(e => ({
      date: e.date, done: e.done, total: e.total,
    })).sort((a, b) => b.date.localeCompare(a.date))
    setHistoryDays(days)
  }

  const openNew = () => {
    setEditingHabit(null)
    setEditingHabitId(null)
    setFormOpen(true)
    if (isMobile) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }

  const closeForm = () => {
    const prevId = editingHabitId
    setFormOpen(false)
    setEditingHabit(null)
    setEditingHabitId(null)
    if (isMobile && prevId) {
      setTimeout(() => {
        cardRefs.current[prevId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }

  const openHistorico = (habit: Habit) => {
    setSelectedHabitForHistorico(habit)
    setHistoricoOpen(true)
    if (isMobile) {
      setTimeout(() => {
        // Scroll to top or something
      }, 80)
    }
  }

  const closeHistorico = () => {
    setHistoricoOpen(false)
    setSelectedHabitForHistorico(null)
  }

  const handleToggle = async (id: string) => {
    const habitBefore = habits.find(h => h.id === id)
    const updated     = await toggleHabitDone(id)

    if (updated.done && !habitBefore?.done) {
      await addIO(updated.pts)
      window.dispatchEvent(new CustomEvent('habit-completed', {
        detail: { name: updated.name, pts: updated.pts }
      }))
    } else if (!updated.done && habitBefore?.done) {
      await removeIO(updated.pts)
    }

    await load()
  }

  const handleSave = async (data: Partial<Habit>) => {
    if (editingHabit?.id) {
      await updateHabit(editingHabit.id, data)
    } else {
      await createHabit(data)
    }
    await syncTodayHistory()
    closeForm()
    await load()
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setEditingHabitId(habit.id)
    setFormOpen(true)
    if (isMobile) setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  }

  const handleDelete = async (id: string) => {
    await deleteHabit(id)
    await syncTodayHistory()
    await load()
  }

  const handleRestore = async (id: string) => {
    await restoreHabit(id)
    await load()
  }

  const handlePermanentDelete = async (id: string) => {
    await hardDeleteHabit(id)
    await load()
  }


  const filtered = activeList === 'all' ? habits : habits.filter(h => h.list === activeList)

  if (loading) return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span style={{ color: 'var(--t3)' }}>Carregando hábitos...</span>
    </main>
  )

  return (
    <PageWrapper maxWidth={formOpen && !isMobile ? 1200 : 900}>
      <div style={{
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
        flexDirection: isMobile ? 'column' : 'row',
      }}>

        {/* ── Lista principal ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: isMobile ? 'stretch' : 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24, gap: 12,
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
          }}>
            <div>
              <h1 style={{ fontSize: 28, color: 'var(--t1)', marginBottom: 4, fontFamily: 'var(--font-title)' }}>Hábitos</h1>
              <p style={{ color: 'var(--t2)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <Button
              onClick={formOpen ? closeForm : openNew}
              variant={formOpen ? 'neutral' : 'default'}
              id="btn-new-habit"
              style={{ width: isMobile ? '100%' : undefined }}
            >
              <i className={`ph ${formOpen ? 'ph-x' : 'ph-plus'}`} style={{ fontSize: 16 }} />
              {formOpen ? 'Cancelar' : 'Nova entrada'}
            </Button>
          </div>



          {/* Urgency banner */}
          {(() => {
            const hour = new Date().getHours()
            const pending = habits.filter(h => !h.done && !h.hidden).length
            const completed = habits.filter(h => h.done && !h.hidden).length
            const pct = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
            if (hour < 18 || pending === 0 || pct >= 70) return null
            return (
              <div style={{
                padding: '12px 16px', marginBottom: 16,
                background: pct < 30 ? '#ef593b18' : 'var(--main)',
                border: `2px solid ${pct < 30 ? '#ef593b' : 'var(--border)'}`,
                borderRadius: 'var(--radius-base)',
                boxShadow: '4px 4px 0 var(--border)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{pct < 30 ? '🚨' : '⏰'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {pending} hábito{pending > 1 ? 's' : ''} ainda pendente{pending > 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Você ainda pode completar o dia.</div>
                </div>
              </div>
            )
          })()}

          {/* Career suggestion banner */}
          {(() => {
            const unmatchedGoal = activeGoals.find(goal =>
              !habits.some(h => h.tags?.includes(goal.title))
            )
            if (!unmatchedGoal) return null
            const template = CAREER_HABIT_TEMPLATES[unmatchedGoal.category]
            return (
              <div style={{
                padding: '12px 16px', marginBottom: 16,
                background: 'var(--main)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-base)',
                boxShadow: '4px 4px 0 var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--main-foreground)' }}>
                    Sua meta '{unmatchedGoal.title}' precisa de consistência
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--main-foreground)', opacity: 0.8 }}>
                    Crie um hábito relacionado para alcançar seus objetivos.
                  </div>
                </div>
                <Button
                  label="Criar hábito"
                  onClick={() => {
                    // Pre-fill form with template
                    setEditingHabit({
                      ...template,
                      name: template.name!.replace('{meta.title}', unmatchedGoal.title),
                      tags: [unmatchedGoal.title]
                    } as Habit)
                    setEditingHabitId(null)
                    setFormOpen(true)
                  }}
                  size="sm"
                />
              </div>
            )
          })()}

          {/* Filter — action pills style */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {(['all', 'habit', 'task', 'goal', 'event'] as const).map(list => {
              const isActive = activeList === list
              return (
                <button
                  key={list}
                  onClick={() => setActiveList(list)}
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
                  {FILTER_LABELS[list]}
                </button>
              )
            })}
          </div>

          <ViewRenderer
            slots={{
              lista: (
                <>
                  {filtered.length === 0 ? (
                    <div style={{
                      padding: '48px 24px', textAlign: 'center',
                      border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
                    }}>
                      <div style={{ display: 'grid', gridAutoColumns: '3'}}>
                        <img src='/illustrations/habitsemptystate.png' alt='cat' style={{ width: 120, height: 120, margin: 'auto' }} className='invert-element' />
                        <p style={{ color: 'var(--t2)', fontSize: 15, marginBottom: 16 }}>
                          {habits.length === 0 ? 'Nenhum hábito ainda.' : `Nenhum ${LIST_LABELS[activeList as HabitList] ?? 'item'} nesta categoria.`}
                        </p>
                      </div>
                      <Button label="Criar primeiro hábito" onClick={openNew} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {filtered.map(habit => (
                        <div key={habit.id} ref={el => { cardRefs.current[habit.id] = el }}>
                            <HabitCard
                              habit={habit}
                              onToggle={handleToggle}
                              onEdit={handleEdit}
                              onRefresh={load}
                              onOpenHistorico={openHistorico}
                              onCloseHistorico={closeHistorico}
                              isHistoricoOpen={historicoOpen && selectedHabitForHistorico?.id === habit.id}
                             isMobile={isMobile}
                           />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Entradas excluídas ── */}
                  {deletedHabits.length > 0 && (
                    <div style={{ marginTop: 32 }}>
                      <button
                        onClick={() => setDeletedSectionOpen(o => !o)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', width: '100%',
                          background: 'var(--secondary-background)',
                          border: '2px solid var(--border)',
                          borderRadius: 'var(--radius-base)',
                          boxShadow: 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)',
                          cursor: 'pointer', fontSize: 13, fontWeight: 500,
                          fontFamily: 'var(--font-sans)', color: 'var(--t2)',
                          transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(var(--shadow-x), var(--shadow-y))'; e.currentTarget.style.boxShadow = 'none' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)' }}
                      >
                        <i className={`ph ${deletedSectionOpen ? 'ph-caret-down' : 'ph-caret-right'}`} style={{ fontSize: 14 }} />
                        Entradas excluídas
                        <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 12 }}>
                          {deletedHabits.length}
                        </span>
                      </button>

                      {deletedSectionOpen && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                          {deletedHabits.map(habit => (
                            <div key={habit.id} style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 14px',
                              background: 'var(--secondary-background)',
                              border: '2px solid var(--b2)',
                              borderRadius: 'var(--radius-base)',
                              opacity: 0.6,
                            }}>
                              <span style={{ fontSize: 16, flexShrink: 0 }}>{habit.icon}</span>
                              <span style={{
                                flex: 1, fontSize: 14, fontWeight: 400, color: 'var(--t2)',
                                textDecoration: 'line-through',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>
                                {habit.name}
                              </span>
                              <Button size="tiny" variant="neutral" onClick={() => handleRestore(habit.id)}>
                                <i className="ph ph-arrow-counter-clockwise" style={{ fontSize: 13 }} />
                              </Button>
                              <Button size="tiny" variant="destructive" onClick={() => handlePermanentDelete(habit.id)}>
                                <i className="ph ph-trash" style={{ fontSize: 13 }} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ),
              quadro: (
                <HabitBoard
                  habits={filtered}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                />
              ),
            }}
          />
        </div>

        {/* ── Painel do form ── */}
        {formOpen && (
          <div ref={formRef} style={{
            width: isMobile ? '100%' : 420,
            flexShrink: 0,
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? 'auto' : 24,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)',
            maxHeight: isMobile ? 'none' : 'calc(100vh - 48px)',
            order: isMobile ? -1 : 0,
            scrollMarginTop: 60,
            overflowY: 'auto',
            padding: isMobile ? 12 : 20,
          }}>
            <EntryForm
              habit={editingHabit}
              onSave={handleSave}
              onClose={closeForm}
              habits={habits}
              streak={streak}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* ── Painel do histórico ── */}
        {historicoOpen && selectedHabitForHistorico && (
          <div style={{
            width: isMobile ? '100%' : 420,
            flexShrink: 0,
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? 'auto' : 24,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: 'var(--shadow-x) var(--shadow-y) 0 var(--shadow-color)',
            maxHeight: isMobile ? 'none' : 'calc(100vh - 48px)',
            order: isMobile ? -1 : 0,
            scrollMarginTop: 60,
            overflowY: 'auto',
            padding: isMobile ? 12 : 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 500, color: 'var(--t1)' }}>Histórico - {selectedHabitForHistorico.name}</h3>
              <Button size="tiny" variant="ghost" onClick={closeHistorico}>
                <i className="ph ph-x" />
              </Button>
            </div>
            <HistoricoPanel habit={selectedHabitForHistorico} isMobile={isMobile} onRefresh={load} />
          </div>
        )}
      </div>
    </PageWrapper>
  )
}