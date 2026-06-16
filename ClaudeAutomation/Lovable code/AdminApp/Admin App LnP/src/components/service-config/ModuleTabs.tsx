import React from "react";
import { cn } from "@/lib/utils";

interface ModuleTabsProps {
  modules: string[];
  active: string;
  onChange: (m: string) => void;
}

const ModuleTabs: React.FC<ModuleTabsProps> = ({ modules, active, onChange }) => {
  if (modules.length <= 1) return null;
  return (
    <div className="flex items-center gap-0 border-b bg-card px-5 overflow-x-auto shrink-0">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground mr-3">
        Module
      </span>
      {modules.map((m) => {
        const isActive = m === active;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
};

export default ModuleTabs;