import type React from "react";
import { ConnectionFeature } from "../features/connection/ConnectionFeature";

export const HomePage: React.FC = () => {
  return (
    <div className="p-4 space-y-4 pb-24">
      <ConnectionFeature />
    </div>
  );
};
