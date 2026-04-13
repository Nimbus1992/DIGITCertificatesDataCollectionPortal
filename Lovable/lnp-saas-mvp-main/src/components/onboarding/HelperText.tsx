import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HelperTextProps {
  text: string;
  reassurance?: string;
  tooltip?: string;
  className?: string;
}

const HelperText: React.FC<HelperTextProps> = ({ text, reassurance, tooltip, className = "" }) => {
  return (
    <div className={`animate-fade-in mt-2 space-y-1 ${className}`}>
      <p className="text-sm text-muted-foreground flex items-start gap-1.5">
        {text}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[240px] text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </p>
      {reassurance && (
        <p className="text-xs text-muted-foreground/70 italic">{reassurance}</p>
      )}
    </div>
  );
};

export default HelperText;
