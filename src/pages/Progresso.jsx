import { NbAppBar, NbCard, NbProgress, NbTicker, NbAchievementCard, NbSparkline, NbBottomNav } from '../components/nb'

const CONQUISTAS = [
  { id:'c1', icon:'🌱', title:'Primeiro passo',  desc:'Criou 1º hábito',  locked:false, raro:false },
  { id:'c2', icon:'🔥', title:'Semana perfeita', desc:'7 dias seguidos',  locked:false, raro:false },
  { id:'c3', icon:'🔗', title:'Conectora',       desc:'Atingiu Nv 2',     locked:false, raro:false },
  { id:'c4', icon:'🏅', title:'Mês completo',    desc:'30 dias seguidos', locked:true,  raro:false },
  { id:'c5', icon:'🔭', title:'Visionária',      desc:'Atingiu Nv 3',     locked:true,  raro:true  },
  { id:'c6', icon:'💎', title:'Milionária IO',   desc:'1.500 IO total',   locked:true,  raro:true  },
]

const MOCK_SPARK = [10,20,10,30,40,20,50,60,40,80,70,90,80,120]

export default function Progresso({ onNavigate }) {
  const economy = { nivel:2, titulo:'Pessoa Conectora', xp_total:1240, xp_prox:1500, saldo_io:1240, streak:14, io_hoje:30 }
  const pct = Math.round((economy.xp_total / economy.xp_prox) * 100)
  const unlocked = CONQUISTAS.filter(c => !c.locked).length

  return (
    <div className="page">
      <NbAppBar
        title="Progresso"
        end={<NbTicker value={`${economy.saldo_io} IO`} size="sm" />}
      />

      <main className="page-content">
        {/* Card nível — amber */}
        <NbCard variant="amber" padding={14} shadow="lg">
          <p className="label" style={{ color:'rgba(255,255,255,.8)' }}>
            NÍVEL {economy.nivel} · {economy.titulo.toUpperCase()}
          </p>
          <div className="display" style={{ fontSize:28, color:'#fff', marginTop:4 }}>
            {economy.xp_total}
            <span style={{ fontSize:16 }}>/ {economy.xp_prox} IO</span>
          </div>
          {/* Progress branco sobre amber */}
          <div style={{
            height:14, position:'relative', overflow:'hidden', marginTop:10,
            background:'rgba(255,255,255,.2)', border:'2px solid rgba(255,255,255,.4)',
          }}>
            <div style={{
              position:'absolute', inset:'0 auto 0 0', width:`${pct}%`,
              background:'#fff',
              backgroundImage:'repeating-linear-gradient(-45deg,rgba(0,0,0,.1) 0 4px,transparent 4px 8px)',
              borderRight:'2px solid rgba(255,255,255,.4)',
            }} />
          </div>
          <p className="mono" style={{ fontSize:11, color:'rgba(255,255,255,.9)', marginTop:6 }}>
            {economy.xp_prox - economy.xp_total} IO ATÉ NÍVEL {economy.nivel + 1}
          </p>
        </NbCard>

        {/* Grid stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <NbCard padding={10} shadow="md">
            <p className="label" style={{ marginBottom:2 }}>XP TOTAL</p>
            <p className="mono" style={{ fontWeight:700, fontSize:20 }}>{economy.xp_total}</p>
          </NbCard>
          <NbCard variant="grass" padding={10} shadow="md">
            <p className="label" style={{ marginBottom:2 }}>STREAK</p>
            <p className="mono" style={{ fontWeight:700, fontSize:20 }}>{economy.streak}d</p>
          </NbCard>
          <NbCard padding={10} shadow="md">
            <p className="label" style={{ marginBottom:2 }}>HOJE</p>
            <p className="mono" style={{ fontWeight:700, fontSize:20 }}>+{economy.io_hoje}</p>
          </NbCard>
          <NbCard variant="sun" padding={10} shadow="md">
            <p className="label" style={{ marginBottom:2 }}>CONQUISTAS</p>
            <p className="mono" style={{ fontWeight:700, fontSize:20 }}>{unlocked}/{CONQUISTAS.length}</p>
          </NbCard>
        </div>

        {/* Sparkline */}
        <NbCard padding={14} shadow="md">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span className="label">IO · ÚLTIMOS 14 DIAS</span>
            <span className="mono" style={{ fontWeight:700, fontSize:13 }}>+{economy.xp_total}</span>
          </div>
          <NbSparkline data={MOCK_SPARK} startLabel="04 ABR" />
        </NbCard>

        {/* Conquistas */}
        <div>
          <p className="label" style={{ marginBottom:8 }}>CONQUISTAS</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {CONQUISTAS.map((c, i) => (
              <div key={c.id} className="anim-scale-in" style={{ '--i': i }}>
                <NbAchievementCard {...c} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <NbBottomNav active="progresso" onNavigate={onNavigate} />
    </div>
  )
}