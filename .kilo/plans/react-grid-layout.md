# React Grid Layout v2 no Rootio
## Grid arrastável e redimensionável · v2.2.x · React 19 · Vite 8

> O RGL v2 é uma reescrita completa em TypeScript com hooks modernos.
> Nenhum jQuery. Compatível com React 18+. Tree-shakeable ESM.

---

## O que é e onde faz sentido no Rootio

React Grid Layout permite criar dashboards com widgets que o usuário pode **arrastar, redimensionar e reorganizar**, com layout salvo automaticamente. Casos de uso ideais no Rootio:

| Tela | Uso sugerido |
|------|-------------|
| **HomePage** | Dashboard personalizável — widgets de streak, IO do dia, metas, reserva |
| **ProgressPage** | Cards de nível, desafios e histórico reordenáveis |
| **WalletPage** | Visão de finanças com gráficos arrastáveis |
| **Qualquer página** | Modo "edição de layout" ativável por toggle nas settings |

---

## Instalação

```bash
npm install react-grid-layout
```

Importar os CSS obrigatórios (uma vez, no `src/index.css` ou `src/main.tsx`):

```ts
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
```

Ou via `index.css`:

```css
@import 'react-grid-layout/css/styles.css';
@import 'react-resizable/css/styles.css';
```

---

## Conceitos essenciais da v2

### `width` é obrigatório
O grid precisa saber a largura do container. Use o hook `useContainerWidth` — é a forma recomendada:

```ts
const { width, containerRef, mounted } = useContainerWidth()
```

Renderize o grid apenas quando `mounted === true` para evitar flash de layout errado.

### Layout como array de objetos

```ts
type LayoutItem = {
  i: string      // deve bater com o key do filho React
  x: number      // posição X em colunas (0 = esquerda)
  y: number      // posição Y em linhas (0 = topo)
  w: number      // largura em colunas
  h: number      // altura em linhas
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
  static?: boolean  // true = não arrastável/redimensionável
}
```

### Configuração em interfaces separadas (API v2)

```ts
gridConfig   = { cols, rowHeight, margin, containerPadding, maxRows }
dragConfig   = { enabled, bounded, handle, cancel, threshold }
resizeConfig = { enabled, handles, handleComponent }
```

---

## Exemplo base — grid simples no Rootio

```tsx
// src/pages/home/DashboardGrid.tsx
import { useContainerWidth } from 'react-grid-layout'
import ReactGridLayout from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const DEFAULT_LAYOUT: Layout = [
  { i: 'streak',    x: 0, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'io-hoje',   x: 4, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'progresso', x: 8, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'habitos',   x: 0, y: 2, w: 8, h: 4, minW: 4 },
  { i: 'carteira',  x: 8, y: 2, w: 4, h: 4, minW: 2 },
]

export function DashboardGrid() {
  const { width, containerRef, mounted } = useContainerWidth()
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT)

  return (
    <div ref={containerRef}>
      {mounted && (
        <ReactGridLayout
          layout={layout}
          width={width}
          gridConfig={{ cols: 12, rowHeight: 80, margin: [12, 12] }}
          dragConfig={{ enabled: true, handle: '.drag-handle' }}
          resizeConfig={{ enabled: true, handles: ['se'] }}
          onLayoutChange={setLayout}
        >
          <div key="streak">
            <StreakWidget />
          </div>
          <div key="io-hoje">
            <IOHojeWidget />
          </div>
          <div key="progresso">
            <ProgressoWidget />
          </div>
          <div key="habitos">
            <HabitosWidget />
          </div>
          <div key="carteira">
            <CarteiraWidget />
          </div>
        </ReactGridLayout>
      )}
    </div>
  )
}
```

---

## Salvar layout no IndexedDB (integração com o engine do Rootio)

O Rootio já usa IndexedDB via `idb`. O ideal é salvar o layout do dashboard junto com o perfil do usuário.

### Opção A — Salvar no `profileDB` (mais simples)

Adicionar o campo `dashboard_layout` ao `Profile`:

```ts
// src/engine/profileDB.ts — adicionar ao tipo Profile
export interface Profile {
  // ... campos existentes ...
  dashboard_layout?: LayoutItem[] | null
}
```

Hook para usar no componente:

```ts
// src/pages/home/useDashboardLayout.ts
import { useState, useEffect, useCallback } from 'react'
import { getProfile, updateProfile } from '../../engine/profileDB'
import type { Layout } from 'react-grid-layout'

const DEFAULT_LAYOUT: Layout = [
  { i: 'streak',    x: 0, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'io-hoje',   x: 4, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'progresso', x: 8, y: 0, w: 4, h: 2, minW: 2 },
  { i: 'habitos',   x: 0, y: 2, w: 8, h: 4, minW: 4 },
  { i: 'carteira',  x: 8, y: 2, w: 4, h: 4, minW: 2 },
]

export function useDashboardLayout() {
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getProfile().then(p => {
      if (p.dashboard_layout?.length) {
        setLayout(p.dashboard_layout)
      }
      setLoaded(true)
    })
  }, [])

  const saveLayout = useCallback(async (newLayout: Layout) => {
    setLayout(newLayout)
    await updateProfile({ dashboard_layout: newLayout })
  }, [])

  const resetLayout = useCallback(async () => {
    setLayout(DEFAULT_LAYOUT)
    await updateProfile({ dashboard_layout: null })
  }, [])

  return { layout, saveLayout, resetLayout, loaded }
}
```

### Opção B — localStorage (mais rápido de implementar)

```ts
const LAYOUT_KEY = 'rootio-dashboard-layout'

function loadLayout(): Layout {
  try {
    const stored = localStorage.getItem(LAYOUT_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_LAYOUT
  } catch {
    return DEFAULT_LAYOUT
  }
}

function saveLayout(layout: Layout) {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout))
}
```

---

## Layout responsivo com breakpoints

Para adaptar o grid ao tamanho da tela (desktop vs tablet vs mobile):

```tsx
import { Responsive, useContainerWidth } from 'react-grid-layout'
import type { ResponsiveLayouts } from 'react-grid-layout'

const LAYOUTS: ResponsiveLayouts = {
  lg: [
    { i: 'streak',    x: 0, y: 0, w: 4, h: 2 },
    { i: 'io-hoje',   x: 4, y: 0, w: 4, h: 2 },
    { i: 'progresso', x: 8, y: 0, w: 4, h: 2 },
    { i: 'habitos',   x: 0, y: 2, w: 8, h: 4 },
    { i: 'carteira',  x: 8, y: 2, w: 4, h: 4 },
  ],
  md: [
    { i: 'streak',    x: 0, y: 0, w: 5, h: 2 },
    { i: 'io-hoje',   x: 5, y: 0, w: 5, h: 2 },
    { i: 'progresso', x: 0, y: 2, w: 5, h: 2 },
    { i: 'habitos',   x: 0, y: 4, w: 10, h: 4 },
    { i: 'carteira',  x: 5, y: 2, w: 5, h: 2 },
  ],
  sm: [
    // Mobile: tudo empilhado em coluna única
    { i: 'streak',    x: 0, y: 0,  w: 6, h: 2, static: true },
    { i: 'io-hoje',   x: 0, y: 2,  w: 6, h: 2, static: true },
    { i: 'progresso', x: 0, y: 4,  w: 6, h: 2, static: true },
    { i: 'habitos',   x: 0, y: 6,  w: 6, h: 5, static: true },
    { i: 'carteira',  x: 0, y: 11, w: 6, h: 4, static: true },
  ],
}

export function DashboardResponsive() {
  const { width, containerRef, mounted } = useContainerWidth()

  return (
    <div ref={containerRef}>
      {mounted && (
        <Responsive
          layouts={LAYOUTS}
          breakpoints={{ lg: 1200, md: 768, sm: 0 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          width={width}
          rowHeight={80}
          margin={[12, 12]}
          onLayoutChange={(layout, allLayouts) => {
            // salvar allLayouts no profileDB ou localStorage
          }}
        >
          <div key="streak"><StreakWidget /></div>
          <div key="io-hoje"><IOHojeWidget /></div>
          <div key="progresso"><ProgressoWidget /></div>
          <div key="habitos"><HabitosWidget /></div>
          <div key="carteira"><CarteiraWidget /></div>
        </Responsive>
      )}
    </div>
  )
}
```

> **Dica mobile:** Em `sm`, marque todos os itens com `static: true` para desativar drag/resize — em telas pequenas o touch drag é frustrante e não faz sentido de UX.

---

## Drag handle — arrastar apenas pelo cabeçalho do card

Evita conflito entre scroll e drag em mobile/touch:

```tsx
// dragConfig={{ handle: '.widget-drag-handle' }}

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      height: '100%',
      border: '2px solid var(--border)',
      borderRadius: 'var(--radius-base)',
      background: 'var(--secondary-background)',
      boxShadow: '4px 4px 0 var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Apenas esse header é arrastável */}
      <div
        className="widget-drag-handle"
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--b2)',
          background: 'var(--bg3)',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          userSelect: 'none',
        }}
      >
        <i className="ph ph-dots-six" style={{ fontSize: 14, color: 'var(--t3)' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)' }}>{title}</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
        {children}
      </div>
    </div>
  )
}
```

---

## Modo edição — toggle para habilitar/desabilitar drag

Padrão comum: o usuário ativa "modo edição" para reorganizar, e sai para voltar ao layout fixo.

```tsx
function DashboardGrid() {
  const [editMode, setEditMode] = useState(false)
  const { layout, saveLayout } = useDashboardLayout()
  const { width, containerRef, mounted } = useContainerWidth()

  return (
    <div>
      {/* Botão de toggle — pode ir na Sidebar ou header da HomePage */}
      <button
        onClick={() => setEditMode(e => !e)}
        style={{
          /* estilo neobrutalist do Rootio */
          padding: '6px 14px', fontSize: 12, fontWeight: 700,
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          background: editMode ? 'var(--main)' : 'var(--secondary-background)',
          color: editMode ? 'var(--main-foreground)' : 'var(--t2)',
          boxShadow: editMode ? 'none' : '2px 2px 0 var(--border)',
          cursor: 'pointer',
          transition: 'all 0.1s',
        }}
      >
        <i className={`ph ${editMode ? 'ph-check' : 'ph-pencil-simple'}`} />
        {editMode ? ' Salvar layout' : ' Editar layout'}
      </button>

      <div ref={containerRef}>
        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{ cols: 12, rowHeight: 80, margin: [12, 12] }}
            dragConfig={{ enabled: editMode, handle: '.widget-drag-handle' }}
            resizeConfig={{ enabled: editMode }}
            onLayoutChange={editMode ? saveLayout : undefined}
          >
            {/* widgets */}
          </ReactGridLayout>
        )}
      </div>
    </div>
  )
}
```

---

## Grid background visual (opcional)

Mostra a grade de células enquanto o modo edição está ativo:

```tsx
import { GridBackground } from 'react-grid-layout/extras'

{editMode && mounted && (
  <GridBackground
    width={width}
    cols={12}
    rowHeight={80}
    margin={[12, 12]}
    rows={10}
    color="var(--b2)"
    borderRadius={8}
    style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
  />
)}
```

---

## CSS para estilizar o placeholder de drag

O RGL coloca um `.react-grid-placeholder` durante o arraste. Customizar para o estilo Rootio:

```css
/* src/index.css */

/* Placeholder durante drag */
.react-grid-placeholder {
  background: var(--main) !important;
  opacity: 0.15 !important;
  border: 2px dashed var(--border) !important;
  border-radius: var(--radius-base) !important;
  transition: all 0.1s ease !important;
}

/* Handle de resize */
.react-resizable-handle {
  width: 16px !important;
  height: 16px !important;
  background-image: none !important;
  border-right: 3px solid var(--border) !important;
  border-bottom: 3px solid var(--border) !important;
  opacity: 0.4;
  transition: opacity 0.15s;
}

.react-resizable-handle:hover {
  opacity: 1;
}

/* Cursor durante drag */
.react-draggable-dragging {
  cursor: grabbing !important;
  z-index: 50;
}
```

---

## Widgets sugeridos para o Rootio

Cada widget é um componente normal. O RGL só controla posição/tamanho:

```tsx
// Exemplo de estrutura de arquivos
src/
  pages/
    home/
      DashboardGrid.tsx       ← componente principal com RGL
      useDashboardLayout.ts   ← hook de persistência
      widgets/
        StreakWidget.tsx
        IOHojeWidget.tsx
        HabitosWidget.tsx
        CarteiraWidget.tsx
        ProgressoWidget.tsx
```

Cada widget recebe as dimensões do container via CSS (`height: 100%`) e se adapta:

```tsx
// src/pages/home/widgets/StreakWidget.tsx
import { useState, useEffect } from 'react'
import { getCurrentStreak } from '../../../engine/habitDB'

export function StreakWidget() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    getCurrentStreak().then(setStreak)
  }, [])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 36 }}>🔥</span>
      <span style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#f97316' }}>{streak}</span>
      <span style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>dias de streak</span>
    </div>
  )
}
```

---

## Performance — memoizar os filhos

O RGL compara filhos por referência. Use `useMemo` para evitar re-renders desnecessários durante drag:

```tsx
const gridChildren = useMemo(() => [
  <div key="streak"><Widget title="Streak"><StreakWidget /></Widget></div>,
  <div key="io-hoje"><Widget title="IO Hoje"><IOHojeWidget /></Widget></div>,
  <div key="progresso"><Widget title="Progresso"><ProgressoWidget /></Widget></div>,
  <div key="habitos"><Widget title="Hábitos"><HabitosWidget /></Widget></div>,
  <div key="carteira"><Widget title="Carteira"><CarteiraWidget /></Widget></div>,
], [])
```

---

## Considerações para o Capacitor (mobile nativo)

Quando integrar com o guia Capacitor:

- Em breakpoint `sm` (`width < 768`), definir todos os itens como `static: true` — drag por touch em dashboards é ruim de UX no mobile.
- O `useContainerWidth` usa `ResizeObserver`, que é suportado em todas WebViews modernas (Android 8+, iOS 13.4+).
- O CSS de safe area do guia Capacitor (padding com `env(safe-area-inset-*)`) funciona normalmente com o RGL — o grid respeita o padding do container.
- Evitar `margin` muito pequeno (< 8px) em mobile para facilitar toque nos handles de resize.

---

## Checklist de integração

- [ ] `npm install react-grid-layout`
- [ ] CSS importado no `index.css`
- [ ] `useContainerWidth` no componente principal
- [ ] Layout padrão definido como constante
- [ ] Persistência implementada (profileDB ou localStorage)
- [ ] Drag handle configurado (evita conflito com scroll)
- [ ] Modo edição com toggle
- [ ] `static: true` em breakpoint mobile
- [ ] CSS do placeholder customizado para o visual Rootio
- [ ] Filhos memoizados com `useMemo`

---

## Referências

- [Docs oficiais RGL](https://react-grid-layout.github.io/react-grid-layout/examples/00-showcase.html)
- [GitHub](https://github.com/react-grid-layout/react-grid-layout)
- [Exemplo 07 — LocalStorage](https://react-grid-layout.github.io/react-grid-layout/examples/07-localstorage.html)
- [Exemplo 08 — Responsive + LocalStorage](https://react-grid-layout.github.io/react-grid-layout/examples/08-localstorage-responsive.html)
- [Exemplo 11 — Toolbox (adicionar/remover widgets)](https://react-grid-layout.github.io/react-grid-layout/examples/11-toolbox.html)