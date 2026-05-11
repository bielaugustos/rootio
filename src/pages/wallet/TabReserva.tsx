import { Button } from '../../components/Button'
import { EmergencyFundTracker } from './EmergencyFundTracker'
import type { EmergencyReserve } from '../../engine/walletDB'

export function TabReserva({ emergency, isMobile, onAport, onRemove, onUndoAport, onOpenForm, aportPreview = 0 }: {
  emergency: EmergencyReserve | null
  isMobile?: boolean
  onAport: (amount: number) => Promise<void>
  onRemove: () => Promise<void>
  onUndoAport: () => Promise<void>
  onOpenForm: (mode: 'emergency' | 'aport') => void
  aportPreview?: number
}) {
  if (!emergency) {
    return (
      <EmptyState
        icon="ph-shield-check"
        title="Nenhuma reserva ainda"
        desc="Reserve 3 a 6 meses de despesas essenciais para imprevistos."
        onAction={() => onOpenForm('emergency')}
        btnLabel="Criar reserva de emergência"
        isMobile={isMobile}
      />
    )
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <EmergencyFundTracker
        totalGoal={emergency.target}
        currentSavings={emergency.current}
        aportes={emergency.aportes ?? []}
        aportPreview={aportPreview}
        onEdit={() => onOpenForm('emergency')}
        onAport={onAport}
        onOpenForm={onOpenForm}
        onUndoAport={onUndoAport}
        onRemove={onRemove}
      />
    </div>
  )
}

// Sub-componente
const EmptyState = ({ icon, title, desc, onAction, btnLabel, isMobile }: {
  icon: string
  title: string
  desc: string
  onAction: () => void
  btnLabel: string
  isMobile?: boolean
}) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 24px', textAlign: 'center',
    border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
    gap: 16, width: '100%', boxSizing: 'border-box',
  }}>
    <img src={`/illustrations/walletreserve.png`} alt='' style={{ width: 100, height: 100 }} />
    <div>
      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--t1)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 380, lineHeight: 1.5 }}>{desc}</div>
    </div>
    <Button
      onClick={onAction}
      style={{ background: '#F59E0B', borderColor: 'var(--border)', color: '#000', width: isMobile ? '100%' : undefined }}
    >
      <i className={`ph ${icon}`} style={{ fontSize: 14 }} /> {btnLabel}
    </Button>
  </div>
)