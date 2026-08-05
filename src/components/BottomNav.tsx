import type React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { MdOutlineExplore } from "react-icons/md";
import { TbSettings, TbSmartHome } from "react-icons/tb";
import { useI18n } from "../hooks/useI18n";

export const BottomNav: React.FC = () => {
  const { t, lng } = useI18n();
  const location = useLocation();

  const tabs = [
    { key: "home", path: "/", label: t("home"), icon: TbSmartHome },
    { key: "explore", path: "/explorer", label: t("explore"), icon: MdOutlineExplore },
    { key: "settings", path: "/settings", label: t("settings"), icon: TbSettings },
  ];

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-base-100/90 backdrop-blur-md border-t border-base-300/60 flex items-center justify-around h-16 px-4 z-40"
      dir={lng === "fa" ? "rtl" : "ltr"}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const IconComponent = tab.icon;
        return (
          <Link
            key={tab.key}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 active:scale-95 ${
              isActive ? "text-primary font-bold" : "text-base-content/50 hover:text-base-content/80"
            }`}
          >
            <div
              className={`px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                isActive ? "bg-primary/15 scale-105" : ""
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

