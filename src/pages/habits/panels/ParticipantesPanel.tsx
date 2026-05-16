/**
 * ParticipantesPanel — Rootio · panels/ParticipantesPanel.tsx
 * ─────────────────────────────────────────────────────────────────
 * Lista de participantes para eventos e tarefas colaborativas.
 *
 * STATUS: Aguarda @rootio-data — depende de:
 *   • Supabase Auth (profileDB.getProfile → user_id real)
 *   • Tabela 'habit_participants' no schema remoto
 *   • RLS policies por user_id
 *
 * O placeholder mostra a UI final com dados mockados,
 * para que o @rootio-ui possa iterar no design sem bloquear.
 * Quando @rootio-data implementar auth, substituir os mocks
 * pelas chamadas reais e remover o banner de aviso.
 *
 * Schema necessário (adicionar em db/schema.sql):
 *   habit_participants (
 *     id uuid PK,
 *     habit_id uuid FK habits.id,
 *     user_id  uuid FK auth.users.id,
 *     role     text ('owner' | 'editor' | 'viewer'),
 *     status   text ('invited' | 'accepted' | 'declined'),
 *     seen_at  timestamp,
 *     done_at  timestamp,
 *     created_at timestamp
 *   )
 *
 * Uso:
 *   <ParticipantesPanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
 */

import { useState, useCallback, useEffect } from 'react'
import type { Habit } from '../../../engine/habitDB'
import { updateHabit } from '../../../engine/habitDB'
import { getProfile } from '../../../engine/profileDB'
import type { Profile } from '../../../engine/profileDB'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Participant {
  id:       string
  name:     string
  handle:   string
  avatar:   string      // emoji (v1) → URL (v2 com Supabase Storage)
  role:     'owner' | 'editor' | 'viewer'
  status:   'invited' | 'accepted' | 'declined'
  seen_at:  string | null
  done_at:  string | null
}

interface PanelProps {
  habit:     Habit
  isMobile?: boolean
  onRefresh: () => void
}

// ─── ParticipantesPanel ──────────────────────────────────────────────────────

export function ParticipantesPanel({ habit, onRefresh }: PanelProps) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [participants, setParticipants] = useState<Participant[]>(() =>
    (habit as any).participants ?? []
  )
  const [email, setEmail] = useState('')

  useEffect(() => {
    getProfile().then(setProfile)
  }, [])

  const persistParticipants = async (list: Participant[]) => {
    await updateHabit(habit.id, { ...(habit as any), participants: list })
    onRefresh()
  }

  const owner: Participant | null = profile
    ? { id: profile.id, name: profile.username ?? 'Você', handle: profile.handle ? `@${profile.handle}` : '@voce',
        avatar: profile.avatar, role: 'owner', status: 'accepted',
        seen_at: new Date().toISOString(), done_at: null }
    : null

  const allParticipants = owner ? [owner, ...participants.filter(p => p.role !== 'owner')] : participants
  const onlineCount = allParticipants.filter(p => p.status === 'accepted').length

  const handleAdd = async () => {
    const name = email.trim()
    if (!name) return
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name,
      handle: '',
      avatar: ['🧑', '👩', '👨', '🧔', '👱', '👴', '👵', '🧑‍🦰'][Math.floor(Math.random() * 8)],
      role: 'editor',
      status: 'invited',
      seen_at: null,
      done_at: null,
    }
    const next = [...participants, newParticipant]
    setParticipants(next)
    setEmail('')
    await persistParticipants(next)
  }

  const handleRemove = async (id: string) => {
    const next = participants.filter(p => p.id !== id)
    setParticipants(next)
    await persistParticipants(next)
  }

  return (
    <div>
      {/* Pill expansível */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 8px', borderRadius: 'var(--radius-sm)',
          border: '2px solid var(--border)',
          background: open ? 'var(--main)' : 'var(--bg3)',
          cursor: 'pointer', width: 'calc(100% - 24px)', textAlign: 'left',
          margin: '0 12px',
          transition: 'background 0.15s',
          boxShadow: open ? '4px 4px 0 var(--border)' : '2px 2px 0 var(--border)',
        }}
      >
        {/* Stacked avatars */}
        <div style={{ display: 'flex' }}>
          {allParticipants.slice(0, 3).map((p, i) => (
            <div key={p.id} style={{
              width: 24, height: 24, borderRadius: '50%',
              background: ['#EEEDFE', '#EAF3DE', '#FAEEDA'][i % 3], color: ['#3C3489', '#27500A', '#633806'][i % 3],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 500,
              border: '1.5px solid var(--bg2)',
              marginLeft: i === 0 ? 0 : -6,
              opacity: p.status === 'invited' ? 0.5 : 1,
            }}>
              {p.avatar}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 13, color: 'var(--t1)', flex: 1 }}>
          {onlineCount} participantes
        </span>
        {onlineCount > 0 && (
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t2)' }}>
            {onlineCount} online
          </span>
        )}
        <i className={`ph ${open ? 'ph-caret-up' : 'ph-caret-down'}`} style={{ fontSize: 15, color: 'var(--t2)' }} />
      </button>

      {/* Panel expansível */}
      {open && (
        <div style={{
          margin: '10px 12px 0',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Indie Flower' }}>Participantes</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 20,
              background: '#EAF3DE', color: '#27500A', fontSize: 11, fontWeight: 500,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#639922' }} />
              ao vivo
            </span>
          </div>

          {/* Banner */}
          {/* <div style={{
            padding: '8px 14px',
            background: '#fef9c3', borderBottom: '1.5px solid #f59e0b',
            fontSize: 11, color: '#78350f', fontWeight: 400,
          }}>
            🔧 Preview — aguarda @rootio-data (auth + Supabase)
          </div> */}

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Lista de participantes */}
            {allParticipants.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: i < allParticipants.length - 1 ? '1px solid var(--b2)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: p.status === 'accepted' ? '#22c55e' : p.status === 'invited' ? 'var(--b2)' : 'var(--main)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {p.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 400 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                    {p.status === 'invited' ? 'Convite pendente' : p.done_at ? 'Concluído' : 'Online'}
                  </div>
                </div>
                {p.role !== 'owner' && (
                  <button
                    onClick={() => handleRemove(p.id)}
                    style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid #fca5a5', background: '#fef2f2',
                      color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: 13,
                    }}
                  >
                    <i className="ph-bold ph-x" />
                  </button>
                )}
              </div>
            ))}

            {/* Preview de conteúdo */}
            <div style={{
              marginTop: 6, padding: '14px 16px',
              background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--b2)',
            }}>
              <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 8 }}>
                conteúdo visível para todos
              </p>
              {habit.notes && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: 'var(--t3)', minWidth: 54, flexShrink: 0 }}>Nota</span>
                  <span style={{ color: 'var(--t1)' }}>{habit.notes}</span>
                </div>
              )}
              {(habit.subtasks ?? []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                  <span style={{ color: 'var(--t3)', fontSize: 11 }}>Subtarefas</span>
                  {habit.subtasks.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{ color: s.done ? '#22c55e' : 'var(--t3)' }}>{s.done ? '✓' : '○'}</span>
                      <span style={{ color: 'var(--t1)' }}>{s.title}</span>
                    </div>
                  ))}
                </div>
              )}
              {(habit.session_logs ?? []).length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--t3)', minWidth: 54, flexShrink: 0 }}>Sessões</span>
                  <span style={{ color: 'var(--t1)' }}>{(habit.session_logs ?? []).length} registro(s)</span>
                </div>
              )}
              {!habit.notes && (habit.subtasks ?? []).length === 0 && (habit.session_logs ?? []).length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--t3)', fontStyle: 'italic' }}>Nenhum conteúdo adicional</div>
              )}
            </div>

            {/* Convidar */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
                placeholder="Nome do participante..."
                style={{
                  flex: 1, height: 40, fontSize: 13, padding: '0 12px',
                  borderRadius: 'var(--radius-sm)', border: '2px solid var(--b2)',
                  background: 'var(--bg2)', color: 'var(--t1)',
                }}
              />
              <button
                onClick={handleAdd}
                style={{
                  height: 40, padding: '0 16px', fontSize: 12, fontWeight: 500,
                  borderRadius: 'var(--radius-sm)', border: '2px solid var(--b2)',
                  background: 'var(--bg2)', color: 'var(--t1)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <i className="ph-bold ph-user-plus" style={{ fontSize: 14 }} />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
/**
 * TabelaPanel — Rootio · panels/TabelaPanel.tsx
 * ─────────────────────────────────────────────────────────────────
 * Grid de dados históricos de sessões (session_logs) do hábito.
 * Permite edição em lote e exportação CSV.
 *
 * STATUS: Aguarda @rootio-data — depende de:
 *   • habit.session_logs[] populado pelo HistoricoPanel
 *   • Sync com Supabase (para exportação ter dados completos)
 *
 * Quando session_logs existir no habit, remove o banner de aviso
 * e os dados reais aparecem automaticamente.
 *
 * Uso:
 *   <TabelaPanel habit={habit} isMobile={isMobile} onRefresh={onRefresh} />
 */

import type { SessionLog } from '../HistoricoPanel'

// ─── Mock data ───────────────────────────────────────────────────────────────

function buildMockLogs(): SessionLog[] {
  const logs: SessionLog[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    if (Math.random() > 0.3) {
      logs.push({
        date:       d.toISOString().slice(0, 10),
        mins:       [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)],
        insight:    i === 1 ? 'Fui mais longe hoje!' : i === 3 ? 'Difícil mas valeu' : '',
        retroativo: false,
      })
    }
  }
  return logs
}

// ─── TabelaPanel ─────────────────────────────────────────────────────────────

export function TabelaPanel({ habit, onRefresh }: { habit: Habit; onRefresh?: () => void }) {
  const [logs, setLogs] = useState<SessionLog[]>(() => {
    const saved: SessionLog[] = (habit as any).session_logs ?? []
    return saved.length > 0 ? saved : buildMockLogs()
  })
  const isMock = !(habit as any).session_logs?.length

  const totalMins = logs.reduce((s, l) => s + (l.mins || 0), 0)
  const doneCount = logs.length

  const handleDelete = useCallback(async (date: string) => {
    const next = logs.filter(l => l.date !== date)
    setLogs(next)
    await updateHabit(habit.id, { ...(habit as any), session_logs: next })
    onRefresh?.()
  }, [logs, habit, onRefresh])

  function exportCSV() {
    const header = 'Data,Concluído,Minutos,Insight,Retroativo'
    const rows = logs.map(l =>
      `${l.date},Sim,${l.mins},"${l.insight.replace(/"/g, '""')}",${l.retroativo ? 'Sim' : 'Não'}`
    ).join('\n')
    const blob = new Blob([header + '\n' + rows], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${habit.name.replace(/\s+/g, '_')}_historico.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{
        borderRadius: 'var(--radius-base)',
        overflow: 'hidden',
        boxShadow: '4px 4px 0 var(--border)',
      }}>
        {/* ── Header ── */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '2px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 13, fontWeight: 900, flex: 1, fontFamily: 'Indie Flower' }}>Tabela de sessões</span>
          <button
              onClick={exportCSV}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', fontSize: 11, fontWeight: 500,
                border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                background: 'var(--secondary-background)',
                boxShadow: '2px 2px 0 var(--border)',
                cursor: 'pointer', color: 'var(--t2)',
                fontFamily: 'var(--font-sans)',
                transition: 'transform 0.08s, box-shadow 0.08s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
            >
              ↓ CSV
            </button>
          </div>

          {/* ── Mock warning ── */}
          {isMock && (
            <div style={{
              padding: '8px 14px',
              background: '#fef9c3', borderBottom: '1.5px solid #f59e0b',
              fontSize: 11, color: '#78350f', fontWeight: 400,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              🔧 Preview com dados mockados — registre sessões no Histórico para ver dados reais
            </div>
          )}

          {/* ── Summary strip ── */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--b2)',
          }}>
            {[
              { label: 'Sessões', value: doneCount },
              { label: 'Total', value: totalMins >= 60 ? `${Math.floor(totalMins/60)}h${totalMins%60>0?` ${totalMins%60}min`:''}` : `${totalMins}min` },
              { label: 'Média', value: doneCount > 0 ? `${Math.round(totalMins/doneCount)}min` : '—' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, padding: '8px 12px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid var(--b2)' : 'none',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Table ── */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.05)' }}>
                  {['Data', 'Tempo', 'Insight', ''].map(h => (
                    <th key={h} style={{
                      padding: '7px 12px', textAlign: h ? 'left' : 'center',
                      fontSize: 10, fontWeight: 500, color: 'var(--t3)',
                      textTransform: 'uppercase', letterSpacing: '.07em',
                      borderBottom: '1.5px solid var(--b2)',
                      whiteSpace: 'nowrap', width: h ? undefined : 40,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.date} style={{ borderBottom: '1px solid var(--bg3)' }}>
                    <td style={{ padding: '7px 12px', fontFamily: 'var(--font-mono)', color: 'var(--t2)', whiteSpace: 'nowrap' }}>
                      {new Date(log.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      {log.retroativo && <span style={{ marginLeft: 5, fontSize: 9, color: 'var(--t3)' }}>retro</span>}
                    </td>
                    <td style={{ padding: '7px 12px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--t1)', whiteSpace: 'nowrap' }}>
                      {log.mins ? `${log.mins}min` : '—'}
                    </td>
                    <td style={{ padding: '7px 12px', color: log.insight ? 'var(--t1)' : 'var(--t3)', fontStyle: log.insight ? 'normal' : 'italic', maxWidth: 200 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.insight || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(log.date)}
                        title="Apagar sessão"
                        style={{
                          width: 26, height: 26,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1.5px solid #fca5a5', borderRadius: 4,
                          background: '#fef2f2', fontSize: 11, cursor: 'pointer', color: '#ef4444',
                        }}
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  )
}
