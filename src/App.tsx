import type React from "react";
import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { BottomNav, type TabType } from "./components/BottomNav";
import { ConnectionFeature } from "./features/connection/ConnectionFeature";
import { DnsListFeature } from "./features/dns-list/DnsListFeature";
import { CustomDnsFeature } from "./features/custom-dns/CustomDnsFeature";
import { SettingsFeature } from "./features/settings/SettingsFeature";
import { LogsFeature } from "./features/logs/LogsFeature";
import { ImportExportFeature } from "./features/import-export/ImportExportFeature";
import { useSettingsStore } from "./store/useSettingsStore";
import type { ServerStore } from "./types";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerStore | null>(null);

  const { theme, lng } = useSettingsStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleOpenAddCustom = () => {
    setEditingServer(null);
    setIsCustomModalOpen(true);
  };

  const handleOpenEditCustom = (server: ServerStore) => {
    setEditingServer(server);
    setIsCustomModalOpen(true);
  };

  return (
    <div
      className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans"
      dir={lng === "fa" ? "rtl" : "ltr"}
    >
      <Navbar />

      <main className="flex-1 overflow-y-auto">
        {activeTab === "home" && (
          <div className="p-4 space-y-4 pb-24">
            <ConnectionFeature />
          </div>
        )}

        {activeTab === "explore" && (
          <DnsListFeature
            onOpenAddCustom={handleOpenAddCustom}
            onOpenEditCustom={handleOpenEditCustom}
          />
        )}

        {activeTab === "tools" && (
          <div className="p-4 space-y-4 pb-24 max-w-md mx-auto">
            <LogsFeature />
            <ImportExportFeature />
          </div>
        )}

        {activeTab === "settings" && <SettingsFeature />}
      </main>

      <CustomDnsFeature
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        editingServer={editingServer}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
