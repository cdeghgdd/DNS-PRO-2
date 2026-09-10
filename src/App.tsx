import type React from "react";
import { useEffect } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";

import { BottomNav } from "./components/BottomNav";
import { CustomDnsFeature } from "./features/custom-dns/CustomDnsFeature";
import {
  CustomDnsModalProvider,
  useCustomDnsModal,
} from "./context/CustomDnsModalContext";

import { HomePage } from "./pages/Home";
import { ExplorerPage } from "./pages/Explorer";
import { SettingsPage } from "./pages/Settings";
import { useSettingsStore } from "./store/useSettingsStore";

const ModalWrapper: React.FC = () => {
  const { isOpen, closeCustom, editingServer } = useCustomDnsModal();

  return (
    <CustomDnsFeature
      isOpen={isOpen}
      onClose={closeCustom}
      editingServer={editingServer}
    />
  );
};

const RootLayout: React.FC = () => {
  const { theme, lng } = useSettingsStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <CustomDnsModalProvider>
      <div
        dir={lng === "fa" ? "rtl" : "ltr"}
        className="relative mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden bg-[#050706] font-sans text-white select-none"
      >
        {/* Subtle green glow */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-[#39ff88]/5 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#39ff88]/5 blur-3xl" />

        <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>

        <ModalWrapper />

        <div className="relative z-20">
          <BottomNav />
        </div>
      </div>
    </CustomDnsModalProvider>
  );
};

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const explorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explorer",
  component: ExplorerPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  explorerRoute,
  settingsRoute,
]);

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
