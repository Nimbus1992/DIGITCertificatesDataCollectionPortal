import React, { useState } from "react";
import { ArrowLeft, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/contexts/OnboardingContext";
import HelperText from "./HelperText";
import { onboardingGuidance } from "@/data/onboardingGuidance";
import { serviceTemplates, categoryLabels, type ServiceTemplate } from "@/data/serviceTemplates";

const TemplateSelection: React.FC<{ onComplete: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { state, updateState } = useOnboarding();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const guidance = onboardingGuidance.templateSelection;

  const categories = ["all", ...Object.keys(categoryLabels)];
  const filtered = serviceTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: ServiceTemplate) => {
    updateState({
      selectedTemplateId: template.id,
      serviceName: template.name,
    });
    setTimeout(onComplete, 300);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Which service would you like to launch first?
          </h2>
          <HelperText text={guidance.helperText} reassurance={guidance.reassurance} className="justify-center" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                  ${selectedCategory === cat
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                {cat === "all" ? "All" : categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
          {filtered.map((template) => {
            const Icon = template.icon;
            const isSelected = state.selectedTemplateId === template.id;
            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-md group
                  ${isSelected
                    ? "border-accent bg-accent/5 shadow-md"
                    : "border-border bg-card hover:border-accent/40"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                    ${isSelected ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground group-hover:text-accent group-hover:bg-accent/10"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{template.name}</h3>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {template.estimatedSetupTime}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((f) => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-start pt-4">
          <Button variant="ghost" onClick={onBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;
