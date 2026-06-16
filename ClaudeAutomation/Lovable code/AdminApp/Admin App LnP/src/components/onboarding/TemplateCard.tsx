import React from "react";
import { Card } from "@/components/ui/card";
import type { ServiceTemplate } from "@/data/serviceTemplates";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: ServiceTemplate;
  onViewDetails?: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onViewDetails }) => {
  const Icon = template.icon;
  const disabled = !!template.comingSoon;

  return (
    <Card
      onClick={onViewDetails}
      className={cn(
        "relative h-56 cursor-pointer overflow-hidden transition-all duration-200 group",
        "hover:shadow-lg hover:border-accent/60",
        disabled && "opacity-75",
      )}
    >
      {/* Coming soon — always on top */}
      {disabled && (
        <span className="absolute top-3 right-3 z-10 text-[10px] uppercase tracking-wide bg-muted text-muted-foreground group-hover:bg-white/20 group-hover:text-white/80 px-1.5 py-0.5 rounded transition-colors duration-200">
          Coming soon
        </span>
      )}

      {/* DEFAULT layer: icon + name + also-called */}
      <div className="absolute inset-0 p-5 flex flex-col opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-none">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0 mb-3">
          <Icon className="h-7 w-7 text-accent" />
        </div>
        <h3 className="text-base font-semibold text-foreground leading-snug mb-2 pr-16">
          {template.name}
        </h3>
        {template.aka && template.aka.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">Also called:</span>
            {template.aka.map((a) => (
              <span
                key={a}
                className="text-[11px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground whitespace-nowrap"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* HOVER layer: accent background + name + description */}
      <div className="absolute inset-0 p-5 flex flex-col bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
        <h3 className="text-base font-semibold text-white leading-snug mb-3 pr-16">
          {template.name}
        </h3>
        <p className="text-sm text-white/90 leading-relaxed">
          {template.description}
        </p>
      </div>
    </Card>
  );
};

export default TemplateCard;
