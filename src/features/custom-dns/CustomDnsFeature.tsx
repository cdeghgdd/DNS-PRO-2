import type React from "react";
import { useState, useEffect } from "react";
import { X, Server, Check, ShieldCheck } from "lucide-react";
import { useDnsStore } from "../../store/useDnsStore";
import { useI18n } from "../../hooks/useI18n";
import {
  isValidIp,
  isValidDohUrl,
  isValidDotDomain,
} from "../../utils/validator";
import { DnsType, ServerStore } from "../../types";

interface CustomDnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingServer?: ServerStore | null;
}

const PRESET_TAGS = ["Custom", "Gaming", "Privacy", "Anti-Ads", "Fast"];

export const CustomDnsFeature: React.FC<CustomDnsModalProps> = ({
  isOpen,
  onClose,
  editingServer,
}) => {
  const { addCustomServer, updateCustomServer } = useDnsStore();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [ip1, setIp1] = useState("");
  const [ip2, setIp2] = useState("");
  const [dnsType, setDnsType] = useState<DnsType>("udp");
  const [dohUrl, setDohUrl] = useState("");
  const [dotDomain, setDotDomain] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Custom"]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingServer) {
      setName(editingServer.name);
      setIp1(editingServer.servers[0] || "");
      setIp2(editingServer.servers[1] || "");
      setDnsType(editingServer.dnsType || "udp");
      setDohUrl(editingServer.dohUrl || "");
      setDotDomain(editingServer.dotDomain || "");
      setSelectedTags(
        editingServer.tags && editingServer.tags.length > 0
          ? editingServer.tags
          : ["Custom"],
      );
    } else {
      setName("");
      setIp1("");
      setIp2("");
      setDnsType("udp");
      setDohUrl("");
      setDotDomain("");
      setSelectedTags(["Custom"]);
    }

    setErrorMsg("");
  }, [editingServer, isOpen]);

  if (!isOpen) return null;

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Server name is required");
      return;
    }

    if (!isValidIp(ip1)) {
      setErrorMsg("Primary DNS IP address is invalid");
      return;
    }

    if (ip2.trim() && !isValidIp(ip2)) {
      setErrorMsg("Secondary DNS IP address is invalid");
      return;
    }

    if (dnsType === "doh" && !isValidDohUrl(dohUrl)) {
      setErrorMsg("Invalid DNS-over-HTTPS (DoH) URL");
      return;
    }

    if (dnsType === "dot" && !isValidDotDomain(dotDomain)) {
      setErrorMsg("Invalid DNS-over-TLS (DoT) Domain");
      return;
    }

    const serversList = [ip1.trim()];

    if (ip2.trim()) {
      serversList.push(ip2.trim());
    }

    if (editingServer) {
      updateCustomServer({
        ...editingServer,
        name: name.trim(),
        servers: serversList,
        dnsType,
        dohUrl: dnsType === "doh" ? dohUrl.trim() : undefined,
        dotDomain: dnsType === "dot" ? dotDomain.trim() : undefined,
        tags: selectedTags,
        isPin: true,
        isCustom: true,
      });
    } else {
      const newKey = `CUSTOM_${Date.now()}`;

      addCustomServer({
        key: newKey,
        name: name.trim(),
        servers: serversList,
        avatar: "/servers-icon/def.png",
        rate: 5,
        tags: selectedTags,
        isPin: true,
        isCustom: true,
        dnsType,
        dohUrl: dnsType === "doh" ? dohUrl.trim() : undefined,
        dotDomain: dnsType === "dot" ? dotDomain.trim() : undefined,
      });
    }

    onClose();
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none transition placeholder:text-white/20 focus:border-[#39ff88]/40 focus:ring-1 focus:ring-[#39ff88]/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#080b09] p-5 shadow-2xl no-scrollbar">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#39ff88]/20 bg-[#39ff88]/10">
              <Server size={19} className="text-[#39ff88]" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">
                {editingServer ? t("edit") : t("addCustomDns")}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#39ff88]/50">
                DNS PRO 2
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-medium text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50">
              {t("serverName")}
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My DNS"
              className={inputClass}
              required
            />
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/50">
                {t("serverAddress1")}
              </label>

              <input
                type="text"
                value={ip1}
                onChange={(e) => setIp1(e.target.value)}
                placeholder="1.1.1.1"
                className={`${inputClass} font-mono`}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/50">
                {t("serverAddress2")}
              </label>

              <input
                type="text"
                value={ip2}
                onChange={(e) => setIp2(e.target.value)}
                placeholder="1.0.0.1"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          {/* DNS Type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50">
              {t("dnsType")}
            </label>

            <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              {(["udp", "doh", "dot"] as DnsType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDnsType(type)}
                  className={`rounded-lg py-2 text-xs font-black transition ${
                    dnsType === type
                      ? "bg-[#39ff88] text-[#050706]"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* DoH */}
          {dnsType === "doh" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/50">
                {t("dohUrl")}
              </label>

              <input
                type="url"
                value={dohUrl}
                onChange={(e) => setDohUrl(e.target.value)}
                placeholder="https://example.com/dns-query"
                className={`${inputClass} font-mono`}
                required
              />
            </div>
          )}

          {/* DoT */}
          {dnsType === "dot" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/50">
                {t("dotDomain")}
              </label>

              <input
                type="text"
                value={dotDomain}
                onChange={(e) => setDotDomain(e.target.value)}
                placeholder="example.com"
                className={`${inputClass} font-mono`}
                required
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50">
              Tags
            </label>

            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-bold transition ${
                      isSelected
                        ? "border-[#39ff88]/40 bg-[#39ff88]/10 text-[#39ff88]"
                        : "border-white/10 bg-white/5 text-white/35"
                    }`}
                  >
                    {isSelected && <Check size={11} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white/45 transition hover:text-white"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#39ff88] text-xs font-black text-[#050706] transition hover:brightness-110"
            >
              <ShieldCheck size={15} />
              {editingServer ? t("save") : t("add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
