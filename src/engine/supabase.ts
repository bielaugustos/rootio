import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:')
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  console.error('Please check your .env.local file or Vercel environment variables')
  throw new Error('Supabase environment variables not configured')
}

if (supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.error('❌ Using placeholder Supabase credentials. Please configure real values.')
  throw new Error('Supabase credentials not properly configured')
}

console.log('✅ Supabase configured:', { url: supabaseUrl, hasKey: !!supabaseAnonKey })

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test connection on init
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error)
  } else {
    console.log('✅ Supabase session check:', data.session ? 'Active session' : 'No active session')
  }
}).catch(err => {
  console.error('❌ Supabase initialization error:', err)
})

// Auth functions
export const auth = {
  signUp: async (email: string, password: string, metadata?: { name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    return { data, error }
  },

  signInWithApple: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  onAuthStateChange: (callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}