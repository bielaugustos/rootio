import { useState } from 'react'
import { NbAppBar, NbCard, NbTransactionRow, NbProgress, NbButton, NbDrawer, NbInput, NbBottomNav } from '../components/nb'

const MOCK_TRANSACTIONS = [
  { id:1, type:'income',  description:'Salário',   category:'salário',     amount:4800, date:'2026-04-17' },
  { id:2, type:'expense', description:'Mercado',   category:'alimentação', amount:286.4, date:'2026-04-16' },
  { id:3, type:'expense', description:'Aluguel',   category:'moradia',     amount:1200, date:'2026-04-10' },
  { id:4, type:'expense', description:'Transporte',category:'transporte',  amount:132,  date:'2026-04-08' },
]
const MOCK_GOAL = { name:'Reserva emergência', saved:3200, target:5000 }

export default function Financas({ onNavigate }) {
  const [txs, setTxs]           = useState(MOCK_TRANSACTIONS)
  const [showForm, setShowForm] = useState(false)
  const [newDesc, setNewDesc]   = useState('')
  const [newAmt, setNewAmt]     = useState('')
  const [newType, setNewType]   = useState('expense')

  const mes    = new Date().toISOString().slice(0,7)
  const saldo  = txs.filter(t => t.date.startsWith(mes))
    .reduce((a,t) => a + (t.type === 'income' ? t.amount : -t.amount), 0)
  const entradas = txs.filter(t => t.type === 'income' && t.date.startsWith(mes))
    .reduce((a,t) => a + t.amount, 0)
  const saidas   = txs.filter(t => t.type === 'expense' && t.date.startsWith(mes))
    .reduce((a,t) => a + t.amount, 0)

  const fmtBRL = v => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v)
  const goalPct = Math.round((MOCK_GOAL.saved / MOCK_GOAL.target) * 100)

  function addTx() {
    if (!newDesc.trim() || !newAmt) return
    const t = {
      id: Date.now(),
      type: newType,
      description: newDesc,
      category: newType === 'income' ? 'entrada' : 'gasto',
      amount: Math.abs(parseFloat(newAmt)),
      date: new Date().toISOString().split('T')[0],
    }
    setTxs(prev => [t, ...prev])
    setNewDesc(''); setNewAmt(''); setShowForm(false)
  }

  return (
    <div className="page">
      <NbAppBar
        title="Finanças"
        end={
          <button
            onClick={() => setShowForm(true)}
            style={{ width:28, height:28, border:'2px solid #111', background:'#fff', cursor:'pointer', fontWeight:900, fontSize:18 }}
          >+</button>
        }
      />

      <main className="page-content">
        {/* Card de saldo */}
        <NbCard variant="sun" padding={14} shadow="lg">
          <p className="label">SALDO · {new Date().toLocaleDateString('pt-BR',{month:'long'}).toUpperCase()}</p>
          <div className="display" style={{ fontSize:30, marginTop:4 }}>{fmtBRL(saldo)}</div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <span className="mono" style={{ fontSize:12, color:'#14833B' }}>↑ {fmtBRL(entradas)}</span>
            <span className="mono" style={{ fontSize:12, color:'#FF6B6B' }}>↓ {fmtBRL(saidas)}</span>
          </div>
        </NbCard>

        {/* Transações */}
        <div>
          <p className="label" style={{ marginBottom:8 }}>TRANSAÇÕES</p>
          {txs.slice(0,5).map(t => (
            <NbTransactionRow key={t.id} {...t} />
          ))}
        </div>

        {/* Meta de reserva */}
        <NbCard variant="grass" padding={12} shadow="md">
          <p className="label" style={{ marginBottom:4 }}>META · {MOCK_GOAL.name.toUpperCase()}</p>
          <div style={{ display:'flex', justifyContent:'space-between', margin:'4px 0 6px' }}>
            <span className="mono" style={{ fontWeight:700 }}>{fmtBRL(MOCK_GOAL.saved)}</span>
            <span className="mono" style={{ fontWeight:700 }}>/ {fmtBRL(MOCK_GOAL.target)}</span>
          </div>
          <NbProgress value={goalPct} color="ink" height={12} />
        </NbCard>
      </main>

      {/* Drawer nova transação */}
      <NbDrawer open={showForm} onClose={() => setShowForm(false)} title="NOVA TRANSAÇÃO">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', gap:8 }}>
            {['income','expense'].map(t => (
              <button key={t}
                onClick={() => setNewType(t)}
                style={{
                  flex:1, border:'2px solid #111', padding:'10px 0',
                  fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700,
                  textTransform:'uppercase', cursor:'pointer', borderRadius:0,
                  background: newType===t ? (t==='income'?'#7CE577':'#FF6B6B') : '#fff',
                  color: newType===t && t==='expense' ? '#fff' : 'inherit',
                }}
              >
                {t === 'income' ? '↑ Entrada' : '↓ Saída'}
              </button>
            ))}
          </div>
          <div>
            <p className="label" style={{ marginBottom:5 }}>DESCRIÇÃO</p>
            <NbInput value={newDesc} onChange={setNewDesc} placeholder="Ex: Mercado" />
          </div>
          <div>
            <p className="label" style={{ marginBottom:5 }}>VALOR (R$)</p>
            <NbInput value={newAmt} onChange={setNewAmt} type="number" placeholder="0,00" />
          </div>
          <NbButton variant="primary" block onClick={addTx} disabled={!newDesc.trim() || !newAmt}>
            <span>Salvar</span><span>→</span>
          </NbButton>
        </div>
      </NbDrawer>

      <NbBottomNav active="financas" onNavigate={onNavigate} />
    </div>
  )
}