import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings, Rocket, Plus, Building2, Clock, CheckCircle2,
  MoreVertical, Eye, Copy, Trash2, Loader2, Users, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { serviceTemplates } from "@/data/serviceTemplates";

type DbService = Tables<"services">;
type ServiceStatus = "draft" | "published" | "live";

const STATUS_CONFIG: Record<ServiceStatus, { label: string; className: string; icon: React.FC<{ className?: string }> }> = {
  draft:     { label: "Draft",     className: "bg-muted text-muted-foreground border-border",  icon: Clock },
  published: { label: "Published", className: "bg-blue-100 text-blue-700 border-blue-200",     icon: CheckCircle2 },
  live:      { label: "Live",      className: "bg-green-100 text-green-700 border-green-200",  icon: Rocket },
};

function configCompletion(status: string): number {
  if (status === "live")      return 100;
  if (status === "published") return 80;
  return 30;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { state, startAddService } = useOnboarding();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState<string>("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [services, setServices] = useState<DbService[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (orgErr) {
        if (!cancelled) { setError(orgErr.message); setLoading(false); }
        return;
      }
      if (!org) { if (!cancelled) setLoading(false); return; }

      if (!cancelled) { setOrgName(org.name); setOrgId(org.id); }

      const [svcsResult, membersResult] = await Promise.all([
        supabase.from("services").select("*").eq("organization_id", org.id).order("created_at", { ascending: true }),
        supabase.from("team_members").select("id", { count: "exact", head: true }).eq("organization_id", org.id),
      ]);

      if (!cancelled) {
        if (svcsResult.error) setError(svcsResult.error.message);
        else setServices(svcsResult.data ?? []);
        setUserCount(membersResult.count ?? 0);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const liveCount = services.filter((s) => s.status === "live").length;

  const handleAddService = () => {
    startAddService();
    navigate("/onboarding");
  };

  const goToConfigure = (svc: DbService) =>
    navigate(`/service/${svc.id}/configure`, {
      state: { status: svc.status, name: svc.name },
    });

  const displayOrgName = orgName || state.orgName || "Your organization";

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {displayOrgName} · Overview
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
            Failed to load services: {error}
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Services", value: services.length, icon: Building2, color: "text-accent" },
            { label: "Total Live",     value: liveCount,        icon: Rocket,    color: "text-green-600" },
            { label: "Total Users",    value: userCount,        icon: Users,     color: "text-blue-600" },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services grid */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">Your Services</h2>

          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading services…</span>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => {
                const tpl = serviceTemplates.find((t) => t.id === svc.template_id);
                const status = (svc.status ?? "draft") as ServiceStatus;
                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
                const SIcon = cfg.icon;
                const completion = configCompletion(status);

                return (
                  <Card
                    key={svc.id}
                    className="group hover:shadow-md transition-all cursor-pointer"
                    onClick={() => goToConfigure(svc)}
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          {tpl ? <tpl.icon className="h-5 w-5 text-accent" /> : <Building2 className="h-5 w-5 text-accent" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] px-2 py-0.5 gap-1 flex items-center border ${cfg.className}`}>
                            <SIcon className="h-2.5 w-2.5" />
                            {cfg.label}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); goToConfigure(svc); }}>
                                <Settings className="h-4 w-4 mr-2" /> Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate("/go-live"); }}>
                                <Rocket className="h-4 w-4 mr-2" /> Go Live
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Eye className="h-4 w-4 mr-2" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-foreground">{svc.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tpl?.name ?? svc.template_id}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Configuration</span>
                          <span className="text-xs font-medium text-foreground">{completion}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span>0 applications</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t">
                        <span className="text-[10px] text-muted-foreground">
                          Updated {formatDate(svc.updated_at)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs gap-1 group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors"
                          onClick={(e) => { e.stopPropagation(); goToConfigure(svc); }}
                        >
                          <Settings className="h-3 w-3" /> Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add new service — single dashed card */}
              <Card
                className="border-dashed hover:border-accent hover:shadow-md transition-all cursor-pointer group"
                onClick={handleAddService}
              >
                <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[220px] gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl border-2 border-dashed border-border group-hover:border-accent flex items-center justify-center transition-colors">
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Add New Service</p>
                    <p className="text-xs text-muted-foreground mt-1">Set up another template for your organisation</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
