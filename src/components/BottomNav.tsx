import type React from "react";
import { Home, ListFilter, Settings as SettingsIcon } from "lucide-react";
import { useI18n } from "../hooks/useI18n";

export type TabType = "home" | "explore" | "tools" | "settings";

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t, lng } = useI18n();

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: t("home"), icon: <Home className="w-5 h-5" /> },
    { key: "explore", label: t("explore"), icon: <ListFilter className="w-5 h-5" /> },
    { key: "settings", label: t("settings"), icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 flex items-center justify-around h-16 px-2 z-40"
      dir={lng === "fa" ? "rtl" : "ltr"}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center justify-center w-full py-1 transition-colors duration-200 ${
              isActive ? "text-primary font-bold" : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <div className={`p-1 rounded-xl ${isActive ? "bg-primary/10" : ""}`}>{tab.icon}</div>
            <span className="text-xs mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
