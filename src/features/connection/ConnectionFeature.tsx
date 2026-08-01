import type React from "react";
import { useMemo, useEffect } from "react";
import { Power, Activity, Server as ServerIcon, Star } from "lucide-react";
import { useDnsStore } from "../../store/useDnsStore";
import { useDnsVpn } from "../../hooks/useDnsVpn";
import { useI18n } from "../../hooks/useI18n";
import { usePing } from "../../hooks/usePing";

export const ConnectionFeature: React.FC = () => {
  const { activeServer, servers, setActiveServer, fetchRemoteServers } = useDnsStore();
  const { isConnected, isConnecting, connect, disconnect } = useDnsVpn();
  const { t } = useI18n();
  const { pings, isPinging, pingServer } = usePing();

  useEffect(() => {
    fetchRemoteServers();
  }, [fetchRemoteServers]);

  const favoriteServers = useMemo(() => {
    return servers.filter((s) => s.isPin);
  }, [servers]);

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

  const handleServerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    const target = servers.find((s) => s.key === selectedKey);
    if (target) {
      setActiveServer(target);
    }
  };

  const activePing = defaultTargetServer ? pings[defaultTargetServer.key] : null;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-base-content">
          {isConnected
            ? t("connectedTo", { server: defaultTargetServer?.name || "DNS" })
            : isConnecting
              ? t("connecting")
              : t("disconnected")}
        </h2>
        <p className="text-sm text-base-content/70">
          {isConnected
            ? defaultTargetServer?.servers.join(" • ")
            : "Select a server to secure your DNS queries"}
        </p>
      </div>

      <div className="relative my-4 flex items-center justify-center">
        <button
          onClick={handleToggle}
          disabled={isConnecting}
          className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 ${
            isConnected
              ? "bg-success text-success-content ring-8 ring-success/20"
              : isConnecting
                ? "bg-warning text-warning-content ring-8 ring-warning/20 animate-pulse"
                : "bg-primary text-primary-content ring-8 ring-primary/20"
          }`}
        >
          <Power className="w-12 h-12 mb-1" />
          <span className="text-sm font-black uppercase tracking-wider">
            {isConnecting ? t("connecting") : isConnected ? t("disconnect") : t("connect")}
          </span>
        </button>
      </div>

      <div className="w-full space-y-1">
        <label className="text-xs font-semibold text-base-content/70 px-1 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
          <span>Favorite Servers</span>
        </label>
        {favoriteServers.length > 0 ? (
          <select
            value={defaultTargetServer?.key || ""}
            onChange={handleServerChange}
            disabled={isConnected || isConnecting}
            className="select select-bordered w-full rounded-2xl bg-base-100 font-bold text-sm shadow-sm"
          >
            {favoriteServers.map((server) => (
              <option key={server.key} value={server.key}>
                {server.name} ({server.servers.join(", ")})
              </option>
            ))}
          </select>
        ) : (
          <div className="p-3 bg-base-100 border border-base-300 rounded-2xl text-center text-xs text-base-content/60">
            No favorite servers added yet. Star servers in Explorer to see them here!
          </div>
        )}
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

          {defaultTargetServer.dohUrl && (
            <div className="text-xs pt-1 border-t border-base-200">
              <span className="text-base-content/60 block">DoH URL</span>
              <span className="font-mono font-medium text-base-content truncate block">
                {defaultTargetServer.dohUrl}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
