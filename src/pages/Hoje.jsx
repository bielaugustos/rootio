import { useState } from 'react'
import {
  NbCard, NbHeroCard, NbHabitRow, NbProgress,
  NbWeekStrip, NbTicker, NbTag, NbButton, NbLevelMeter
} from '../components/nb'
import './Hoje.css'

/* Mock — substitua pelos seus stores/hooks reais */
const MOCK_HABITS = [
  { id:1, name:'Meditar 10min',   priority:'alta',  freq:'diario',   pts:10, done:false, days:[1,2,3,4,5] },
  { id:2, name:'Beber 2L de água',priority:'media', freq:'diario',   pts:10, done:false, days:[0,1,2,3,4,5,6] },
  { id:3, name:'Ler 10 páginas',  priority:'baixa', freq:'diario',   pts:10, done:true,  days:[1,3,5] },
  { id:4, name:'Caminhar 30min',  priority:'media', freq:'semanal',  pts:10, done:true,  days:[1,3] },
]

const MOCK_ECONOMY = { nivel:2, titulo:'Pessoa Conectora', xp_total:1240, xp_prox:1500, saldo_io:1240, streak:14, io_hoje:30 }
const MOCK_SPRINT  = { name:'Fundar o Hábito', periodo:'SPRINT 04 · ABRIL', dia:12, total:30, pct:40 }

export default function Hoje() {
  const [habits, setHabits] = useState(MOCK_HABITS)

  const today    = new Date().getDay()
  const hoje     = habits.filter(h => h.days?.includes(today) ?? true)
  const done     = hoje.filter(h => h.done)
  const proximo  = hoje.find(h => !h.done)
  const pct      = hoje.length ? Math.round((done.length / hoje.length) * 100) : 0
  const activeDays = [1, 2, 3]  // substitua pelo histórico real

  function toggleHabit(id) {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h))
  }

  /* Semana — datas reais */
  const ORDER  = [1,2,3,4,5,6,0]
  const today_ = new Date()
  const weekDates = ORDER.map(di => {
    const d = new Date(today_)
    d.setDate(today_.getDate() - today_.getDay() + di)
    return d.getDate()
  })

  return (
    <div className="hoje-page">

      {/* AppBar */}
      <header className="nb-appbar">
        <div className="nb-appbar__logo">IO</div>
        <span className="nb-appbar__title display">Hoje</span>
        <div className="nb-appbar__end">
          <NbTicker value={`${MOCK_ECONOMY.saldo_io} IO`} size="sm" />
          <div className="nb-avatar">🌻</div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="hoje-content">

        {/* Label do dia */}
        <div>
          <p className="label">{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</p>
          <h1 className="display" style={{ fontSize:22, marginTop:4 }}>
            {proximo ? 'O QUE FAZER AGORA?' : 'DIA COMPLETO!'}
          </h1>
        </div>

        {/* Hero — próxima ação */}
        {proximo && (
          <NbHeroCard
            kicker="▶ PRÓXIMA AÇÃO"
            title={proximo.name}
            description={`${proximo.priority} · ${proximo.freq}`}
            actionLabel="Concluir"
            onAction={() => toggleHabit(proximo.id)}
          />
        )}

        {/* Progresso do dia */}
        {hoje.length > 0 && (
          <NbCard shadow="md" padding={10}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span className="label">HOJE</span>
              <span className="mono" style={{ fontSize:11 }}>{done.length}/{hoje.length} · {pct}%</span>
            </div>
            {/* mini checkboxes */}
            <div style={{ display:'flex', gap:4, alignItems:'center', marginBottom:8 }}>
              {hoje.slice(0,7).map(h => (
                <button
                  key={h.id}
                  onClick={() => toggleHabit(h.id)}
                  style={{
                    width:18, height:18, flexShrink:0,
                    border:'2px solid #111',
                    background: h.done ? 'var(--amber)' : '#fff',
                    cursor:'pointer', borderRadius:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}
                >
                  {h.done && (
                    <svg width="10" height="8" viewBox="0 0 14 11">
                      <path d="M1 5l4 4 8-8" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="square"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <NbProgress value={pct} height={12} />
          </NbCard>
        )}

        {/* Week strip */}
        <NbCard shadow="md" padding={10}>
          <p className="label" style={{ marginBottom:8 }}>SEMANA · STREAK {MOCK_ECONOMY.streak}d</p>
          <NbWeekStrip activeDays={activeDays} compact weekDates={weekDates} />
        </NbCard>

        {/* Sprint ativo */}
        <NbCard variant="paper" shadow="md" padding={10}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <span className="label">{MOCK_SPRINT.periodo}</span>
            <NbTag variant="amber" size="sm">DIA {MOCK_SPRINT.dia}/{MOCK_SPRINT.total}</NbTag>
          </div>
          <h3 className="display" style={{ fontSize:14, marginBottom:8 }}>{MOCK_SPRINT.name}</h3>
          <NbProgress value={MOCK_SPRINT.pct} height={10} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span className="mono" style={{ fontSize:10 }}>{MOCK_SPRINT.pct}% concluído</span>
            <span className="mono" style={{ fontSize:10 }}>{MOCK_SPRINT.total - MOCK_SPRINT.dia} dias restantes</span>
          </div>
        </NbCard>

        {/* Lista de hábitos do dia */}
        {hoje.length > 0 && (
          <div>
            {done.length < hoje.length && (
              <>
                <p className="label" style={{ marginBottom:8 }}>PENDENTES</p>
                {hoje.filter(h => !h.done).map(h => (
                  <NbHabitRow key={h.id} {...h} onToggle={() => toggleHabit(h.id)} />
                ))}
              </>
            )}
            {done.length > 0 && (
              <>
                <p className="label" style={{ marginTop:16, marginBottom:8 }}>CONCLUÍDOS · {done.length}</p>
                {done.map(h => (
                  <NbHabitRow key={h.id} {...h} onToggle={() => toggleHabit(h.id)} />
                ))}
              </>
            )}
          </div>
        )}

        {/* Level meter */}
        <NbLevelMeter
          nivel={MOCK_ECONOMY.nivel}
          titulo={MOCK_ECONOMY.titulo}
          xpAtual={MOCK_ECONOMY.xp_total}
          xpProx={MOCK_ECONOMY.xp_prox}
          streak={MOCK_ECONOMY.streak}
        />

      </main>

      {/* Bottom nav */}
      <nav className="nb-bottomnav">
        {['Hoje','Hábitos','$','Prog.','Perfil'].map((label, i) => (
          <a key={label} className={i === 0 ? 'active' : ''}>
            {label}
          </a>
        ))}
      </nav>
    </div>
  )
}