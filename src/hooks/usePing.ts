import { useState } from 'react'

export function usePing() {
  const [pings, setPings] = useState<Record<string, number | null>>({})
  const [isPinging, setIsPinging] = useState(false)

  const pingServer = async (key: string, ip: string) => {
    const start = performance.now()
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)
      await fetch(`https://${ip}`, { mode: 'no-cors', signal: controller.signal })
      clearTimeout(timeoutId)
      const duration = Math.round(performance.now() - start)
      setPings((prev) => ({ ...prev, [key]: duration }))
    } catch {
      const duration = Math.round(performance.now() - start)
      if (duration < 2500) {
        setPings((prev) => ({ ...prev, [key]: duration }))
      } else {
        setPings((prev) => ({ ...prev, [key]: null }))
      }
    }
  }

  const pingAll = async (servers: Array<{ key: string; servers: string[] }>) => {
    setIsPinging(true)
    for (const srv of servers) {
      if (srv.servers.length > 0) {
        await pingServer(srv.key, srv.servers[0])
      }
    }
    setIsPinging(false)
  }

  return { pings, isPinging, pingServer, pingAll }
}
