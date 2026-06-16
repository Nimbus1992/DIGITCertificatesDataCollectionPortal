import React from "react";
import { Button } from "@/components/ui/button";
import { Undo2, Smartphone, Tablet, Monitor, HelpCircle } from "lucide-react";
import { usePreview, type DeviceMode } from "./PreviewContext";

interface PreviewTopBarProps {
  onExit: () => void;
}

const devices: { mode: DeviceMode; icon: React.ElementType }[] = [
  { mode: "mobile", icon: Smartphone },
  { mode: "tablet", icon: Tablet },
  { mode: "desktop", icon: Monitor },
];

const PreviewTopBar: React.FC<PreviewTopBarProps> = ({ onExit }) => {
  const { deviceMode, setDeviceMode } = usePreview();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-b">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExit} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
          <Undo2 className="h-4 w-4" /> Exit Preview
        </Button>
      </div>

      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
        {devices.map(({ mode, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setDeviceMode(mode)}
            className={`p-2 rounded-md transition-colors ${
              deviceMode === mode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 text-muted-foreground">
        <span className="text-sm">Help</span>
        <HelpCircle className="h-4 w-4" />
      </div>
    </div>
  );
};

export default PreviewTopBar;
