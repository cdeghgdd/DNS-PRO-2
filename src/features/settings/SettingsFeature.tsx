import type React from "react";
import { Power, RefreshCw, Sun, Bell, ShieldCheck } from "lucide-react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useI18n } from "../../hooks/useI18n";
import { ImportExportFeature } from "../import-export/ImportExportFeature";
import { LogsFeature } from "../logs/LogsFeature";

export const SettingsFeature: React.FC = () => {
  const {
    autoStartOnBoot,
    setAutoStartOnBoot,
    autoReconnect,
    setAutoReconnect,
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useSettingsStore();

  const { t } = useI18n();

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-all ${
        checked
          ? "border-[#39ff88]/50 bg-[#39ff88]"
          : "border-white/10 bg-white/10"
      }`}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
          checked
            ? "left-[22px] bg-[#050706]"
            : "left-[3px] bg-white/50"
        }`}
      />
    </button>
  );

  const SettingRow = ({
    icon,
    title,
    description,
    checked,
    onChange,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#39ff88]/15 bg-[#39ff88]/5 text-[#39ff88]">
          {icon}
        </div>

        <div className="min-w-0">
          <span className="block text-sm font-bold text-white">
            {title}
          </span>
          <span className="mt-0.5 block text-[11px] leading-4 text-white/40">
            {description}
          </span>
        </div>
      </div>

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div className="mx-auto max-w-md space-y-4 overflow-y-auto px-4 pb-8 pt-5 no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#39ff88]/25 bg-[#39ff88]/10">
          <img
            src="/dns_pro_logo.png"
            alt="DNS PRO 2"
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {t("settings")}
          </h2>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#39ff88]/60">
            DNS PRO 2
          </p>
        </div>
      </div>

      {/* Connection settings */}
      <section className="rounded-2xl border border-white/10 bg-[#0a0d0b] p-4 shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#39ff88]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white/50">
            Connection
          </span>
        </div>

        <div className="space-y-4">
          <SettingRow
            icon={<Power size={18} />}
            title={t("autoStart")}
            description="Launch DNS service on device boot"
            checked={autoStartOnBoot}
            onChange={setAutoStartOnBoot}
          />

          <div className="h-px bg-white/5" />

          <SettingRow
            icon={<RefreshCw size={18} />}
            title={t("autoReconnect")}
            description="Reconnect automatically if network drops"
            checked={autoReconnect}
            onChange={setAutoReconnect}
          />

          <div className="h-px bg-white/5" />

          <SettingRow
            icon={<Bell size={18} />}
            title="Persistent Notification"
            description="Show ongoing notification status"
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-2xl border border-white/10 bg-[#0a0d0b] p-4 shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <Sun size={16} className="text-[#39ff88]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white/50">
            Appearance
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="block text-sm font-bold text-white">
              {t("theme")}
            </span>
            <span className="text-[11px] text-white/40">
              Choose your preferred interface theme
            </span>
          </div>

          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                theme === "light"
                  ? "bg-[#39ff88] text-[#050706]"
                  : "text-white/40"
              }`}
            >
              {t("light")}
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                theme === "dark"
                  ? "bg-[#39ff88] text-[#050706]"
                  : "text-white/40"
              }`}
            >
              {t("dark")}
            </button>
          </div>
        </div>
      </section>

      <LogsFeature />
      <ImportExportFeature />

      {/* Footer */}
      <div className="pt-4 text-center">
        <div className="text-xs font-bold text-white/30">
          DNS PRO 2
        </div>
        <div className="mt-1 text-[10px] text-white/15">
          Secure DNS • {t("version")}
        </div>
      </div>
    </div>
  );
};
