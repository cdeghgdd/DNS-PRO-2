import { useCallback, useEffect } from "react";
import { DnsVpn } from "../plugins/dns-vpn.plugin";
import { useDnsStore } from "../store/useDnsStore";
import { useLogStore } from "../store/useLogStore";
import { useI18n } from "./useI18n";
import type { ServerStore } from "../types";

export function useDnsVpn() {
  const {
    activeServer,
    isConnected,
    isConnecting,
    setActiveServer,
    setIsConnected,
    setIsConnecting,
    addRecentServer,
  } = useDnsStore();

  const { t } = useI18n();
  const addLog = useLogStore((s) => s.addLog);

  const checkStatus = useCallback(async () => {
    try {
      const res = await DnsVpn.status();
      if (res.isRunning && res.status === "connected") {
        setIsConnected(true);
        setIsConnecting(false);
      } else {
        setIsConnected(false);
        setIsConnecting(false);
      }
    } catch {
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, [setIsConnected, setIsConnecting]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const connect = async (server: ServerStore) => {
    try {
      setIsConnecting(true);
      addLog("info", `Requesting VPN permission for ${server.name}...`);

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        try {
          await Notification.requestPermission();
        } catch {}
      }

      const perm = await DnsVpn.requestPermission();
      if (!perm.granted) {
        setIsConnecting(false);
        addLog("error", "VPN permission denied by user");
        return false;
      }

      addLog("info", `Connecting to ${server.name} [${server.servers.join(", ")}]...`);

      const res = await DnsVpn.start({
        servers: server.servers,
        dnsType: server.dnsType || "udp",
        dohUrl: server.dohUrl,
        dotDomain: server.dotDomain,
        serverName: server.name,
        notificationTitle: t("title"),
        disconnectText: t("disconnect"),
      });

      if (res.success) {
        setActiveServer(server);
        setIsConnected(true);
        setIsConnecting(false);
        addRecentServer(server);
        addLog("success", `Successfully connected to ${server.name}`);

        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification(t("title"), {
              body: server.name,
              tag: "dns-vpn-connected",
            });
          } catch {}
        }

        return true;
      } else {
        setIsConnecting(false);
        addLog("error", res.error || "Failed to start VPN service");
        return false;
      }
    } catch (err: any) {
      setIsConnecting(false);
      addLog("error", `Connection error: ${err?.message || err}`);
      return false;
    }
  };

  const disconnect = async () => {
    try {
      setIsConnecting(true);
      addLog("info", "Disconnecting DNS VPN service...");
      await DnsVpn.stop();
      setIsConnected(false);
      setIsConnecting(false);
      addLog("info", "Disconnected from DNS VPN");
    } catch (err: any) {
      setIsConnecting(false);
      addLog("error", `Disconnect error: ${err?.message || err}`);
    }
  };

  return {
    isConnected,
    isConnecting,
    activeServer,
    connect,
    disconnect,
    checkStatus,
  };
}
