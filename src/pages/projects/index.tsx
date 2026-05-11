import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { Button } from '../../components/Button'

// ─── Types ────────────────────────────────────────────────────────────────────
type KanbanCol = 'todo' | 'doing' | 'done'

interface ProjectCard {
  id: string
  title: string
  tag: string
  priority: 'baixa' | 'media' | 'alta'
  col: KanbanCol
}

interface Project {
  id: string
  name: string
  emoji: string
  color: string
  cards: ProjectCard[]
  created_at: string
}

const LS_KEY = 'projects-v1'

const PRIORITY_COLOR: Record<string, string> = {
  alta: '#ef4444', media: 'var(--main)', baixa: '#22c55e',
}

const COL_META: Record<KanbanCol, { label: string; icon: string }> = {
  todo:  { label: 'A fazer',       icon: 'circle' },
  doing: { label: 'Em progresso',  icon: 'clock'  },
  done:  { label: 'Concluído',     icon: 'check-circle' },
}

const COLORS = ['#ffbf00','#ef593b','#6FB8FF','#9B7BFF','#22c55e','#f59e0b','#ec4899','#14b8a6']
const EMOJIS = ['🚀','💡','🎯','📦','⚡','🌱','🔥','🛠️','📊','🎨','🧪','🌍']

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1', name: 'Rootio App', emoji: '🚀', color: '#ffbf00',
    created_at: new Date().toISOString(),
    cards: [
      { id: 'c1', title: 'Implementar fase 3',    tag: 'dev',     priority: 'alta',  col: 'doing' },
      { id: 'c2', title: 'Testes de integração',  tag: 'qa',      priority: 'media', col: 'todo'  },
      { id: 'c3', title: 'Design do onboarding',  tag: 'design',  priority: 'baixa', col: 'done'  },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadProjects(): Project[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '') } catch { return DEFAULT_PROJECTS }
}
function saveProjects(p: Project[]) { localStorage.setItem(LS_KEY, JSON.stringify(p)) }

// ─── Card modal ───────────────────────────────────────────────────────────────
function CardModal({ card, onSave, onClose, onDelete }: {
  card: Partial<ProjectCard> | null
  onSave: (c: Partial<ProjectCard>) => void
  onClose: () => void
  onDelete?: () => void
}) {
  const [title,    setTitle]    = useState(card?.title    ?? '')
  const [tag,      setTag]      = useState(card?.tag      ?? '')
  const [priority, setPriority] = useState<ProjectCard['priority']>(card?.priority ?? 'media')
  const [col,      setCol]      = useState<KanbanCol>(card?.col ?? 'todo')
  const isEdit = !!card?.id

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '6px 6px 0 var(--border)', width: '100%', maxWidth: 400 }}>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: 'var(--t1)' }}>{isEdit ? 'Editar card' : 'Novo card'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 22 }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inp} placeholder="O que precisa ser feito?" />
          </div>
          <div>
            <label style={lbl}>Tag</label>
            <input value={tag} onChange={e => setTag(e.target.value)} style={inp} placeholder="dev, design, qa…" />
          </div>
          <div>
            <label style={lbl}>Prioridade</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['baixa','media','alta'] as const).map(p => (
                <button key={p} onClick={() => setPriority(p)} style={{ flex: 1, padding: '6px 0', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: priority === p ? PRIORITY_COLOR[p] : 'var(--secondary-background)', color: priority === p ? '#fff' : 'var(--t2)', boxShadow: priority === p ? '2px 2px 0 var(--border)' : 'none', textTransform: 'capitalize' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Coluna</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(Object.entries(COL_META) as [KanbanCol, typeof COL_META[KanbanCol]][]).map(([k, meta]) => (
                <button key={k} onClick={() => setCol(k)} style={{ flex: 1, padding: '6px 0', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: col === k ? 'var(--main)' : 'var(--secondary-background)', color: col === k ? 'var(--main-foreground)' : 'var(--t2)', boxShadow: col === k ? '2px 2px 0 var(--border)' : 'none' }}>
                  {meta.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <Button variant="default" onClick={() => onSave({ title, tag, priority, col })} style={{ flex: 1 }}>
              {isEdit ? 'Salvar' : 'Criar'}
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

// ─── Project modal ────────────────────────────────────────────────────────────
function ProjectModal({ onSave, onClose }: {
  onSave: (p: { name: string; emoji: string; color: string }) => void
  onClose: () => void
}) {
  const [name,  setName]  = useState('')
  const [emoji, setEmoji] = useState('🚀')
  const [color, setColor] = useState('#ffbf00')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '6px 6px 0 var(--border)', width: '100%', maxWidth: 400 }}>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: 'var(--t1)' }}>Novo projeto</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 22 }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="Ex: Meu SaaS" autoFocus />
          </div>
          <div>
            <label style={lbl}>Emoji</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)} style={{ width: 36, height: 36, border: `2px solid ${emoji === e ? 'var(--border)' : 'transparent'}`, borderRadius: 'var(--radius-sm)', background: emoji === e ? 'var(--main)' : 'var(--bg2)', cursor: 'pointer', fontSize: 18, boxShadow: emoji === e ? '2px 2px 0 var(--border)' : 'none' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Cor</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: color === c ? '3px solid var(--border)' : '2px solid transparent', cursor: 'pointer', boxShadow: color === c ? '2px 2px 0 var(--border)' : 'none' }} />
              ))}
            </div>
          </div>
          <Button variant="default" onClick={() => name.trim() && onSave({ name, emoji, color })}>
            Criar projeto
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban board ─────────────────────────────────────────────────────────────
function KanbanBoard({ project, onUpdate }: { project: Project; onUpdate: (p: Project) => void }) {
  const [cardModal, setCardModal] = useState<{ open: boolean; card: ProjectCard | null; col: KanbanCol }>({ open: false, card: null, col: 'todo' })

  const saveCards = (cards: ProjectCard[]) => onUpdate({ ...project, cards })

  const onSaveCard = (data: Partial<ProjectCard>) => {
    const { card, col } = cardModal
    if (card?.id) {
      saveCards(project.cards.map(c => c.id === card.id ? { ...card, ...data } : c))
    } else {
      saveCards([...project.cards, { id: Date.now().toString(), col, title: '', tag: '', priority: 'media', ...data }])
    }
    setCardModal({ open: false, card: null, col: 'todo' })
  }

  const onDeleteCard = () => {
    if (!cardModal.card) return
    saveCards(project.cards.filter(c => c.id !== cardModal.card!.id))
    setCardModal({ open: false, card: null, col: 'todo' })
  }

  const moveCard = (card: ProjectCard, to: KanbanCol) => {
    saveCards(project.cards.map(c => c.id === card.id ? { ...c, col: to } : c))
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {(Object.entries(COL_META) as [KanbanCol, typeof COL_META[KanbanCol]][]).map(([col, meta]) => {
          const colCards = project.cards.filter(c => c.col === col)
          return (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className={`ph ph-${meta.icon}`} style={{ fontSize: 15, color: 'var(--t3)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{meta.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1px 6px', color: 'var(--t3)' }}>{colCards.length}</span>
                </div>
                <button onClick={() => setCardModal({ open: true, card: null, col })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', lineHeight: 1 }}>
                  <i className="ph ph-plus" style={{ fontSize: 18 }} />
                </button>
              </div>

              {/* Cards */}
              {colCards.map(card => (
                <div key={card.id} style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', boxShadow: '3px 3px 0 var(--border)', padding: '10px 12px', cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s' }}
                  onClick={() => setCardModal({ open: true, card, col: card.col })}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--border)' }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 8, lineHeight: 1.4 }}>{card.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {card.tag && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.tag}</span>
                    )}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORITY_COLOR[card.priority], border: '1.5px solid var(--border)', flexShrink: 0 }} />
                    {/* Quick move arrows */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                      {col !== 'todo'  && <button onClick={() => moveCard(card, col === 'doing' ? 'todo'  : 'doing')} style={arrowBtn}><i className="ph ph-arrow-left"  style={{ fontSize: 11 }} /></button>}
                      {col !== 'done'  && <button onClick={() => moveCard(card, col === 'todo'  ? 'doing' : 'done' )} style={arrowBtn}><i className="ph ph-arrow-right" style={{ fontSize: 11 }} /></button>}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {colCards.length === 0 && (
                <div style={{ border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)', padding: '20px 12px', textAlign: 'center', color: 'var(--t3)', fontSize: 12, cursor: 'pointer' }}
                  onClick={() => setCardModal({ open: true, card: null, col })}>
                  + Adicionar card
                </div>
              )}
            </div>
          )
        })}
      </div>

      {cardModal.open && (
        <CardModal card={cardModal.card} onSave={onSaveCard} onClose={() => setCardModal({ open: false, card: null, col: 'todo' })} onDelete={cardModal.card ? onDeleteCard : undefined} />
      )}
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>(loadProjects)
  const [activeId, setActiveId] = useState<string>(() => loadProjects()[0]?.id ?? '')
  const [newModal, setNewModal] = useState(false)

  const save = (p: Project[]) => { setProjects(p); saveProjects(p) }

  const onNewProject = (data: { name: string; emoji: string; color: string }) => {
    const p: Project = { id: Date.now().toString(), cards: [], created_at: new Date().toISOString(), ...data }
    const updated = [...projects, p]
    save(updated); setActiveId(p.id); setNewModal(false)
  }

  const onUpdateProject = (p: Project) => save(projects.map(x => x.id === p.id ? p : x))
  const onDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id)
    save(updated); setActiveId(updated[0]?.id ?? '')
  }

  const active = projects.find(p => p.id === activeId)

  return (
    <PageWrapper maxWidth={1000}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Projetos</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/projects/settings')} style={iconBtnSm}>
            <i className="ph ph-gear" style={{ fontSize: 17 }} />
          </button>
          <Button variant="default" size="sm" onClick={() => setNewModal(true)}>
            <i className="ph ph-plus" style={{ fontSize: 15 }} /> Projeto
          </Button>
        </div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 20 }}>Organize e acompanhe iniciativas com kanban integrado.</p>

      {/* Project tabs */}
      {projects.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
          {projects.map(p => (
            <button key={p.id} onClick={() => setActiveId(p.id)} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--border)', cursor: 'pointer',
              background: activeId === p.id ? p.color : 'var(--secondary-background)',
              color: activeId === p.id ? '#000' : 'var(--t2)',
              boxShadow: activeId === p.id ? '2px 2px 0 var(--border)' : 'none',
              fontWeight: 600, fontSize: 13, transition: 'all 0.12s',
            }}>
              <span>{p.emoji}</span> {p.name}
              <span style={{ fontSize: 10, opacity: 0.6 }}>({p.cards.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Active project */}
      {active ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: active.color, border: '2px solid var(--border)', boxShadow: '2px 2px 0 var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{active.emoji}</div>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--t1)' }}>{active.name}</span>
            <button onClick={() => onDeleteProject(active.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 13 }}>
              <i className="ph ph-trash" style={{ fontSize: 16 }} />
            </button>
          </div>
          <KanbanBoard project={active} onUpdate={onUpdateProject} />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--t3)' }}>
          <i className="ph ph-folder-notch-open" style={{ fontSize: 48, display: 'block', marginBottom: 12 }} />
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, marginBottom: 8 }}>Nenhum projeto ainda</div>
          <div style={{ fontSize: 14, marginBottom: 20 }}>Crie seu primeiro projeto para começar a organizar suas iniciativas.</div>
          <Button variant="default" onClick={() => setNewModal(true)}>
            <i className="ph ph-plus" style={{ fontSize: 16 }} /> Criar projeto
          </Button>
        </div>
      )}

      {newModal && <ProjectModal onSave={onNewProject} onClose={() => setNewModal(false)} />}
    </PageWrapper>
  )
}

const arrowBtn: React.CSSProperties = { width: 20, height: 20, background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }
const iconBtnSm: React.CSSProperties = { width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)', cursor: 'pointer', color: 'var(--t2)', transition: 'transform 0.1s, box-shadow 0.1s' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg2)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--t1)', fontFamily: 'var(--font-sans)', outline: 'none' }