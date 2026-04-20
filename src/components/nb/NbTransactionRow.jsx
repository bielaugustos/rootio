// Linha de transação financeira — receita (income) ou despesa (expense)
const ArrowUp   = () => <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2v10M3 6l4-4 4 4" stroke="#111111" strokeWidth="2.5" fill="none" strokeLinecap="square"/></svg>
const ArrowDown = () => <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 12V2M3 8l4 4 4-4" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="square"/></svg>

export function NbTransactionRow({ type = 'income', description, category, amount, date, className = '' }) {
  const isIncome = type === 'income'
  const amtFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  }).format(amount)

  const dateFormatted = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
  })

  return (
    <div className={['nb-tx', isIncome ? 'nb-tx--in' : 'nb-tx--out', className].filter(Boolean).join(' ')}>
      <div className="nb-tx__icon">
        {isIncome ? <ArrowUp /> : <ArrowDown />}
      </div>
      <div className="nb-tx__body">
        <p className="nb-tx__name">{description}</p>
        <p className="nb-tx__meta">{dateFormatted} · {category?.toUpperCase()}</p>
      </div>
      <span className="nb-tx__amt">
        {isIncome ? '+' : '−'}{amtFormatted}
      </span>
    </div>
  )
}