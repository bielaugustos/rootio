import { useState } from 'react'
import { NbAppBar, NbCard, NbHabitRow, NbProgress, NbButton, NbDrawer, NbInput, NbCheck, NbTag, NbBottomNav } from '../components/nb'

const MOCK_HABITS = [
  { id:1, name:'Meditar 10min',  priority:'alta',  freq:'diario',  pts:10, done:false, days:[1,2,3,4,5] },
  { id:2, name:'Ler 10 páginas', priority:'alta',  freq:'diario',  pts:10, done:false, days:[1,3,5] },
  { id:3, name:'Caminhar 30min', priority:'baixa', freq:'semanal', pts:10, done:false, days:[1,3] },
  { id:4, name:'Beber 2L',       priority:'media', freq:'diario',  pts:10, done:true,  days:[0,1,2,3,4,5,6] },
  { id:5, name:'Dormir 22h',     priority:'media', freq:'diario',  pts:10, done:true,  days:[0,1,2,3,4,5,6] },
]
const WEEK_DAYS = [
  {id:1,l:'S'},{id:2,l:'T'},{id:3,l:'Q'},{id:4,l:'Q'},{id:5,l:'S'},{id:6,l:'S'},{id:0,l:'D'}
]

export default function Habitos({ onNavigate }) {
  const [habits, setHabits]     = useState(MOCK_HABITS)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newDays, setNewDays]   = useState([1,2,3,4,5])
  const [newPri, setNewPri]     = useState('media')

  const today  = new Date().getDay()
  const hoje   = habits.filter(h => h.days.includes(today))
  const done   = hoje.filter(h => h.done)
  const pct    = hoje.length ? Math.round((done.length / hoje.length) * 100) : 0

  function toggleHabit(id) {
    setHabits(prev => prev.map(h => h.id === id ? {...h, done: !h.done} : h))
  }

  function addHabit() {
    if (!newName.trim()) return
    const h = { id: Date.now(), name: newName, priority: newPri, freq: 'diario', pts: 10, done: false, days: newDays }
    setHabits(prev => [h, ...prev])
    setNewName(''); setShowForm(false)
  }

  const pendentes  = hoje.filter(h => !h.done)
  const concluidos = hoje.filter(h => h.done)

  return (
    <div className="page">
      <NbAppBar
        title="Hábitos"
        end={
          <button
            onClick={() => setShowForm(true)}
            style={{ width:28, height:28, border:'2px solid #111', background:'#fff', cursor:'pointer', fontWeight:900, fontSize:18 }}
          >+</button>
        }
      />

      <main className="page-content">
        {/* Resumo do dia */}
        <NbCard padding={10} shadow="md">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span className="label">PARA HOJE · {done.length}/{hoje.length}</span>
            <span className="mono" style={{ fontSize:11, fontWeight:700 }}>{pct}%</span>
          </div>
          <NbProgress value={pct} height={10} />
        </NbCard>

        {/* Pendentes */}
        {pendentes.length > 0 && (
          <div>
            <p className="label" style={{ marginBottom:8 }}>PENDENTES</p>
            {pendentes.map((h, i) => (
              <div key={h.id} className="anim-slide-up" style={{ '--i': i }}>
                <NbHabitRow {...h} onToggle={() => toggleHabit(h.id)} />
              </div>
            ))}
          </div>
        )}

        {/* Concluídos */}
        {concluidos.length > 0 && (
          <div>
            <p className="label" style={{ marginTop:16, marginBottom:8 }}>
              CONCLUÍDOS · {concluidos.length}
            </p>
            {concluidos.map(h => (
              <NbHabitRow key={h.id} {...h} onToggle={() => toggleHabit(h.id)} />
            ))}
          </div>
        )}

        {hoje.length === 0 && (
          <NbCard padding={32} shadow="md" style={{ textAlign:'center' }}>
            <p className="label" style={{ marginBottom:12 }}>NENHUM HÁBITO PARA HOJE</p>
            <NbButton variant="primary" onClick={() => setShowForm(true)}>+ Criar hábito</NbButton>
          </NbCard>
        )}
      </main>

      {/* Drawer de novo hábito */}
      <NbDrawer open={showForm} onClose={() => setShowForm(false)} title="NOVO HÁBITO">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <p className="label" style={{ marginBottom:5 }}>NOME</p>
            <NbInput
              value={newName}
              onChange={setNewName}
              placeholder="Ex: Meditar 10 minutos"
            />
          </div>

          <div>
            <p className="label" style={{ marginBottom:5 }}>FREQUÊNCIA</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
              {WEEK_DAYS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setNewDays(prev =>
                    prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id]
                  )}
                  style={{
                    border:'2px solid #111', padding:'6px 0', textAlign:'center',
                    fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700,
                    background: newDays.includes(d.id) ? 'var(--amber)' : '#fff',
                    color: newDays.includes(d.id) ? '#fff' : 'var(--mute)',
                    cursor:'pointer', borderRadius:0,
                  }}
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom:5 }}>PRIORIDADE</p>
            <div style={{ display:'flex', gap:8 }}>
              {['alta','media','baixa'].map(p => (
                <button key={p}
                  onClick={() => setNewPri(p)}
                  style={{
                    flex:1, border:'2px solid #111', padding:'8px 0',
                    fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700,
                    textTransform:'uppercase', cursor:'pointer', borderRadius:0,
                    background: newPri === p
                      ? p==='alta' ? '#FF6B6B' : p==='media' ? '#F59E0B' : '#7CE577'
                      : '#fff',
                    color: newPri === p && p==='alta' ? '#fff' : 'inherit',
                  }}
                >{p}</button>
              ))}
            </div>
          </div>

          <NbButton variant="primary" block onClick={addHabit} disabled={!newName.trim()}>
            <span>Plantar hábito</span>
            <span>→</span>
          </NbButton>
        </div>
      </NbDrawer>

      <NbBottomNav active="habitos" onNavigate={onNavigate} />
    </div>
  )
}