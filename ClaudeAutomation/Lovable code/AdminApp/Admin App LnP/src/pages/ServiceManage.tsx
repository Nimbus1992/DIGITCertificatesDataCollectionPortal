import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Copy, ExternalLink, Eye, Users, Languages, Globe, Monitor } from "lucide-react";
import { toast } from "sonner";
import { AuditProvider } from "@/components/audit/AuditContext";
import { AuditFilterBar } from "@/components/audit/AuditFilterBar";
import { ConfigActivityTab } from "@/components/audit/ConfigActivityTab";
import { DeploymentsTab } from "@/components/audit/DeploymentsTab";
import { RuntimeActivityTab } from "@/components/audit/RuntimeActivityTab";
import { deployments } from "@/data/auditLogs";
import { DeploymentStatusBadge, EnvBadge, RelativeTime } from "@/components/audit/shared";

const ServiceManage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useOnboarding();

  const service = state.services.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    );
  }

  const serviceSlug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const citizenUrl = `https://${serviceSlug}.citizen.lovable.app`;
  const employeeUrl = `https://${serviceSlug}.employee.lovable.app`;

  const handleCopy = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${label} URL copied to clipboard`);
  };

  // Find scoped audit logs: try slug match, otherwise fall back to first known service slug
  const knownSlugs = Array.from(new Set(deployments.map((d) => d.serviceId)));
  const scopeId = knownSlugs.includes(serviceSlug) ? serviceSlug : knownSlugs[0];
  const serviceVersions = deployments.filter((d) => d.serviceId === scopeId);

  return (
    <div className="bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">{service.name}</h1>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Manage your live application</p>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="h-auto bg-transparent border-b border-border w-full justify-start rounded-none p-0 gap-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground">Activity Logs</TabsTrigger>
            <TabsTrigger value="deployments" className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground">Deployments</TabsTrigger>
            <TabsTrigger value="versions" className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground">Versions</TabsTrigger>
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground">Service Users</TabsTrigger>
          </TabsList>


          <TabsContent value="overview" className="mt-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Application Links</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4 text-accent" /> Citizen App
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px]">Public</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">For citizens to apply, track, and manage their applications.</p>
                    <div className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-2">
                      <span className="text-xs text-foreground truncate flex-1 font-mono">{citizenUrl}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(citizenUrl, "Citizen App")}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => window.open(citizenUrl, "_blank")}>
                      <ExternalLink className="h-3.5 w-3.5" /> Open Citizen App
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-accent" /> Employee App
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px]">Internal</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">For employees to review, approve, and manage applications.</p>
                    <div className="flex items-center gap-1.5 bg-muted rounded-md px-3 py-2">
                      <span className="text-xs text-foreground truncate flex-1 font-mono">{employeeUrl}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(employeeUrl, "Employee App")}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => window.open(employeeUrl, "_blank")}>
                      <ExternalLink className="h-3.5 w-3.5" /> Open Employee App
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Go Live Setup</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/setup/users")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Manage Users</p>
                      <p className="text-xs text-muted-foreground">Add or remove team members and roles</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/config/languages")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Languages className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Localization</p>
                      <p className="text-xs text-muted-foreground">Add languages and manage translations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Preview</h2>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/service/${id}/preview`)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Application Preview</p>
                    <p className="text-xs text-muted-foreground">Preview citizen and employee experiences</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <AuditProvider serviceScopeId={scopeId}>
              <AuditFilterBar scoped />
              <div className="mt-4 space-y-6">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Configuration changes
                  </h3>
                  <ConfigActivityTab />
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Runtime application events
                  </h3>
                  <RuntimeActivityTab />
                </section>
              </div>
            </AuditProvider>
          </TabsContent>

          <TabsContent value="deployments" className="mt-6">
            <AuditProvider serviceScopeId={scopeId}>
              <AuditFilterBar scoped />
              <div className="mt-4">
                <DeploymentsTab />
              </div>
            </AuditProvider>
          </TabsContent>

          <TabsContent value="versions" className="mt-6">
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 text-xs">Version</TableHead>
                    <TableHead className="h-9 text-xs">Published</TableHead>
                    <TableHead className="h-9 text-xs">By</TableHead>
                    <TableHead className="h-9 text-xs">Environment</TableHead>
                    <TableHead className="h-9 text-xs">Status</TableHead>
                    <TableHead className="h-9 text-xs">Changed modules</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceVersions.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="py-2 font-mono text-sm">{v.version}</TableCell>
                      <TableCell className="py-2"><RelativeTime ts={v.timestamp} /></TableCell>
                      <TableCell className="py-2 text-sm">{v.publishedBy}</TableCell>
                      <TableCell className="py-2"><EnvBadge env={v.environment} /></TableCell>
                      <TableCell className="py-2"><DeploymentStatusBadge status={v.status} /></TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{v.changedModules.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                  {serviceVersions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        No versions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-1">Service Users</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Team members assigned to this service. Manage roles from workspace-level Users & Access.
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate("/setup/users")} className="gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Open Users & Access
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ServiceManage;
