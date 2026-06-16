import React from "react";
import { Info } from "lucide-react";

interface HelperTextProps {
  text: string;
  reassurance?: string;
}

const HelperText: React.FC<HelperTextProps> = ({ text, reassurance }) => (
  <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 flex gap-3">
    <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
    <div className="space-y-1">
      <p className="text-xs text-foreground leading-relaxed">{text}</p>
      {reassurance && (
        <p className="text-xs text-muted-foreground leading-relaxed">{reassurance}</p>
      )}
    </div>
  </div>
);

export default HelperText;
