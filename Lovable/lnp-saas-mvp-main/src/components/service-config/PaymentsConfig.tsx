import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, CreditCard, CheckCircle2, Info, Banknote,
  Building2, Smartphone, Receipt, Shield,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  type: "online" | "offline";
  icon: React.ReactNode;
  enabled: boolean;
  configFields?: { key: string; label: string; placeholder: string; secret?: boolean }[];
  config: Record<string, string>;
}

const defaultMethods: PaymentMethod[] = [
  {
    id: "online_card",
    label: "Credit / Debit Card",
    description: "Accept Visa, Mastercard, and Amex payments online via Stripe.",
    type: "online",
    icon: <CreditCard className="h-5 w-5" />,
    enabled: false,
    configFields: [
      { key: "stripe_publishable_key", label: "Stripe Publishable Key", placeholder: "pk_live_..." },
      { key: "stripe_secret_key", label: "Stripe Secret Key", placeholder: "sk_live_...", secret: true },
      { key: "webhook_secret", label: "Webhook Secret", placeholder: "whsec_...", secret: true },
    ],
    config: {},
  },
  {
    id: "online_upi",
    label: "UPI / Net Banking",
    description: "Accept UPI and net banking payments (India). Powered by Razorpay.",
    type: "online",
    icon: <Smartphone className="h-5 w-5" />,
    enabled: false,
    configFields: [
      { key: "razorpay_key_id", label: "Razorpay Key ID", placeholder: "rzp_live_..." },
      { key: "razorpay_key_secret", label: "Razorpay Key Secret", placeholder: "Your secret key", secret: true },
    ],
    config: {},
  },
  {
    id: "offline_cash",
    label: "Cash",
    description: "Record cash payments collected at the counter or in the field.",
    type: "offline",
    icon: <Banknote className="h-5 w-5" />,
    enabled: true,
    config: {},
  },
  {
    id: "offline_check",
    label: "Cheque / Demand Draft",
    description: "Record cheque or DD payments with cheque number and bank details.",
    type: "offline",
    icon: <Receipt className="h-5 w-5" />,
    enabled: true,
    config: {},
  },
  {
    id: "offline_bank",
    label: "Bank Transfer / NEFT",
    description: "Record bank transfers. Applicant provides UTR number as proof.",
    type: "offline",
    icon: <Building2 className="h-5 w-5" />,
    enabled: false,
    configFields: [
      { key: "bank_name", label: "Bank Name", placeholder: "e.g. State Bank of India" },
      { key: "account_number", label: "Account Number", placeholder: "Account number" },
      { key: "ifsc_code", label: "IFSC Code", placeholder: "e.g. SBIN0001234" },
      { key: "account_name", label: "Account Name", placeholder: "Beneficiary name" },
    ],
    config: {},
  },
];

interface PaymentsConfigProps {
  moduleName: string;
  onBack: () => void;
}

const PaymentsConfig: React.FC<PaymentsConfigProps> = ({ moduleName, onBack }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>(defaultMethods);
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [receiptSettings, setReceiptSettings] = useState({
    autoGenerate: true,
    prefix: "RCP",
    footer: "Thank you for your payment. This is a computer-generated receipt.",
  });

  const toggleMethod = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const updateConfig = (methodId: string, key: string, value: string) => {
    setMethods((prev) =>
      prev.map((m) =>
        m.id === methodId ? { ...m, config: { ...m.config, [key]: value } } : m
      )
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onlineMethods = methods.filter((m) => m.type === "online");
  const offlineMethods = methods.filter((m) => m.type === "offline");
  const enabledCount = methods.filter((m) => m.enabled).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">{moduleName} — Payment Setup</h1>
              <p className="text-xs text-muted-foreground">
                Configure online and offline payment methods
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {enabledCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                {enabledCount} method{enabledCount > 1 ? "s" : ""} enabled
              </Badge>
            )}
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
              onClick={handleSave}
            >
              {saved && <CheckCircle2 className="h-4 w-4" />}
              {saved ? "Saved!" : "Save Settings"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Info */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Enable the payment methods you want to accept. Online methods require API credentials.
            Offline methods allow staff to <strong>record</strong> payments collected outside the system.
            Fees are calculated based on your <strong>Billing rules</strong>.
          </p>
        </div>

        {/* Online Methods */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            <h2 className="font-semibold text-sm text-foreground">Online Payment Methods</h2>
          </div>
          {onlineMethods.map((method) => (
            <Card key={method.id} className={`transition-all ${method.enabled ? "border-accent/30" : ""}`}>
              <CardContent className="p-0">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedMethod(expandedMethod === method.id ? null : method.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${method.enabled ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {method.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">{method.label}</p>
                      {method.enabled && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-0">
                          Enabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => toggleMethod(method.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {method.enabled && method.configFields && expandedMethod === method.id && (
                  <>
                    <Separator />
                    <div className="p-4 space-y-3 bg-muted/30">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        API Configuration
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {method.configFields.map((field) => (
                          <div key={field.key} className="space-y-1">
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                              type={field.secret ? "password" : "text"}
                              className="h-8 text-xs"
                              placeholder={field.placeholder}
                              value={method.config[field.key] ?? ""}
                              onChange={(e) => updateConfig(method.id, field.key, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Offline Methods */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-accent" />
            <h2 className="font-semibold text-sm text-foreground">Offline Payment Recording</h2>
            <Badge variant="secondary" className="text-xs text-muted-foreground">
              Staff records payment manually
            </Badge>
          </div>
          {offlineMethods.map((method) => (
            <Card key={method.id} className={`transition-all ${method.enabled ? "border-accent/30" : ""}`}>
              <CardContent className="p-0">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() =>
                    method.configFields
                      ? setExpandedMethod(expandedMethod === method.id ? null : method.id)
                      : undefined
                  }
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${method.enabled ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                    {method.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">{method.label}</p>
                      {method.enabled && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-0">
                          Enabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => toggleMethod(method.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {method.enabled && method.configFields && expandedMethod === method.id && (
                  <>
                    <Separator />
                    <div className="p-4 space-y-3 bg-muted/30">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Bank Details (shown to applicant)
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {method.configFields.map((field) => (
                          <div key={field.key} className="space-y-1">
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder={field.placeholder}
                              value={method.config[field.key] ?? ""}
                              onChange={(e) => updateConfig(method.id, field.key, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Receipt Settings */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-accent" />
              <p className="font-semibold text-sm text-foreground">Receipt Settings</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={receiptSettings.autoGenerate}
                onCheckedChange={(v) => setReceiptSettings({ ...receiptSettings, autoGenerate: v })}
              />
              <div>
                <p className="text-sm font-medium text-foreground">Auto-generate receipts</p>
                <p className="text-xs text-muted-foreground">
                  Automatically generate a PDF receipt when payment is recorded
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Receipt Number Prefix</Label>
                <Input
                  className="h-8 text-xs"
                  value={receiptSettings.prefix}
                  onChange={(e) => setReceiptSettings({ ...receiptSettings, prefix: e.target.value })}
                  placeholder="RCP"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Receipt Footer Text</Label>
              <Textarea
                className="text-xs resize-none"
                rows={2}
                value={receiptSettings.footer}
                onChange={(e) => setReceiptSettings({ ...receiptSettings, footer: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PaymentsConfig;
