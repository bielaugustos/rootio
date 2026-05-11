export type Tab = 'fin' | 'metas' | 'reserva'

export type FinSubTab = 'lista' | 'detalhes'

export type FinPeriod = 'month' | 'quarter' | 'year'

export type WalletFormMode = 'transaction' | 'goal' | 'emergency' | 'aport'

export const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'fin', label: 'Finanças', icon: 'ph-currency-circle-dollar' },
  { id: 'metas', label: 'Metas', icon: 'ph-target' },
  { id: 'reserva', label: 'Reserva', icon: 'ph-medal' },
]