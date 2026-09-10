import type React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Compass, Settings } from "lucide-react";

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const items = [
    {
      to: "/",
      label: "Home",
      icon: Home,
    },
    {
      to: "/explorer",
      label: "DNS",
      icon: Compass,
    },
    {
      to: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="shrink-0 border-t border-white/10 bg-[#070908]/95 backdrop-blur-xl px-3 py-2">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex min-w-[82px] flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-all ${
                active
                  ? "bg-[#39ff88]/10 text-[#39ff88]"
                  : "text-white/45 hover:text-white/80"
              }`}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.5 : 2}
              />

              <span className="text-[11px] font-medium">
                {item.label}
              </span>

              {active && (
                <span className="h-1 w-1 rounded-full bg-[#39ff88]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
