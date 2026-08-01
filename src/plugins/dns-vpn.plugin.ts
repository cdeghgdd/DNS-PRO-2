import { registerPlugin } from '@capacitor/core'
import { DnsType, VpnStatus } from '../types'

export interface DnsVpnPlugin {
  requestPermission(): Promise<{ granted: boolean }>
  start(options: {
    servers: string[]
    dnsType: DnsType
    dohUrl?: string
    dotDomain?: string
  }): Promise<{ success: boolean; error?: string }>
  stop(): Promise<{ success: boolean }>
  status(): Promise<VpnStatus>
  isRunning(): Promise<{ isRunning: boolean }>
  getCurrentDNS(): Promise<{
    servers: string[]
    dnsType: DnsType
    dohUrl?: string
    dotDomain?: string
  }>
}

export const DnsVpn = registerPlugin<DnsVpnPlugin>('DnsVpn', {
  web: {
    requestPermission: async () => ({ granted: true }),
    start: async () => ({ success: true }),
    stop: async () => ({ success: true }),
    status: async () => ({
      status: 'disconnected',
      isRunning: false,
      servers: [],
      dnsType: 'udp'
    }),
    isRunning: async () => ({ isRunning: false }),
    getCurrentDNS: async () => ({
      servers: [],
      dnsType: 'udp'
    })
  }
})
