import React from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, ExternalLink, LayoutDashboard, PartyPopper, Users, UserCheck } from "lucide-react";

const GoLiveSuccess: React.FC = () => {
  const { state } = useOnboarding();
  const navigate = useNavigate();

  const serviceSlug = state.serviceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const citizenUrl = `https://${serviceSlug}.citizen.lovable.app`;
  const employeeUrl = `https://${serviceSlug}.employee.lovable.app`;

  const handleCopy = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${label} URL copied to clipboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-lg w-full animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="h-10 w-10 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            🎉 Your service is now live!
          </h2>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{state.serviceName}</span>{" "}
            is live and ready to receive applications.
          </p>
        </div>

        {/* URL Cards */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Citizen App */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Citizen App</span>
                <Badge variant="secondary" className="ml-auto text-xs">Public</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                For citizens to register, log in, and submit applications.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-md px-3 py-2 text-xs text-muted-foreground font-mono truncate">
                  {citizenUrl}
                </div>
                <Button size="icon" variant="outline" className="shrink-0" onClick={() => handleCopy(citizenUrl, "Citizen App")}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="shrink-0" onClick={() => window.open(citizenUrl, "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Employee App */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Employee App</span>
                <Badge variant="secondary" className="ml-auto text-xs">Internal</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                For employees to log in, review, and process applications.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-md px-3 py-2 text-xs text-muted-foreground font-mono truncate">
                  {employeeUrl}
                </div>
                <Button size="icon" variant="outline" className="shrink-0" onClick={() => handleCopy(employeeUrl, "Employee App")}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="shrink-0" onClick={() => window.open(employeeUrl, "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          className="w-full gap-2 h-11"
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default GoLiveSuccess;
