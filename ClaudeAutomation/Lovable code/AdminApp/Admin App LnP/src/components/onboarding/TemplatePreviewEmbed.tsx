import React, { useState } from "react";
import { Users, ZoomIn, ZoomOut } from "lucide-react";
import { ServiceConfigProvider } from "@/contexts/ServiceConfigContext";
import { PreviewProvider, usePreview, type PreviewRole } from "@/components/preview/PreviewContext";
import { PreviewContent } from "@/components/preview/ServicePreview";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ROLES: { label: string; role: PreviewRole; roleId: string; description: string }[] = [
  { label: "Citizen", role: "citizen", roleId: "citizen", description: "Apply for a license and track your application" },
  { label: "Doc Verifier", role: "documentVerifier", roleId: "document_verifier", description: "Review and verify submitted documents" },
  { label: "Field Inspector", role: "fieldInspector", roleId: "field_inspector", description: "Conduct field inspections and raise observations" },
  { label: "Approver", role: "approver", roleId: "approver", description: "Approve or reject applications and issue licenses" },
];

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.25;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM = 0.75;

const EmbedInner: React.FC = () => {
  const { role, setRole } = usePreview();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 10) / 10));
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 10) / 10));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full">
        {/* Role toggle */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium">View as:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {ROLES.map((r) => (
              <Tooltip key={r.role}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setRole(r.role, r.roleId)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                      role === r.role
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    {r.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[180px] text-center">
                  <p className="font-medium mb-0.5">{r.label}</p>
                  <p className="text-xs opacity-80">{r.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center justify-end gap-1.5 px-3 py-1.5 border-b bg-muted/10 shrink-0">
          <button
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <span className="text-[11px] text-muted-foreground w-9 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable preview */}
        <div className="flex-1 overflow-auto">
          <div style={{ zoom }}>
            <PreviewContent />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

interface Props {
  templateId: string;
  templateName: string;
}

export const TemplatePreviewEmbed: React.FC<Props> = ({ templateId, templateName }) => (
  <ServiceConfigProvider serviceId={templateId}>
    <PreviewProvider serviceName={templateName}>
      <EmbedInner />
    </PreviewProvider>
  </ServiceConfigProvider>
);
