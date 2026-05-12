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

import { useState } from 'react'
import type { Habit } from '../../../engine/habitDB'
import { Pill } from '../../../components/Pill'

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

// ─── Mock data (remover quando auth estiver pronto) ───────────────────────────

const MOCK_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Você', handle: '@voce', avatar: '🧑', role: 'owner', status: 'accepted', seen_at: new Date().toISOString(), done_at: null },
]



// ─── ParticipantesPanel ──────────────────────────────────────────────────────

export function ParticipantesPanel({ habit }: PanelProps) {
  const [open, setOpen] = useState(false)

  const participants = MOCK_PARTICIPANTS
  const onlineCount = participants.filter(p => p.status === 'accepted').length

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
          cursor: 'pointer', width: '100%', textAlign: 'left',
          transition: 'background 0.15s',
          boxShadow: open ? '4px 4px 0 var(--border)' : '2px 2px 0 var(--border)',
        }}
      >
        {/* Stacked avatars */}
        <div style={{ display: 'flex' }}>
          {participants.slice(0, 3).map((p, i) => (
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
          marginTop: 10,
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          background: 'var(--bg2)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '2px solid var(--border)',
            background: 'var(--c-event, #9B7BFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Participantes</span>
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

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Lista de participantes */}
            {participants.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0',
                borderBottom: i < participants.length - 1 ? '0.5px solid var(--b2)' : 'none',
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
                  <button style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    border: '0.5px solid var(--b2)', background: '#FCEBEB',
                    color: '#A32D2D', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 13,
                  }}>
                    <i className="ph-bold ph-x" />
                  </button>
                )}
              </div>
            ))}

            {/* Preview de conteúdo */}
            <div style={{
              marginTop: 10, padding: '10px 12px',
              background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
              border: '0.5px solid var(--b2)',
            }}>
              <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>
                conteúdo visível para todos
              </p>
              {[
                { key: 'local', val: habit.deadline ? 'Agendado' : 'Sem local' },
                { key: 'nota', val: habit.notes || 'Sem notas' },
              ].map(({ key, val }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--t3)', minWidth: 40 }}>{key}</span>
                  <span style={{ color: 'var(--t1)' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Convidar */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <input
                type="email"
                placeholder="email@exemplo.com"
                style={{
                  flex: 1, height: 32, fontSize: 12, padding: '0 10px',
                  borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--b2)',
                  background: 'var(--bg2)', color: 'var(--t1)',
                }}
              />
              <button style={{
                height: 32, padding: '0 12px', fontSize: 12, fontWeight: 500,
                borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--b2)',
                background: 'var(--bg2)', color: 'var(--t1)', cursor: 'pointer',
              }}>
                <i className="ph-bold ph-user-plus" style={{ fontSize: 13 }} />
                Convidar
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

export function TabelaPanel({ habit }: { habit: Habit }) {
  const [open, setOpen] = useState(false)

  // Real data from habit, fallback to mock for preview
  const rawLogs: SessionLog[] = habit.session_logs ?? []
  const hasMock = rawLogs.length === 0
  const logs = hasMock ? buildMockLogs() : rawLogs

  const totalMins = logs.reduce((s, l) => s + (l.mins || 0), 0)
  const doneCount = logs.length

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

  const pillLabel = doneCount > 0 ? `Tabela · ${doneCount}` : 'Tabela'

  return (
    <div>
      <Pill
        label={pillLabel}
        variant="goal"
        size="sm"
        selected={open}
        onClick={() => setOpen(o => !o)}
        id="pill-tabela"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="1"/>
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
          </svg>
        }
      />

      {open && (
        <div style={{
          marginTop: 12,
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          background: 'var(--bg2, #fff)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0 var(--border)',
        }}>
          {/* ── Header ── */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '2px solid var(--border)',
            background: 'var(--c-goal, #F59E0B)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Tabela de sessões</span>
            <button
              onClick={exportCSV}
              style={{
                fontSize: 10, fontWeight: 500, padding: '3px 8px',
                border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg2)', cursor: 'pointer', color: 'var(--t1)',
                boxShadow: '2px 2px 0 var(--border)', fontFamily: 'var(--font-sans)',
              }}
            >
              ↓ CSV
            </button>
          </div>

          {/* ── Mock warning ── */}
          {hasMock && (
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
                <tr style={{ background: 'var(--bg3)' }}>
                  {['Data', 'Status', 'Tempo', 'Insight'].map(h => (
                    <th key={h} style={{
                      padding: '7px 12px', textAlign: 'left',
                      fontSize: 10, fontWeight: 500, color: 'var(--t3)',
                      textTransform: 'uppercase', letterSpacing: '.07em',
                      borderBottom: '1.5px solid var(--b2)',
                      whiteSpace: 'nowrap',
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
                    <td style={{ padding: '7px 12px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 500, padding: '2px 6px',
                        border: '1.5px solid #22c55e', borderRadius: 3,
                        background: '#dcfce7', color: '#15803d',
                      }}>✓ Feito</span>
                    </td>
                    <td style={{ padding: '7px 12px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--t1)', whiteSpace: 'nowrap' }}>
                      {log.mins ? `${log.mins}min` : '—'}
                    </td>
                    <td style={{ padding: '7px 12px', color: log.insight ? 'var(--t1)' : 'var(--t3)', fontStyle: log.insight ? 'normal' : 'italic', maxWidth: 200 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.insight || '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
