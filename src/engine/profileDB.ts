import { getDB } from './db'
import { supabase } from './supabase'
import type { Layout } from 'react-grid-layout'

export interface Profile {
  id: string
  username: string | null
  handle: string | null
  bio: string | null
  avatar: string
  bg_cor: string
  plan: 'free' | 'pro'
  theme: 'light' | 'dark'
  sound_on: boolean
  notifications_on: boolean
  shop_owned: string[]
  created_at: string
  updated_at: string
  show_editor: boolean
  dashboard_layout?: Layout | null
  mobile_widget_heights?: Record<string, number> | null
  mobile_widget_order?: string[] | null

}



const DEFAULT_PROFILE: Profile = {
  id: 'local-user',
  username: null,
  handle: null,
  bio: null,
  avatar: '🌻',
  bg_cor: '#1d1c21',
  plan: 'free',
  theme: 'light',
  sound_on: true,
  notifications_on: true,
   shop_owned: [],
   show_editor: false,
   created_at: new Date().toISOString(),
   updated_at: new Date().toISOString()
  
}

let currentProfile: Profile | null = null
const listeners: Set<() => void> = new Set()

export async function getProfile(): Promise<Profile> {
  // Check if user is authenticated with Supabase
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    // User is authenticated, try to get from Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!error && data) {
      currentProfile = data as Profile
      return currentProfile
    }

    // If no profile in Supabase, create one
    const newProfile: Profile = {
      ...DEFAULT_PROFILE,
      id: session.user.id,
      username: session.user.user_metadata?.name || null,
      handle: session.user.user_metadata?.name ? `@${session.user.user_metadata.name.toLowerCase().replace(/\s/g, '')}` : null,
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(newProfile)

    if (!insertError) {
      currentProfile = newProfile
      return newProfile
    }
  }

  // Fallback to local IndexedDB
  if (currentProfile) return currentProfile
  const db = await getDB()
  const profile = await db.get('profiles', 'local-user')
  if (!profile) {
    await db.put('profiles', DEFAULT_PROFILE)
    currentProfile = DEFAULT_PROFILE
    return DEFAULT_PROFILE
  }
  currentProfile = profile
  return profile
}

export async function updateProfile(data: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<Profile> {
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    // Update in Supabase
    const current = currentProfile ?? await getProfile()
    const updated = { ...current, ...data, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('profiles')
      .upsert(updated)

    if (!error) {
      currentProfile = updated
      listeners.forEach(fn => fn())
      return updated
    }
  }

  // Fallback to local IndexedDB
  const db = await getDB()
  const current = currentProfile ?? await getProfile()
  const updated = { ...current, ...data, updated_at: new Date().toISOString() }
  await db.put('profiles', updated)
  currentProfile = updated
  listeners.forEach(fn => fn())
  return updated
}

export function subscribeProfile(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function resetProfileCache() {
  currentProfile = null
}