import { type Habit } from '../../engine/habitDB'

export function ProgressoPanel({ habit, onClose }: { habit: Habit; onClose: () => void }) {
  const current = habit.goal_current ?? 0
  const target = habit.goal_target ?? 0
  const unit = habit.goal_unit ?? ''
  const period = habit.goal_period
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const done = pct >= 100

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px solid var(--border)', paddingBottom: 12, marginBottom: 16, background: 'var(--bg3)', margin: '-16px -16px 16px', padding: '12px 16px' }}>
        <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>Progresso — {habit.name}</span>
        <button onClick={onClose} style={{ width: 28, height: 28, border: '1.5px solid var(--b2)', borderRadius: 'var(--radius-sm)', background: 'var(--secondary-background)', cursor: 'pointer', fontSize: 13, color: 'var(--t2)' }}>✕</button>
      </div>

      {target > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{done ? '🎉' : '🎯'}</div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 40, color: done ? '#22c55e' : 'var(--t1)' }}>{pct}%</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>
              {current} {unit} de {target} {unit}
              {period ? ` / ${period}` : ''}
            </div>
          </div>

          <div style={{ height: 12, background: 'var(--bg3)', borderRadius: 6, overflow: 'hidden', border: '2px solid var(--border)' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: done ? '#22c55e' : 'var(--main)', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>

          {done && (
            <div style={{ background: '#22c55e22', border: '2px solid #22c55e', borderRadius: 'var(--radius-base)', padding: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#22c55e' }}>Meta concluída! 🎯</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 'auto' }}>
            <div style={{ background: 'var(--bg3)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>Atual</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>{current} {unit}</div>
            </div>
            <div style={{ background: 'var(--bg3)', border: '2px solid var(--border)', borderRadius: 'var(--radius-base)', padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>Meta</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t1)' }}>{target} {unit}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}>
          <i className="ph ph-chart-line-up" style={{ fontSize: 40, display: 'block', marginBottom: 12 }} />
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 16, marginBottom: 8, color: 'var(--t1)' }}>Nenhuma meta definida</div>
          <div style={{ fontSize: 13 }}>Defina uma meta numérica no hábito para ver o progresso aqui.</div>
        </div>
      )}
    </div>
  )
}
