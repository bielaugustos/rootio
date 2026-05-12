import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { Button } from '../../components/Button'
import { getEconomy } from '../../engine/economyDB'
import { getProfile } from '../../engine/profileDB'

// ─── Types ────────────────────────────────────────────────────────────────────
type GoalStatus = 'active' | 'done' | 'paused'
type GoalCategory = 'cargo' | 'habilidade' | 'network' | 'projeto' | 'educacao' | 'financeiro'

interface CareerGoal {
  id: string
  title: string
  category: GoalCategory
  status: GoalStatus
  deadline: string | null   // ISO date
  progress: number          // 0-100
  notes: string
  milestones: { id: string; text: string; done: boolean }[]
  created_at: string
}

const LS_KEY = 'career-goals-v1'

const CATEGORY_META: Record<GoalCategory, { label: string; icon: string; color: string }> = {
  cargo:       { label: 'Cargo',       icon: 'briefcase',      color: '#1976D2' },
  habilidade:  { label: 'Habilidade',  icon: 'graduation-cap', color: '#7B1FA2' },
  network:     { label: 'Network',     icon: 'users',          color: '#00796B' },
  projeto:     { label: 'Projeto',     icon: 'folder-notch',   color: '#E64A19' },
  educacao:    { label: 'Educação',    icon: 'book-open',      color: '#1565C0' },
  financeiro:  { label: 'Financeiro',  icon: 'trend-up',       color: '#2E7D32' },
}

function getUnlockedCategories(nivel: number): GoalCategory[] {
  const unlocks: Record<number, GoalCategory[]> = {
    1: ['habilidade', 'educacao'],
    3: ['cargo', 'network'],
    5: ['projeto', 'financeiro'],
  }
  const all = Object.keys(CATEGORY_META) as GoalCategory[]
  return all.filter(cat => {
    for (const [minLevel, cats] of Object.entries(unlocks)) {
      if (nivel >= Number(minLevel) && cats.includes(cat)) return true
    }
    return nivel >= 1 && ['habilidade', 'educacao'].includes(cat) // base
  })
}

const DEFAULT_GOALS: CareerGoal[] = [
  {
    id: '1', title: 'Alcançar cargo Sênior', category: 'cargo', status: 'active',
    deadline: (() => { const d = new Date(); d.setMonth(d.getMonth() + 4); return d.toISOString().split('T')[0] })(),
    progress: 45, notes: 'Focando em liderança técnica e entregas consistentes.',
    milestones: [
      { id: 'm1', text: 'Tech talk interno feito', done: true },
      { id: 'm2', text: 'Liderar projeto solo',    done: false },
      { id: 'm3', text: 'Avaliação de desempenho', done: false },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '2', title: 'Dominar TypeScript avançado', category: 'habilidade', status: 'active',
    deadline: null, progress: 70, notes: '',
    milestones: [
      { id: 'm4', text: 'Generics e conditional types', done: true },
      { id: 'm5', text: 'Criar biblioteca tipada',      done: false },
    ],
    created_at: new Date().toISOString(),
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function GoalCard({ goal, onEdit, onToggleMilestone }: {
  goal: CareerGoal
  onEdit: (g: CareerGoal) => void
  onToggleMilestone: (goalId: string, milestoneId: string) => void
}) {
  const meta = CATEGORY_META[goal.category]
  const doneMilestones = goal.milestones.filter(m => m.done).length
  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div style={{
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)',
      boxShadow: '4px 4px 0 var(--border)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', background: meta.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`ph ph-${meta.icon}`} style={{ fontSize: 20, color: meta.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, color: 'var(--t1)' }}>{goal.title}</span>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: goal.status === 'done' ? 'var(--main)' : goal.status === 'paused' ? 'var(--bg3)' : 'transparent', color: 'var(--t2)' }}>
              {goal.status === 'done' ? 'Concluído' : goal.status === 'paused' ? 'Pausado' : meta.label}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${goal.progress}%`, background: meta.color, borderRadius: 'var(--radius-sm)', transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)', flexShrink: 0 }}>{goal.progress}%</span>
          </div>
        </div>
        <button onClick={() => onEdit(goal)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, flexShrink: 0 }}>
          <i className="ph ph-dots-three-vertical" style={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Milestones */}
      {goal.milestones.length > 0 && (
        <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {goal.milestones.map(m => (
            <button key={m.id} onClick={() => onToggleMilestone(goal.id, m.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0',
            }}>
              <i className={`ph ${m.done ? 'ph-check-circle-fill' : 'ph-circle'}`}
                style={{ fontSize: 18, color: m.done ? 'var(--main)' : 'var(--b2)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: m.done ? 'var(--t3)' : 'var(--t2)', textDecoration: m.done ? 'line-through' : 'none' }}>
                {m.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Footer meta */}
      <div style={{ borderTop: '1px solid var(--b2)', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--t3)' }}>
          <i className="ph ph-flag-checkered" style={{ fontSize: 13, marginRight: 4 }} />
          {doneMilestones}/{goal.milestones.length} marcos
        </span>
        {daysLeft !== null && (
          <span style={{ fontSize: 12, color: daysLeft < 14 ? '#ef4444' : 'var(--t3)' }}>
            <i className="ph ph-clock" style={{ fontSize: 13, marginRight: 4 }} />
            {daysLeft > 0 ? `${daysLeft} dias` : 'Vencido'}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Modal de novo/editar goal ────────────────────────────────────────────────
function GoalModal({ goal, onSave, onClose, onDelete, nivel }: {
  goal: Partial<CareerGoal> | null
  onSave: (g: Partial<CareerGoal>) => void
  onClose: () => void
  onDelete?: () => void
  nivel: number
}) {
  const [title, setTitle]       = useState(goal?.title ?? '')
  const [category, setCategory] = useState<GoalCategory>(goal?.category ?? 'cargo')
  const [progress, setProgress] = useState(goal?.progress ?? 0)
  const [deadline, setDeadline] = useState(goal?.deadline ?? '')
  const [notes, setNotes]       = useState(goal?.notes ?? '')
  const isEdit = !!goal?.id

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '6px 6px 0 var(--border)', width: '100%', maxWidth: 440, maxHeight: '90dvh', overflow: 'auto' }}>
        <div style={{ padding: '18px 20px', borderBottom: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--t1)' }}>{isEdit ? 'Editar meta' : 'Nova meta'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Alcançar cargo Sênior" style={inputStyle} />
          </div>
            <div>
              <label style={labelStyle}>Categoria</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(Object.entries(CATEGORY_META) as [GoalCategory, typeof CATEGORY_META[GoalCategory]][])
                  .filter(([key]) => getUnlockedCategories(nivel).includes(key))
                  .map(([key, meta]) => (
                  <button key={key} onClick={() => setCategory(key)} style={{
                    padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 400,
                    background: category === key ? 'var(--main)' : 'var(--secondary-background)',
                    color: category === key ? 'var(--main-foreground)' : 'var(--t2)',
                    boxShadow: category === key ? '2px 2px 0 var(--border)' : 'none',
                  }}>
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>
          <div>
            <label style={labelStyle}>Progresso — {progress}%</label>
            <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--main)' }} />
          </div>
          <div>
            <label style={labelStyle}>Prazo (opcional)</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Contexto, próximos passos..." style={{ ...inputStyle, resize: 'vertical', height: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <Button variant="default" onClick={() => onSave({ title, category, progress, deadline: deadline || null, notes })} style={{ flex: 1 }}>
              {isEdit ? 'Salvar' : 'Criar meta'}
            </Button>
            {isEdit && onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <i className="ph ph-trash" style={{ fontSize: 16 }} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function CareerPage() {
  const navigate = useNavigate()
  const [goals, setGoals] = useState<CareerGoal[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '') } catch { return DEFAULT_GOALS }
  })
  const [modal, setModal] = useState<{ open: boolean; goal: CareerGoal | null }>({ open: false, goal: null })
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all')
  const [economy, setEconomy] = useState<{ nivel: number }>({ nivel: 1 })
  const [plan, setPlan] = useState<'free' | 'pro'>('free')

  useEffect(() => {
    Promise.all([
      getEconomy().then(data => setEconomy({ nivel: data.nivel })),
      getProfile().then(p => setPlan(p.plan))
    ])
  }, [])

  const save = (updated: CareerGoal[]) => {
    setGoals(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }

  const onSave = (data: Partial<CareerGoal>) => {
    if (modal.goal) {
      save(goals.map(g => g.id === modal.goal!.id ? { ...modal.goal!, ...data } : g))
    } else {
      const newGoal: CareerGoal = {
        id: Date.now().toString(), status: 'active', milestones: [],
        created_at: new Date().toISOString(),
        ...data,
      } as CareerGoal
      save([newGoal, ...goals])
    }
    setModal({ open: false, goal: null })
  }

  const onDelete = () => {
    if (!modal.goal) return
    save(goals.filter(g => g.id !== modal.goal!.id))
    setModal({ open: false, goal: null })
  }

  const onToggleMilestone = (goalId: string, milestoneId: string) => {
    save(goals.map(g => g.id !== goalId ? g : {
      ...g,
      milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m),
      progress: (() => {
        const updated = g.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m)
        const done = updated.filter(m => m.done).length
        return updated.length > 0 ? Math.round((done / updated.length) * 100) : g.progress
      })(),
    }))
  }

  const filtered = goals.filter(g => filter === 'all' || g.status === filter)
  const active = goals.filter(g => g.status === 'active').length
  const done   = goals.filter(g => g.status === 'done').length
  const avgPct = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0

  return (
    <PageWrapper maxWidth={760}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Carreira</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/career/settings')} style={iconBtnSm} title="Ajustes">
            <i className="ph ph-gear" style={{ fontSize: 17 }} />
          </button>
          <Button variant="default" size="sm" onClick={() => setModal({ open: true, goal: null })}>
            <i className="ph ph-plus" style={{ fontSize: 15 }} /> Meta
          </Button>
        </div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 24 }}>Gerencie sua jornada profissional e metas de crescimento.</p>

      {plan === 'free' && (
        <div style={{
          background: 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '3px 3px 0 var(--border)',
          padding: '16px 18px',
          marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <i className="ph ph-lock" style={{ fontSize: 24, color: 'var(--main)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: 'var(--t1)', marginBottom: 4 }}>
              Recursos avançados no Pro
            </div>
            <p style={{ fontSize: 14, color: 'var(--t2)', margin: 0 }}>
              Desbloqueie metas ilimitadas, relatórios avançados e integração com hábitos.
            </p>
          </div>
          <Button variant="default" size="sm">
            Upgrade Pro
          </Button>
        </div>
      )}

      {/* ── Summary bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Em andamento', value: active, icon: 'lightning', color: 'var(--main)' },
          { label: 'Concluídas',   value: done,   icon: 'check-fat', color: '#22c55e'     },
          { label: 'Progresso',    value: `${avgPct}%`, icon: 'trend-up', color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <i className={`ph ph-${s.icon}`} style={{ fontSize: 20, color: s.color }} />
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--t1)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tips based on level ── */}
      {economy.nivel === 1 && (
        <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)', padding: '16px 18px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <i className="ph ph-lightbulb" style={{ fontSize: 20, color: 'var(--main)' }} />
            <span style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: 'var(--t1)' }}>Dicas para metas de habilidade</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--t2)', margin: 0 }}>
            Foque em aprender novas tecnologias passo a passo. Comece com fundamentos e construa projetos práticos para consolidar o conhecimento.
          </p>
        </div>
      )}
      {economy.nivel >= 5 && (
        <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)', padding: '16px 18px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <i className="ph ph-trend-up" style={{ fontSize: 20, color: '#3b82f6' }} />
            <span style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: 'var(--t1)' }}>Previsões de tendência</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--t2)', margin: 0 }}>
            Mercados emergentes em AI, sustentabilidade e trabalho remoto. Invista em habilidades transversais como comunicação e liderança.
          </p>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {([['all', 'Todas'], ['active', 'Em andamento'], ['done', 'Concluídas'], ['paused', 'Pausadas']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, cursor: 'pointer',
            background: filter === val ? 'var(--main)'             : 'var(--secondary-background)',
            color:      filter === val ? 'var(--main-foreground)' : 'var(--t2)',
            boxShadow:  filter === val ? '2px 2px 0 var(--border)' : 'none',
            transition: 'all 0.12s',
          }}>{label}</button>
        ))}
      </div>

      {/* ── Goals list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--t3)' }}>
            <i className="ph ph-briefcase" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, marginBottom: 8 }}>Nenhuma meta aqui</div>
            <div style={{ fontSize: 14 }}>Crie sua primeira meta de carreira para começar.</div>
          </div>
        ) : (
          filtered.map(g => (
            <GoalCard key={g.id} goal={g}
              onEdit={goal => setModal({ open: true, goal })}
              onToggleMilestone={onToggleMilestone} />
          ))
        )}
      </div>

      {/* ── Modal ── */}
      {modal.open && (
        <GoalModal
          goal={modal.goal}
          onSave={onSave}
          onClose={() => setModal({ open: false, goal: null })}
          onDelete={modal.goal ? onDelete : undefined}
          nivel={economy.nivel}
        />
      )}
    </PageWrapper>
  )
}

const iconBtnSm: React.CSSProperties = {
  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--secondary-background)', border: '2px solid var(--border)',
  borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)',
  cursor: 'pointer', color: 'var(--t2)', transition: 'transform 0.1s, box-shadow 0.1s',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--t3)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  background: 'var(--bg2)', border: '2px solid var(--border)',
  borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--t1)',
  fontFamily: 'var(--font-sans)', outline: 'none',
}
