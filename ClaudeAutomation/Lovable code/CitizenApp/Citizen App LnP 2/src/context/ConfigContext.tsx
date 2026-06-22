import { createContext, useContext, useMemo, type ReactNode } from "react";
import { SERVICES, getService } from "@/config/services";
import type { ServiceConfig } from "@/config/types";

type ConfigContextValue = {
  services: ServiceConfig[];
  getService: (id: string) => ServiceConfig | undefined;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ConfigContextValue>(
    () => ({ services: SERVICES, getService }),
    []
  );
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}