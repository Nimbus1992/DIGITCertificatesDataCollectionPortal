import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  ArrowLeft, Puzzle, Search, CheckCircle2, Plus, Settings,
  Trash2, ExternalLink, Zap, FileText, CreditCard, BarChart3,
  MessageSquare, Info,
} from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: "document_verification" | "payment" | "integration" | "analytics" | "communication";
  provider: string;
  version: string;
  pricingModel: "free" | "per_use" | "monthly";
  pricePerUse?: number;
  monthlyPrice?: number;
  configSchema: { key: string; label: string; type: string; required?: boolean }[];
  isInstalled?: boolean;
  installedConfig?: Record<string, string>;
}

const CATEGORY_ICONS: Record<Plugin["category"], React.ReactNode> = {
  document_verification: <FileText className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  integration: <Zap className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  communication: <MessageSquare className="h-4 w-4" />,
};

const CATEGORY_LABELS: Record<Plugin["category"], string> = {
  document_verification: "Document Verification",
  payment: "Payment",
  integration: "Integration",
  analytics: "Analytics",
  communication: "Communication",
};

const CATEGORY_COLORS: Record<Plugin["category"], string> = {
  document_verification: "bg-blue-100 text-blue-700",
  payment: "bg-green-100 text-green-700",
  integration: "bg-purple-100 text-purple-700",
  analytics: "bg-orange-100 text-orange-700",
  communication: "bg-pink-100 text-pink-700",
};

const marketplacePlugins: Plugin[] = [
  {
    id: "ocr-verify",
    name: "OCR Document Verification",
    description: "Automatically verify uploaded ID cards, licenses, and permits using optical character recognition. Extracts and validates key fields.",
    category: "document_verification",
    provider: "LNP Built-in",
    version: "1.0.0",
    pricingModel: "per_use",
    pricePerUse: 0.05,
    configSchema: [
      { key: "confidence_threshold", label: "Confidence Threshold (0–1)", type: "number", required: true },
    ],
    isInstalled: false,
    installedConfig: {},
  },
  {
    id: "stripe",
    name: "Stripe Payment Gateway",
    description: "Accept online card payments for permit fees. Supports Visa, Mastercard, and Amex. Includes automatic receipt generation.",
    category: "payment",
    provider: "Stripe",
    version: "1.0.0",
    pricingModel: "free",
    configSchema: [
      { key: "publishable_key", label: "Publishable Key", type: "text", required: true },
      { key: "secret_key", label: "Secret Key", type: "password", required: true },
    ],
    isInstalled: true,
    installedConfig: { publishable_key: "pk_live_****" },
  },
  {
    id: "twilio-sms",
    name: "Twilio SMS Notifications",
    description: "Send real-time SMS notifications to applicants at each workflow stage. Reduce call volume to your office.",
    category: "communication",
    provider: "Twilio",
    version: "1.0.0",
    pricingModel: "per_use",
    pricePerUse: 0.01,
    configSchema: [
      { key: "account_sid", label: "Account SID", type: "text", required: true },
      { key: "auth_token", label: "Auth Token", type: "password", required: true },
      { key: "from_number", label: "From Number", type: "text", required: true },
    ],
    isInstalled: false,
    installedConfig: {},
  },
  {
    id: "google-maps",
    name: "Google Maps Address Validator",
    description: "Validate and auto-complete address fields in your forms using the Google Maps Places API. Reduces errors in location data.",
    category: "integration",
    provider: "Google",
    version: "1.0.0",
    pricingModel: "per_use",
    pricePerUse: 0.002,
    configSchema: [
      { key: "api_key", label: "Google Maps API Key", type: "password", required: true },
    ],
    isInstalled: false,
    installedConfig: {},
  },
  {
    id: "docusign",
    name: "DocuSign E-Signature",
    description: "Request legally binding digital signatures on issued certificates and approvals. Full audit trail included.",
    category: "integration",
    provider: "DocuSign",
    version: "1.0.0",
    pricingModel: "monthly",
    monthlyPrice: 25,
    configSchema: [
      { key: "integration_key", label: "Integration Key", type: "text", required: true },
      { key: "account_id", label: "Account ID", type: "text", required: true },
    ],
    isInstalled: false,
    installedConfig: {},
  },
  {
    id: "sla-tracker",
    name: "SLA Tracker",
    description: "Track application processing times against SLA targets. Receive email alerts when SLAs are about to breach.",
    category: "analytics",
    provider: "LNP Built-in",
    version: "1.0.0",
    pricingModel: "free",
    configSchema: [
      { key: "warning_threshold", label: "Warn at % of SLA (e.g. 80)", type: "number", required: true },
      { key: "alert_email", label: "Alert Email", type: "text", required: false },
    ],
    isInstalled: false,
    installedConfig: {},
  },
];

interface PluginsManagerProps {
  moduleName: string;
  onBack: () => void;
}

const PluginsManager: React.FC<PluginsManagerProps> = ({ moduleName, onBack }) => {
  const [plugins, setPlugins] = useState<Plugin[]>(marketplacePlugins);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [configPlugin, setConfigPlugin] = useState<Plugin | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const filtered = plugins.filter((p) => {
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const installedPlugins = plugins.filter((p) => p.isInstalled);

  const openInstall = (plugin: Plugin) => {
    setConfigPlugin(plugin);
    setConfigValues(plugin.installedConfig ?? {});
    setShowConfigDialog(true);
  };

  const confirmInstall = () => {
    if (!configPlugin) return;
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === configPlugin.id ? { ...p, isInstalled: true, installedConfig: configValues } : p
      )
    );
    setShowConfigDialog(false);
    setConfigPlugin(null);
  };

  const uninstall = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isInstalled: false, installedConfig: {} } : p))
    );
  };

  const pricingLabel = (p: Plugin) => {
    if (p.pricingModel === "free") return "Free";
    if (p.pricingModel === "per_use") return `$${p.pricePerUse}/use`;
    if (p.pricingModel === "monthly") return `$${p.monthlyPrice}/mo`;
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">{moduleName} — Plugins & Extensions</h1>
              <p className="text-xs text-muted-foreground">
                Browse and install integrations from the marketplace
              </p>
            </div>
          </div>
          {installedPlugins.length > 0 && (
            <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
              {installedPlugins.length} installed
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        <Tabs defaultValue="marketplace">
          <TabsList>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="installed">
              Installed{installedPlugins.length > 0 && ` (${installedPlugins.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-4 mt-4">
            {/* Search + Category filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search plugins..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {["all", "document_verification", "payment", "integration", "analytics", "communication"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors capitalize ${
                      activeCategory === cat
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-background border-border text-foreground hover:border-accent"
                    }`}
                  >
                    {cat === "all" ? "All" : CATEGORY_LABELS[cat as Plugin["category"]]}
                  </button>
                ))}
              </div>
            </div>

            {/* Plugin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((plugin) => (
                <Card
                  key={plugin.id}
                  className={`relative transition-all hover:shadow-md ${plugin.isInstalled ? "border-accent/40" : ""}`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${CATEGORY_COLORS[plugin.category]} bg-opacity-20`}>
                          {CATEGORY_ICONS[plugin.category]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground">{plugin.name}</p>
                            {plugin.isInstalled && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">by {plugin.provider}</p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${plugin.pricingModel === "free" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {pricingLabel(plugin)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{plugin.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${CATEGORY_COLORS[plugin.category]}`}>
                        {CATEGORY_LABELS[plugin.category]}
                      </Badge>
                      {plugin.isInstalled ? (
                        <div className="flex gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => openInstall(plugin)}
                          >
                            <Settings className="h-3 w-3" /> Configure
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                            onClick={() => uninstall(plugin.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                          onClick={() => openInstall(plugin)}
                        >
                          <Plus className="h-3 w-3" /> Install
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                <Puzzle className="h-8 w-8 mx-auto mb-3 opacity-30" />
                No plugins match your search.
              </div>
            )}
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="mt-4">
            {installedPlugins.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-sm">
                <Puzzle className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p>No plugins installed yet.</p>
                <p className="text-xs mt-1">Browse the marketplace to add plugins to this service.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {installedPlugins.map((plugin) => (
                  <Card key={plugin.id} className="border-accent/30">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${CATEGORY_COLORS[plugin.category]} shrink-0`}>
                        {CATEGORY_ICONS[plugin.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground">{plugin.name}</p>
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {plugin.provider} · v{plugin.version} · {pricingLabel(plugin)}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => openInstall(plugin)}
                        >
                          <Settings className="h-3 w-3" /> Configure
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                          onClick={() => uninstall(plugin.id)}
                        >
                          <Trash2 className="h-3 w-3" /> Uninstall
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Install / Configure Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {configPlugin?.isInstalled ? "Configure" : "Install"} {configPlugin?.name}
            </DialogTitle>
          </DialogHeader>
          {configPlugin && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-3">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{configPlugin.description}</p>
              </div>
              {configPlugin.configSchema.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  This plugin requires no configuration.
                </p>
              ) : (
                configPlugin.configSchema.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-destructive ml-0.5">*</span>}
                    </Label>
                    <Input
                      type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
                      value={configValues[field.key] ?? ""}
                      onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={confirmInstall}
            >
              {configPlugin?.isInstalled ? "Save Configuration" : "Install Plugin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PluginsManager;
