import type React from "react";
import { ConnectionFeature } from "../features/connection/ConnectionFeature";

export const HomePage: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-8">
      <ConnectionFeature />
    </div>
  );
};
