import { NbAppBar, NbCard, NbTicker, NbTag, NbAchievementCard, NbProfileEquipped, NbButton, NbBottomNav } from '../components/nb'

const CONQUISTAS_PREVIEW = [
  { id:'c1', icon:'🔥', title:'7D',    locked:false },
  { id:'c2', icon:'💰', title:'1ª META',locked:false },
  { id:'c3', icon:'📚', title:'ESTUDO', locked:false },
  { id:'c4', icon:'🏆', title:'30D',    locked:true  },
]

export default function Perfil({ onNavigate }) {
  const user = { avatar:'🌻', username:'Laura M.', handle:'laurinha', since:'ABR 24' }
  const economy = { nivel:3, saldo_io:1240, streak:14, io_hoje:30 }
  const plan = 'free'

  const pctHabitos = 87

  return (
    <div className="page">
      <NbAppBar
        title="Perfil"
        end={
          <button style={{ width:28, height:28, border:'2px solid #111', background:'#fff', cursor:'pointer', fontSize:14 }}>
            ⚙
          </button>
        }
      />

      <main className="page-content">
        {/* Hero */}
        <NbCard variant="sun" padding={14} shadow="lg">
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{
              width:64, height:64, background:'#fff', border:'3px solid #111',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:32, flexShrink:0,
            }}>
              {user.avatar}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="display" style={{ fontSize:18 }}>{user.username}</div>
              <div className="mono" style={{ fontSize:10, color:'#92400e', marginTop:3, letterSpacing:'.14em', textTransform:'uppercase' }}>
                @{user.handle} · DESDE {user.since}
              </div>
              <div style={{ display:'flex', gap:5, marginTop:6 }}>
                <NbTag variant="ink" size="sm">NV {economy.nivel}</NbTag>
                <NbTicker value={`${economy.saldo_io} IO`} size="sm" />
                {plan === 'pro' && <NbTag variant="violet" size="sm">PRO ★</NbTag>}
              </div>
            </div>
          </div>
        </NbCard>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[
            { value:economy.streak,  label:'STREAK',   bg:'#fff',     color:'#111' },
            { value:`${pctHabitos}%`,label:'HÁBITOS',  bg:'#7CE577',  color:'#111' },
            { value:23,              label:'BADGES',   bg:'#F59E0B',  color:'#fff' },
          ].map(s => (
            <div key={s.label}
              style={{
                background:s.bg, border:'4px solid #111', boxShadow:'4px 4px 0 0 #111',
                padding:'12px 8px', textAlign:'center',
              }}
            >
              <div className="display" style={{ fontSize:26, color:s.color }}>{s.value}</div>
              <div className="mono" style={{ fontSize:9, color:s.color, opacity:.75, textTransform:'uppercase', letterSpacing:'.14em', marginTop:3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Equipado */}
        <NbCard padding={12} shadow="md">
          <NbProfileEquipped
            avatar={user.avatar}
            theme="☀️"
            themeBg="#FFD23F"
            elite={null}
          />
        </NbCard>

        {/* Conquistas */}
        <NbCard padding={12} shadow="md">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span className="label">CONQUISTAS · 23/60</span>
            <span className="mono" style={{ fontSize:11, fontWeight:700, cursor:'pointer' }}>Ver →</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
            {CONQUISTAS_PREVIEW.map(c => (
              <NbAchievementCard key={c.id} {...c} size="sm" />
            ))}
          </div>
        </NbCard>

        {/* Pro gate */}
        {plan !== 'pro' && (
          <NbCard variant="violet" padding={12} shadow="md">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{
                width:36, height:36, background:'var(--sun)', border:'2px solid #111',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-display)', fontWeight:900, fontSize:18,
              }}>★</div>
              <div style={{ flex:1 }}>
                <p className="label" style={{ color:'var(--sun)', marginBottom:2 }}>PRO · VITALÍCIO</p>
                <div className="display" style={{ fontSize:18, color:'#fff' }}>R$ 12,90</div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,.8)', margin:0 }}>pagamento único · acesso vitalício</p>
              </div>
            </div>
            <NbButton variant="sun" block style={{ marginTop:12, fontSize:12 }}>
              <span>Desbloquear pra sempre ★</span>
            </NbButton>
          </NbCard>
        )}
      </main>

      <NbBottomNav active="perfil" onNavigate={onNavigate} />
    </div>
  )
}