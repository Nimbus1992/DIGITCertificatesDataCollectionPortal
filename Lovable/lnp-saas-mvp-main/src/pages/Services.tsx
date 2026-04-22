import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, ArrowRight, LayoutGrid, List, X } from "lucide-react";
import {
  serviceTemplates,
  categoryLabels,
  categoryColors,
  departmentColors,
  allDepartments,
} from "@/data/serviceTemplates";

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetOnboarding, updateState } = useOnboarding();
  const [search, setSearch] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const categories = ["all", ...Array.from(new Set(serviceTemplates.map((t) => t.category)))];

  const filtered = serviceTemplates.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.departments.some((d) => d.toLowerCase().includes(search.toLowerCase()));
    const matchCat = selectedCategory === "all" || t.category === selectedCategory;
    const matchDept =
      selectedDepts.length === 0 ||
      selectedDepts.every((d) => t.departments.includes(d));
    return matchSearch && matchCat && matchDept;
  });

  const toggleDept = (dept: string) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedDepts([]);
    setSelectedCategory("all");
  };

  const hasFilters = search || selectedDepts.length > 0 || selectedCategory !== "all";

  const handleUseTemplate = (templateId: string) => {
    resetOnboarding();
    updateState({ selectedTemplateId: templateId, currentStep: 4 });
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse available templates and add them to your organization
          </p>
        </div>

        {/* Search + view toggle */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search templates by name, description or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 transition-colors ${view === "grid" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 transition-colors ${view === "list" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs border capitalize transition-colors ${
                selectedCategory === cat
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background border-border text-foreground hover:border-accent"
              }`}
            >
              {cat === "all" ? "All Categories" : categoryLabels[cat]}
              {cat !== "all" && (
                <span className="ml-1.5 opacity-60">
                  {serviceTemplates.filter((t) => t.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Department filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Filter by Department
            </p>
            {selectedDepts.length > 0 && (
              <button
                onClick={() => setSelectedDepts([])}
                className="text-xs text-accent hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allDepartments.map((dept) => {
              const active = selectedDepts.includes(dept);
              const color = departmentColors[dept] ?? "bg-muted text-muted-foreground";
              return (
                <button
                  key={dept}
                  onClick={() => toggleDept(dept)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    active
                      ? `${color} border-transparent font-medium ring-2 ring-offset-1 ring-accent/40`
                      : "bg-background border-border text-foreground hover:border-accent"
                  }`}
                >
                  {dept}
                  {active && <X className="inline h-2.5 w-2.5 ml-1 -mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active filter summary + clear */}
        {hasFilters && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{filtered.length}</strong> of{" "}
              {serviceTemplates.length} templates
            </span>
            <button onClick={clearFilters} className="text-xs text-accent hover:underline gap-1 flex items-center">
              <X className="h-3 w-3" /> Clear all filters
            </button>
          </div>
        )}

        {/* Grid view */}
        {view === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((template) => (
              <Card
                key={template.id}
                className="group hover:shadow-md transition-all cursor-pointer flex flex-col"
                onClick={() => handleUseTemplate(template.id)}
              >
                <CardContent className="p-5 flex flex-col flex-1 space-y-4">
                  {/* Icon + category */}
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <template.icon className="h-5 w-5 text-accent" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-2 py-0.5 border-0 ${categoryColors[template.category]}`}
                    >
                      {categoryLabels[template.category]}
                    </Badge>
                  </div>

                  {/* Name + description */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Department tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {template.departments.map((dept) => (
                      <span
                        key={dept}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          departmentColors[dept] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {dept}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((f) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {f}
                      </span>
                    ))}
                    {template.features.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        +{template.features.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>~{template.estimatedSetupTime} setup</span>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-accent text-accent-foreground hover:bg-accent/90 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); handleUseTemplate(template.id); }}
                    >
                      Use Template <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="space-y-2">
            {filtered.map((template) => (
              <Card
                key={template.id}
                className="group hover:shadow-sm transition-all cursor-pointer"
                onClick={() => handleUseTemplate(template.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <template.icon className="h-5 w-5 text-accent" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground">{template.name}</p>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-2 py-0 border-0 ${categoryColors[template.category]}`}
                      >
                        {categoryLabels[template.category]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {template.departments.map((dept) => (
                        <span
                          key={dept}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            departmentColors[dept] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1 hidden md:block">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Clock className="h-3 w-3" />
                      <span>~{template.estimatedSetupTime}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{template.features.length} features</p>
                  </div>

                  <Button
                    size="sm"
                    className="h-8 text-xs bg-accent text-accent-foreground hover:bg-accent/90 gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); handleUseTemplate(template.id); }}
                  >
                    Use <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No templates match your filters</p>
            <p className="text-xs mt-1">Try adjusting your search or department selection</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServicesPage;
