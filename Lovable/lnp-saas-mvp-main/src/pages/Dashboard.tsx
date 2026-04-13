import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, Rocket, Plus, FileText, Users, BarChart3 } from "lucide-react";
import { serviceTemplates } from "@/data/serviceTemplates";

const Dashboard: React.FC = () => {
  const { state, resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const template = serviceTemplates.find((t) => t.id === state.selectedTemplateId);

  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-warning/15 text-warning border-warning/30" },
    published: { label: "Published", className: "bg-accent/15 text-accent border-accent/30" },
    live: { label: "Live", className: "bg-success/15 text-success border-success/30" },
  };

  const currentStatus = statusConfig[state.serviceStatus] || statusConfig.draft;

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Button variant="outline" size="sm" onClick={() => {
            resetOnboarding();
            navigate("/onboarding");
          }}>
            <Plus className="h-4 w-4 mr-1" /> New Service
          </Button>
        </div>
        {/* Success Banner */}
        {state.isOnboardingComplete && !state.isLive && (
          <div className="animate-slide-up mb-6 p-4 rounded-xl border border-accent/20 bg-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">🎉 Your service is ready!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {state.isPublished
                    ? "Your service is published. Continue to go live."
                    : "Configure your service and publish it when ready."}
                </p>
              </div>
              <Button
                onClick={() => state.isPublished ? navigate("/go-live") : navigate(`/service/${state.selectedTemplateId}/configure`)}
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
              >
                {state.isPublished ? (
                  <><Rocket className="h-4 w-4" /> Go Live</>
                ) : (
                  <><Settings className="h-4 w-4" /> Configure</>
                )}
              </Button>
            </div>
          </div>
        )}

        {state.isLive && (
          <div className="animate-slide-up mb-6 p-4 rounded-xl border border-success/20 bg-success/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <h3 className="font-semibold text-foreground">Your service is live!</h3>
            </div>
          </div>
        )}

        {/* Service Card */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-start gap-3">
                {template && <template.icon className="h-8 w-8 text-accent mt-0.5" />}
                <div>
                  <CardTitle className="text-lg">{state.serviceName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template?.description || "Custom service"}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={currentStatus.className}>
                {currentStatus.label}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {template?.features.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {f}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate(`/service/${state.selectedTemplateId}/configure`)}>
                  <Settings className="h-3.5 w-3.5 mr-1" /> Configure
                </Button>
                {state.isPublished && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/go-live")}>
                    <Rocket className="h-3.5 w-3.5 mr-1" /> Go Live Setup
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/service/${state.selectedTemplateId}/configure`)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Forms & Fields</p>
                  <p className="text-xs text-muted-foreground">Customize your forms</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/go-live")}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Team Members</p>
                  <p className="text-xs text-muted-foreground">Invite your team</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Analytics</p>
                  <p className="text-xs text-muted-foreground">Track performance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
