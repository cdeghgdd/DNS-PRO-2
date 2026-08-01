import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useDnsStore } from '../../store/useDnsStore'
import { useI18n } from '../../hooks/useI18n'
import { isValidIp, isValidDohUrl, isValidDotDomain } from '../../utils/validator'
import { DnsType, ServerStore } from '../../types'

interface CustomDnsModalProps {
  isOpen: boolean
  onClose: () => void
  editingServer?: ServerStore | null
}

export const CustomDnsFeature: React.FC<CustomDnsModalProps> = ({
  isOpen,
  onClose,
  editingServer
}) => {
  const { addCustomServer, updateCustomServer } = useDnsStore()
  const { t } = useI18n()

  const [name, setName] = useState('')
  const [ip1, setIp1] = useState('')
  const [ip2, setIp2] = useState('')
  const [dnsType, setDnsType] = useState<DnsType>('udp')
  const [dohUrl, setDohUrl] = useState('')
  const [dotDomain, setDotDomain] = useState('')
  const [tagsStr, setTagsStr] = useState('Custom')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (editingServer) {
      setName(editingServer.name)
      setIp1(editingServer.servers[0] || '')
      setIp2(editingServer.servers[1] || '')
      setDnsType(editingServer.dnsType || 'udp')
      setDohUrl(editingServer.dohUrl || '')
      setDotDomain(editingServer.dotDomain || '')
      setTagsStr(editingServer.tags?.join(', ') || 'Custom')
    } else {
      setName('')
      setIp1('')
      setIp2('')
      setDnsType('udp')
      setDohUrl('')
      setDotDomain('')
      setTagsStr('Custom')
    }
    setErrorMsg('')
  }, [editingServer, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Server name is required')
      return
    }

    if (!isValidIp(ip1)) {
      setErrorMsg('Primary DNS IP address is invalid')
      return
    }

    if (ip2.trim() && !isValidIp(ip2)) {
      setErrorMsg('Secondary DNS IP address is invalid')
      return
    }

    if (dnsType === 'doh' && !isValidDohUrl(dohUrl)) {
      setErrorMsg('Invalid DNS-over-HTTPS (DoH) URL')
      return
    }

    if (dnsType === 'dot' && !isValidDotDomain(dotDomain)) {
      setErrorMsg('Invalid DNS-over-TLS (DoT) Domain')
      return
    }

    const serversList = [ip1.trim()]
    if (ip2.trim()) serversList.push(ip2.trim())

    const tagsArr = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (editingServer) {
      updateCustomServer({
        ...editingServer,
        name: name.trim(),
        servers: serversList,
        dnsType,
        dohUrl: dnsType === 'doh' ? dohUrl.trim() : undefined,
        dotDomain: dnsType === 'dot' ? dotDomain.trim() : undefined,
        tags: tagsArr
      })
    } else {
      const newKey = `CUSTOM_${Date.now()}`
      addCustomServer({
        key: newKey,
        name: name.trim(),
        servers: serversList,
        avatar: '/servers-icon/def.png',
        rate: 5,
        tags: tagsArr,
        isPin: false,
        isCustom: true,
        dnsType,
        dohUrl: dnsType === 'doh' ? dohUrl.trim() : undefined,
        dotDomain: dnsType === 'dot' ? dotDomain.trim() : undefined
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-base-100 border border-base-300 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-base-content">
            {editingServer ? t('edit') : t('addCustomDns')}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-error text-xs py-2 rounded-xl">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label label-text text-xs font-semibold">
              {t('serverName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Custom DNS"
              className="input input-sm input-bordered w-full rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label label-text text-xs font-semibold">
                {t('serverAddress1')}
              </label>
              <input
                type="text"
                value={ip1}
                onChange={(e) => setIp1(e.target.value)}
                placeholder="1.1.1.1 or ::1"
                className="input input-sm input-bordered w-full rounded-xl font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="label label-text text-xs font-semibold">
                {t('serverAddress2')}
              </label>
              <input
                type="text"
                value={ip2}
                onChange={(e) => setIp2(e.target.value)}
                placeholder="1.0.0.1"
                className="input input-sm input-bordered w-full rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label label-text text-xs font-semibold">
              {t('dnsType')}
            </label>
            <select
              value={dnsType}
              onChange={(e) => setDnsType(e.target.value as DnsType)}
              className="select select-sm select-bordered w-full rounded-xl text-xs"
            >
              <option value="udp">Plain DNS (UDP/TCP)</option>
              <option value="doh">DNS-over-HTTPS (DoH)</option>
              <option value="dot">DNS-over-TLS (DoT)</option>
            </select>
          </div>

          {dnsType === 'doh' && (
            <div>
              <label className="label label-text text-xs font-semibold">
                {t('dohUrl')}
              </label>
              <input
                type="url"
                value={dohUrl}
                onChange={(e) => setDohUrl(e.target.value)}
                placeholder="https://dns.example.com/dns-query"
                className="input input-sm input-bordered w-full rounded-xl font-mono text-xs"
                required
              />
            </div>
          )}

          {dnsType === 'dot' && (
            <div>
              <label className="label label-text text-xs font-semibold">
                {t('dotDomain')}
              </label>
              <input
                type="text"
                value={dotDomain}
                onChange={(e) => setDotDomain(e.target.value)}
                placeholder="dns.example.com"
                className="input input-sm input-bordered w-full rounded-xl font-mono text-xs"
                required
              />
            </div>
          )}

          <div>
            <label className="label label-text text-xs font-semibold">Tags</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Gaming, Web, Custom"
              className="input input-sm input-bordered w-full rounded-xl text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm flex-1 rounded-xl"
            >
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary btn-sm flex-1 rounded-xl">
              {editingServer ? t('save') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
