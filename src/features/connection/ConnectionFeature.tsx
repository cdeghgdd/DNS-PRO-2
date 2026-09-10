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
  ShieldCheck,
  Zap,
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

  const favoriteServers = useMemo(
    () => servers.filter((s) => s.isPin),
    [servers],
  );

  const selectableServers = useMemo(
    () => (favoriteServers.length > 0 ? favoriteServers : servers),
    [favoriteServers, servers],
  );

  const defaultTargetServer =
    activeServer || favoriteServers[0] || servers[0];

  const handleToggle = async () => {
    if (isConnecting) return;

    if (isConnected) {
      await disconnect();
    } else if (defaultTargetServer) {
      await connect(defaultTargetServer);
    }
  };

  const handlePingActive = () => {
    if (
      defaultTargetServer &&
      defaultTargetServer.servers.length > 0
    ) {
      pingServer(
        defaultTargetServer.key,
        defaultTargetServer.servers[0],
      );
    }
  };

  const handleSelectServer = (server: ServerStore) => {
    setActiveServer(server);
    setIsSelectOpen(false);
  };

  const activePing = defaultTargetServer
    ? pings[defaultTargetServer.key]
    : null;

  return (
    <div className="min-h-full bg-[#050706] text-white px-4 pt-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-lime-400/30 bg-black shadow-lg shadow-lime-500/10">
            <img
              src="/dns_pro_logo.png"
              alt="DNS PRO 2"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="text-lg font-black tracking-tight">
              DNS PRO <span className="text-lime-400">2</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Fast DNS • Secure Network
            </div>
          </div>
        </div>

        <div
          className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
            isConnected
              ? "border-lime-400/30 bg-lime-400/10 text-lime-400"
              : "border-white/10 bg-white/[0.03] text-white/40"
          }`}
        >
          {isConnected ? "Protected" : "Offline"}
        </div>
      </div>

      {/* Status */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/10">
            {isConnected ? (
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-lime-400" />
            )}

            <span className="text-[11px] font-bold text-lime-300">
              {isConnected
                ? "DNS PROTECTION ACTIVE"
                : "READY TO CONNECT"}
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight">
          {isConnected
            ? defaultTargetServer?.name || "DNS"
            : isConnecting
              ? t("connecting")
              : "DNS PRO 2"}
        </h1>

        <p className="text-xs text-white/40 mt-1 font-mono">
          {isConnected
            ? defaultTargetServer?.servers.join(" • ")
            : defaultTargetServer?.name || "Choose a DNS server"}
        </p>
      </div>

      {/* Connect button */}
      <div className="flex justify-center mb-8">
        <div
          className={`rounded-full p-2 transition-all duration-500 ${
            isConnected
              ? "bg-lime-400/10 shadow-[0_0_70px_rgba(163,230,53,0.18)]"
              : "bg-white/[0.02]"
          }`}
        >
          <button
            onClick={handleToggle}
            disabled={isConnecting}
            className={`w-52 h-52 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 active:scale-95 ${
              isConnected
                ? "border-lime-400 bg-lime-400 text-black shadow-[0_0_45px_rgba(163,230,53,0.25)]"
                : isConnecting
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-300 animate-pulse"
                  : "border-lime-400/50 bg-[#0b100c] text-lime-400 hover:border-lime-400"
            }`}
          >
            <Power className="w-14 h-14 mb-3" strokeWidth={2.2} />

            <span className="text-sm font-black uppercase tracking-[0.18em]">
              {isConnecting
                ? t("connecting")
                : isConnected
                  ? t("disconnect")
                  : t("connect")}
            </span>
          </button>
        </div>
      </div>

      {/* DNS selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-lime-400" />
            <span className="text-xs font-bold text-white/70">
              DNS SERVER
            </span>
          </div>

          {isConnected && (
            <span className="text-[10px] text-lime-400 font-bold">
              ACTIVE
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            !isConnected &&
            !isConnecting &&
            setIsSelectOpen(true)
          }
          disabled={isConnected || isConnecting}
          className="w-full bg-[#0b100c] border border-white/10 rounded-2xl p-4 flex items-center justify-between active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/10 flex items-center justify-center">
              {defaultTargetServer?.avatar ? (
                <img
                  src={defaultTargetServer.avatar}
                  alt={defaultTargetServer.name}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <ServerIcon className="w-5 h-5 text-lime-400" />
              )}
            </div>

            <div className="text-left rtl:text-right min-w-0">
              <div className="font-bold text-sm truncate">
                {defaultTargetServer?.name ||
                  "Select DNS Server"}
              </div>

              <div className="text-[11px] text-white/35 font-mono truncate">
                {defaultTargetServer?.servers.join(", ") ||
                  "No server selected"}
              </div>
            </div>
          </div>

          <ChevronDown className="w-5 h-5 text-white/30 flex-shrink-0" />
        </button>
      </div>

      {/* Server info */}
      {defaultTargetServer && (
        <div className="bg-[#0b100c] border border-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                <ServerIcon className="w-5 h-5 text-lime-400" />
              </div>

              <div className="min-w-0">
                <div className="font-bold text-sm truncate">
                  {defaultTargetServer.name}
                </div>

                <div className="text-[10px] text-white/35 uppercase tracking-wider">
                  {defaultTargetServer.dnsType || "UDP"} Protocol
                </div>
              </div>
            </div>

            <button
              onClick={handlePingActive}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-lime-400/10 text-lime-400 text-xs font-bold active:scale-95"
            >
              <Activity className="w-3.5 h-3.5" />

              {activePing !== null &&
              activePing !== undefined
                ? `${activePing} ${t("ms")}`
                : t("ping")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
            <div>
              <div className="text-[10px] text-white/30 mb-1">
                PRIMARY DNS
              </div>
              <div className="font-mono text-xs font-bold text-lime-300 truncate">
                {defaultTargetServer.servers[0] || "-"}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-white/30 mb-1">
                SECONDARY DNS
              </div>
              <div className="font-mono text-xs font-bold text-lime-300 truncate">
                {defaultTargetServer.servers[1] || "-"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom DNS */}
      <button
        onClick={openAddCustom}
        className="w-full h-12 rounded-2xl border border-lime-400/20 bg-lime-400/5 text-lime-400 flex items-center justify-center gap-2 font-bold text-sm active:scale-[0.98] transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>{t("addCustomServer")}</span>
      </button>

      {/* Server selector */}
      {isSelectOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0"
            onClick={() => setIsSelectOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#090d0a] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-lime-400" />
                <h3 className="font-black text-lg">
                  Select DNS Server
                </h3>
              </div>

              <button
                onClick={() => setIsSelectOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pt-4 no-scrollbar">
              {selectableServers.map((srv) => {
                const isSelected =
                  defaultTargetServer?.key === srv.key;

                return (
                  <button
                    key={srv.key}
                    type="button"
                    onClick={() => handleSelectServer(srv)}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all text-left rtl:text-right ${
                      isSelected
                        ? "border-lime-400/40 bg-lime-400/10"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                        {srv.avatar ? (
                          <img
                            src={srv.avatar}
                            alt={srv.name}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <ServerIcon className="w-5 h-5 text-lime-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">
                          {srv.name}
                        </div>

                        <div className="text-[11px] text-white/35 font-mono truncate">
                          {srv.servers.join(", ")}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-7 h-7 rounded-full bg-lime-400 text-black flex items-center justify-center flex-shrink-0">
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
