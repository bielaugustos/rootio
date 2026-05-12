import {
  useState, useEffect, useRef, useCallback,
  createContext, useContext, type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'

export type ViewId =
  | 'lista'
  | 'tabela'
  | 'quadro'
  | 'calendario'
  | 'cronograma'
  | 'galeria'
  | 'grafico'
  | 'feed'
  | 'mapa'
  | 'painel'

export interface DisplaySettings {
  linhasVerticais: boolean
  exibirIcone:     boolean
  envolverConteudo: boolean
  abrirEm: 'completo' | 'lateral' | 'central'
}

export interface ViewState {
  view:    ViewId
  display: DisplaySettings
}

export type PageKey = 'habits' | 'wallet' | 'projects' | 'sprint' | 'career' | 'finance' | 'feed' | 'progress' | 'default'

const PAGE_VIEWS: Record<PageKey, ViewId[]> = {
  habits:   ['lista',  'tabela',    'quadro',    'calendario', 'cronograma', 'galeria', 'grafico', 'painel'],
  wallet:   ['lista',  'tabela',    'grafico',   'calendario', 'painel'],
  projects: ['quadro', 'lista',     'tabela',    'cronograma', 'calendario', 'galeria', 'painel'],
  sprint:   ['quadro', 'lista',     'cronograma', 'painel'],
  career:   ['lista',  'tabela',    'quadro',    'cronograma', 'galeria', 'painel'],
  finance:  ['lista',  'tabela',    'grafico',   'calendario', 'painel'],
  feed:     ['feed',   'lista',     'galeria',   'painel'],
  progress: ['painel', 'grafico',   'cronograma', 'lista'],
  default:  ['lista',  'tabela',    'quadro',    'painel'],
}

const PAGE_DEFAULT_VIEW: Record<PageKey, ViewId> = {
  habits:   'lista',
  wallet:   'lista',
  projects: 'quadro',
  sprint:   'quadro',
  career:   'lista',
  finance:  'tabela',
  feed:     'feed',
  progress: 'painel',
  default:  'lista',
}

const ROUTE_PAGE: Record<string, PageKey> = {
  '/habits':   'habits',
  '/wallet':   'wallet',
  '/projects': 'projects',
  '/sprint':   'sprint',
  '/career':   'career',
  '/finance':  'finance',
  '/feed':     'feed',
  '/progress': 'progress',
}

interface ViewMeta {
  id:    ViewId
  label: string
  icon:  ReactNode
  desc:  string
}

const VIEWS: ViewMeta[] = [
  {
    id: 'lista', label: 'Lista', desc: 'Itens em sequência vertical',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="5" y1="4" x2="13" y2="4"/>
        <line x1="5" y1="8" x2="13" y2="8"/>
        <line x1="5" y1="12" x2="13" y2="12"/>
        <circle cx="2.5" cy="4"  r="1" fill="currentColor" stroke="none"/>
        <circle cx="2.5" cy="8"  r="1" fill="currentColor" stroke="none"/>
        <circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'tabela', label: 'Tabela', desc: 'Grade de dados estilo planilha',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1.5" y="1.5" width="13" height="13" rx="1"/>
        <line x1="1.5" y1="5.5"  x2="14.5" y2="5.5"/>
        <line x1="1.5" y1="9.5"  x2="14.5" y2="9.5"/>
        <line x1="6"   y1="5.5"  x2="6"    y2="14.5"/>
        <line x1="10.5" y1="5.5" x2="10.5" y2="14.5"/>
      </svg>
    ),
  },
  {
    id: 'quadro', label: 'Quadro', desc: 'Colunas Kanban por status',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1"  y="1" width="4" height="14" rx="1"/>
        <rect x="6"  y="1" width="4" height="10" rx="1"/>
        <rect x="11" y="1" width="4" height="7"  rx="1"/>
      </svg>
    ),
  },
  {
    id: 'calendario', label: 'Calendário', desc: 'Visão mensal por datas',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1.5" y="2.5" width="13" height="12" rx="1"/>
        <line x1="1.5" y1="6.5"  x2="14.5" y2="6.5"/>
        <line x1="5"   y1="1"    x2="5"    y2="4"/>
        <line x1="11"  y1="1"    x2="11"   y2="4"/>
        <rect x="3.5" y="8.5"  width="2" height="2" rx="0.4" fill="currentColor" stroke="none"/>
        <rect x="7"   y="8.5"  width="2" height="2" rx="0.4" fill="currentColor" stroke="none"/>
        <rect x="10.5" y="8.5" width="2" height="2" rx="0.4" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'cronograma', label: 'Cronograma', desc: 'Linha do tempo (Gantt)',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="1.5" y1="4"  x2="14.5" y2="4"/>
        <line x1="1.5" y1="8"  x2="14.5" y2="8"/>
        <line x1="1.5" y1="12" x2="14.5" y2="12"/>
        <rect x="2"  y="2.5" width="6" height="3" rx="1" fill="currentColor" stroke="none" opacity=".7"/>
        <rect x="6"  y="6.5" width="7" height="3" rx="1" fill="currentColor" stroke="none" opacity=".7"/>
        <rect x="3"  y="10.5" width="5" height="3" rx="1" fill="currentColor" stroke="none" opacity=".7"/>
      </svg>
    ),
  },
  {
    id: 'galeria', label: 'Galeria', desc: 'Cards em grade visual',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1"  y="1"  width="6" height="6" rx="1"/>
        <rect x="9"  y="1"  width="6" height="6" rx="1"/>
        <rect x="1"  y="9"  width="6" height="6" rx="1"/>
        <rect x="9"  y="9"  width="6" height="6" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'grafico', label: 'Gráfico', desc: 'Análise visual de dados',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="1.5,12 5,7 8,9.5 11.5,4 14.5,6"/>
        <line x1="1.5" y1="14" x2="14.5" y2="14"/>
        <line x1="1.5" y1="2"  x2="1.5"  y2="14"/>
      </svg>
    ),
  },
  {
    id: 'feed', label: 'Feed', desc: 'Posts e atualizações em sequência',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1.5" y="1.5" width="13" height="5" rx="1"/>
        <rect x="1.5" y="9"   width="13" height="5" rx="1"/>
        <line x1="3.5" y1="3.5" x2="7" y2="3.5"/>
        <line x1="3.5" y1="5"   x2="10" y2="5"/>
        <line x1="3.5" y1="11" x2="7" y2="11"/>
        <line x1="3.5" y1="12.5" x2="10" y2="12.5"/>
      </svg>
    ),
  },
  {
    id: 'mapa', label: 'Mapa', desc: 'Visão geográfica ou de relações',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1,3 6,1 10,3 15,1 15,13 10,15 6,13 1,15"/>
        <line x1="6"  y1="1"  x2="6"  y2="13"/>
        <line x1="10" y1="3"  x2="10" y2="15"/>
      </svg>
    ),
  },
  {
    id: 'painel', label: 'Painel', desc: 'Dashboard com resumo e métricas',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1"  y="1"  width="6" height="4" rx="1"/>
        <rect x="9"  y="1"  width="6" height="8" rx="1"/>
        <rect x="1"  y="7"  width="6" height="8" rx="1"/>
        <rect x="9"  y="11" width="6" height="4" rx="1"/>
      </svg>
    ),
  },
]

interface ViewContextValue {
  page:    PageKey
  state:   ViewState
  setView: (v: ViewId) => void
  setDisplay: (d: Partial<DisplaySettings>) => void
}

const ViewContext = createContext<ViewContextValue | null>(null)

const DEFAULT_DISPLAY: DisplaySettings = {
  linhasVerticais:  false,
  exibirIcone:      true,
  envolverConteudo: false,
  abrirEm:          'lateral',
}

function storageKey(page: PageKey) { return `rootio-view-${page}` }

function loadState(page: PageKey): ViewState {
  try {
    const raw = localStorage.getItem(storageKey(page))
    if (raw) return JSON.parse(raw) as ViewState
  } catch {}
  return { view: PAGE_DEFAULT_VIEW[page], display: { ...DEFAULT_DISPLAY } }
}

function saveState(page: PageKey, s: ViewState) {
  localStorage.setItem(storageKey(page), JSON.stringify(s))
}

export function ViewProvider({ children }: { children: ReactNode }) {
  const location  = useLocation()
  const page      = (ROUTE_PAGE[location.pathname] ?? 'default') as PageKey
  const [state, setState] = useState<ViewState>(() => loadState(page))

  useEffect(() => { setState(loadState(page)) }, [page])

  const setView = useCallback((v: ViewId) => {
    setState(s => {
      const next = { ...s, view: v }
      saveState(page, next)
      return next
    })
  }, [page])

  const setDisplay = useCallback((d: Partial<DisplaySettings>) => {
    setState(s => {
      const next = { ...s, display: { ...s.display, ...d } }
      saveState(page, next)
      return next
    })
  }, [page])

  return (
    <ViewContext.Provider value={{ page, state, setView, setDisplay }}>
      {children}
    </ViewContext.Provider>
  )
}

export function useView() {
  const ctx = useContext(ViewContext)
  if (!ctx) throw new Error('useView must be used inside <ViewProvider>')
  return {
    view:       ctx.state.view,
    display:    ctx.state.display,
    page:       ctx.page,
    setView:    ctx.setView,
    setDisplay: ctx.setDisplay,
    availableViews: PAGE_VIEWS[ctx.page] ?? PAGE_VIEWS.default,
  }
}

function ToggleSwitch({
  value, onChange,
}: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 32, height: 18, borderRadius: 9,
        border: '2px solid var(--border)',
        background: value ? 'var(--main)' : 'var(--bg3)',
        cursor: 'pointer', position: 'relative',
        flexShrink: 0, padding: 0,
        transition: 'background 0.12s',
      }}
      aria-pressed={value}
    >
      <div style={{
        position: 'absolute',
        top: 1, left: value ? 12 : 1,
        width: 12, height: 12, borderRadius: '50%',
        background: value ? 'var(--foreground)' : 'var(--t3)',
        transition: 'left 0.12s',
      }} />
    </button>
  )
}

function SegmentedPick<T extends string>({
  options, value, onChange,
}: {
  options: { label: string; value: T }[]
  value:   T
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '3px 8px', fontSize: 11, fontWeight: 600,
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: value === opt.value ? 'var(--main)' : 'var(--bg3)',
            color: 'var(--t1)',
            cursor: 'pointer',
            transform: value === opt.value ? 'translate(2px,2px)' : 'none',
            transition: 'all 0.1s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

interface ViewSwitcherProps {
  leftOffset?: string
}

export function ViewSwitcher({ leftOffset }: ViewSwitcherProps) {
  const [open, setOpen]   = useState(false)
  const [tab,  setTab]    = useState<'views' | 'display'>('views')
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  let ctx: ViewContextValue | null = null
  try { ctx = useContext(ViewContext) } catch {}

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!ctx) return null

  const { page, state, setView, setDisplay } = ctx
  const availableViews = PAGE_VIEWS[page] ?? PAGE_VIEWS.default
  const activeViewMeta = VIEWS.find(v => v.id === state.view)

  const left = leftOffset ?? 'calc(var(--sidebar-w, 56px) + 8px + 28px + 6px)'

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        title={`Visualização: ${activeViewMeta?.label ?? ''}`}
        style={{
          position: 'fixed',
          top: 14,
          left,
          zIndex: 200,
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? 'var(--main)' : 'var(--secondary-background)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: open ? 'none' : '2px 2px 0 var(--border)',
          transform: open ? 'translate(2px,2px)' : 'none',
          cursor: 'pointer',
          color: 'var(--t1)',
          transition: 'left 0.22s ease, background 0.1s, transform 0.1s, box-shadow 0.1s',
          padding: 0,
        }}
      >
        <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: open ? 1 : 0.7 }}>
          {activeViewMeta?.icon}
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: 48,
            left,
            zIndex: 300,
            width: 268,
            background: 'var(--secondary-background)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-base)',
            boxShadow: '6px 6px 0 var(--border)',
            overflow: 'hidden',
            animation: 'vsDropIn 0.12s ease',
          }}
        >
          <style>{`
            @keyframes vsDropIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <div style={{
            display: 'flex',
            borderBottom: '2px solid var(--border)',
            background: 'var(--bg3)',
          }}>
            {(['views', 'display'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '8px 0',
                  background: tab === t ? 'var(--secondary-background)' : 'transparent',
                  border: 'none',
                  borderRight: t === 'views' ? '2px solid var(--border)' : 'none',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  color: tab === t ? 'var(--t1)' : 'var(--t3)',
                  textTransform: 'uppercase', letterSpacing: '.07em',
                  fontFamily: 'var(--font-sans)',
                  transition: 'color 0.1s',
                }}
              >
                {t === 'views' ? 'Visualização' : 'Exibição'}
              </button>
            ))}
          </div>

          {tab === 'views' && (
            <div style={{ padding: '8px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              {VIEWS.filter(v => availableViews.includes(v.id)).map(v => {
                const active = state.view === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => { setView(v.id); setOpen(false) }}
                    title={v.desc}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 5, padding: '10px 6px 8px',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      background: active ? 'var(--main)' : 'var(--bg)',
                      color: 'var(--t1)',
                      cursor: 'pointer',
                      boxShadow: active ? 'none' : '2px 2px 0 var(--border)',
                      transform: active ? 'translate(2px,2px)' : 'none',
                      transition: 'all 0.1s',
                      fontFamily: 'var(--font-sans)',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--bg3)'
                        e.currentTarget.style.transform = 'translate(1px,1px)'
                        e.currentTarget.style.boxShadow = '1px 1px 0 var(--border)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--bg)'
                        e.currentTarget.style.transform = 'none'
                        e.currentTarget.style.boxShadow = '2px 2px 0 var(--border)'
                      }
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: active ? 1 : 0.65,
                    }}>
                      {v.icon}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: active ? 800 : 600, lineHeight: 1 }}>
                      {v.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {tab === 'display' && (
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {([
                { key: 'linhasVerticais',  label: 'Linhas verticais',    desc: 'Mostra grade na tabela' },
                { key: 'exibirIcone',      label: 'Ícone da página',     desc: 'Emojis dos itens' },
                { key: 'envolverConteudo', label: 'Envolver conteúdo',   desc: 'Quebra texto longo' },
              ] as const).map((row, i, arr) => (
                <div
                  key={row.key}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--bg3)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>{row.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{row.desc}</div>
                  </div>
                  <ToggleSwitch
                    value={state.display[row.key as keyof DisplaySettings] as boolean}
                    onChange={v => setDisplay({ [row.key]: v })}
                  />
                </div>
              ))}
              <div style={{ paddingTop: 10, borderTop: '1px solid var(--bg3)', marginTop: 2 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)', marginBottom: 6 }}>
                  Abrir páginas em
                </div>
                <SegmentedPick
                  options={[
                    { label: 'Completo', value: 'completo' },
                    { label: 'Lateral',  value: 'lateral'  },
                    { label: 'Central',  value: 'central'  },
                  ]}
                  value={state.display.abrirEm}
                  onChange={v => setDisplay({ abrirEm: v })}
                />
              </div>
            </div>
          )}

          <div style={{
            padding: '7px 14px',
            borderTop: '2px solid var(--border)',
            background: 'var(--bg3)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              {activeViewMeta?.icon}
            </span>
            <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
              {activeViewMeta?.label} · {availableViews.length} visualizações
            </span>
          </div>
        </div>
      )}
    </>
  )
}

type ViewSlots = Partial<Record<ViewId, ReactNode>>

interface ViewRendererProps {
  slots:    ViewSlots
  fallback?: ReactNode
}

export function ViewRenderer({ slots, fallback }: ViewRendererProps) {
  let ctx: ViewContextValue | null = null
  try { ctx = useContext(ViewContext) } catch {}
  const view = ctx?.state.view ?? 'lista'

  if (slots[view]) return <>{slots[view]}</>

  if (fallback) return <>{fallback}</>

  const meta = VIEWS.find(v => v.id === view)
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16,
      padding: '64px 24px', textAlign: 'center',
      border: '2px dashed var(--b2)', borderRadius: 'var(--radius-base)',
      minHeight: 300,
    }}>
      <span style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
        {meta?.icon}
      </span>
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--t1)', marginBottom: 6 }}>
          Visualização {meta?.label}
        </div>
        <div style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 280 }}>
          {meta?.desc}. Em breve disponível para esta seção.
        </div>
      </div>
    </div>
  )
}
