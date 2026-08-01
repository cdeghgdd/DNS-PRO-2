import { create } from 'zustand'
import { LanguageKey } from '../i18n/translations'
import { Settings } from '../types'

interface SettingsState extends Settings {
  setLng: (lng: LanguageKey) => void
  setTheme: (theme: 'light' | 'dark') => void
  setAutoStartOnBoot: (value: boolean) => void
  setAutoReconnect: (value: boolean) => void
  setNotificationsEnabled: (value: boolean) => void
}

const STORAGE_KEY = 'dnschanger_settings'

const defaultSettings: Settings = {
  autoStartOnBoot: false,
  autoReconnect: true,
  lng: 'eng',
  theme: 'dark',
  notificationsEnabled: true
}

function loadInitialSettings(): Settings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) }
  } catch {
  }
  return defaultSettings
}

export const useSettingsStore = create<SettingsState>((set) => {
  const initial = loadInitialSettings()

  return {
    ...initial,
    setLng: (lng) =>
      set((state) => {
        const next = { ...state, lng }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return { lng }
      }),
    setTheme: (theme) =>
      set((state) => {
        const next = { ...state, theme }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return { theme }
      }),
    setAutoStartOnBoot: (autoStartOnBoot) =>
      set((state) => {
        const next = { ...state, autoStartOnBoot }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return { autoStartOnBoot }
      }),
    setAutoReconnect: (autoReconnect) =>
      set((state) => {
        const next = { ...state, autoReconnect }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return { autoReconnect }
      }),
    setNotificationsEnabled: (notificationsEnabled) =>
      set((state) => {
        const next = { ...state, notificationsEnabled }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return { notificationsEnabled }
      })
  }
})
