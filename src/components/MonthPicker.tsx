import { Button } from './Button'

interface MonthPickerProps {
  selectedMonth?: string
  onSelect: (monthKey: string) => void
}

const months = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

export function MonthPicker({ selectedMonth, onSelect }: MonthPickerProps) {
  const handlePrev = () => {
    if (!selectedMonth) return
    const [year, month] = selectedMonth.split('-').map(Number)
    let newMonth = month - 1
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear = year - 1
    }
    onSelect(`${newYear}-${String(newMonth).padStart(2, '0')}`)
  }

  const handleNext = () => {
    if (!selectedMonth) return
    const [year, month] = selectedMonth.split('-').map(Number)
    let newMonth = month + 1
    let newYear = year
    if (newMonth > 12) {
      newMonth = 1
      newYear = year + 1
    }
    onSelect(`${newYear}-${String(newMonth).padStart(2, '0')}`)
  }

  const selectedIndex = selectedMonth ? parseInt(selectedMonth.split('-')[1]) - 1 : -1

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={handlePrev}
        style={{
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
          background: 'var(--secondary-background)', cursor: 'pointer',
          boxShadow: '2px 2px 0 var(--border)', transition: 'all 0.1s'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
      >
        <i className="ph ph-caret-left" style={{ color: 'var(--t2)' }} />
      </button>

      <Button
        style={{
          minWidth: 200, justifyContent: 'center', textAlign: 'center', fontWeight: 'normal',
          background: 'var(--secondary-background)', borderColor: 'var(--border)', color: 'var(--t1)',
          boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 8
        }}
      >
        <i className="ph ph-calendar" style={{ fontSize: 16 }} />
        {selectedMonth ? `${months[selectedIndex]} ${selectedMonth.split('-')[0]}` : <span>Escolha um mês</span>}
      </Button>

      <button
        onClick={handleNext}
        style={{
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
          background: 'var(--secondary-background)', cursor: 'pointer',
          boxShadow: '2px 2px 0 var(--border)', transition: 'all 0.1s'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}
      >
        <i className="ph ph-caret-right" style={{ color: 'var(--t2)' }} />
      </button>
    </div>
  )
}