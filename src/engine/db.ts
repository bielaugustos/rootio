import { openDB, type IDBPDatabase, type DBSchema } from 'idb'

interface ThemeDB extends DBSchema {
  // Tokens globais: { key: '--main', value: '#ffbf00', mode: 'light' | 'dark' }
  'global-tokens': {
    key: string
    value: { key: string; value: string; mode: 'light' | 'dark' }
    indexes: { 'by-mode': string }
  }
  // Tokens por componente: { id: 'comp:btn-1:--comp-btn-bg', componentId, token, value }
  'component-tokens': {
    key: string
    value: { id: string; componentId: string; token: string; value: string }
    indexes: { 'by-component': string }
  }
  // Metadados do tema (nome, autor, data)
  'theme-meta': {
    key: string
    value: { key: string; value: string }
  }
  // Perfil do usuário
  'profiles': {
    key: string
    value: {
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
      show_editor: boolean
      created_at: string
      updated_at: string
    }
  }
}

let _db: IDBPDatabase<ThemeDB> | null = null

export async function getDB(): Promise<IDBPDatabase<ThemeDB>> {
  if (_db) return _db

  // Force database recreation by incrementing version to ensure schema is correct
  _db = await openDB<ThemeDB>('theme-db', 3, {
    upgrade(db, oldVersion) {
      // Clear any existing stores if upgrading
      if (oldVersion < 2) {
        const storeNames = Array.from(db.objectStoreNames)
        storeNames.forEach(name => {
          db.deleteObjectStore(name)
        })

        // Global tokens store
        const globalStore = db.createObjectStore('global-tokens', { keyPath: 'key' })
        globalStore.createIndex('by-mode', 'mode')

        // Component tokens store
        const compStore = db.createObjectStore('component-tokens', { keyPath: 'id' })
        compStore.createIndex('by-component', 'componentId')

        // Meta store
        db.createObjectStore('theme-meta', { keyPath: 'key' })
      }
      if (oldVersion < 3) {
        db.createObjectStore('profiles', { keyPath: 'id' })
      }
    },
  })
  return _db
}