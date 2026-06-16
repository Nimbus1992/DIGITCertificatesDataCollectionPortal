import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, Plus, Pencil, Trash2, CreditCard, Building, Landmark,
  Receipt, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ── constants ── */
import {
  TRADE_PAYMENT_STAGES,
  TRADE_STATE_NAMES,
  TRADE_FEE_NAMES,
} from "@/data/tradeLicenseTemplate";
import {
  RENEWAL_PAYMENT_STAGES,
  RENEWAL_STATE_NAMES,
  RENEWAL_FEE_NAMES,
  isRenewalModule,
} from "@/data/renewalTemplate";
import { useModuleState } from "@/lib/moduleStorage";

// Receipt templates pulled from Document Designer's shared template list
import { DOCUMENT_TEMPLATE_NAMES } from "@/data/documentTemplates";

const GATEWAY_OPTIONS = [
  { value: "razorpay", label: "Razorpay" },
  { value: "paygov", label: "PayGov" },
  { value: "custom", label: "Custom" },
] as const;

type Gateway = "razorpay" | "paygov" | "custom";

interface PaymentStage {
  id: string;
  name: string;
  workflowState: string;
  fees: string[];
  methods: { online: boolean; counter: boolean };
  gateway: Gateway;
  generateReceipt: boolean;
  receiptTemplate?: string;
}

const uid = () => crypto.randomUUID();

const buildDefaultStages = (moduleName: string): PaymentStage[] => {
  const src = isRenewalModule(moduleName) ? RENEWAL_PAYMENT_STAGES : TRADE_PAYMENT_STAGES;
  return src.map((s) => ({
    id: s.id,
    name: s.name,
    workflowState: s.workflowState,
    fees: [...s.fees],
    methods: { online: s.methods.online, counter: s.methods.counter },
    gateway: s.gateway,
    generateReceipt: s.generateReceipt,
    receiptTemplate: s.receiptTemplate,
  }));
};

const emptyStage = (): PaymentStage => ({
  id: uid(),
  name: "",
  workflowState: "",
  fees: [],
  methods: { online: true, counter: false },
  gateway: "razorpay",
  generateReceipt: false,
});


/* ── component ── */
interface Props {
  moduleName: string;
  onBack: () => void;
}

const PaymentsConfigurator: React.FC<Props> = ({ moduleName, onBack }) => {
  const { toast } = useToast();
  const { id: serviceId = "service" } = useParams();
  const renewal = isRenewalModule(moduleName);
  const WORKFLOW_STATES = renewal ? RENEWAL_STATE_NAMES : TRADE_STATE_NAMES;
  const AVAILABLE_FEES = renewal ? RENEWAL_FEE_NAMES : TRADE_FEE_NAMES;
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);
  const [stages, setStages] = useModuleState<PaymentStage[]>(
    "payments", serviceId, moduleName, () => buildDefaultStages(moduleName),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<PaymentStage>(emptyStage());
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setDraft(emptyStage());
    setEditingId(null);
    setSheetOpen(true);
  };

  const openEdit = (s: PaymentStage) => {
    setDraft({ ...s, methods: { ...s.methods }, fees: [...s.fees] });
    setEditingId(s.id);
    setSheetOpen(true);
  };

  const deleteStage = (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Payment stage deleted" });
  };

  const saveStage = () => {
    if (!draft.name.trim() || !draft.workflowState || draft.fees.length === 0) {
      toast({ title: "Please fill required fields", description: "Name, workflow state, and at least one fee are required.", variant: "destructive" });
      return;
    }
    if (editingId) {
      setStages((prev) => prev.map((s) => (s.id === editingId ? { ...draft } : s)));
    } else {
      setStages((prev) => [...prev, draft]);
    }
    setSheetOpen(false);
    toast({ title: editingId ? "Payment stage updated" : "Payment stage added" });
  };

  const updateDraft = (u: Partial<PaymentStage>) => setDraft((p) => ({ ...p, ...u }));

  const toggleFee = (fee: string) => {
    setDraft((p) => ({
      ...p,
      fees: p.fees.includes(fee) ? p.fees.filter((f) => f !== fee) : [...p.fees, fee],
    }));
  };

  const toggleMethod = (key: keyof PaymentStage["methods"]) => {
    setDraft((p) => ({ ...p, methods: { ...p.methods, [key]: !p.methods[key] } }));
  };

  const showWarning = paymentsEnabled && stages.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Payments</h1>
              <p className="text-sm text-muted-foreground">Business License &gt; {moduleName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="pay-toggle" className="text-sm">Enable Payments</Label>
            <Switch id="pay-toggle" checked={paymentsEnabled} onCheckedChange={setPaymentsEnabled} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <p className="text-sm text-muted-foreground">
          Configure how and when fees are collected. Map fees to workflow stages and choose payment methods.
        </p>

        {showWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Payments are enabled but no payment stages are configured. Add at least one stage.</AlertDescription>
          </Alert>
        )}

        {paymentsEnabled && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-foreground">Configure Payment Stages</h2>
              <Button size="sm" onClick={openCreate} className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-3.5 w-3.5" /> Add Payment Stage
              </Button>
            </div>

            {stages.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No payment stages yet. Click "Add Payment Stage" to begin.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stages.map((s) => (
                  <Card key={s.id} className="group hover:border-accent/40 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.workflowState}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {s.fees.map((f) => (
                          <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                        {s.methods.online && <span className="flex items-center gap-0.5"><CreditCard className="h-3 w-3" /> Online</span>}
                        {s.methods.counter && <span className="flex items-center gap-0.5"><Landmark className="h-3 w-3" /> Counter</span>}
                        {s.generateReceipt && <span className="flex items-center gap-0.5"><Receipt className="h-3 w-3" /> Receipt</span>}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(s)}>
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => deleteStage(s.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {!paymentsEnabled && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Payments are disabled for this application.</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Payment Stage" : "Add Payment Stage"}</SheetTitle>
            <SheetDescription>Configure a payment collection point in the workflow.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {/* name */}
            <div className="space-y-1.5">
              <Label>Payment Stage Name</Label>
              <Input placeholder="e.g. Application Payment" value={draft.name} onChange={(e) => updateDraft({ name: e.target.value })} />
            </div>

            {/* workflow state */}
            <div className="space-y-1.5">
              <Label>Workflow State</Label>
              <Select value={draft.workflowState} onValueChange={(v) => updateDraft({ workflowState: v })}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {WORKFLOW_STATES.map((ws) => (
                    <SelectItem key={ws} value={ws}>{ws}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* fees mapping */}
            <div className="space-y-2">
              <Label>Fees Mapping</Label>
              {AVAILABLE_FEES.map((fee) => (
                <label key={fee} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={draft.fees.includes(fee)} onCheckedChange={() => toggleFee(fee)} />
                  <span className="text-sm">{fee}</span>
                </label>
              ))}
            </div>

            {/* payment method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              {(["online", "counter"] as const).map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={draft.methods[m]} onCheckedChange={() => toggleMethod(m)} />
                  <span className="text-sm capitalize">{m}</span>
                </label>
              ))}
            </div>

            {/* gateway - only when online enabled */}
            {draft.methods.online && (
              <div className="space-y-1.5">
                <Label>Payment Gateway</Label>
                <Select value={draft.gateway} onValueChange={(v) => updateDraft({ gateway: v as Gateway })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GATEWAY_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}


            {/* receipt */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch checked={draft.generateReceipt} onCheckedChange={(v) => updateDraft({ generateReceipt: v, receiptTemplate: v ? draft.receiptTemplate : undefined })} />
                <Label>Generate Receipt</Label>
              </div>
              {draft.generateReceipt && (
                <Select value={draft.receiptTemplate || ""} onValueChange={(v) => updateDraft({ receiptTemplate: v })}>
                  <SelectTrigger><SelectValue placeholder="Select from available documents" /></SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TEMPLATE_NAMES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={saveStage}>
              {editingId ? "Update Stage" : "Save Stage"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PaymentsConfigurator;
