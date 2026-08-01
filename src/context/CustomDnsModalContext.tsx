import type React from "react";
import { createContext, useContext, useState } from "react";
import type { ServerStore } from "../types";

interface CustomDnsModalContextType {
  openAddCustom: () => void;
  openEditCustom: (server: ServerStore) => void;
  closeCustom: () => void;
  isOpen: boolean;
  editingServer: ServerStore | null;
}

const CustomDnsModalContext = createContext<CustomDnsModalContextType | undefined>(undefined);

export const CustomDnsModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerStore | null>(null);

  const openAddCustom = () => {
    setEditingServer(null);
    setIsOpen(true);
  };

  const openEditCustom = (server: ServerStore) => {
    setEditingServer(server);
    setIsOpen(true);
  };

  const closeCustom = () => {
    setIsOpen(false);
  };

  return (
    <CustomDnsModalContext.Provider value={{ openAddCustom, openEditCustom, closeCustom, isOpen, editingServer }}>
      {children}
    </CustomDnsModalContext.Provider>
  );
};

export const useCustomDnsModal = () => {
  const context = useContext(CustomDnsModalContext);
  if (!context) {
    throw new Error("useCustomDnsModal must be used within CustomDnsModalProvider");
  }
  return context;
};
