import { useState, useMemo } from 'react'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { ProgressRing } from './components/ProgressRing'
import { useGoals } from './hooks/useGoals'
import type { FinancialGoal } from '../../engine/walletDB'

export function TabMetas({ onOpenForm, isMobile }: {
  onOpenForm: (mode: 'goal' | 'aport', goal?: FinancialGoal) => void
  isMobile?: boolean
}) {
  const { goals, remove } = useGoals()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<string | null>(null)

  // Cálculos rápidos
  const totals = useMemo(() => {
    const saved = goals.reduce((s, g) => s + g.saved, 0)
    const target = goals.reduce((s, g) => s + g.target, 0)
    return { saved, target, pct: target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0 }
  }, [goals])

  const deleteGoal = async (id: string) => {
    await remove(id)
    setDeleteModal(null)
  }

  if (goals.length === 0) return <EmptyState onAction={() => onOpenForm('goal')} isMobile={isMobile} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', boxSizing: 'border-box' }}>
      {goals.length >= 2 && <GoalsOverview totals={totals} />}

      {goals.map(g => (
        <GoalCard
          key={g.id}
          goal={g}
          isExpanded={expandedId === g.id}
          onToggle={() => setExpandedId(expandedId === g.id ? null : g.id)}
          onEdit={() => onOpenForm('goal', g)}
          onDelete={() => setDeleteModal(g.id)}
        />
      ))}

      <Button onClick={() => onOpenForm('goal')} style={{ width: '100%', gap: 6 }}>
        <i className="ph ph-plus" style={{ fontSize: 14 }} /> Nova meta
      </Button>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)}>
        <div style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 12 }}>Excluir meta</h3>
          <p style={{ color: 'var(--t2)', marginBottom: 24 }}>Tem certeza? Esta ação não pode ser desfeita.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="neutral" onClick={() => setDeleteModal(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteModal && deleteGoal(deleteModal)}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Sub-componentes
const EmptyState = ({ onAction, isMobile }: { onAction: () => void; isMobile?: boolean }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 24px', textAlign: 'center',
    border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
    gap: 16, width: '100%', boxSizing: 'border-box',
  }}>
    <img src='/illustrations/walletemptystatenogoals.png' alt='' style={{ width: 120, height: 120 }} />
    <div>
      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)', marginBottom: 6 }}>Nenhuma meta ainda</div>
      <div style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 380, lineHeight: 1.5 }}>
        Defina um objetivo financeiro e acompanhe seu progresso passo a passo.
      </div>
    </div>
    <Button
      onClick={onAction}
      style={{ background: '#F59E0B', borderColor: 'var(--border)', color: '#000', width: isMobile ? '100%' : undefined }}
    >
      <i className="ph ph-plus" style={{ fontSize: 14 }} /> Criar primeira meta
    </Button>
  </div>
)

const GoalsOverview = ({ totals }: { totals: { saved: number; target: number; pct: number } }) => (
  <div style={{
    padding: '16px 20px', border: '2px solid var(--border)',
    borderRadius: 'var(--radius-base)', background: 'var(--secondary-background)',
    boxShadow: '4px 4px 0 var(--border)', display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <ProgressRing pct={totals.pct} size={56} color={totals.pct >= 100 ? '#22c55e' : '#f59e0b'} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        Visão geral das metas
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--t1)', lineHeight: 1 }}>
        {totals.saved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </div>
      <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>
        de {totals.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {totals.pct}% concluído
      </div>
    </div>
  </div>
)

const GoalCard = ({ goal, isExpanded, onToggle, onEdit, onDelete }: {
  goal: FinancialGoal
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) => {
  const pct = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0
  const done = pct >= 100
  const color = done ? '#22c55e' : '#f59e0b'
  const remaining = Math.max(0, goal.target - goal.saved)

  return (
    <div style={{
      border: '2px solid var(--border)', borderRadius: 'var(--radius-base)',
      background: 'var(--secondary-background)', boxShadow: '4px 4px 0 var(--border)',
      overflow: 'hidden',
    }}>
      <div
        onClick={onToggle}
        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <ProgressRing pct={pct} size={48} color={color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {goal.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>
              {goal.saved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <span style={{ fontSize: 11, color: 'var(--t3)' }}>
              / {goal.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            {done && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', background: '#dcfce7', border: '1.5px solid #22c55e', borderRadius: 99, color: '#15803d' }}>
                ✓ Concluída
              </span>
            )}
            {goal.deadline && !done && (
              <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 99 }}>
                <i className="ph ph-calendar" style={{ marginRight: 3, fontSize: 10 }} />
                {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
          {!isExpanded && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 5, background: 'var(--b2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>{pct}%</span>
            </div>
          )}
        </div>

        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
          <button
            onClick={() => onToggle()}
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--t2)', fontSize: 13, boxShadow: '2px 2px 0 var(--border)' }}
          >
            <i className={`ph ph-${isExpanded ? 'caret-up' : 'caret-down'}`} />
          </button>
          <button
            onClick={() => onEdit()}
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--t2)', fontSize: 13, boxShadow: '2px 2px 0 var(--border)' }}
          >
            <i className="ph ph-pencil-simple" />
          </button>
          <Button variant="destructive" size="tiny" onClick={() => onDelete()}>
            <i className="ph ph-trash" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--b2)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 8, background: 'var(--b2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              ['Guardado', goal.saved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color],
              ['Faltam', remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'var(--t1)'],
              ['Progresso', `${pct}%`, color],
            ].map(([l, v, c]) => (
              <div key={String(l)} style={{ flex: 1, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</span>
                <span style={{ fontSize: 15, fontWeight: 900, fontFamily: 'var(--font-mono)', color: String(c) }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}