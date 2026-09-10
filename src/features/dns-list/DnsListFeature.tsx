import type React from "react";
import { useMemo, useEffect } from "react";
import {
  Search,
  Star,
  Server as ServerIcon,
  Activity,
  Trash2,
  Edit,
  Zap,
} from "lucide-react";
import { useDnsStore } from "../../store/useDnsStore";
import { useI18n } from "../../hooks/useI18n";
import { usePing } from "../../hooks/usePing";
import type { ServerStore } from "../../types";

interface DnsListProps {
  onOpenAddCustom: () => void;
  onOpenEditCustom: (server: ServerStore) => void;
}

export const DnsListFeature: React.FC<DnsListProps> = ({
  onOpenEditCustom,
}) => {
  const {
    servers,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    toggleFavorite,
    deleteCustomServer,
    fetchRemoteServers,
  } = useDnsStore();

  useEffect(() => {
    fetchRemoteServers();
  }, [fetchRemoteServers]);

  const { t } = useI18n();
  const { pings, pingServer } = usePing();

  const availableTags = useMemo(() => {
    const set = new Set<string>();

    for (const srv of servers) {
      if (srv.tags) {
        for (const tag of srv.tags) {
          set.add(tag);
        }
      }
    }

    return Array.from(set);
  }, [servers]);

  const filteredServers = useMemo(() => {
    return servers.filter((srv) => {
      if (srv.isCustom) return false;

      const matchesSearch =
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.servers.some((ip) => ip.includes(searchQuery));

      const matchesTag = selectedTag
        ? srv.tags?.includes(selectedTag)
        : true;

      return matchesSearch && matchesTag;
    });
  }, [servers, searchQuery, selectedTag]);

  const sortedServers = useMemo(() => {
    return [...filteredServers].sort((a, b) => {
      if (a.isPin && !b.isPin) return -1;
      if (!a.isPin && b.isPin) return 1;
      return b.rate - a.rate;
    });
  }, [filteredServers]);

  return (
    <div className="mx-auto flex min-h-0 flex-1 w-full max-w-md flex-col overflow-hidden px-4 pt-5">
      {/* Header */}
      <div className="flex-none space-y-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#39ff88]/20 bg-[#39ff88]/10">
            <Zap size={21} className="text-[#39ff88]" />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {t("explore")}
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#39ff88]/50">
              DNS Servers
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />

          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0d0b] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#39ff88]/40 focus:ring-1 focus:ring-[#39ff88]/20"
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition ${
              selectedTag === null
                ? "border-[#39ff88]/50 bg-[#39ff88] text-[#050706]"
                : "border-white/10 bg-white/5 text-white/45"
            }`}
          >
            {t("all")}
          </button>

          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setSelectedTag(selectedTag === tag ? null : tag)
              }
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                selectedTag === tag
                  ? "border-[#39ff88]/50 bg-[#39ff88] text-[#050706]"
                  : "border-white/10 bg-white/5 text-white/45"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* DNS list */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain touch-pan-y pb-6 pt-2 no-scrollbar">
        {sortedServers.map((srv) => {
          const pingVal = pings[srv.key];

          return (
            <div
              key={srv.key}
              className={`rounded-2xl border p-3.5 transition-all ${
                srv.isPin
                  ? "border-[#39ff88]/35 bg-[#39ff88]/5"
                  : "border-white/10 bg-[#0a0d0b]"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Favorite */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(srv.key)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/5 hover:text-[#39ff88]"
                >
                  <Star
                    size={18}
                    className={
                      srv.isPin
                        ? "fill-[#39ff88] text-[#39ff88]"
                        : ""
                    }
                  />
                </button>

                {/* Server icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {srv.avatar ? (
                    <img
                      src={srv.avatar}
                      alt={srv.name}
                      className="h-6 w-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <ServerIcon
                      size={19}
                      className="text-[#39ff88]"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-bold text-white">
                      {srv.name}
                    </h4>

                    {srv.isPin && (
                      <span className="shrink-0 rounded-full bg-[#39ff88]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#39ff88]">
                        FAVORITE
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 truncate font-mono text-[11px] text-white/35">
                    {srv.servers.join(", ")}
                  </p>

                  {srv.tags && srv.tags.length > 0 && (
                    <div className="mt-1.5 flex gap-1 overflow-hidden">
                      {srv.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-white/35"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ping */}
                <button
                  type="button"
                  onClick={() =>
                    srv.servers[0] &&
                    pingServer(srv.key, srv.servers[0])
                  }
                  className="flex h-9 min-w-[45px] shrink-0 flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/35 transition hover:border-[#39ff88]/20 hover:text-[#39ff88]"
                >
                  <Activity size={13} />

                  <span className="text-[9px] font-mono">
                    {pingVal !== undefined && pingVal !== null
                      ? `${pingVal}ms`
                      : "--"}
                  </span>
                </button>

                {/* Custom controls */}
                {srv.isCustom && (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenEditCustom(srv)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-white/5 hover:text-white"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCustomServer(srv.key)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400/60 hover:bg-red-400/10 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {sortedServers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ServerIcon size={32} className="mb-3 text-white/15" />
            <p className="text-sm font-bold text-white/35">
              No DNS servers found
            </p>
            <p className="mt-1 text-xs text-white/20">
              Try another search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
