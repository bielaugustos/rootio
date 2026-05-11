import { useState, useEffect, useRef } from 'react'

import { PageWrapper } from '../../components/PageWrapper'
import { Button } from '../../components/Button'
import { TabFin } from './TabFin'
import { TabMetas } from './TabMetas'
import { TabReserva } from './TabReserva'
import { WalletForm, type WalletFormMode, type WalletFormData } from './WalletForm'
import { useTransactions } from './hooks/useTransactions'
import { useGoals } from './hooks/useGoals'
import { useEmergency } from './hooks/useEmergency'
import { TABS, type Tab } from './walletTypes'
import type { FinancialGoal } from '../../engine/walletDB'

export function WalletPage() {
  const { txs, add: addTx, remove: removeTx } = useTransactions()
  const { add: addGoal, update: updateGoal } = useGoals()
  const { emergency, save: saveEmergency, aport: aportEmergency, remove: removeEmergency, undoLastAport } = useEmergency()

  const [tab, setTab] = useState<Tab>('fin')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<WalletFormMode>('transaction')
  const [formGoal, setFormGoal] = useState<{ id?: string; name: string; target: number; saved?: number; deadline?: string | null } | undefined>(undefined)
  const [aportPreview, setAportPreview] = useState(0)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const openForm = (mode: WalletFormMode, goal?: typeof formGoal) => {
    setFormMode(mode)
    setFormGoal(goal)
    setFormOpen(true)
    if (isMobile) setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' }), 150)
  }

const closeForm = () => { setFormOpen(false); setAportPreview(0) }

  const handleSave = async (data: WalletFormData) => {
    const amountRaw = data.amount || '0'
    const amount = parseFloat(String(amountRaw).replace(',', '.'))
    const targetRaw = data.goalTarget || '0'
    const targetVal = parseFloat(String(targetRaw).replace(',', '.'))
    const emergencyTargetRaw = data.emergencyTarget || '0'
    const emergencyTargetVal = parseFloat(String(emergencyTargetRaw).replace(',', '.'))

    if (formMode === 'transaction') {
      const desc = (data.description || '').trim()
      const amt = isNaN(amount) ? 0 : amount
      if (amt > 0 && desc) {
        await addTx({ 
          type: data.type as 'income' | 'expense', 
          amount: amt, 
          description: desc, 
          category: data.category || 'Outros', 
          date: data.date || new Date().toISOString().split('T')[0], 
        })
        closeForm()
      }
    }

    if (formMode === 'goal') {
      const goalNameVal = data.goalName?.trim() || ''
      const tgt = isNaN(targetVal) ? 0 : targetVal
      const saved = data.goalSaved ? parseFloat(String(data.goalSaved).replace(',', '.')) : 0
      if (!goalNameVal || tgt <= 0) return
      if (formGoal?.id) {
        await updateGoal(formGoal.id, { name: goalNameVal, target: tgt, saved, deadline: data.goalDeadline || null })
      } else {
        await addGoal({ name: goalNameVal, target: tgt, saved, deadline: data.goalDeadline || null })
      }
    }

    if (formMode === 'emergency') {
      const tgt = isNaN(emergencyTargetVal) ? 0 : emergencyTargetVal
      const currentVal = data.emergencyCurrent ? parseFloat(String(data.emergencyCurrent).replace(',', '.')) : 0
      if (tgt < 0) return
      await saveEmergency({ target: tgt, current: currentVal, lastAport: null, aportes: [] })
    }

    if (formMode === 'aport') {
      const aportVal = data.emergencyTarget ? parseFloat(String(data.emergencyTarget).replace(',', '.')) : 0
      if (aportVal <= 0) return

      // Aporte em meta financeira (vem da TabMetas)
      if (formGoal?.id) {
        const currentSaved = formGoal.saved ?? 0
        await updateGoal(formGoal.id, { saved: currentSaved + aportVal })
      } else {
        // Aporte em reserva de emergência (vem da TabReserva)
        if (!emergency) return
        await aportEmergency(aportVal)
      }
    }

    closeForm()
  }

  const btnLabel = formOpen ? 'Cancelar'
    : tab === 'fin'     ? 'Nova transação'
    : tab === 'metas'   ? 'Nova meta'
    : emergency         ? 'Novo aporte'
    : 'Criar reserva'

  return (
    <PageWrapper maxWidth={isMobile ? undefined : formOpen ? 1200 : 900}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ flex: 1, minWidth: formOpen && !isMobile ? 500 : 'auto' }}>
          <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--t1)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ph ph-wallet" style={{ fontSize: 26 }} /> Carteira
              </h1>
              <p style={{ color: 'var(--t2)', fontSize: 15 }}>Finanças, metas e reserva de emergência.</p>
            </div>
            <Button
              onClick={formOpen ? closeForm : () => {
                if (tab === 'fin')    openForm('transaction')
                else if (tab === 'metas')  openForm('goal')
                else openForm(emergency ? 'aport' : 'emergency')
              }}
              variant={formOpen ? 'neutral' : 'default'}
              style={{
                width: 200,
                minWidth: 200,
              }}
            >
              <i className={`ph ${formOpen ? 'ph-x' : 'ph-plus'}`} style={{ fontSize: 16 }} />
              {btnLabel}
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); if (formOpen) closeForm() }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-sans)',
                  border: `var(--border-width) solid ${tab === t.id ? 'var(--border)' : 'var(--b2)'}`,
                  background: tab === t.id ? 'var(--main)' : 'var(--secondary-background)',
                  color: tab === t.id ? 'var(--main-foreground)' : 'var(--t2)',
                  boxShadow: tab === t.id ? 'none' : 'var(--shadow-x) var(--shadow-y) 0 var(--border)',
                  transform: tab === t.id ? 'translate(var(--shadow-x), var(--shadow-y))' : 'none',
                  transition: 'all 0.1s',
                }}
              >
                <i className={`ph ${t.icon}`} style={{ fontSize: 14 }} />
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'fin' && <TabFin txs={txs} onRefresh={() => {}} onDelete={removeTx} isMobile={isMobile} />}
          {tab === 'metas' && <TabMetas onOpenForm={(mode, goal) => openForm(mode, goal)} isMobile={isMobile} />}
          {tab === 'reserva' && <TabReserva emergency={emergency} onRemove={removeEmergency} onUndoAport={undoLastAport} isMobile={isMobile} onOpenForm={(mode) => openForm(mode)} aportPreview={formOpen && formMode === 'aport' ? aportPreview : 0} onAport={aportEmergency} />}
        </div>

        {formOpen && (
          <div ref={formRef} style={{
            width: isMobile ? '100%' : 420,
            flexShrink: 0,
            position: isMobile ? 'relative' : 'sticky',
            top: isMobile ? 0 : 24,
            zIndex: isMobile ? 50 : 'auto',
            maxHeight: isMobile ? 'none' : 'calc(100vh - 72px)',
            overflowY: 'auto',
            alignSelf: 'flex-start',
            order: isMobile ? -1 : 0,
            marginTop: isMobile ? 20 : 0,
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            background: 'var(--secondary-background)',
            boxShadow: '4px 4px 0 var(--border)',
          }}>
            <WalletForm
              mode={formMode}
              editGoal={formGoal ? { id: formGoal.id ?? '', name: formGoal.name, target: formGoal.target, saved: formGoal.saved ?? 0, deadline: formGoal.deadline, user_id: '', created_at: '' } as FinancialGoal : undefined}
              initialEmergency={emergency ? { current: emergency.current, target: emergency.target } : undefined}
              onSave={handleSave}
              onClose={closeForm}
              onAportPreviewChange={setAportPreview}
              isMobile={isMobile}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  )
}