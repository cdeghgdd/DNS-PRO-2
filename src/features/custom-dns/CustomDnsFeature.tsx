import type React from 'react'
import { useState, useEffect } from 'react'
import { X, Server, Check } from 'lucide-react'
import { useDnsStore } from '../../store/useDnsStore'
import { useI18n } from '../../hooks/useI18n'
import { isValidIp, isValidDohUrl, isValidDotDomain } from '../../utils/validator'
import { DnsType, ServerStore } from '../../types'

interface CustomDnsModalProps {
  isOpen: boolean
  onClose: () => void
  editingServer?: ServerStore | null
}

const PRESET_TAGS = ['Custom', 'Gaming', 'Privacy', 'Anti-Ads', 'Fast']

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
  const [selectedTags, setSelectedTags] = useState<string[]>(['Custom'])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (editingServer) {
      setName(editingServer.name)
      setIp1(editingServer.servers[0] || '')
      setIp2(editingServer.servers[1] || '')
      setDnsType(editingServer.dnsType || 'udp')
      setDohUrl(editingServer.dohUrl || '')
      setDotDomain(editingServer.dotDomain || '')
      setSelectedTags(editingServer.tags && editingServer.tags.length > 0 ? editingServer.tags : ['Custom'])
    } else {
      setName('')
      setIp1('')
      setIp2('')
      setDnsType('udp')
      setDohUrl('')
      setDotDomain('')
      setSelectedTags(['Custom'])
    }
    setErrorMsg('')
  }, [editingServer, isOpen])

  if (!isOpen) return null

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag))
      }
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

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

    if (editingServer) {
      updateCustomServer({
        ...editingServer,
        name: name.trim(),
        servers: serversList,
        dnsType,
        dohUrl: dnsType === 'doh' ? dohUrl.trim() : undefined,
        dotDomain: dnsType === 'dot' ? dotDomain.trim() : undefined,
        tags: selectedTags,
        isPin: true,
        isCustom: true
      })
    } else {
      const newKey = `CUSTOM_${Date.now()}`
      addCustomServer({
        key: newKey,
        name: name.trim(),
        servers: serversList,
        avatar: '/servers-icon/def.png',
        rate: 5,
        tags: selectedTags,
        isPin: true,
        isCustom: true,
        dnsType,
        dohUrl: dnsType === 'doh' ? dohUrl.trim() : undefined,
        dotDomain: dnsType === 'dot' ? dotDomain.trim() : undefined
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative bg-base-100 border border-base-300 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between border-b border-base-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-base-content">
              {editingServer ? t('edit') : t('addCustomDns')}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm text-base-content/70">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-error text-xs py-2 px-3 rounded-xl">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/70">
              {t('serverName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My DNS"
              className="input input-sm input-bordered w-full rounded-xl font-semibold text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/70">
                {t('serverAddress1')}
              </label>
              <input
                type="text"
                value={ip1}
                onChange={(e) => setIp1(e.target.value)}
                placeholder="1.1.1.1"
                className="input input-sm input-bordered w-full rounded-xl font-mono text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/70">
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/70">
              {t('dnsType')}
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-base-200 rounded-xl">
              <button
                type="button"
                onClick={() => setDnsType('udp')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dnsType === 'udp'
                    ? 'bg-primary text-primary-content shadow-xs'
                    : 'text-base-content/70'
                }`}
              >
                UDP
              </button>
              <button
                type="button"
                onClick={() => setDnsType('doh')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dnsType === 'doh'
                    ? 'bg-primary text-primary-content shadow-xs'
                    : 'text-base-content/70'
                }`}
              >
                DoH
              </button>
              <button
                type="button"
                onClick={() => setDnsType('dot')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dnsType === 'dot'
                    ? 'bg-primary text-primary-content shadow-xs'
                    : 'text-base-content/70'
                }`}
              >
                DoT
              </button>
            </div>
          </div>

          {dnsType === 'doh' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/70">
                {t('dohUrl')}
              </label>
              <input
                type="url"
                value={dohUrl}
                onChange={(e) => setDohUrl(e.target.value)}
                placeholder="https://example.com/dns-query"
                className="input input-sm input-bordered w-full rounded-xl font-mono text-xs"
                required
              />
            </div>
          )}

          {dnsType === 'dot' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content/70">
                {t('dotDomain')}
              </label>
              <input
                type="text"
                value={dotDomain}
                onChange={(e) => setDotDomain(e.target.value)}
                placeholder="example.com"
                className="input input-sm input-bordered w-full rounded-xl font-mono text-xs"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content/70">
              Tags
            </label>
            <div className="flex flex-wrap gap-1">
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`btn btn-xs rounded-lg gap-1 ${
                      isSelected ? 'btn-primary' : 'btn-ghost bg-base-200 text-base-content/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{tag}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm flex-1 rounded-xl font-bold"
            >
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary btn-sm flex-1 rounded-xl font-bold">
              {editingServer ? t('save') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

