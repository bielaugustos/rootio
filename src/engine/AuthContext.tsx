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

  // Listen for offline mode changes
  useEffect(() => {
    const checkOfflineMode = () => {
      const newOfflineMode = localStorage.getItem('offline-mode') === 'true'
      if (newOfflineMode !== offlineMode) {
        console.log('🔄 Offline mode changed:', newOfflineMode)
        setOfflineMode(newOfflineMode)
      }
    }

    // Check immediately
    checkOfflineMode()

    // Listen for storage events
    window.addEventListener('storage', checkOfflineMode)

    // Also check periodically (for same-tab changes)
    const interval = setInterval(checkOfflineMode, 1000)

    return () => {
      window.removeEventListener('storage', checkOfflineMode)
      clearInterval(interval)
    }
  }, [offlineMode])

  useEffect(() => {
    console.log('🔄 Initializing auth context...')

    // Check if we're returning from OAuth (detect by URL fragments or params)
    const isOAuthCallback = window.location.hash.includes('access_token') ||
                           window.location.hash.includes('id_token') ||
                           window.location.search.includes('code') ||
                           window.location.search.includes('error') ||
                           window.location.hash.includes('#')

    if (isOAuthCallback) {
      console.log('🔄 Detected OAuth callback URL, waiting for session...', {
        hash: window.location.hash.substring(0, 50) + '...',
        search: window.location.search
      })

      // Add a small delay for OAuth callback processing
      setTimeout(() => {
        console.log('⏰ OAuth callback timeout reached, checking session...')
        auth.getSession().then(({ session, error }) => {
          if (error) console.error('❌ OAuth callback session error:', error)
          console.log('🔍 OAuth callback session check:', session ? `Found (${session.user.email})` : 'None')
        })
      }, 2000)
    }

    // Get initial session with retry logic
    const getSessionWithRetry = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const { session, error } = await auth.getSession()
          if (error) {
            console.error(`❌ Error getting session (attempt ${i + 1}):`, error)
            if (i === retries - 1) {
              setLoading(false)
              return
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
            continue
          }

          console.log('📋 Initial session check:', session ? `Active (${session.user.email})` : 'None')
          if (session) {
            console.log('Session details:', {
              userId: session.user.id,
              email: session.user.email,
              provider: session.user.app_metadata?.provider,
              expiresAt: new Date(session.expires_at! * 1000).toISOString()
            })
          }

          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
          return
        } catch (err) {
          console.error(`❌ Unexpected error getting session (attempt ${i + 1}):`, err)
          if (i === retries - 1) {
            setLoading(false)
          }
        }
      }
    }

    getSessionWithRetry()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, {
        hasSession: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        currentUserState: !!user,
        currentSessionState: !!session
      })

      // Force update state immediately
      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        setLoading(false)
      } else if (event === 'SIGNED_IN') {
        console.log('✅ User signed in successfully:', session?.user?.email)
        if (session) {
          console.log('Session details:', {
            provider: session.user.app_metadata?.provider,
            userId: session.user.id,
            expiresAt: session.expires_at
          })
        }
        setLoading(false)

        // Force navigation after successful sign in
        if (session && !offlineMode) {
          console.log('🔄 Triggering navigation after sign in...')
          // Clear any OAuth URL fragments
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname)
          }

          // Small delay to ensure state is updated
          setTimeout(() => {
            const onboardingCompleted = localStorage.getItem('onboarding-completed') === 'true'
            const targetUrl = onboardingCompleted ? '/' : '/onboarding'
            console.log('🚀 Navigating to:', targetUrl)
            window.location.href = targetUrl
          }, 200)
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed')
      } else {
        // For other events, ensure loading is false
        setLoading(false)
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