import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Copy,
  Trash2,
  DollarSign,
  Layers,
  GitBranch,
  Calculator,
  Info,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────

type FeeType = "fixed" | "slab" | "conditional" | "formula";

interface SlabRow {
  id: string;
  conditionLabel: string;
  amount: number;
}

interface Fee {
  id: string;
  name: string;
  code: string;
  type: FeeType;
  amount?: number;
  currency?: string;
  slabs?: SlabRow[];
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
  conditionAmount?: number;
  formula?: string;
  applicableStage: string;
  mandatory: boolean;
  status: "active" | "draft";
}

// ── Constants ──────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

import { TRADE_FEES, TRADE_STATE_NAMES } from "@/data/tradeLicenseTemplate";
import { RENEWAL_FEES, RENEWAL_STATE_NAMES, isRenewalModule } from "@/data/renewalTemplate";
import { useModuleState } from "@/lib/moduleStorage";

const FEE_TYPE_META: Record<FeeType, { label: string; icon: React.ElementType; description: string }> = {
  fixed: { label: "Fixed Fee", icon: DollarSign, description: "A flat amount charged every time" },
  slab: { label: "Slab Based", icon: Layers, description: "Amount varies by condition ranges" },
  conditional: { label: "Conditional", icon: GitBranch, description: "Charged only when a condition is met" },
  formula: { label: "Formula Based", icon: Calculator, description: "Calculated using a formula" },
};

const CONDITION_FIELDS = ["Business Type", "Area (sq ft)", "No. of Employees", "Zone", "Category", "Is Hazardous"];
const OPERATORS = ["=", "!=", ">", "<", ">=", "<="];
const FORMULA_VARIABLES = ["Area", "Rate", "BusinessType", "Employees", "Zone"];

const buildDefaultFees = (moduleName: string): Fee[] => {
  const src = isRenewalModule(moduleName) ? RENEWAL_FEES : TRADE_FEES;
  return src.map((f) => ({
    id: f.id,
    name: f.name,
    code: f.code,
    type: f.type,
    amount: f.amount,
    currency: f.currency,
    slabs: f.slabs ? f.slabs.map((s) => ({ id: s.id, conditionLabel: s.conditionLabel, amount: s.amount })) : undefined,
    conditionField: f.conditionField,
    conditionOperator: f.conditionOperator,
    conditionValue: f.conditionValue,
    conditionAmount: f.conditionAmount,
    formula: f.formula,
    applicableStage: f.applicableStage,
    mandatory: f.mandatory,
    status: f.status,
  }));
};

const emptyFee = (stages: string[]): Fee => ({
  id: uid(),
  name: "",
  code: "",
  type: "fixed",
  amount: 0,
  currency: "INR",
  slabs: [{ id: uid(), conditionLabel: "", amount: 0 }],
  conditionField: CONDITION_FIELDS[0],
  conditionOperator: "=",
  conditionValue: "",
  conditionAmount: 0,
  formula: "",
  applicableStage: stages[0],
  mandatory: false,
  status: "draft",
});

const autoCode = (name: string) =>
  name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_") || "";

// ── Component ──────────────────────────────────────────

interface Props {
  moduleName: string;
  onBack: () => void;
}

const FeesConfigurator: React.FC<Props> = ({ moduleName, onBack }) => {
  const { id: serviceId = "service" } = useParams();
  const WORKFLOW_STAGES = isRenewalModule(moduleName) ? RENEWAL_STATE_NAMES : TRADE_STATE_NAMES;
  const [fees, setFees] = useModuleState<Fee[]>(
    "fees", serviceId, moduleName, () => buildDefaultFees(moduleName),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [draft, setDraft] = useState<Fee>(() => emptyFee(WORKFLOW_STAGES));

  // ── Handlers ──

  const openCreate = () => {
    setEditingFee(null);
    setDraft(emptyFee(WORKFLOW_STAGES));
    setSheetOpen(true);
  };

  const openEdit = (fee: Fee) => {
    setEditingFee(fee);
    setDraft({ ...fee, slabs: fee.slabs ? fee.slabs.map((s) => ({ ...s })) : [{ id: uid(), conditionLabel: "", amount: 0 }] });
    setSheetOpen(true);
  };

  const duplicateFee = (fee: Fee) => {
    const dup: Fee = {
      ...fee,
      id: uid(),
      name: `${fee.name} (Copy)`,
      code: `${fee.code}_COPY`,
      slabs: fee.slabs?.map((s) => ({ ...s, id: uid() })),
    };
    setFees((prev) => [...prev, dup]);
  };

  const deleteFee = (id: string) => setFees((prev) => prev.filter((f) => f.id !== id));

  const saveFee = () => {
    if (!draft.name.trim()) return;
    if (editingFee) {
      setFees((prev) => prev.map((f) => (f.id === editingFee.id ? { ...draft, status: "active" } : f)));
    } else {
      setFees((prev) => [...prev, { ...draft, status: "active" }]);
    }
    setSheetOpen(false);
  };

  const updateDraft = (updates: Partial<Fee>) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      if (updates.name !== undefined && !editingFee) {
        next.code = autoCode(updates.name);
      }
      return next;
    });
  };

  // ── Slab helpers ──

  const addSlab = () => updateDraft({ slabs: [...(draft.slabs || []), { id: uid(), conditionLabel: "", amount: 0 }] });
  const updateSlab = (id: string, updates: Partial<SlabRow>) =>
    updateDraft({ slabs: (draft.slabs || []).map((s) => (s.id === id ? { ...s, ...updates } : s)) });
  const removeSlab = (id: string) => updateDraft({ slabs: (draft.slabs || []).filter((s) => s.id !== id) });

  // ── Render ──

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground text-lg">Fees</h1>
              <p className="text-xs text-muted-foreground">
                Business License &gt; {moduleName}
              </p>
            </div>
          </div>
          <Button onClick={openCreate} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            <Plus className="h-4 w-4" /> Add Fee
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Helper */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Define fee components for this service. These fees will be used in payment configuration.
          </p>
        </div>

        {/* Fee cards */}
        {fees.length === 0 ? (
          <div className="text-center py-20">
            <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-foreground mb-1">No fees configured</h3>
            <p className="text-sm text-muted-foreground mb-6">Add your first fee to get started.</p>
            <Button onClick={openCreate} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
              <Plus className="h-4 w-4" /> Add First Fee
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fees.map((fee) => {
              const meta = FEE_TYPE_META[fee.type];
              const Icon = meta.icon;
              return (
                <Card key={fee.id} className="relative group hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {fee.mandatory && (
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive" title="Mandatory" />
                        )}
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${
                            fee.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {fee.status === "active" ? "Active" : "Draft"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{fee.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Type: {meta.label}</p>
                      {fee.type === "fixed" && (
                        <p className="text-xs text-muted-foreground">
                          Amount: {fee.currency || "INR"} {fee.amount?.toLocaleString()}
                        </p>
                      )}
                      
                    </div>

                    <div className="flex gap-1 pt-1">
                      <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => openEdit(fee)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => duplicateFee(fee)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs gap-1 text-destructive hover:text-destructive" onClick={() => deleteFee(fee.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Side Panel ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingFee ? "Edit Fee" : "Create Fee"}</SheetTitle>
          </SheetHeader>

          <div className="space-y-5 py-4">
            {/* Fee Name */}
            <div className="space-y-1.5">
              <Label>Fee Name</Label>
              <Input
                placeholder="e.g. Application Fee"
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
              />
            </div>

            {/* Fee Code */}
            <div className="space-y-1.5">
              <Label>Fee Code</Label>
              <Input
                value={draft.code}
                onChange={(e) => updateDraft({ code: e.target.value })}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">Auto-generated from name. Editable.</p>
            </div>

            {/* Fee Type */}
            <div className="space-y-1.5">
              <Label>Fee Type</Label>
              <Select value={draft.type} onValueChange={(v) => updateDraft({ type: v as FeeType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FEE_TYPE_META) as FeeType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {FEE_TYPE_META[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">{FEE_TYPE_META[draft.type].description}</p>
            </div>

            {/* ── Type-specific fields ── */}
            {draft.type === "fixed" && (
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Fixed Fee</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.amount ?? 0}
                      onChange={(e) => updateDraft({ amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select value={draft.currency || "INR"} onValueChange={(v) => updateDraft({ currency: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ INR</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {draft.type === "slab" && (
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Slab Configuration</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Condition</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(draft.slabs || []).map((slab) => (
                      <TableRow key={slab.id}>
                        <TableCell className="py-1.5">
                          <Input
                            className="h-8 text-xs"
                            placeholder="e.g. 0–100 sq ft"
                            value={slab.conditionLabel}
                            onChange={(e) => updateSlab(slab.id, { conditionLabel: e.target.value })}
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input
                            className="h-8 text-xs"
                            type="number"
                            min={0}
                            value={slab.amount}
                            onChange={(e) => updateSlab(slab.id, { amount: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeSlab(slab.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={addSlab}>
                  <Plus className="h-3 w-3" /> Add Slab
                </Button>
              </div>
            )}

            {draft.type === "conditional" && (
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Condition</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Field</Label>
                    <Select value={draft.conditionField || CONDITION_FIELDS[0]} onValueChange={(v) => updateDraft({ conditionField: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_FIELDS.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Operator</Label>
                    <Select value={draft.conditionOperator || "="} onValueChange={(v) => updateDraft({ conditionOperator: v })}>
                      <SelectTrigger className="h-8 text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op} value={op}>{op}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Value</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="e.g. Restaurant"
                      value={draft.conditionValue || ""}
                      onChange={(e) => updateDraft({ conditionValue: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Fee Amount</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.conditionAmount ?? 0}
                    onChange={(e) => updateDraft({ conditionAmount: Number(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {draft.type === "formula" && (
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Formula</h4>
                <div className="space-y-1.5">
                  <Label>Expression</Label>
                  <Input
                    className="font-mono text-xs"
                    placeholder="e.g. Area × Rate"
                    value={draft.formula || ""}
                    onChange={(e) => updateDraft({ formula: e.target.value })}
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1.5">Available variables:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {FORMULA_VARIABLES.map((v) => (
                      <Badge key={v} variant="secondary" className="text-[10px] cursor-pointer hover:bg-accent hover:text-accent-foreground" onClick={() => updateDraft({ formula: (draft.formula || "") + ` ${v}` })}>
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Applicable stage is now driven by Payment Setup, not the fee itself. */}

            {/* Mandatory toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Mandatory Fee</p>
                <p className="text-[11px] text-muted-foreground">This fee must be paid to proceed</p>
              </div>
              <Switch checked={draft.mandatory} onCheckedChange={(v) => updateDraft({ mandatory: v })} />
            </div>

            {/* Save */}
            <Button onClick={saveFee} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5" disabled={!draft.name.trim()}>
              Save Fee
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FeesConfigurator;
