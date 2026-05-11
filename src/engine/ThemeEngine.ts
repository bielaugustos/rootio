import { getDB } from './db'
import { DEFAULT_LIGHT } from '../tokens/default-light'
import { DEFAULT_DARK } from '../tokens/default-dark'

type Mode = 'light' | 'dark'

export class ThemeEngine {
  private mode: Mode = 'light'
  private listeners: Set<() => void> = new Set()
  private initialized: boolean = false
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this._init()
    await this.initPromise
    this.initialized = true
  }

  private async _init(): Promise<void> {
    try {
      const db = await getDB()
      // Check localStorage first (for onboarding preference)
      const localTheme = localStorage.getItem('theme') as Mode | null
      if (localTheme && (localTheme === 'light' || localTheme === 'dark')) {
        this.mode = localTheme
        localStorage.removeItem('theme') // Clean up
      } else {
        const savedMode = await db.get('theme-meta', 'mode')
        this.mode = (savedMode?.value as Mode) ?? this.getSystemMode()
      }
      this.applyDefaults()
      await this.applyPersistedGlobalTokens()
      await this.applyAllPersistedComponentTokens()
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localTheme) this.setMode(e.matches ? 'dark' : 'light')
      })
    } catch (error) {
      console.warn('ThemeEngine initialization failed, using defaults:', error)
      this.mode = this.getSystemMode()
      this.applyDefaults()
    }
  }

  private getSystemMode(): Mode {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  getMode(): Mode {
    if (!this.initialized) {
      // Fallback to system preference if not initialized
      return this.getSystemMode()
    }
    return this.mode
  }

  async setMode(mode: Mode): Promise<void> {
    await this.ensureInitialized()
    this.mode = mode
    this.mode = mode
    document.documentElement.classList.toggle('dark', mode === 'dark')
    const db = await getDB()
    await db.put('theme-meta', { key: 'mode', value: mode })
    this.applyDefaults()
    await this.applyPersistedGlobalTokens()
    this.emit()
  }

  toggleMode(): Promise<void> {
    return this.setMode(this.mode === 'light' ? 'dark' : 'light')
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init()
    }
  }

  private applyDefaults(): void {
    const defaults = this.mode === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT
    const root = document.documentElement
    for (const [key, value] of Object.entries(defaults)) {
      root.style.setProperty(key, value)
    }
  }

  private async applyPersistedGlobalTokens(): Promise<void> {
    const db = await getDB()
    const tokens = await db.getAllFromIndex('global-tokens', 'by-mode', this.mode)
    const root = document.documentElement
    for (const { key, value } of tokens) {
      root.style.setProperty(key, value)
    }
  }

  async setGlobalToken(key: string, value: string): Promise<void> {
    await this.ensureInitialized()
    document.documentElement.style.setProperty(key, value)
    const db = await getDB()
    await db.put('global-tokens', { key: `${this.mode}:${key}`, value, mode: this.mode })
    this.emit()
  }

  getGlobalToken(key: string): string {
    if (!this.initialized) {
      // Return default values if not initialized
      const defaults = this.getSystemMode() === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT
      return defaults[key] ?? ''
    }
    const computed = getComputedStyle(document.documentElement).getPropertyValue(key).trim()
    if (computed) return computed
    const defaults = this.mode === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT
    return defaults[key] ?? ''
  }

  async getAllGlobalTokens(): Promise<Record<string, string>> {
    await this.ensureInitialized()
    const defaults = this.mode === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT
    const result = { ...defaults }
    const db = await getDB()
    const persisted = await db.getAllFromIndex('global-tokens', 'by-mode', this.mode)
    for (const { key, value } of persisted) {
      const token = key.replace(`${this.mode}:`, '')
      result[token] = value
    }
    return result
  }

  async setComponentToken(componentId: string, token: string, value: string): Promise<void> {
    await this.ensureInitialized()
    const el = document.querySelector(`[data-comp-id="${componentId}"]`) as HTMLElement | null
    if (el) el.style.setProperty(token, value)
    const db = await getDB()
    const id = `comp:${componentId}:${token}`
    await db.put('component-tokens', { id, componentId, token, value })
    this.emit()
  }

  async removeComponentToken(componentId: string, token: string): Promise<void> {
    await this.ensureInitialized()
    const el = document.querySelector(`[data-comp-id="${componentId}"]`) as HTMLElement | null
    if (el) el.style.removeProperty(token)
    const db = await getDB()
    await db.delete('component-tokens', `comp:${componentId}:${token}`)
    this.emit()
  }

  async getComponentTokens(componentId: string): Promise<Record<string, string>> {
    await this.ensureInitialized()
    const db = await getDB()
    const records = await db.getAllFromIndex('component-tokens', 'by-component', componentId)
    return Object.fromEntries(records.map(r => [r.token, r.value]))
  }

  private async applyAllPersistedComponentTokens(): Promise<void> {
    const db = await getDB()
    const allRecords = await db.getAll('component-tokens')
    for (const { componentId, token, value } of allRecords) {
      const el = document.querySelector(`[data-comp-id="${componentId}"]`) as HTMLElement | null
      if (el) el.style.setProperty(token, value)
    }
  }

  async resetAll(): Promise<void> {
    await this.ensureInitialized()
    const db = await getDB()
    await db.clear('global-tokens')
    await db.clear('component-tokens')
    this.applyDefaults()
    document.querySelectorAll<HTMLElement>('[data-comp-id]').forEach(el => {
      el.removeAttribute('style')
    })
    this.emit()
  }

  async resetGlobalTokens(): Promise<void> {
    await this.ensureInitialized()
    const db = await getDB()
    await db.clear('global-tokens')
    this.applyDefaults()
    this.emit()
  }

  async resetComponentTokens(componentId: string): Promise<void> {
    await this.ensureInitialized()
    const db = await getDB()
    const records = await db.getAllFromIndex('component-tokens', 'by-component', componentId)
    for (const r of records) await db.delete('component-tokens', r.id)
    const el = document.querySelector(`[data-comp-id="${componentId}"]`) as HTMLElement | null
    if (el) el.removeAttribute('style')
    this.emit()
  }

  async exportTheme(): Promise<string> {
    await this.ensureInitialized()
    const globalTokens = await this.getAllGlobalTokens()
    const db = await getDB()
    const componentTokens = await db.getAll('component-tokens')
    const payload = {
      version: 1,
      mode: this.mode,
      globalTokens,
      componentTokens,
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(payload, null, 2)
  }

  async importTheme(json: string): Promise<void> {
    await this.ensureInitialized()
    const payload = JSON.parse(json) as {
      version: number
      mode: Mode
      globalTokens: Record<string, string>
      componentTokens: { id: string; componentId: string; token: string; value: string }[]
    }
    if (payload.version !== 1) throw new Error('Versão de tema incompatível')
    const db = await getDB()
    await db.clear('global-tokens')
    await db.clear('component-tokens')
    if (payload.mode) await this.setMode(payload.mode)
    for (const [key, value] of Object.entries(payload.globalTokens)) {
      await db.put('global-tokens', { key: `${this.mode}:${key}`, value, mode: this.mode })
      document.documentElement.style.setProperty(key, value)
    }
    for (const record of payload.componentTokens) {
      await db.put('component-tokens', record)
      const el = document.querySelector(`[data-comp-id="${record.componentId}"]`) as HTMLElement | null
      if (el) el.style.setProperty(record.token, record.value)
    }
    this.emit()
  }

  onChange(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit(): void {
    this.listeners.forEach(fn => fn())
  }
}

export const themeEngine = new ThemeEngine()