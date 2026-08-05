import type React from "react";
import { useMemo, useEffect, useState } from "react";
import {
  Power,
  Activity,
  Server as ServerIcon,
  Star,
  Plus,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { useDnsStore } from "../../store/useDnsStore";
import { useDnsVpn } from "../../hooks/useDnsVpn";
import { useI18n } from "../../hooks/useI18n";
import { usePing } from "../../hooks/usePing";
import { useCustomDnsModal } from "../../context/CustomDnsModalContext";
import type { ServerStore } from "../../types";

export const ConnectionFeature: React.FC = () => {
  const { activeServer, servers, setActiveServer, fetchRemoteServers } = useDnsStore();
  const { isConnected, isConnecting, connect, disconnect } = useDnsVpn();
  const { t } = useI18n();
  const { pings, isPinging, pingServer } = usePing();
  const { openAddCustom } = useCustomDnsModal();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    fetchRemoteServers();
  }, [fetchRemoteServers]);

  const favoriteServers = useMemo(() => {
    return servers.filter((s) => s.isPin);
  }, [servers]);

  const selectableServers = useMemo(() => {
    return favoriteServers.length > 0 ? favoriteServers : servers;
  }, [favoriteServers, servers]);

  const defaultTargetServer = activeServer || favoriteServers[0] || servers[0];

  const handleToggle = async () => {
    if (isConnecting) return;
    if (isConnected) {
      await disconnect();
    } else {
      if (defaultTargetServer) {
        await connect(defaultTargetServer);
      }
    }
  };

  const handlePingActive = () => {
    if (defaultTargetServer && defaultTargetServer.servers.length > 0) {
      pingServer(defaultTargetServer.key, defaultTargetServer.servers[0]);
    }
  };

  const handleSelectServer = (server: ServerStore) => {
    setActiveServer(server);
    setIsSelectOpen(false);
  };

  const activePing = defaultTargetServer ? pings[defaultTargetServer.key] : null;

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6 max-w-md mx-auto min-h-[80vh] relative">
      <div className="text-center space-y-1 mt-4">
        <h2 className="text-2xl font-black text-base-content tracking-tight">
          {isConnected
            ? t("connectedTo", { server: defaultTargetServer?.name || "DNS" })
            : isConnecting
              ? t("connecting")
              : t("disconnected")}
        </h2>
        <p className="text-sm font-medium text-base-content/70">
          {isConnected
            ? defaultTargetServer?.servers.join(" • ")
            : defaultTargetServer?.name || "Select a server"}
        </p>
      </div>

      <div className="relative my-6 flex items-center justify-center">
        <button
          onClick={handleToggle}
          disabled={isConnecting}
          className={`w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 ${
            isConnected
              ? "bg-success text-success-content ring-8 ring-success/20"
              : isConnecting
                ? "bg-warning text-warning-content ring-8 ring-warning/20 animate-pulse"
                : "bg-primary text-primary-content ring-8 ring-primary/20"
          }`}
        >
          <Power className="w-16 h-16 mb-2" />
          <span className="text-base font-black uppercase tracking-wider">
            {isConnecting ? t("connecting") : isConnected ? t("disconnect") : t("connect")}
          </span>
        </button>
      </div>

      <div className="w-full space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold text-base-content/80 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span>{t("selectFavoriteServer")}</span>
          </label>
        </div>

        <button
          type="button"
          onClick={() => !isConnected && !isConnecting && setIsSelectOpen(true)}
          disabled={isConnected || isConnecting}
          className="w-full border border-base-300 bg-base-100 rounded-2xl p-3.5 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-xl bg-base-200 flex items-center justify-center flex-shrink-0">
              {defaultTargetServer?.avatar ? (
                <img
                  src={defaultTargetServer.avatar}
                  alt={defaultTargetServer.name}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <ServerIcon className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="text-left rtl:text-right truncate">
              <div className="font-bold text-sm text-base-content truncate">
                {defaultTargetServer?.name || t("selectFavoriteServer")}
              </div>
              <div className="text-xs text-base-content/60 font-mono truncate">
                {defaultTargetServer?.servers.join(", ")}
              </div>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-base-content/60 flex-shrink-0" />
        </button>
      </div>

      <div className="w-full">
        <button
          onClick={openAddCustom}
          className="btn btn-outline btn-primary w-full rounded-2xl gap-2 font-bold shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>{t("addCustomServer")}</span>
        </button>
      </div>

      {defaultTargetServer && (
        <div className="w-full bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
                {defaultTargetServer.avatar ? (
                  <img
                    src={defaultTargetServer.avatar}
                    alt={defaultTargetServer.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <ServerIcon className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base-content">{defaultTargetServer.name}</h3>
                <span className="text-xs text-base-content/60 uppercase">
                  {defaultTargetServer.dnsType || "UDP"} Protocol
                </span>
              </div>
            </div>
            <button
              onClick={handlePingActive}
              disabled={isPinging}
              className="btn btn-ghost btn-xs gap-1"
            >
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs">
                {activePing !== null && activePing !== undefined
                  ? `${activePing} ${t("ms")}`
                  : t("ping")}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-base-200">
            <div>
              <span className="text-base-content/60 block">Primary DNS</span>
              <span className="font-mono font-semibold text-base-content">
                {defaultTargetServer.servers[0] || "-"}
              </span>
            </div>
            <div>
              <span className="text-base-content/60 block">Secondary DNS</span>
              <span className="font-mono font-semibold text-base-content">
                {defaultTargetServer.servers[1] || "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {isSelectOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsSelectOpen(false)} />

          <div className="relative w-full max-w-md bg-base-100 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 max-h-[75vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning fill-warning" />
                <h3 className="font-black text-lg text-base-content">
                  {t("selectFavoriteServer")}
                </h3>
              </div>
              <button
                onClick={() => setIsSelectOpen(false)}
                className="btn btn-ghost btn-circle btn-sm text-base-content/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 no-scrollbar">
              {selectableServers.map((srv) => {
                const isSelected = defaultTargetServer?.key === srv.key;
                return (
                  <button
                    key={srv.key}
                    type="button"
                    onClick={() => handleSelectServer(srv)}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all text-left rtl:text-right ${
                      isSelected
                        ? "border-primary bg-primary/10 font-bold"
                        : "border-base-200 hover:bg-base-200/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-base-200 flex items-center justify-center flex-shrink-0">
                        {srv.avatar ? (
                          <img
                            src={srv.avatar}
                            alt={srv.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <ServerIcon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-base-content truncate">
                          {srv.name}
                        </div>
                        <div className="text-xs text-base-content/60 font-mono truncate">
                          {srv.servers.join(", ")}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center flex-shrink-0 ml-2 rtl:mr-2">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
