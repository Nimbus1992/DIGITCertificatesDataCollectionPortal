import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

type Props = {
  label: string;
  value: React.ReactNode;
  delta?: { value: number; suffix?: string; positiveIsGood?: boolean; note?: string };
  size?: "lg" | "md" | "sm";
  accent?: "primary" | "success" | "warning" | "danger" | "info" | "muted";
};

const accentMap = {
  primary: "border-t-primary",
  success: "border-t-success",
  warning: "border-t-warning",
  danger: "border-t-danger",
  info: "border-t-info",
  muted: "border-t-muted-foreground/30",
};

export function KpiCard({ label, value, delta, size = "md", accent = "primary" }: Props) {
  const positiveIsGood = delta?.positiveIsGood ?? true;
  const up = (delta?.value ?? 0) >= 0;
  const good = positiveIsGood ? up : !up;
  return (
    <Card className={cn("p-5 border-t-4", accentMap[accent])}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 font-bold tracking-tight",
          size === "lg" && "text-4xl",
          size === "md" && "text-2xl",
          size === "sm" && "text-xl",
        )}
      >
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
            good ? "text-success" : "text-danger",
          )}
        >
          {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(delta.value).toFixed(1)}
          {delta.suffix ?? "%"}
          {delta.note && (
            <span className="ml-1 font-normal text-muted-foreground">{delta.note}</span>
          )}
        </div>
      )}
    </Card>
  );
}
