import React, { useMemo, useEffect } from 'react'
import { Search, Star, Plus, Server as ServerIcon, Activity, Trash2, Edit } from 'lucide-react'
import { useDnsStore } from '../../store/useDnsStore'
import { useDnsVpn } from '../../hooks/useDnsVpn'
import { useI18n } from '../../hooks/useI18n'
import { usePing } from '../../hooks/usePing'
import { ServerStore } from '../../types'

interface DnsListProps {
  onOpenAddCustom: () => void
  onOpenEditCustom: (server: ServerStore) => void
}

export const DnsListFeature: React.FC<DnsListProps> = ({
  onOpenAddCustom,
  onOpenEditCustom
}) => {
  const {
    servers,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    toggleFavorite,
    deleteCustomServer,
    activeServer,
    fetchRemoteServers
  } = useDnsStore()

  useEffect(() => {
    fetchRemoteServers()
  }, [fetchRemoteServers])

  const { connect, disconnect, isConnected, isConnecting } = useDnsVpn()
  const { t } = useI18n()
  const { pings, pingServer } = usePing()

  const availableTags = useMemo(() => {
    const set = new Set<string>()
    for (const srv of servers) {
      if (srv.tags) {
        for (const tag of srv.tags) {
          set.add(tag)
        }
      }
    }
    return Array.from(set)
  }, [servers])

  const filteredServers = useMemo(() => {
    return servers.filter((srv) => {
      const matchesSearch =
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.servers.some((ip) => ip.includes(searchQuery))
      const matchesTag = selectedTag ? srv.tags?.includes(selectedTag) : true
      return matchesSearch && matchesTag
    })
  }, [servers, searchQuery, selectedTag])

  const sortedServers = useMemo(() => {
    return [...filteredServers].sort((a, b) => {
      if (a.isPin && !b.isPin) return -1
      if (!a.isPin && b.isPin) return 1
      return b.rate - a.rate
    })
  }, [filteredServers])

  const handleConnectClick = async (srv: ServerStore) => {
    if (activeServer?.key === srv.key && isConnected) {
      await disconnect()
    } else {
      await connect(srv)
    }
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered w-full pl-9 pr-3 rounded-xl text-sm"
          />
        </div>
        <button
          onClick={onOpenAddCustom}
          className="btn btn-primary btn-sm rounded-xl gap-1"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs">{t('add')}</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedTag(null)}
          className={`btn btn-xs rounded-full ${
            selectedTag === null ? 'btn-primary' : 'btn-ghost bg-base-200'
          }`}
        >
          {t('all')}
        </button>
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`btn btn-xs rounded-full ${
              selectedTag === tag ? 'btn-primary' : 'btn-ghost bg-base-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sortedServers.map((srv) => {
          const isActive = activeServer?.key === srv.key && isConnected
          const pingVal = pings[srv.key]

          return (
            <div
              key={srv.key}
              className={`bg-base-100 border rounded-2xl p-3.5 flex items-center justify-between transition-all duration-200 ${
                isActive ? 'border-primary shadow-md ring-1 ring-primary' : 'border-base-300'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleFavorite(srv.key)}
                  className="btn btn-ghost btn-circle btn-xs text-base-content/40 hover:text-warning"
                >
                  <Star
                    className={`w-4 h-4 ${
                      srv.isPin ? 'fill-warning text-warning' : ''
                    }`}
                  />
                </button>

                <div className="w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center flex-shrink-0">
                  {srv.avatar ? (
                    <img
                      src={srv.avatar}
                      alt={srv.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <ServerIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-base-content truncate">
                      {srv.name}
                    </h4>
                    {srv.isCustom && (
                      <span className="badge badge-ghost badge-xs text-[10px]">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/60 font-mono truncate">
                    {srv.servers.join(', ')}
                  </p>
                  {srv.tags && srv.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {srv.tags.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-base-200 text-[10px] text-base-content/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => srv.servers[0] && pingServer(srv.key, srv.servers[0])}
                  className="btn btn-ghost btn-xs text-base-content/60"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-[10px]">
                    {pingVal !== undefined && pingVal !== null ? `${pingVal}ms` : ''}
                  </span>
                </button>

                {srv.isCustom && (
                  <>
                    <button
                      onClick={() => onOpenEditCustom(srv)}
                      className="btn btn-ghost btn-circle btn-xs text-base-content/60"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCustomServer(srv.key)}
                      className="btn btn-ghost btn-circle btn-xs text-error"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleConnectClick(srv)}
                  disabled={isConnecting}
                  className={`btn btn-sm rounded-xl ${
                    isActive ? 'btn-error' : 'btn-primary'
                  }`}
                >
                  {isActive ? t('disconnect') : t('connect')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
