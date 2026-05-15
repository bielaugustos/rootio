import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { auth } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  offlineMode: boolean
  signOut: () => Promise<void>
  exitOfflineMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [offlineMode, setOfflineMode] = useState(() => localStorage.getItem('offline-mode') === 'true')

  useEffect(() => {
    console.log('🔄 Initializing auth context...')

    // Handle OAuth callback on page load
    const handleAuthCallback = async () => {
      const { data, error } = await auth.getSession()
      if (error) {
        console.error('❌ Error getting session on callback:', error)
      } else if (data.session) {
        console.log('✅ Session found on callback:', data.session.user.email)
      } else {
        console.log('ℹ️ No session found on callback')
      }
    }

    // Check if we're returning from OAuth
    if (window.location.hash.includes('access_token') || window.location.search.includes('code')) {
      console.log('🔄 Detected OAuth callback, handling...')
      handleAuthCallback()
    }

    // Get initial session
    auth.getSession().then(({ session, error }) => {
      if (error) {
        console.error('❌ Error getting initial session:', error)
      } else {
        console.log('📋 Initial session check:', session ? `Active (${session.user.email})` : 'None')
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, {
        hasSession: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        url: window.location.href
      })

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        // Clear any local data if needed
      } else if (event === 'SIGNED_IN') {
        console.log('✅ User signed in:', session?.user?.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const { error } = await auth.signOut()
    if (error) throw error
  }

  const exitOfflineMode = () => {
    localStorage.removeItem('offline-mode')
    setOfflineMode(false)
    // Redirecionar para login
    window.location.href = '/login'
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    offlineMode,
    signOut,
    exitOfflineMode
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}