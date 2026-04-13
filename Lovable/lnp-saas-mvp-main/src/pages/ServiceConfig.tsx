import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, Rocket, Check, Info } from "lucide-react";
import { defaultModules, configTiles } from "@/data/serviceModules";
import RolesDesigner from "@/components/service-config/RolesDesigner";
import NotificationsManager from "@/components/service-config/NotificationsManager";
import ChecklistBuilder from "@/components/service-config/ChecklistBuilder";
import FormBuilder from "@/components/service-config/FormBuilder";
import DocumentDesigner from "@/components/service-config/DocumentDesigner";

type TileStatus = "not_started" | "in_progress" | "completed";

const statusConfig: Record<TileStatus, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

const ServiceConfig: React.FC = () => {
  const { state, updateState } = useOnboarding();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState(defaultModules[0].id);
  const [activeTile, setActiveTile] = useState<string | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [tileStatuses, setTileStatuses] = useState<Record<string, Record<string, TileStatus>>>(() => {
    const initial: Record<string, Record<string, TileStatus>> = {};
    defaultModules.forEach((m) => {
      initial[m.id] = {};
      configTiles.forEach((t) => {
        initial[m.id][t.id] = "not_started";
      });
    });
    return initial;
  });

  const currentModule = defaultModules.find((m) => m.id === selectedModule)!;
  const currentStatuses = tileStatuses[selectedModule] || {};
  const completedCount = Object.values(currentStatuses).filter((s) => s === "completed").length;
  const progressPercent = (completedCount / configTiles.length) * 100;

  const activeTileData = activeTile ? configTiles.find((t) => t.id === activeTile) : null;

  const handlePublish = () => {
    updateState({ isPublished: true, serviceStatus: "published" });
    setShowPublishConfirm(true);
  };

  // Publish confirmation screen
  if (showPublishConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Service Published!</h2>
          <p className="text-muted-foreground mb-1">
            <span className="font-medium text-foreground">{state.serviceName}</span> has been published successfully.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Your service is published but not live yet. Continue to Go Live setup to make it available.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/go-live")} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Rocket className="h-4 w-4" /> Continue to Go Live
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Specialized config screens
  if (activeTile === "forms") {
    return <FormBuilder moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  }
  if (activeTile === "roles") {
    return <RolesDesigner moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  }
  if (activeTile === "notifications") {
    return <NotificationsManager moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  }
  if (activeTile === "checklists") {
    return <ChecklistBuilder moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  }
  if (activeTile === "documents") {
    return <DocumentDesigner moduleName={currentModule.name} onBack={() => setActiveTile(null)} />;
  }

  // Generic tile placeholder detail view
  if (activeTileData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveTile(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">
                {currentModule.name} — {activeTileData.title}
              </h1>
              <p className="text-xs text-muted-foreground">Module configuration</p>
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <activeTileData.icon className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{activeTileData.title}</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              This is where you configure {activeTileData.title.toLowerCase()} for the{" "}
              <span className="font-medium text-foreground">{currentModule.name}</span> module.
            </p>
            <Button variant="outline" onClick={() => setActiveTile(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Module Configuration
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Main hub view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground text-lg">{state.serviceName || "Service Configuration"}</h1>
              <p className="text-xs text-muted-foreground">Configure modules and settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedModule} onValueChange={(v) => { setSelectedModule(v); setActiveTile(null); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {defaultModules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Eye className="h-4 w-4" /> Preview
            </Button>
            {!state.isPublished && (
              <Button onClick={handlePublish} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
                <Rocket className="h-4 w-4" /> Publish Service
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Guidance banner */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-foreground">
              You're configuring the <span className="font-semibold">{currentModule.name}</span> module. Switch modules using the dropdown above.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Each module has its own configuration. Complete these steps for each module before publishing.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {completedCount} of {configTiles.length} configured
          </span>
        </div>

        {/* Tile grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configTiles.map((tile) => {
            const status = currentStatuses[tile.id] || "not_started";
            const cfg = statusConfig[status];
            return (
              <Card
                key={tile.id}
                className="relative group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTile(tile.id)}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <tile.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tile.required && (
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" title="Required" />
                      )}
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${cfg.className}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{tile.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tile.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors"
                    onClick={(e) => { e.stopPropagation(); setActiveTile(tile.id); }}
                  >
                    {tile.ctaLabel}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ServiceConfig;
