export type DnsType = 'udp' | 'doh' | 'dot'

export interface Server {
  key: string
  name: string
  servers: string[]
  avatar: string
  rate: number
  tags: string[]
  dnsType?: DnsType
  dohUrl?: string
  dotDomain?: string
  isCustom?: boolean
}

export interface ServerStore extends Server {
  isPin: boolean
}

export interface Settings {
  autoStartOnBoot: boolean
  autoReconnect: boolean
  lng: 'eng' | 'fa' | 'ru'
  theme: 'light' | 'dark'
  notificationsEnabled: boolean
}

export interface VpnStatus {
  status: 'connected' | 'disconnected' | 'connecting'
  isRunning: boolean
  servers: string[]
  dnsType: DnsType
  dohUrl?: string
  dotDomain?: string
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
}
