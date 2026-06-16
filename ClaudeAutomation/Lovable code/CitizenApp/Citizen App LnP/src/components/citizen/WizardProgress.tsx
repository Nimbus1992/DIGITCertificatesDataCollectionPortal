type Props = {
  total: number;
  current: number;
  stepLabel: string;
};

export function WizardProgress({ total, current, stepLabel }: Props) {
  return (
    <div className="bg-card px-4 pt-3 pb-3">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide">
        <span className="text-muted-foreground">Step {current + 1} of {total}</span>
        <span className="text-foreground">{stepLabel}</span>
      </div>
      <div className="mt-2 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }, (_, i) => {
          const cls = i < current ? "bg-brand-teal-deep" : i === current ? "bg-brand-teal" : "bg-progress-track";
          return <div key={i} className={`h-1.5 rounded-full ${cls}`} />;
        })}
      </div>
    </div>
  );
}