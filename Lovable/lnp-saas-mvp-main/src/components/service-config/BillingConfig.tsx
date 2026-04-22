import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Calculator, Pencil, Trash2, Info,
  GripVertical, CheckCircle2,
} from "lucide-react";

interface FeeRule {
  id: string;
  name: string;
  description: string;
  conditionField: string;
  conditionOperator: string;
  conditionValue: string;
  feeAmount: number;
  feeType: "fixed" | "percentage" | "per_unit";
  isActive: boolean;
  sortOrder: number;
}

const OPERATORS = [
  { value: "always", label: "Always apply (no condition)" },
  { value: "eq", label: "equals" },
  { value: "neq", label: "not equals" },
  { value: "gt", label: "greater than" },
  { value: "lt", label: "less than" },
  { value: "gte", label: "greater than or equal" },
  { value: "lte", label: "less than or equal" },
  { value: "contains", label: "contains" },
];

const FEE_TYPES = [
  { value: "fixed", label: "Fixed Amount" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "per_unit", label: "Per Unit" },
];

const FORM_FIELDS = [
  { value: "business_type", label: "Business Type" },
  { value: "num_employees", label: "Number of Employees" },
  { value: "floor_area", label: "Floor Area (sq ft)" },
  { value: "num_floors", label: "Number of Floors" },
  { value: "annual_turnover", label: "Annual Turnover" },
  { value: "license_category", label: "License Category" },
];

const defaultRules: FeeRule[] = [
  {
    id: "r1",
    name: "Base Application Fee",
    description: "Flat fee charged on every application",
    conditionField: "",
    conditionOperator: "always",
    conditionValue: "",
    feeAmount: 100,
    feeType: "fixed",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "r2",
    name: "Large Business Surcharge",
    description: "Additional fee for businesses with more than 50 employees",
    conditionField: "num_employees",
    conditionOperator: "gt",
    conditionValue: "50",
    feeAmount: 250,
    feeType: "fixed",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "r3",
    name: "Commercial Property Fee",
    description: "Fee per 100 sq ft of commercial space",
    conditionField: "floor_area",
    conditionOperator: "gt",
    conditionValue: "0",
    feeAmount: 10,
    feeType: "per_unit",
    isActive: false,
    sortOrder: 3,
  },
];

const emptyRule = (): FeeRule => ({
  id: `r_${Date.now()}`,
  name: "",
  description: "",
  conditionField: "",
  conditionOperator: "always",
  conditionValue: "",
  feeAmount: 0,
  feeType: "fixed",
  isActive: true,
  sortOrder: 99,
});

interface BillingConfigProps {
  moduleName: string;
  onBack: () => void;
}

const BillingConfig: React.FC<BillingConfigProps> = ({ moduleName, onBack }) => {
  const [rules, setRules] = useState<FeeRule[]>(defaultRules);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<FeeRule | null>(null);
  const [saved, setSaved] = useState(false);
  const [previewFormData, setPreviewFormData] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const totalPreviewFee = rules
    .filter((r) => r.isActive)
    .reduce((sum, rule) => {
      if (rule.conditionOperator === "always") return sum + rule.feeAmount;
      const fieldVal = previewFormData[rule.conditionField];
      if (!fieldVal) return sum;
      let conditionMet = false;
      switch (rule.conditionOperator) {
        case "eq": conditionMet = fieldVal === rule.conditionValue; break;
        case "neq": conditionMet = fieldVal !== rule.conditionValue; break;
        case "gt": conditionMet = Number(fieldVal) > Number(rule.conditionValue); break;
        case "lt": conditionMet = Number(fieldVal) < Number(rule.conditionValue); break;
        case "gte": conditionMet = Number(fieldVal) >= Number(rule.conditionValue); break;
        case "lte": conditionMet = Number(fieldVal) <= Number(rule.conditionValue); break;
        case "contains": conditionMet = String(fieldVal).includes(rule.conditionValue); break;
      }
      return conditionMet ? sum + rule.feeAmount : sum;
    }, 0);

  const openNew = () => {
    setEditingRule(emptyRule());
    setShowDialog(true);
  };

  const openEdit = (rule: FeeRule) => {
    setEditingRule({ ...rule });
    setShowDialog(true);
  };

  const saveRule = () => {
    if (!editingRule) return;
    setRules((prev) => {
      const exists = prev.find((r) => r.id === editingRule.id);
      return exists
        ? prev.map((r) => (r.id === editingRule.id ? editingRule : r))
        : [...prev, editingRule];
    });
    setShowDialog(false);
    setEditingRule(null);
  };

  const deleteRule = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id));

  const toggleActive = (id: string) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const feeTypeLabel = (type: FeeRule["feeType"]) =>
    FEE_TYPES.find((t) => t.value === type)?.label ?? type;

  const operatorLabel = (op: string) =>
    OPERATORS.find((o) => o.value === op)?.label ?? op;

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
              <h1 className="font-bold text-foreground">{moduleName} — Billing & Fee Rules</h1>
              <p className="text-xs text-muted-foreground">
                Configure dynamic fee calculation rules
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-1.5">
              <Calculator className="h-4 w-4" />
              {showPreview ? "Hide" : "Test"} Calculator
            </Button>
            <Button variant="outline" size="sm" onClick={openNew} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Rule
            </Button>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
              onClick={handleSave}
            >
              {saved && <CheckCircle2 className="h-4 w-4" />}
              {saved ? "Saved!" : "Save Rules"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-5">
        {/* Info */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Fee rules are evaluated in order. Rules with <strong>no condition</strong> always apply. Rules with
            conditions apply only when the applicant's form data meets the criteria.
            The total fee is the sum of all matching rules.
          </p>
        </div>

        {/* Fee Calculator Preview */}
        {showPreview && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-accent" />
                <p className="font-semibold text-sm text-foreground">Fee Calculator Preview</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FORM_FIELDS.map((f) => (
                  <div key={f.value} className="space-y-1">
                    <Label className="text-xs">{f.label}</Label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="Enter value"
                      value={previewFormData[f.value] ?? ""}
                      onChange={(e) =>
                        setPreviewFormData({ ...previewFormData, [f.value]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                {rules
                  .filter((r) => r.isActive)
                  .map((rule) => {
                    let applies = rule.conditionOperator === "always";
                    if (!applies && previewFormData[rule.conditionField]) {
                      const fieldVal = previewFormData[rule.conditionField];
                      switch (rule.conditionOperator) {
                        case "gt": applies = Number(fieldVal) > Number(rule.conditionValue); break;
                        case "lt": applies = Number(fieldVal) < Number(rule.conditionValue); break;
                        case "gte": applies = Number(fieldVal) >= Number(rule.conditionValue); break;
                        case "lte": applies = Number(fieldVal) <= Number(rule.conditionValue); break;
                        case "eq": applies = fieldVal === rule.conditionValue; break;
                        case "neq": applies = fieldVal !== rule.conditionValue; break;
                      }
                    }
                    return (
                      <div key={rule.id} className={`flex items-center justify-between text-sm ${applies ? "text-foreground" : "text-muted-foreground line-through"}`}>
                        <span>{rule.name}</span>
                        <span className="font-medium">${rule.feeAmount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                <div className="border-t pt-2 flex items-center justify-between font-bold text-sm">
                  <span>Total Fee</span>
                  <span className="text-accent text-base">${totalPreviewFee.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {rules.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No fee rules yet. Click "Add Rule" to create your first rule.
            </div>
          )}
          {rules.map((rule, idx) => (
            <Card key={rule.id} className={`transition-opacity ${!rule.isActive ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 cursor-grab text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{rule.name}</p>
                        {rule.description && (
                          <p className="text-xs text-muted-foreground">{rule.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-base font-bold text-foreground">
                            ${rule.feeAmount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{feeTypeLabel(rule.feeType)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {rule.conditionOperator === "always" ? (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Always applies
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          When{" "}
                          {FORM_FIELDS.find((f) => f.value === rule.conditionField)?.label ?? rule.conditionField}{" "}
                          {operatorLabel(rule.conditionOperator)} {rule.conditionValue}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleActive(rule.id)}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(rule)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        {rules.filter((r) => r.isActive).length > 0 && (
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {rules.filter((r) => r.isActive).length} active fee rules
                </p>
                <p className="text-xs text-muted-foreground">
                  Minimum fee (base rules only):{" "}
                  ${rules
                    .filter((r) => r.isActive && r.conditionOperator === "always")
                    .reduce((s, r) => s + r.feeAmount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-accent/40" />
            </CardContent>
          </Card>
        )}
      </main>

      {/* Rule Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule?.name ? "Edit Fee Rule" : "New Fee Rule"}</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Rule Name *</Label>
                <Input
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="e.g. Base Application Fee"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="When this fee applies..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Fee Amount *</Label>
                  <Input
                    type="number"
                    value={editingRule.feeAmount}
                    onChange={(e) => setEditingRule({ ...editingRule, feeAmount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fee Type</Label>
                  <Select
                    value={editingRule.feeType}
                    onValueChange={(v) => setEditingRule({ ...editingRule, feeType: v as FeeRule["feeType"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select
                  value={editingRule.conditionOperator}
                  onValueChange={(v) =>
                    setEditingRule({ ...editingRule, conditionOperator: v, conditionField: v === "always" ? "" : editingRule.conditionField })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingRule.conditionOperator !== "always" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Form Field</Label>
                    <Select
                      value={editingRule.conditionField}
                      onValueChange={(v) => setEditingRule({ ...editingRule, conditionField: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_FIELDS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Value</Label>
                    <Input
                      value={editingRule.conditionValue}
                      onChange={(e) => setEditingRule({ ...editingRule, conditionValue: e.target.value })}
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingRule.isActive}
                  onCheckedChange={(v) => setEditingRule({ ...editingRule, isActive: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={saveRule}
              disabled={!editingRule?.name || editingRule.feeAmount < 0}
            >
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingConfig;
