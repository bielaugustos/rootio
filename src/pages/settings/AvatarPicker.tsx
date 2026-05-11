import { useState } from 'react'
import type { Profile } from '../../engine/profileDB'
import { Button } from '../../components/Button'

const AVATARS = ['🌻', '🔥', '⚡', '🌊', '🍀', '🎯', '🦋', '🐺', '🦊', '🐉', '🌙', '⭐']
const BG_PRESETS = ['#ffbf00', '#ef593b', '#6FB8FF', '#9B7BFF', '#7CE577', '#1D1C21', '#ffffff', '#f7f4ec']

interface AvatarPickerProps {
  profile: Profile
  onUpdate: (data: Partial<Profile>) => void
}

export function AvatarPicker({ profile, onUpdate }: AvatarPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ width: '100%' }}>
      {!open ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => setOpen(true)}>
          <div style={{
            width: 64, height: 64, fontSize: 36,
            borderRadius: 'var(--radius-base)',
            border: '2px solid var(--border)',
            boxShadow: '4px 4px 0 var(--border)',
            background: profile.bg_cor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.1s, box-shadow 0.1s',
            flexShrink: 0,
          }}>
            {profile.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
              {profile.username ?? 'Usuário'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
              Clique para editar avatar
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
            gap: 8,
            padding: 4,
            width: '100%',
          }}>
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={async () => { await onUpdate({ avatar: a }); setOpen(false) }}
                style={{
                  width: 48, height: 48, fontSize: 28,
                  border: `2px solid ${profile.avatar === a ? 'var(--border)' : 'transparent'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: profile.avatar === a ? profile.bg_cor : 'var(--bg3, #e8e4dc)',
                  cursor: 'pointer',
                  boxShadow: profile.avatar === a ? '2px 2px 0 var(--border)' : 'none',
                  transition: 'all 0.1s',
                }}
              >
                {a}
              </button>
            ))}

            {/* Botão IO — locked */}
            <button
              disabled
              title="Desbloqueie com IO"
              style={{
                width: 48, height: 48,
                border: '2px dashed var(--b2)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg3, #e8e4dc)',
                cursor: 'not-allowed',
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 20 }}>✨</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--t3)', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
              </span>
              <div style={{ position: 'absolute', top: 2, right: 3, fontSize: 9 }}>🔒</div>
            </button>
          </div>

          <div style={{ alignSelf: 'flex-end', marginTop: '40px' }}>
            <Button label="Fechar ✕" variant="ghost" size="sm" onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export function BgColorPicker({ profile, onUpdate }: AvatarPickerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {BG_PRESETS.map(color => (
        <button
          key={color}
          onClick={() => onUpdate({ bg_cor: color })}
          style={{
            width: 32, height: 32,
            background: color,
            border: `2px solid ${profile.bg_cor === color ? 'var(--border)' : 'var(--b2)'}`,
            borderRadius: 'var(--radius-sm)',
            boxShadow: profile.bg_cor === color ? '2px 2px 0 var(--border)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.1s',
            flexShrink: 0,
          }}
        />
      ))}

      {/* Botão IO — locked */}
      <button
        disabled
        title="Desbloqueie novas cores com IO"
        style={{
          width: 32, height: 32,
          border: '2px dashed var(--b2)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg3, #e8e4dc)',
          cursor: 'not-allowed',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 1,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14 }}>🎨</span>
        <span style={{ fontSize: 7, fontWeight: 700, color: 'var(--t3)', fontFamily: 'var(--font-sans)', lineHeight: 1 }}>
        </span>
        <div style={{ position: 'absolute', top: 1, right: 2, fontSize: 8 }}>🔒</div>
      </button>
    </div>
  )
}