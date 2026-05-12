import { useState, useEffect } from 'react'
import { useTheme } from '../engine/useTheme'
import { TOKEN_GROUPS } from '../tokens/groups'

const RANGE_TOKENS = new Set([
  '--border-width',
  '--shadow-x',
  '--shadow-y',
  '--radius-base',
  '--radius-sm',
  '--spacing',
  '--section-gap',
  '--grid-gap',
])

const RANGE_MAX: Record<string, number> = {
  '--border-width': 8,
  '--shadow-x': 20,
  '--shadow-y': 20,
  '--radius-base': 24,
  '--radius-sm': 24,
  '--spacing': 48,
  '--section-gap': 80,
  '--grid-gap': 48,
}

export function PaletteEditor() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState('brand')
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const { mode, toggleMode, setGlobalToken, getAllGlobalTokens, resetGlobalTokens } = useTheme()

  useEffect(() => {
    getAllGlobalTokens().then(setTokens)
  }, [mode, getAllGlobalTokens])

  const handleToken = async (key: string, value: string) => {
    setTokens(t => ({ ...t, [key]: value }))
    await setGlobalToken(key, value)
  }

  const handleReset = async () => {
    await resetGlobalTokens()
    const fresh = await getAllGlobalTokens()
    setTokens(fresh)
  }

  const drawerWidth = typeof window !== 'undefined' && window.innerWidth <= 768 ? '100vw' : '380px'

  const btnBase: React.CSSProperties = {
    flex: 1,
    height: 40,
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    fontSize: 13,
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-base)',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.1s',
  }

  const activeGroupData = TOKEN_GROUPS.find(g => g.id === activeGroup)

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-base)',
          background: 'var(--main)',
          color: 'var(--main-foreground)',
          border: '2px solid var(--border)',
          boxShadow: '4px 4px 0 var(--border)',
          fontSize: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translate(4px, 4px)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
        }}
      >
        🎨
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9998,
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: drawerWidth,
          height: '100vh',
          background: 'var(--secondary-background)',
          borderLeft: '2px solid var(--border)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: 16,
          borderBottom: '1px solid var(--b2)',
          flexShrink: 0,
        }}>
          <button
            onClick={handleReset}
            style={{
              ...btnBase,
              background: 'var(--main)',
              color: 'var(--main-foreground)',
              boxShadow: '4px 4px 0 var(--border)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(4px,4px)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
            }}
          >
            ↺ Reset global
          </button>

          <button
            onClick={toggleMode}
            style={{
              ...btnBase,
              background: 'var(--secondary-background)',
              color: 'var(--foreground)',
              boxShadow: '4px 4px 0 var(--border)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(4px,4px)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
            }}
          >
            {mode === 'dark' ? '☀ Claro' : '● Escuro'}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              ...btnBase,
              flex: 'none',
              width: 40,
              background: 'var(--secondary-background)',
              color: 'var(--foreground)',
              boxShadow: '4px 4px 0 var(--border)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(4px,4px)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '4px 4px 0 var(--border)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          padding: '12px 16px',
          borderBottom: '1px solid var(--b2)',
          flexShrink: 0,
        }}>
          {TOKEN_GROUPS.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              style={{
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'transform 0.1s, box-shadow 0.1s',
                background: activeGroup === g.id ? 'var(--main)' : 'var(--secondary-background)',
                color: activeGroup === g.id ? 'var(--main-foreground)' : 'var(--foreground)',
                boxShadow: activeGroup === g.id ? 'none' : '2px 2px 0 var(--border)',
              }}
              onMouseEnter={e => {
                if (activeGroup !== g.id) {
                  e.currentTarget.style.transform = 'translate(2px,2px)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                if (activeGroup !== g.id) e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)'
              }}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Token list */}
        <div style={{ flex: 1, padding: '8px 16px', overflowY: 'auto' }}>
          {activeGroupData && activeGroupData.tokens.map((key, i) => {
            const isRange = RANGE_TOKENS.has(key)
            const numVal = parseInt(tokens[key] ?? '0') || 0
            const max = RANGE_MAX[key] ?? 16

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '10px 0',
                  borderBottom: i < activeGroupData.tokens.length - 1 ? '1px solid var(--b2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--t2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {key.replace('--', '')}
                  </span>

                  {isRange ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="range"
                        min={0}
                        max={max}
                        value={numVal}
                        onChange={e => handleToken(key, `${e.target.value}px`)}
                        style={{ flex: 1 }}
                      />
                      <code style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        background: 'var(--bg3, #e8e4dc)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        color: 'var(--t2)',
                        minWidth: 44,
                        textAlign: 'right',
                      }}>
                        {tokens[key] ?? `${numVal}px`}
                      </code>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={tokens[key] ?? ''}
                      onChange={e => handleToken(key, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--b2)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--secondary-background)',
                        color: 'var(--foreground)',
                        outline: 'none',
                      }}
                    />
                  )}
                </div>

                {!isRange && (
                  <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: '2px 2px 0 var(--border)',
                      background: tokens[key] ?? 'transparent',
                    }} />
                    <input
                      type="color"
                      value={tokens[key]?.startsWith('#') ? tokens[key] : '#888888'}
                      onChange={e => handleToken(key, e.target.value)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
