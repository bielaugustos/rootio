import { useState, useEffect, useRef } from 'react'



export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: string
  iconClass?: string
  shortcut?: string
  group?: string
  onSelect: () => void
}

export interface CommandKProps {
  items: CommandItem[]
  placeholder?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandK({ items, placeholder = 'o que você fez ou quer fazer?', open: externalOpen, onOpenChange }: CommandKProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const open = externalOpen ?? internalOpen

  const setOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setInternalOpen(value)
    }
  }

  const filtered = items.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.description?.toLowerCase().includes(query.toLowerCase())
  )

  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const g = item.group ?? 'Geral'
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  const flatFiltered = Object.values(groups).flat()

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setInternalOpen(prev => !prev)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setInternalOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, flatFiltered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, 0))
    }
    if (e.key === 'Enter' && flatFiltered[selected]) {
      flatFiltered[selected].onSelect()
      setOpen(false)
    }
  }

  if (!open) return null

  let flatIndex = 0

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10002,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '10vh',
    }}>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
        }}
      />

      {/* Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 640,
        margin: '0 24px',
        background: 'var(--secondary-background)',
        border: '1px solid var(--b2)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-x, 4px) var(--shadow-y, 4px) 0 var(--border)',
        animation: 'ckSlideIn 0.08s ease-out',
      }}>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          borderBottom: '1px solid var(--b2)',
        }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize: 18, color: 'var(--t3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              fontFamily: 'var(--font-sans)',
              color: 'var(--foreground)',
            }}
          />
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 8px',
            background: 'var(--bg2, #f2f2f2)',
            border: '1px solid var(--b2)',
            borderRadius: 6,
            color: 'var(--t3)',
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
          }}>
            ESC
          </div>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {flatFiltered.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--t3)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
            }}>
              Nenhum resultado encontrado
            </div>
          ) : (
            Object.entries(groups).map(([groupName, groupItems]) => (
              <div key={groupName}>
                {/* Group label */}
                <div style={{
                  padding: '8px 20px 4px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--t3)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {groupName}
                </div>

                {groupItems.map(item => {
                  const currentIndex = flatIndex++
                  const isSelected = selected === currentIndex

                  return (
                    <div
                      key={item.id}
                      onClick={() => { item.onSelect(); setOpen(false) }}
                      onMouseEnter={() => setSelected(currentIndex)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 20px',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--bg2, #f2f2f2)' : 'transparent',
                        transition: 'background 0.08s',
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--main)',
                        border: '2px solid var(--border)',
                        borderRadius: 8,
                        boxShadow: '2px 2px 0 var(--border)',
                        fontSize: 18,
                        flexShrink: 0,
                        color: 'var(--main-foreground)',
                      }}>
                        {item.iconClass ? (
                          <i className={`ph ${item.iconClass}`} />
                        ) : item.icon ? (
                          <span>{item.icon}</span>
                        ) : (
                          <i className="ph ph-caret-right" />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: 'var(--font-sans)',
                          color: 'var(--t1)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.label}
                        </div>
                        {item.description && (
                          <div style={{
                            fontSize: 12,
                            color: 'var(--t3)',
                            fontFamily: 'var(--font-sans)',
                            marginTop: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {item.description}
                          </div>
                        )}
                      </div>

                      {/* Shortcut */}
                      {item.shortcut && (
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          background: 'var(--bg3, #e8e4dc)',
                          border: '1px solid var(--b2)',
                          borderRadius: 6,
                          color: 'var(--t3)',
                          fontFamily: 'var(--font-mono)',
                          flexShrink: 0,
                        }}>
                          {item.shortcut}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderTop: '1px solid var(--b2)',
          background: 'var(--bg2, #f2f2f2)',
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { icon: 'ph-caret-down', label: 'navegar' },
              { icon: 'ph-caret-right', label: 'selecionar' },
              { icon: 'ph-eyeglass', label: 'fechar' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 6px',
                  background: 'var(--secondary-background)',
                  border: '1px solid var(--b2)',
                  borderRadius: 4,
                  color: 'var(--t3)',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <i className={`ph ${icon}`} style={{ fontSize: 10 }} />
                </span>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--font-sans)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--t3)',
            fontFamily: 'var(--font-mono)',
          }}>
            <i className="ph ph-command" style={{ fontSize: 14 }} />
            <span>K</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ckSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
