import { useState, useEffect } from 'react'
import { Button } from '../../components/Button'
import { PageWrapper } from '../../components/PageWrapper'
import { getEconomy, labelNivel, type EconomyData } from '../../engine/economyDB'
import { useNavigate } from 'react-router-dom'

export function HubPage() {
  const navigate = useNavigate()
  const [economy, setEconomy] = useState<EconomyData | null>(null)

  useEffect(() => { getEconomy().then(setEconomy) }, [])

  return (
    <PageWrapper maxWidth={640}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '4px 4px 0 var(--border)',
            cursor: 'pointer',
            color: 'var(--foreground)',
            fontSize: 16,
            transition: 'transform 0.1s, box-shadow 0.1s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = 'none' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)' }}
        >
          <i className="ph ph-arrow-left" />
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)', marginBottom: 4 }}>Hub IO</h1>
          <p style={{ color: 'var(--t2)', fontSize: 15 }}>Gerencie sua experiência e recompensas</p>
        </div>
      </div>

      {/* IO Balance Card */}
      <div style={{
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--border)',
        background: 'var(--secondary-background)',
        padding: 24,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Saldo Total
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--font-mono, monospace)' }}>
            {economy !== null ? economy.io_saldo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--t3)' }}>IO</span>
        </div>
        <Button label="Comprar Tokens" variant="default" onClick={() => navigate('/shop')} style={{ width: '100%' }} />
      </div>

      {/* Level Progress Card */}
      <div style={{
        border: '2px solid var(--border)',
        borderRadius: 'var(--radius-base)',
        boxShadow: '4px 4px 0 var(--border)',
        background: 'var(--secondary-background)',
        padding: 24,
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)' }}>
              {economy ? `Nível ${economy.nivel} · ${labelNivel(economy.nivel)}` : 'Nível —'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>
              {economy ? `${economy.xp_total} / ${economy.xp_proximo_nivel} XP para Nível ${economy.nivel + 1}` : 'Carregando...'}
            </div>
          </div>
          <div style={{
            width: 48, height: 48,
            borderRadius: '50%',
            background: 'var(--main)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 20,
            color: 'var(--main-foreground)',
            flexShrink: 0,
            border: '2px solid var(--border)',
          }}>
            {economy ? economy.nivel : '—'}
          </div>
        </div>
        <div style={{
          width: '100%', height: 10,
          borderRadius: 5,
          background: 'var(--b2)',
          overflow: 'hidden',
          marginTop: 12,
        }}>
          <div style={{
            width: economy ? `${economy.progresso_nivel}%` : '0%',
            height: '100%',
            background: 'var(--main)',
            borderRadius: 5,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Atividade Recente */}
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        ATIVIDADE RECENTE
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {/* Item 1 — Hábito Concluído */}
        <div style={{
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          background: 'var(--secondary-background)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--bg3)',
            borderRadius: 'var(--radius-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            border: '2px solid var(--border)',
          }}>
            <i className="ph ph-check-circle" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Hábito Concluído</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--main)' }}>+50 XP</div>
        </div>

        {/* Item 2 — Upvotes Recebidos */}
        <div style={{
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          background: 'var(--secondary-background)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          borderLeft: '4px solid var(--main)',
        }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--bg3)',
            borderRadius: 'var(--radius-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            border: '2px solid var(--border)',
          }}>
            <i className="ph ph-thumbs-up" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Upvotes Recebidos</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--main)' }}>+15 XP</div>
        </div>

        {/* Item 3 — Nova Insígnia (full width) */}
        <div style={{
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-base)',
          boxShadow: '4px 4px 0 var(--border)',
          background: 'var(--secondary-background)',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          gridColumn: '1 / -1',
        }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--bg3)',
            borderRadius: 'var(--radius-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            border: '2px solid var(--border)',
            flexShrink: 0,
          }}>
            <i className="ph ph-trophy" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Nova Insígnia</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Explorador Matinal</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--main)', flexShrink: 0 }}>+200 XP</div>
        </div>
      </div>

      {/* Insígnias de Crescimento */}
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        INSÍGNIAS DE CRESCIMENTO
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {/* Insígnia 1 — Foco Total */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          padding: 16,
        }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: 'var(--radius-base)',
            border: '2px solid var(--border)',
            background: 'linear-gradient(135deg, var(--main), #ff8c00)',
          }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)', textAlign: 'center' }}>Foco Total</span>
        </div>

        {/* Insígnia 2 — Mentor Root */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          padding: 16,
        }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: 'var(--radius-base)',
            border: '2px solid var(--border)',
            background: 'linear-gradient(135deg, #9B7BFF, #6B4CE6)',
          }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)', textAlign: 'center' }}>Mentor Root</span>
        </div>

        {/* Insígnia 3 — ??? (locked) */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          padding: 16,
          opacity: 0.4,
        }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: 'var(--radius-base)',
            border: '2px solid var(--border)',
            background: 'var(--b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32,
            color: 'var(--t3)',
          }}>
            <i className="ph ph-lock" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)', textAlign: 'center' }}>???</span>
        </div>
      </div>
    </PageWrapper>
  )
}
