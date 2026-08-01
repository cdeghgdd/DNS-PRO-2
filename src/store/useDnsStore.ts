import { create } from 'zustand'
import { ServerStore } from '../types'
import { DEFAULT_SERVERS } from '../utils/constants'

interface DnsState {
  servers: ServerStore[]
  activeServer: ServerStore | null
  isConnected: boolean
  isConnecting: boolean
  searchQuery: string
  selectedTag: string | null
  recentServers: ServerStore[]
  toggleFavorite: (key: string) => void
  addCustomServer: (server: ServerStore) => void
  updateCustomServer: (server: ServerStore) => void
  deleteCustomServer: (key: string) => void
  setActiveServer: (server: ServerStore | null) => void
  setIsConnected: (connected: boolean) => void
  setIsConnecting: (connecting: boolean) => void
  setSearchQuery: (query: string) => void
  setSelectedTag: (tag: string | null) => void
  addRecentServer: (server: ServerStore) => void
  importServers: (imported: ServerStore[]) => void
}

const STORAGE_SERVERS_KEY = 'dnschanger_servers'
const STORAGE_FAVS_KEY = 'dnschanger_favorites'
const STORAGE_RECENT_KEY = 'dnschanger_recents'

function loadInitialServers(): ServerStore[] {
  try {
    const customSaved = localStorage.getItem(STORAGE_SERVERS_KEY)
    const favsSaved = localStorage.getItem(STORAGE_FAVS_KEY)
    const customServers: ServerStore[] = customSaved ? JSON.parse(customSaved) : []
    const favKeys: string[] = favsSaved ? JSON.parse(favsSaved) : []

    const merged = [...DEFAULT_SERVERS, ...customServers].map((srv) => ({
      ...srv,
      isPin: favKeys.includes(srv.key)
    }))
    return merged
  } catch {
    return DEFAULT_SERVERS
  }
}

function loadInitialRecents(): ServerStore[] {
  try {
    const recents = localStorage.getItem(STORAGE_RECENT_KEY)
    return recents ? JSON.parse(recents) : []
  } catch {
    return []
  }
}

export const useDnsStore = create<DnsState>((set) => {
  const initialServers = loadInitialServers()
  const initialRecents = loadInitialRecents()

  return {
    servers: initialServers,
    activeServer: null,
    isConnected: false,
    isConnecting: false,
    searchQuery: '',
    selectedTag: null,
    recentServers: initialRecents,

    toggleFavorite: (key) =>
      set((state) => {
        const nextServers = state.servers.map((srv) =>
          srv.key === key ? { ...srv, isPin: !srv.isPin } : srv
        )
        const favKeys = nextServers.filter((s) => s.isPin).map((s) => s.key)
        localStorage.setItem(STORAGE_FAVS_KEY, JSON.stringify(favKeys))
        return { servers: nextServers }
      }),

    addCustomServer: (server) =>
      set((state) => {
        const newServer = { ...server, isCustom: true }
        const nextServers = [...state.servers, newServer]
        const customOnly = nextServers.filter((s) => s.isCustom)
        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(customOnly))
        return { servers: nextServers }
      }),

    updateCustomServer: (server) =>
      set((state) => {
        const nextServers = state.servers.map((s) => (s.key === server.key ? server : s))
        const customOnly = nextServers.filter((s) => s.isCustom)
        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(customOnly))
        return { servers: nextServers }
      }),

    deleteCustomServer: (key) =>
      set((state) => {
        const nextServers = state.servers.filter((s) => s.key !== key)
        const customOnly = nextServers.filter((s) => s.isCustom)
        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(customOnly))
        return { servers: nextServers }
      }),

    setActiveServer: (activeServer) => set({ activeServer }),
    setIsConnected: (isConnected) => set({ isConnected }),
    setIsConnecting: (isConnecting) => set({ isConnecting }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSelectedTag: (selectedTag) => set({ selectedTag }),

    addRecentServer: (server) =>
      set((state) => {
        const filtered = state.recentServers.filter((s) => s.key !== server.key)
        const updated = [server, ...filtered].slice(0, 5)
        localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(updated))
        return { recentServers: updated }
      }),

    importServers: (imported) =>
      set(() => {
        const customOnly = imported.map((s) => ({ ...s, isCustom: true }))
        const existingKeys = new Set(DEFAULT_SERVERS.map((s) => s.key))
        const nonDuplicateCustom = customOnly.filter((s) => !existingKeys.has(s.key))

        const nextServers = [...DEFAULT_SERVERS, ...nonDuplicateCustom]
        localStorage.setItem(STORAGE_SERVERS_KEY, JSON.stringify(nonDuplicateCustom))
        return { servers: nextServers }
      })
  }
})
