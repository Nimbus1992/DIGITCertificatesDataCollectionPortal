import { cn } from "@/lib/utils";
import logoUrl from "@/assets/cape-town-logo.png";

type Props = {
  variant?: "compact" | "full";
  className?: string;
};

/**
 * City of Cape Town shield crest. Uses the official-style PNG mark
 * with transparent background so it sits cleanly on dark or light surfaces.
 */
export function CapeTownLogo({ variant = "compact", className }: Props) {
  const mark = (
    <img
      src={logoUrl}
      alt="City of Cape Town"
      className={cn("h-8 w-auto shrink-0 object-contain", variant === "compact" && className)}
      draggable={false}
    />
  );

  if (variant === "compact") return mark;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logoUrl}
        alt="City of Cape Town"
        className="h-10 w-auto shrink-0 object-contain"
        draggable={false}
      />
      <div className="leading-tight">
        <div className="text-[10px] font-semibold tracking-[0.18em] uppercase opacity-80">
          City of
        </div>
        <div className="text-lg font-bold tracking-tight">Cape Town</div>
      </div>
    </div>
  );
}
