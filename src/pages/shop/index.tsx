import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/PageWrapper'
import { Button } from '../../components/Button'
import { getEconomy } from '../../engine/economyDB'
import { spendIO } from '../../engine/economyDB'
import { getProfile, updateProfile } from '../../engine/profileDB'

// ─── Catalogue ────────────────────────────────────────────────────────────────
type ShopCategory = 'avatares' | 'temas' | 'powerups'

interface ShopItem {
  id: string
  name: string
  desc: string
  price: number
  category: ShopCategory
  emoji?: string
  color?: string
  preview?: string   // CSS background or color value
  rarity: 'comum' | 'raro' | 'lendario'
}

const ITEMS: ShopItem[] = [
  // Avatares
  { id: 'av-fire',   name: '🔥 Chama',       desc: 'Para os incansáveis', price: 50,  category: 'avatares', emoji: '🔥', rarity: 'comum'   },
  { id: 'av-brain',  name: '🧠 Mente',        desc: 'Para os pensadores',  price: 50,  category: 'avatares', emoji: '🧠', rarity: 'comum'   },
  { id: 'av-rocket', name: '🚀 Foguete',      desc: 'Para os ambiciosos',  price: 100, category: 'avatares', emoji: '🚀', rarity: 'raro'    },
  { id: 'av-crown',  name: '👑 Coroa',        desc: 'Para os líderes',     price: 200, category: 'avatares', emoji: '👑', rarity: 'lendario' },
  { id: 'av-star',   name: '⭐ Estrela',      desc: 'Brilhe sempre',       price: 75,  category: 'avatares', emoji: '⭐', rarity: 'raro'    },
  { id: 'av-gem',    name: '💎 Diamante',     desc: 'Raridade suprema',    price: 500, category: 'avatares', emoji: '💎', rarity: 'lendario' },
  { id: 'av-herb',   name: '🌿 Erva',         desc: 'Natural e sereno',    price: 30,  category: 'avatares', emoji: '🌿', rarity: 'comum'   },
  { id: 'av-bolt',   name: '⚡ Relâmpago',    desc: 'Velocidade máxima',   price: 80,  category: 'avatares', emoji: '⚡', rarity: 'raro'    },
  // Temas de cor de fundo
  { id: 'bg-ocean',  name: 'Oceano',          desc: 'Azul profundo',       price: 60,  category: 'temas', color: '#1e3a5f', rarity: 'comum'   },
  { id: 'bg-forest', name: 'Floresta',        desc: 'Verde intenso',       price: 60,  category: 'temas', color: '#14532d', rarity: 'comum'   },
  { id: 'bg-dusk',   name: 'Entardecer',      desc: 'Roxo mágico',         price: 80,  category: 'temas', color: '#4c1d95', rarity: 'raro'    },
  { id: 'bg-neo',    name: 'Neon',            desc: 'Rosa vibrante',       price: 120, category: 'temas', color: '#831843', rarity: 'raro'    },
  { id: 'bg-gold',   name: 'Ouro',            desc: 'Dourado premium',     price: 250, category: 'temas', color: '#78350f', rarity: 'lendario' },
  // Power-ups
  { id: 'pu-x2',     name: 'Multiplicador ×2', desc: '+100% IO por 7 dias',  price: 150, category: 'powerups', emoji: '✖️', rarity: 'raro'    },
  { id: 'pu-shield', name: 'Escudo de Streak', desc: 'Protege 1 dia de streak', price: 80, category: 'powerups', emoji: '🛡️', rarity: 'comum' },
  { id: 'pu-turbo',  name: 'Turbo de Hábitos', desc: '+50% IO em hábitos por 3 dias', price: 100, category: 'powerups', emoji: '💨', rarity: 'raro' },
]

const RARITY_COLOR: Record<ShopItem['rarity'], string> = {
  comum:    'var(--t3)',
  raro:     '#3b82f6',
  lendario: '#f59e0b',
}

const RARITY_BG: Record<ShopItem['rarity'], string> = {
  comum:    'var(--bg3)',
  raro:     '#dbeafe',
  lendario: '#fef3c7',
}

// ─── Item card ────────────────────────────────────────────────────────────────
function ItemCard({ item, owned, canAfford, onBuy }: {
  item: ShopItem; owned: boolean; canAfford: boolean; onBuy: (item: ShopItem) => void
}) {
  return (
    <div style={{
      background: 'var(--secondary-background)',
      border: `2px solid ${owned ? 'var(--main)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: owned ? '4px 4px 0 var(--main)' : '4px 4px 0 var(--border)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'transform 0.1s, box-shadow 0.1s',
      cursor: owned ? 'default' : canAfford ? 'pointer' : 'not-allowed',
      opacity: !owned && !canAfford ? 0.7 : 1,
    }}
      onMouseEnter={e => { if (!owned && canAfford) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = owned ? '0 0 0 var(--main)' : '0 0 0 var(--border)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = owned ? '4px 4px 0 var(--main)' : '4px 4px 0 var(--border)' }}
      onClick={() => { if (!owned && canAfford) onBuy(item) }}
    >
      {/* Preview */}
      <div style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: item.color ?? 'var(--bg2)',
        fontSize: item.emoji ? 36 : 14,
        position: 'relative',
      }}>
        {item.emoji ?? ''}
        {/* Rarity badge */}
        <div style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: RARITY_BG[item.rarity], color: RARITY_COLOR[item.rarity], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {item.rarity}
        </div>
        {owned && (
          <div style={{ position: 'absolute', top: 6, left: 6, background: 'var(--main)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px 6px', fontSize: 9, fontWeight: 700 }}>
            ✓ POSSUÍDO
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{item.name}</div>
        <div style={{ fontSize: 11, color: 'var(--t3)', flex: 1 }}>{item.desc}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--main)' }}>IO {item.price}</span>
          {!owned && (
            <span style={{ fontSize: 10, fontWeight: 700, color: canAfford ? 'var(--t2)' : '#ef4444' }}>
              {canAfford ? 'Comprar →' : 'Sem IO'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({ item, onConfirm, onClose }: { item: ShopItem; onConfirm: () => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--secondary-background)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: '6px 6px 0 var(--border)', width: '100%', maxWidth: 360, overflow: 'hidden' }}>
        <div style={{ height: 100, background: item.color ?? 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
          {item.emoji ?? ''}
        </div>
        <div style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--t1)' }}>Confirmar compra</div>
          <div style={{ fontSize: 14, color: 'var(--t2)' }}>
            <strong>{item.name}</strong> por <strong style={{ color: 'var(--main)' }}>IO {item.price}</strong>
          </div>
          <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.5 }}>{item.desc}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button variant="neutral" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
            <Button variant="default" onClick={onConfirm} style={{ flex: 1 }}>
              <i className="ph ph-shopping-cart" style={{ fontSize: 16 }} /> Comprar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function ShopPage() {
  const navigate  = useNavigate()
  const [io, setIO]               = useState(0)
  const [owned, setOwned]         = useState<string[]>([])
  const [filter, setFilter]       = useState<ShopCategory | 'todos'>('todos')
  const [confirm, setConfirm]     = useState<ShopItem | null>(null)
  const [toast, setToast]         = useState<string | null>(null)

  useEffect(() => {
    getEconomy().then(e => setIO(e.io_saldo))
    getProfile().then(p => setOwned(p.shop_owned ?? []))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 3000)
  }

  const handleBuy = async (item: ShopItem) => {
    if (io < item.price) return
    await spendIO(item.price)
    const updated = [...owned, item.id]
    await updateProfile({ shop_owned: updated })

    // Apply avatar or bg instantly
    if (item.category === 'avatares' && item.emoji) {
      await updateProfile({ avatar: item.emoji, shop_owned: updated })
    } else if (item.category === 'temas' && item.color) {
      await updateProfile({ bg_cor: item.color, shop_owned: updated })
    }

    setOwned(updated)
    setIO(prev => prev - item.price)
    setConfirm(null)
    showToast(`✓ ${item.name} adicionado ao seu perfil!`)
    window.dispatchEvent(new Event('habits-changed'))
  }

  const filtered = ITEMS.filter(i => filter === 'todos' || i.category === filter)

  return (
    <PageWrapper maxWidth={860}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--t1)' }}>Loja</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* IO balance chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--main)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)', fontWeight: 700, fontSize: 14, color: 'var(--main-foreground)' }}>
            <i className="ph ph-coin" style={{ fontSize: 16 }} /> IO {io}
          </div>
          <button onClick={() => navigate('/shop/settings')} style={iconBtn}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = 'none' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)' }}>
            <i className="ph ph-gear" style={{ fontSize: 17 }} />
          </button>
        </div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 20 }}>Gaste seu IO em avatares, temas e power-ups.</p>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
        {([['todos','Todos','squares-four'],['avatares','Avatares','smiley'],['temas','Temas','palette'],['powerups','Power-ups','lightning']] as const).map(([k, label, icon]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 'var(--radius-sm)',
            border: '2px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === k ? 'var(--main)'             : 'var(--secondary-background)',
            color:      filter === k ? 'var(--main-foreground)' : 'var(--t2)',
            boxShadow:  filter === k ? '2px 2px 0 var(--border)' : 'none',
          }}>
            <i className={`ph ph-${icon}`} style={{ fontSize: 14 }} /> {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {filtered.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            owned={owned.includes(item.id)}
            canAfford={io >= item.price}
            onBuy={setConfirm}
          />
        ))}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal item={confirm} onConfirm={() => handleBuy(confirm)} onClose={() => setConfirm(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--foreground)', color: 'var(--main)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '3px 3px 0 var(--border)', padding: '10px 20px', fontSize: 14, fontWeight: 600, zIndex: 400, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </PageWrapper>
  )
}

const iconBtn: React.CSSProperties = {
  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--secondary-background)', border: '2px solid var(--border)',
  borderRadius: 'var(--radius-sm)', boxShadow: '2px 2px 0 var(--border)',
  cursor: 'pointer', color: 'var(--t2)', transition: 'transform 0.1s, box-shadow 0.1s',
}