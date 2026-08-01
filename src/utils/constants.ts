import { ServerStore } from '../types'

export const DEFAULT_SERVERS: ServerStore[] = [
  {
    key: 'SHECAN',
    name: 'Shecan',
    servers: ['178.22.122.100', '185.51.200.2'],
    avatar: '/servers-icon/shecan.png',
    rate: 10,
    tags: ['Gaming', 'Web', 'Ai'],
    isPin: false,
    dnsType: 'udp'
  },
  {
    key: 'ELECTRO',
    name: 'Electro Team',
    servers: ['78.157.42.100', '78.157.42.101'],
    avatar: '/servers-icon/electro.png',
    rate: 9,
    tags: ['Gaming', 'Web', 'Ai'],
    isPin: false,
    dnsType: 'udp'
  },
  {
    key: 'RADAR_GAME',
    name: 'Radar Game',
    servers: ['10.202.10.10', '10.202.10.11'],
    avatar: '/servers-icon/radar.png',
    rate: 8,
    tags: ['Gaming'],
    isPin: false,
    dnsType: 'udp'
  },
  {
    key: '403_ONLINE',
    name: '403 Online',
    servers: ['10.202.10.202', '10.202.10.102'],
    avatar: '/servers-icon/403.png',
    rate: 9,
    tags: ['Web', 'Ai'],
    isPin: false,
    dnsType: 'udp'
  },
  {
    key: 'ASIATECH',
    name: 'Asiatech',
    servers: ['194.36.174.161', '178.22.122.100'],
    avatar: '/servers-icon/asiatech.png',
    rate: 7,
    tags: ['Web'],
    isPin: false,
    dnsType: 'udp'
  },
  {
    key: 'CLOUD_FLARE',
    name: 'Cloudflare',
    servers: ['1.1.1.1', '1.0.0.1'],
    avatar: '/servers-icon/cloudflare.png',
    rate: 10,
    tags: ['Web', 'Security'],
    isPin: false,
    dnsType: 'udp',
    dohUrl: 'https://cloudflare-dns.com/dns-query'
  },
  {
    key: 'GOOGLE',
    name: 'Google Public DNS',
    servers: ['8.8.8.8', '8.8.4.4'],
    avatar: '/servers-icon/def.png',
    rate: 10,
    tags: ['Web', 'Global'],
    isPin: false,
    dnsType: 'udp',
    dohUrl: 'https://dns.google/dns-query'
  },
  {
    key: 'QUAD9',
    name: 'Quad9',
    servers: ['9.9.9.9', '149.112.112.112'],
    avatar: '/servers-icon/def.png',
    rate: 9,
    tags: ['Security', 'Privacy'],
    isPin: false,
    dnsType: 'udp'
  },
  {
    key: 'ADGUARD',
    name: 'AdGuard DNS',
    servers: ['94.140.14.14', '94.140.15.15'],
    avatar: '/servers-icon/def.png',
    rate: 9,
    tags: ['AdBlock', 'Privacy'],
    isPin: false,
    dnsType: 'udp'
  }
]
