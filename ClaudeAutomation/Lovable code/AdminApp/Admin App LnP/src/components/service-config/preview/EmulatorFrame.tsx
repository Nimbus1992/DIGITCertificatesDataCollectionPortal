import React from "react";
import { Smartphone, Monitor } from "lucide-react";

/** Mobile (citizen) and desktop (employee) chrome used by in-editor emulators. */
export const EmulatorFrame: React.FC<{
  device: "mobile" | "desktop";
  label?: string;
  children: React.ReactNode;
}> = ({ device, label, children }) => {
  if (device === "mobile") {
    return (
      <div className="flex flex-col items-center gap-2">
        {label && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Smartphone className="h-3 w-3" /> {label}
          </div>
        )}
        <div className="relative w-[280px] h-[560px] bg-[#1a1a1a] rounded-[2rem] p-2 shadow-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1a1a1a] rounded-b-xl z-10" />
          <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden flex flex-col">
            {children}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {label && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Monitor className="h-3 w-3" /> {label}
        </div>
      )}
      <div className="w-full max-w-[520px] bg-card rounded-lg shadow-xl overflow-hidden border">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b">
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-background rounded px-2 py-0.5 text-[10px] text-muted-foreground">
            employee.console
          </div>
        </div>
        <div className="bg-white">{children}</div>
      </div>
    </div>
  );
};

export default EmulatorFrame;
