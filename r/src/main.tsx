import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import './index.css'

async function initNative() {
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { Capacitor } = await import('@capacitor/core')

    if (Capacitor.isNativePlatform()) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      await StatusBar.setStyle({ style: prefersDark ? Style.Dark : Style.Light })
      await SplashScreen.hide({ fadeOutDuration: 300 })
    }
  } catch (e) {
    // Not running in Capacitor - ignore
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

initNative()