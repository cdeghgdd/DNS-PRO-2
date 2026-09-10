import type React from "react";
import { Moon, Sun } from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";
import { useI18n } from "../hooks/useI18n";

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useSettingsStore();
  const { t } = useI18n();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <header className="shrink-0 border-b border-white/10 bg-[#070908]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#39ff88]/30 bg-[#39ff88]/10">
            <img
              src="/dns_pro_logo.png"
              alt="DNS PRO 2"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="text-sm font-bold tracking-wide text-white">
              DNS PRO <span className="text-[#39ff88]">2</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Secure DNS
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/65 transition hover:border-[#39ff88]/40 hover:text-[#39ff88]"
          aria-label={t("theme")}
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
};
