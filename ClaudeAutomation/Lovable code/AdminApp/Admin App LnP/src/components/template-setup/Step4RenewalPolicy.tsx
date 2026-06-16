import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type RenewalMode = "global" | "by_category" | "by_subcategory";

export interface RenewalPolicyState {
  mode: RenewalMode;
  globalMonths: number;
  perCategory: Record<string, number>;
  perSubcategory: Record<string, number>;
}

interface Props {
  categories: string[];
  subcategories: { name: string; parent: string }[];
  policy: RenewalPolicyState;
  setPolicy: (next: RenewalPolicyState) => void;
  onContinue: () => void;
  hideHeader?: boolean;
  hideContinue?: boolean;
}

const subKey = (s: { name: string; parent: string }) => `${s.parent}::${s.name}`;

const ModeOption: React.FC<{
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}> = ({ active, label, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "text-left p-4 rounded-md border transition-all w-full",
      active
        ? "border-accent bg-accent/5 ring-1 ring-accent"
        : "border-input hover:border-accent/40 hover:bg-muted/20",
    )}
  >
    <div className="text-sm font-medium text-foreground">{label}</div>
    <div className="text-xs text-muted-foreground mt-1">{description}</div>
  </button>
);

const MonthsInput: React.FC<{
  value: number;
  onChange: (n: number) => void;
  className?: string;
}> = ({ value, onChange, className }) => (
  <Input
    type="number"
    min={1}
    value={Number.isFinite(value) ? value : ""}
    onChange={(e) => {
      const n = parseInt(e.target.value, 10);
      onChange(Number.isFinite(n) && n > 0 ? n : 0);
    }}
    className={cn("h-9 w-28", className)}
  />
);

const Step4RenewalPolicy: React.FC<Props> = ({
  categories,
  subcategories,
  policy,
  setPolicy,
  onContinue,
  hideHeader,
  hideContinue,
}) => {
  const hasCategories = categories.length > 0;
  const hasSubcategories = subcategories.length > 0;

  const [bulkValue, setBulkValue] = React.useState<number>(12);

  // Force global mode when no categories.
  React.useEffect(() => {
    if (!hasCategories && policy.mode !== "global") {
      setPolicy({ ...policy, mode: "global" });
    }
  }, [hasCategories, policy, setPolicy]);

  const setMode = (mode: RenewalMode) => setPolicy({ ...policy, mode });

  const setGlobal = (n: number) => setPolicy({ ...policy, globalMonths: n });

  const setCatValue = (cat: string, n: number) =>
    setPolicy({ ...policy, perCategory: { ...policy.perCategory, [cat]: n } });

  const setSubValue = (key: string, n: number) =>
    setPolicy({
      ...policy,
      perSubcategory: { ...policy.perSubcategory, [key]: n },
    });

  const applyToAllCategories = () => {
    const next: Record<string, number> = {};
    categories.forEach((c) => (next[c] = bulkValue));
    setPolicy({ ...policy, perCategory: next });
  };

  const applyToAllSubcategories = () => {
    const next: Record<string, number> = {};
    subcategories.forEach((s) => (next[subKey(s)] = bulkValue));
    setPolicy({ ...policy, perSubcategory: next });
  };

  const canContinue = (() => {
    if (policy.mode === "global") return policy.globalMonths > 0;
    if (policy.mode === "by_category")
      return categories.every((c) => (policy.perCategory[c] ?? 0) > 0);
    if (policy.mode === "by_subcategory")
      return subcategories.every((s) => (policy.perSubcategory[subKey(s)] ?? 0) > 0);
    return false;
  })();

  return (
    <div className="space-y-8">
      {!hideHeader && (<div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Set up renewal validity
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Define how long renewed licenses remain active.
        </p>
      </div>)}

      {!hasCategories && (
        <Card className="p-5 space-y-3">
          <Label htmlFor="global-months" className="text-sm">After how long from issuance should renewal be allowed?</Label>
          <div className="flex items-center gap-2">
            <MonthsInput value={policy.globalMonths} onChange={setGlobal} />
            <span className="text-sm text-muted-foreground">months</span>
          </div>
        </Card>
      )}

      {hasCategories && (
        <div className="space-y-4">
          <div>
            <div className="text-base font-medium text-foreground">
              How does renewal validity vary?
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              Pick the level that best fits your application.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ModeOption
              active={policy.mode === "global"}
              label="Does not vary"
              description="One validity duration for every license."
              onClick={() => setMode("global")}
            />
            <ModeOption
              active={policy.mode === "by_category"}
              label="By category"
              description="Each category has its own duration."
              onClick={() => setMode("by_category")}
            />
            {hasSubcategories && (
              <ModeOption
                active={policy.mode === "by_subcategory"}
                label="By subcategory"
                description="Each subcategory has its own duration."
                onClick={() => setMode("by_subcategory")}
              />
            )}
          </div>

          {policy.mode === "global" && (
            <Card className="p-5 space-y-3">
              <Label className="text-sm">After how long from issuance should renewal be allowed?</Label>
              <div className="flex items-center gap-2">
                <MonthsInput value={policy.globalMonths} onChange={setGlobal} />
                <span className="text-sm text-muted-foreground">months</span>
              </div>
            </Card>
          )}

          {policy.mode === "by_category" && (
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-end gap-2 p-3 border-b bg-muted/30">
                <span className="text-xs text-muted-foreground">Apply to all:</span>
                <MonthsInput value={bulkValue} onChange={setBulkValue} className="w-20" />
                <Button size="sm" variant="outline" onClick={applyToAllCategories}>
                  Apply
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-48">Renewal Duration (Months)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c}>
                      <TableCell className="font-medium">{c}</TableCell>
                      <TableCell>
                        <MonthsInput
                          value={policy.perCategory[c] ?? 12}
                          onChange={(n) => setCatValue(c, n)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {policy.mode === "by_subcategory" && (
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-end gap-2 p-3 border-b bg-muted/30">
                <span className="text-xs text-muted-foreground">Apply to all:</span>
                <MonthsInput value={bulkValue} onChange={setBulkValue} className="w-20" />
                <Button size="sm" variant="outline" onClick={applyToAllSubcategories}>
                  Apply
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Parent Category</TableHead>
                    <TableHead className="w-48">Renewal Duration (Months)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((s) => {
                    const k = subKey(s);
                    return (
                      <TableRow key={k}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.parent || "—"}</TableCell>
                        <TableCell>
                          <MonthsInput
                            value={policy.perSubcategory[k] ?? 12}
                            onChange={(n) => setSubValue(k, n)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {!hideContinue && (<div className="flex justify-end">
        <Button
          onClick={onContinue}
          size="lg"
          className="gap-1.5"
          disabled={!canContinue}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>)}
    </div>
  );
};

export default Step4RenewalPolicy;