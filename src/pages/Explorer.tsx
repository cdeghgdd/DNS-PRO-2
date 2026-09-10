import type React from "react";
import { DnsListFeature } from "../features/dns-list/DnsListFeature";
import { useCustomDnsModal } from "../context/CustomDnsModalContext";

export const ExplorerPage: React.FC = () => {
  const { openAddCustom, openEditCustom } = useCustomDnsModal();
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DnsListFeature
        onOpenAddCustom={openAddCustom}
        onOpenEditCustom={openEditCustom}
      />
    </div>
  );
};

