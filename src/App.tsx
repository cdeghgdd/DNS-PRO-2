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
        className="h-screen w-full max-w-md mx-auto bg-base-200 text-base-content flex flex-col font-sans overflow-hidden relative select-none"
        dir={lng === "fa" ? "rtl" : "ltr"}
      >
        <main className="flex-1 overflow-hidden relative flex flex-col pb-20">
          <Outlet />
        </main>

        <ModalWrapper />

        <BottomNav />
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

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
