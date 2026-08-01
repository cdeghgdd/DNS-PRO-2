import { create } from 'zustand'
import { LogEntry } from '../types'

interface LogState {
  logs: LogEntry[]
  addLog: (level: LogEntry['level'], message: string) => void
  clearLogs: () => void
}

export const useLogStore = create<LogState>((set) => ({
  logs: [
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'App initialized'
    }
  ],
  addLog: (level, message) =>
    set((state) => ({
      logs: [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          level,
          message
        },
        ...state.logs
      ].slice(0, 200)
    })),
  clearLogs: () => set({ logs: [] })
}))
