import type React from "react";
import { DnsListFeature } from "../features/dns-list/DnsListFeature";
import { useCustomDnsModal } from "../context/CustomDnsModalContext";

export const ExplorerPage: React.FC = () => {
  const { openAddCustom, openEditCustom } = useCustomDnsModal();
  return (
    <DnsListFeature
      onOpenAddCustom={openAddCustom}
      onOpenEditCustom={openEditCustom}
    />
  );
};
