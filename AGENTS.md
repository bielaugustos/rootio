# Rootio — Projeto React + TypeScript

App de produtividade pessoal com design neobrutalism, PWA, Capacitor.

## Stack

- React 19, TypeScript ~6.0, Vite 8, Tailwind v4
- react-router-dom v7 (BrowserRouter)
- IndexedDB via `idb` (local-first)
- Capacitor 6 (iOS/Android)

## Scripts

- `npm run dev` — dev server
- `npm run build` — build + typecheck
- `npm run lint` — ESLint
- `npm run preview` — preview build

## Estrutura

- `src/components/` — 22 componentes reutilizáveis (Button, Card, Input, Modal, Sidebar, Toast, etc.)
- `src/pages/` — páginas agrupadas por seção: `home/`, `habits/`, `feed/`, `wallet/`, `settings/`, `design/`, `career/`, `finance/`, `mentor/`, `profile/`, `projects/`, `shop/`, `sprint/`, `progress/`, `notifications/`, `legal/`
- `src/engine/` — camada de dados (ThemeEngine, DBs, Context)
- `src/tokens/` — design tokens (cores, sombras, bordas via CSS variables)

## Convenções

- `verbatimModuleSyntax` ativado — usar `import type` para tipos
- Componentes em PascalCase, páginas em `index.tsx` + subcomponentes co-localizados
- Estilos inline com `var(--css-variable)` (para o theme editor runtime)
- Sidebar em `App.tsx` com NavLink, 3 estados: expanded (220px), collapsed (56px), hidden (0px)
- Mobile: `window.innerWidth < 600` → sidebar hidden, layout flex column
- Idioma: português (pt-BR) em toda UI

## Tokens de design (neobrutalism)

- Bordas pretas `2px solid var(--border)`
- Sombra `var(--shadow-x) var(--shadow-y) 0 var(--border)`
- Efeito hover: translate + remove sombra (press-down)
- Cor principal: amber `#ffbf00` (`var(--main)`)
- `--radius-base: 5px`, `--radius-sm: 4px`, `--radius-lg: 8px`


# Rootio — Agentes do Projeto

Este arquivo define os agentes que operam sobre o projeto Rootio.
Cada agente tem um escopo bem definido e deve ser acionado conforme o contexto.

---

## 🎨 @rootio-ui — UI & Product Agent

**Escopo:** Toda interface visual, componentes, páginas, design system, tokens, onboarding, fluxos de navegação e decisões de produto que afetam a experiência do usuário.

**Stack de referência:** React 19, TypeScript ~6.0, Vite 8, Tailwind v4, Capacitor 6, IndexedDB via `idb`, react-router-dom v7.

**Convenções obrigatórias:**
- Estilos sempre com `var(--css-variable)` — nunca valores hardcoded
- Componentes em `src/components/` (PascalCase), páginas em `src/pages/<seção>/index.tsx`
- Idioma: português (pt-BR) em toda UI
- Design system neobrutalism: bordas `2px solid var(--border)`, sombra `var(--shadow-x) var(--shadow-y) 0 var(--border)`, cor principal `var(--main)` (#ffbf00)
- Mobile: `window.innerWidth < 600` → sidebar hidden, layout flex column
- Usar `import type` para tipos (verbatimModuleSyntax ativo)

**Responsável por:**
- Implementar e iterar páginas existentes (Habits, Wallet, Progress, Feed, Career, Finance, etc.)
- Criar e refinar componentes em `src/components/`
- Onboarding, empty states, ilustrações
- Tokens de design em `src/tokens/` e `src/index.css`
- Loja (`/shop`) e modelo freemium na UI
- Ícones, splash screens, assets visuais

**Lista de prioridades ativas (v1.0 launch):**

| # | Prioridade | Tarefa | Status |
|---|-----------|--------|--------|
| 1 | 🔴 Crítico | Definir escopo do MVP: ocultar seções incompletas (Career, Finance, Mentor, Projects, Sprint, Shop) | Concluído |
| 2 | 🔴 Crítico | Criar fluxo de Onboarding (3 telas: boas-vindas → perfil → primeiro hábito) | Pendente |
| 3 | 🔴 Crítico | Substituir ícones/splash genéricos do Capacitor pelo branding Rootio | Pendente |
| 4 | 🟡 Importante | Empty states com ilustrações em todas as seções ativas | Pendente |
| 5 | 🟡 Importante | Tela de Login/Cadastro (UI apenas — integração é com @rootio-data) | Pendente |
| 6 | 🟡 Importante | Push notifications UI: configuração de lembretes de hábitos | Concluído |
| 6.1 | 🟡 Importante | Slider: adicionar exemplos na /themes (newcomp Sllider.tsx) | Concluído |
| 7 | 🟡 Importante | Revisar Feed: mudar de rede social para diário pessoal | Pendente |
| 8 | 🟢 Estratégico | ShopPage: definir e implementar modelo freemium (UI de planos) | Pendente |
| 9 | 🟢 Estratégico | CommandK: melhorar grupos e adicionar ações rápidas | Pendente |
| 10 | 🟢 Estratégico | PaletteEditor: esconder em produção por padrão | Pendente |

---

## 🗄️ @rootio-data — Data & Sync Agent

**Escopo:** Toda camada de dados do projeto: IndexedDB local, schema remoto (Supabase/PostgreSQL), autenticação, sincronização, migrations e integridade dos dados.

**Stack de referência:** `idb` v8, Supabase (Auth + Realtime + PostgreSQL), schema em `db/schema.sql`, engines em `src/engine/`.

**Convenções obrigatórias:**
- Todo acesso a dados passa pelas funções de `src/engine/` — nunca acesso direto ao IndexedDB nas páginas
- Novos stores do IndexedDB devem ser adicionados com migration versionada em `src/engine/db.ts`
- Schema remoto segue o padrão de `db/schema.sql`: `uuid` como PK, `user_id` com FK para `auth.users`, `updated_at` para sync
- Funções de engine exportam: `get*`, `set*`, `delete*`, `subscribe*`
- Sync strategy: local-first — IndexedDB é fonte da verdade, Supabase é mirror

**Responsável por:**
- Autenticação: Supabase Auth (email/senha + OAuth futuro)
- Sync bidirecional IndexedDB ↔ Supabase
- Migrations do schema remoto
- Engines de dados: `habitDB`, `walletDB`, `economyDB`, `challengeDB`, `profileDB`
- Criar engines faltantes (careerDB, financeDB, projectsDB, sprintDB)
- Política de dados offline / conflict resolution
- Segurança: Row Level Security (RLS) no Supabase

**Lista de prioridades ativas (v1.0 launch):**

| # | Prioridade | Tarefa | Status |
|---|-----------|--------|--------|
| 1 | 🔴 Crítico | Configurar Supabase: projeto, env vars, cliente | Pendente |
| 2 | 🔴 Crítico | Implementar autenticação: signUp, signIn, signOut, sessão persistente | Pendente |
| 3 | 🔴 Crítico | Sync de hábitos: IndexedDB → Supabase (upsert ao salvar, pull ao abrir) | Pendente |
| 4 | 🔴 Crítico | Sync de perfil: foto, username, handle, plano | Pendente |
| 5 | 🟡 Importante | Sync de wallet / emergency fund | Pendente |
| 6 | 🟡 Importante | RLS policies: garantir que cada user só acessa seus dados | Pendente |
| 7 | 🟡 Importante | Conflict resolution: last-write-wins com `updated_at` | Pendente |
| 8 | 🟡 Importante | Criar schema completo para habits, profiles, wallet no Supabase | Pendente |
| 9 | 🟢 Estratégico | Realtime subscriptions: atualizar UI quando dados mudam no servidor | Pendente |
| 10 | 🟢 Estratégico | Export de dados (LGPD): gerar JSON com todos os dados do usuário | Pendente |

---

## 🚀 @rootio-launch — Launch & Distribution Agent

**Escopo:** Tudo relacionado a publicação, distribuição, marketing e qualidade antes do lançamento. Não escreve código de feature — valida, empacota e distribui.

**Stack de referência:** Capacitor 6, Android Gradle, Xcode, `package.json` v0.4.0, `capacitor.config.ts` (`com.ioverso.rootio`).

**Convenções obrigatórias:**
- Versão semântica: `package.json` e `build.gradle` / `Info.plist` sempre em sync
- Build de release: `npm run build && npx cap sync` antes de qualquer geração de APK/IPA
- Assets de store: screenshots em 3 tamanhos (phone, tablet, desktop), icon 1024x1024 sem alpha
- Política de privacidade deve estar em `/privacidade` (já existe `PrivacidadePage`) e linkada nas stores

**Responsável por:**
- Corrigir `package.json` name (`"rootio"`) e `version` antes do build
- Validar e atualizar `capacitor.config.ts` para produção (servidor, scheme)
- Gerar APK de release assinado (Android)
- Gerar IPA e submeter para TestFlight (iOS)
- Criar fichas de store: título, descrição, palavras-chave, screenshots
- Configurar deep links e Universal Links
- Checklist pré-lançamento (crash-free rate, performance, acessibilidade)
- Monitoramento pós-lançamento: Sentry ou similar

**Lista de prioridades ativas (v1.0 launch):**

| # | Prioridade | Tarefa | Status |
|---|-----------|--------|--------|
| 1 | 🔴 Crítico | Corrigir `package.json`: `name: "rootio"`, confirmar version `0.4.0` → `1.0.0` | Pendente |
| 2 | 🔴 Crítico | Política de privacidade: revisar conteúdo da `PrivacidadePage` (dados coletados, LGPD) | Pendente |
| 3 | 🔴 Crítico | Assets de ícone: gerar todos os tamanhos Android + iOS a partir do logo.svg | Pendente |
| 4 | 🔴 Crítico | Splash screens: gerar para todos os tamanhos Android + iOS | Pendente |
| 5 | 🟡 Importante | Ficha Google Play: título, descrição curta (80 chars), descrição longa, categoria | Pendente |
| 6 | 🟡 Importante | Ficha App Store: título, subtítulo, keywords, descrição, categoria | Pendente |
| 7 | 🟡 Importante | Screenshots para ambas as stores (pelo menos 3 por plataforma) | Pendente |
| 8 | 🟡 Importante | Configurar signing: keystore Android, provisioning profile iOS | Pendente |
| 9 | 🟡 Importante | Build de release Android (APK/AAB assinado) | Pendente |
| 10 | 🟡 Importante | Build de release iOS (IPA) + submissão TestFlight | Pendente |
| 11 | 🟢 Estratégico | Configurar Sentry (ou similar) para crash reporting | Pendente |
| 12 | 🟢 Estratégico | Landing page de divulgação (waitlist ou download direto) | Pendente |
| 13 | 🟢 Estratégico | Analytics: Posthog ou Mixpanel (privacy-friendly) | Pendente |

---

## Como usar os agentes

Ao iniciar uma tarefa, mencione o agente responsável no início da conversa:

```
@rootio-ui — quero criar o fluxo de onboarding
@rootio-data — implementar autenticação com Supabase
@rootio-launch — gerar os ícones e preparar o build Android
```

Os agentes podem colaborar: por exemplo, @rootio-ui cria a tela de login e @rootio-data implementa a lógica de autenticação para ela.

Atualizar o status das tarefas neste arquivo após cada sessão de trabalho.
