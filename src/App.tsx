import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './engine/ThemeContext'
import { AuthProvider, useAuth } from './engine/AuthContext'
import { Sidebar } from './components/Sidebar'
import { PaletteEditor } from './editor/PaletteEditor'
import { CommandK } from './components/CommandK'
import { ViewProvider, ViewSwitcher } from './components/ViewSwitcher'
import { ToastIO } from './components/ToastIO'
import type { CommandItem } from './components/CommandK'
import { getProfile, subscribeProfile } from './engine/profileDB'
import { getHabits } from './engine/habitDB'

// ── Existing pages ────────────────────────────────────────────────────────────
import { HomePage }          from './pages/HomePage'
import { HabitsPage }        from './pages/habits'
import { ThemesPage }        from './pages/design/ThemesPage'
import { SettingsPage }      from './pages/settings'
import { AccountPage }       from './pages/settings/account'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { WalletPage } from './pages/wallet'
import { HubPage }           from './pages/hub'
import { ProgressPage }      from './pages/progress'
import { PrivacidadePage }   from './pages/legal/PrivacidadePage'
import { SyncPage }          from './pages/legal/SyncPage'
import { OnboardingPage }    from './pages/onboarding'

// ── Feed (migrated from Next.js) ──────────────────────────────────────────────
import { FeedPage }          from './pages/feed'
import { PostDetailPage }    from './pages/feed/PostDetailPage'
import { NewPostPage }       from './pages/feed/NewPostPage'
import { PostConfirmPage }   from './pages/feed/PostConfirmPage'
import { FeedSettingsPage }  from './pages/feed/settings'

// ── Auth ───────────────────────────────────────────────────────────────────────
import { LoginPage }          from './pages/login'

// ── New section stubs ─────────────────────────────────────────────────────────
import { CareerPage }        from './pages/career'
import { CareerSettingsPage } from './pages/career/settings'

import { MentorPage }        from './pages/mentor'
import { MentorSettingsPage } from './pages/mentor/settings'
import { ProfilePage }       from './pages/profile'
import { ProfileSettingsPage } from './pages/profile/settings'
import { ProjectsPage }      from './pages/projects'
import { ProjectsSettingsPage } from './pages/projects/settings'
import { ShopPage }          from './pages/shop'
import { ShopSettingsPage }  from './pages/shop/settings'
import { SprintPage }        from './pages/sprint'
import { SprintSettingsPage } from './pages/sprint/settings'


const HABITS_CHANGE_EVENT = 'habits-changed'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const onboardingCompleted = localStorage.getItem('onboarding-completed') === 'true'

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true })
      } else if (!onboardingCompleted) {
        navigate('/onboarding', { replace: true })
      }
    }
  }, [user, loading, onboardingCompleted, navigate])

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🌱</div>
          <div style={{ fontSize: 18, color: 'var(--t1)' }}>Carregando...</div>
        </div>
      </div>
    )
  }

  if (!user || !onboardingCompleted) {
    return null // Will redirect
  }

  return <>{children}</>
}

function AppWithNav() {
  const navigate = useNavigate()
  const [showEditor, setShowEditor] = useState(false)
  const [habitItems, setHabitItems] = useState<CommandItem[]>([])

  const loadHabits = useCallback(async () => {
    const habits = await getHabits()
    setHabitItems(habits.map(h => ({
      id: `habit-${h.id}`,
      label: h.name,
      description: `${h.list} · ${h.done ? 'feito ✓' : 'pendente'} · +${h.pts}pts`,
      icon: h.icon,
      group: h.list === 'habit' ? 'Hábitos' : h.list === 'task' ? 'Tarefas' : h.list === 'goal' ? 'Metas' : 'Eventos',
      onSelect: () => navigate('/habits'),
    })))
  }, [navigate])

  useEffect(() => {
    getProfile().then(p => setShowEditor(p.show_editor ?? false))
    return subscribeProfile(() => {
      getProfile().then(p => setShowEditor(p.show_editor ?? false))
    })
  }, [])

  useEffect(() => {
    window.addEventListener(HABITS_CHANGE_EVENT, loadHabits)
    return () => window.removeEventListener(HABITS_CHANGE_EVENT, loadHabits)
  }, [loadHabits])



  const commandItems: CommandItem[] = [
    { id: 'nav-home',     label: 'Início',       description: 'Dashboard principal',    iconClass: 'ph-house',          group: 'Navegar', onSelect: () => navigate('/') },
    { id: 'nav-habits',   label: 'Hábitos',      description: 'Ver todos os hábitos',   iconClass: 'ph-check-square',   group: 'Navegar', onSelect: () => navigate('/habits') },
    { id: 'nav-wallet',   label: 'Carteira',     description: 'Carteira e reservas',   iconClass: 'ph-wallet',         group: 'Navegar', onSelect: () => navigate('/wallet') },
    { id: 'nav-feed',     label: 'Diário',       description: 'Diário pessoal',          iconClass: 'ph-book-open',      group: 'Navegar', onSelect: () => navigate('/feed') },
    { id: 'nav-progress', label: 'Progresso',    description: 'Estatísticas e nível',   iconClass: 'ph-chart-line-up',  group: 'Navegar', onSelect: () => navigate('/progress') },
    { id: 'nav-themes',   label: 'Temas',        description: 'Personalizar aparência', iconClass: 'ph-palette',        group: 'Sistema', onSelect: () => navigate('/themes') },
    { id: 'nav-settings', label: 'Ajustes',      description: 'Configurações gerais',   iconClass: 'ph-gear',           group: 'Sistema', onSelect: () => navigate('/settings') },
    ...habitItems,
  ]

  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/onboarding'

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100dvh' }}>
        <Sidebar />
        {/* Main content — flex:1 fills remaining space after sidebar spacer */}
        <div style={{ flex: 1, minWidth: 0, width: 0, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/onboarding"     element={<OnboardingPage />} />
            <Route path="/login"          element={<LoginPage />} />
            {/* ── Authenticated routes ── */}
            <Route path="/*" element={
              <AuthGuard>
                <Routes>
                  <Route path="/"               element={<HomePage />} />
            <Route path="/habits"         element={<HabitsPage />} />
            <Route path="/hub"            element={<HubPage />} />
            <Route path="/notifications"  element={<NotificationsPage />} />
            <Route path="/wallet"         element={<WalletPage />} />
            <Route path="/progress"       element={<ProgressPage />} />
            <Route path="/settings"       element={<SettingsPage />} />
            <Route path="/settings/account" element={<AccountPage />} />
            <Route path="/themes"         element={<ThemesPage />} />
            <Route path="/privacidade"    element={<PrivacidadePage />} />
            <Route path="/sync"           element={<SyncPage />} />

            {/* ── Feed ── */}
            <Route path="/feed"           element={<FeedPage />} />
            <Route path="/feed/new"       element={<NewPostPage />} />
            <Route path="/feed/confirm"   element={<PostConfirmPage />} />
            <Route path="/feed/:id"       element={<PostDetailPage />} />
            <Route path="/feed/settings"  element={<FeedSettingsPage />} />

            {/* ── Sections with own settings ── */}
            <Route path="/career"              element={<CareerPage />} />
            <Route path="/career/settings"     element={<CareerSettingsPage />} />

            <Route path="/mentor"              element={<MentorPage />} />
            <Route path="/mentor/settings"     element={<MentorSettingsPage />} />
            <Route path="/profile"             element={<ProfilePage />} />
            <Route path="/profile/settings"    element={<ProfileSettingsPage />} />
            <Route path="/projects"            element={<ProjectsPage />} />
            <Route path="/projects/settings"   element={<ProjectsSettingsPage />} />
            <Route path="/shop"                element={<ShopPage />} />
            <Route path="/shop/settings"       element={<ShopSettingsPage />} />
            <Route path="/sprint"              element={<SprintPage />} />
            <Route path="/sprint/settings"     element={<SprintSettingsPage />} />
                </Routes>
              </AuthGuard>
            } />
          </Routes>
        </div>
      </div>
      {!isAuthPage && <ViewSwitcher />}
      {showEditor && <PaletteEditor />}
      <CommandK items={commandItems} />
      <ToastIO />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ViewProvider>
            <AppWithNav />
          </ViewProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
