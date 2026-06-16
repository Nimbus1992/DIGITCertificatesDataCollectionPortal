import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, FileSpreadsheet, X, Lock, FileCheck, RefreshCw, Download, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOnboarding,
  type ServiceItem,
  type TemplateSetup,
  type RenewalPolicy,
  type WorkflowScope,
} from "@/contexts/OnboardingContext";
import { toast } from "@/hooks/use-toast";
import { parseCategoriesCsv, parseSubcategoriesCsv } from "@/lib/csvParse";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { seedFormSteps, saveFormSteps } from "@/lib/formStorage";
import Step4RenewalPolicy, {
  type RenewalPolicyState,
} from "@/components/template-setup/Step4RenewalPolicy";
import Step5WorkflowScope from "@/components/template-setup/Step5WorkflowScope";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceItem;
}

const CATEGORIES_SAMPLE_CSV =
  "Category Name\nRetail\nManufacturing\nHospitality\n";
const SUBCATEGORIES_SAMPLE_CSV =
  "Subcategory Name,Parent Category\nRestaurant,Hospitality\nBakery,Retail\nGarment Factory,Manufacturing\n";

const downloadSample = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const YesNo: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div className="inline-flex rounded-md border border-input p-0.5 bg-background">
    {[
      { v: true, label: "Yes" },
      { v: false, label: "No" },
    ].map((o) => (
      <button
        key={o.label}
        type="button"
        onClick={() => onChange(o.v)}
        className={cn(
          "px-4 py-1 text-sm rounded-sm transition-colors",
          value === o.v ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const UploadField: React.FC<{
  id: string;
  fileName?: string;
  itemCount: number;
  itemLabel: string;
  sampleFilename: string;
  sampleCsv: string;
  onFile: (file: File) => Promise<void> | void;
  onClear: () => void;
}> = ({ id, fileName, itemCount, itemLabel, sampleFilename, sampleCsv, onFile, onClear }) => (
  <div className="space-y-2">
    {fileName ? (
      <div className="flex items-center gap-3 p-3 rounded-md border border-accent/30 bg-accent/5">
        <FileSpreadsheet className="h-4 w-4 text-accent shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">{fileName}</div>
          <div className="text-xs text-muted-foreground">
            {itemCount > 0 ? `${itemCount} ${itemLabel} parsed` : "No rows parsed"}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    ) : (
      <label
        htmlFor={id}
        className="flex items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed border-input hover:border-accent/50 hover:bg-muted/30 cursor-pointer transition-colors text-sm"
      >
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-accent font-medium">Upload file</span>
        <span className="text-muted-foreground">CSV</span>
        <input
          id={id}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = "";
          }}
        />
      </label>
    )}
    {!fileName && (
      <button
        type="button"
        onClick={() => downloadSample(sampleFilename, sampleCsv)}
        className="inline-flex items-center gap-1 text-xs text-accent underline-offset-2 hover:underline"
      >
        <Download className="h-3.5 w-3.5" />
        Download sample
      </button>
    )}
  </div>
);

const arraysEqual = <T,>(a: T[] = [], b: T[] = []) =>
  a.length === b.length && JSON.stringify(a) === JSON.stringify(b);

const MasterTemplateConfigurator: React.FC<Props> = ({ open, onOpenChange, service }) => {
  const { updateService } = useOnboarding();

  const initialSetup: TemplateSetup =
    service.templateSetup ?? { hasCategories: false, hasSubcategories: false };
  const initialRenewal = service.customModules.includes("Renewal");
  const initialPolicy: RenewalPolicyState = service.renewalPolicy ?? {
    mode: "global",
    globalMonths: 12,
    perCategory: {},
    perSubcategory: {},
  };
  const initialScope: WorkflowScope = service.workflowScope ?? "shared";

  const [name, setName] = useState(service.name);
  const [renewalEnabled, setRenewalEnabled] = useState(initialRenewal);
  const [setup, setSetup] = useState<TemplateSetup>(initialSetup);
  const [policy, setPolicy] = useState<RenewalPolicyState>(initialPolicy);
  const [scope, setScope] = useState<WorkflowScope>(initialScope);
  const [newCategory, setNewCategory] = useState("");

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    const exists = (setup.categoriesList ?? []).some(
      (c) => c.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      toast({ title: "Category already exists", variant: "destructive" });
      return;
    }
    setSetup((s) => ({ ...s, categoriesList: [...(s.categoriesList ?? []), trimmed] }));
    setNewCategory("");
  };

  useEffect(() => {
    if (open) {
      setName(service.name);
      setRenewalEnabled(service.customModules.includes("Renewal"));
      setSetup(service.templateSetup ?? { hasCategories: false, hasSubcategories: false });
      setPolicy(
        service.renewalPolicy ?? {
          mode: "global",
          globalMonths: 12,
          perCategory: {},
          perSubcategory: {},
        },
      );
      setScope(service.workflowScope ?? "shared");
    }
  }, [open, service]);

  const categoriesList = setup.categoriesList ?? [];
  const subcategoriesList = setup.subcategoriesList ?? [];

  // Auto-clean policy when categories disappear
  useEffect(() => {
    if (!setup.hasCategories && policy.mode !== "global") {
      setPolicy((p) => ({ ...p, mode: "global", perCategory: {}, perSubcategory: {} }));
    }
    if (!setup.hasSubcategories && policy.mode === "by_subcategory") {
      setPolicy((p) => ({ ...p, mode: "global", perSubcategory: {} }));
    }
    if (!setup.hasCategories && scope !== "shared") {
      setScope("shared");
    }
  }, [setup.hasCategories, setup.hasSubcategories]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoriesFile = async (f: File) => {
    try {
      const list = await parseCategoriesCsv(f);
      setSetup((s) => ({ ...s, categoriesFileName: f.name, categoriesList: list }));
    } catch {
      toast({ title: "Could not parse file", description: "Use the sample CSV format.", variant: "destructive" });
    }
  };

  const handleSubcategoriesFile = async (f: File) => {
    try {
      const list = await parseSubcategoriesCsv(f);
      setSetup((s) => ({ ...s, subcategoriesFileName: f.name, subcategoriesList: list }));
    } catch {
      toast({ title: "Could not parse file", description: "Use the sample CSV format.", variant: "destructive" });
    }
  };

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (setup.hasCategories && categoriesList.length === 0) return false;
    if (setup.hasCategories && setup.hasSubcategories && subcategoriesList.length === 0) return false;
    if (renewalEnabled && (!policy.globalMonths || policy.globalMonths <= 0) && policy.mode === "global") return false;
    return true;
  }, [name, setup, categoriesList.length, subcategoriesList.length, renewalEnabled, policy]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const customModules = ["Issuance", ...(renewalEnabled ? ["Renewal"] : [])];
    const cleanSetup: TemplateSetup = {
      hasCategories: setup.hasCategories,
      hasSubcategories: setup.hasCategories ? setup.hasSubcategories : false,
      categoriesFileName: setup.hasCategories ? setup.categoriesFileName : undefined,
      subcategoriesFileName:
        setup.hasCategories && setup.hasSubcategories ? setup.subcategoriesFileName : undefined,
      categoriesList: setup.hasCategories ? categoriesList : undefined,
      subcategoriesList:
        setup.hasCategories && setup.hasSubcategories ? subcategoriesList : undefined,
    };

    const cleanPolicy: RenewalPolicy | undefined = renewalEnabled
      ? {
          mode: policy.mode,
          globalMonths: policy.globalMonths || 12,
          perCategory: setup.hasCategories ? policy.perCategory : {},
          perSubcategory: setup.hasCategories && setup.hasSubcategories ? policy.perSubcategory : {},
        }
      : undefined;

    const cleanScope: WorkflowScope = setup.hasCategories ? scope : "shared";

    updateService(service.id, {
      name: trimmed,
      customModules,
      templateSetup: cleanSetup,
      renewalPolicy: cleanPolicy,
      workflowScope: cleanScope,
    });

    // Re-seed form schemas only when category lists actually changed
    const prevCats = service.templateSetup?.categoriesList ?? [];
    const prevSubs = (service.templateSetup?.subcategoriesList ?? []).map(
      (s) => `${s.parent}::${s.name}`,
    );
    const nextSubs = (cleanSetup.subcategoriesList ?? []).map((s) => `${s.parent}::${s.name}`);
    const listsChanged =
      !arraysEqual(prevCats, cleanSetup.categoriesList ?? []) ||
      !arraysEqual(prevSubs, nextSubs);

    if (listsChanged) {
      saveFormSteps(service.id, "Issuance", seedFormSteps("Issuance", cleanSetup));
      if (renewalEnabled) {
        saveFormSteps(service.id, "Renewal", seedFormSteps("Renewal", cleanSetup));
      }
    }

    toast({ title: "Master template updated", description: "Service settings saved." });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Master Template Configuration</SheetTitle>
          <SheetDescription>
            Edit the foundational architecture, structure, and policies of this service.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="svc-name">Service name</Label>
            <Input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Modules */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Modules</h3>
              <p className="text-xs text-muted-foreground mt-0.5">System-supported journeys.</p>
            </div>
            <div className="rounded-md border border-border divide-y">
              <div className="flex items-center gap-3 p-3 bg-muted/30">
                <FileCheck className="h-4 w-4 text-accent" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground flex items-center gap-2">
                    Issuance
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-background border px-1.5 py-0.5 rounded text-muted-foreground">
                      <Lock className="h-3 w-3" /> Default
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3">
                <RefreshCw className={cn("h-4 w-4", renewalEnabled ? "text-accent" : "text-muted-foreground")} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Renewal</div>
                  <p className="text-xs text-muted-foreground">Allow citizens to renew existing licenses.</p>
                </div>
                <Switch checked={renewalEnabled} onCheckedChange={setRenewalEnabled} />
              </div>
            </div>
          </div>

          {/* Structure */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Structure</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Categories and subcategories for license classification.
              </p>
            </div>
            <div className="rounded-md border border-border divide-y">
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-foreground">Categories enabled</div>
                  <YesNo
                    value={setup.hasCategories}
                    onChange={(v) =>
                      setSetup((s) => ({
                        ...s,
                        hasCategories: v,
                        hasSubcategories: v ? s.hasSubcategories : false,
                        categoriesFileName: v ? s.categoriesFileName : undefined,
                        categoriesList: v ? s.categoriesList : undefined,
                        subcategoriesFileName: v ? s.subcategoriesFileName : undefined,
                        subcategoriesList: v ? s.subcategoriesList : undefined,
                      }))
                    }
                  />
                </div>
                {setup.hasCategories && (
                  <UploadField
                    id="cat-upload-edit"
                    fileName={setup.categoriesFileName}
                    itemCount={categoriesList.length}
                    itemLabel="categories"
                    sampleFilename="license-categories-sample.csv"
                    sampleCsv={CATEGORIES_SAMPLE_CSV}
                    onFile={handleCategoriesFile}
                    onClear={() =>
                      setSetup((s) => ({ ...s, categoriesFileName: undefined, categoriesList: [] }))
                    }
                  />
                )}
              </div>
              {setup.hasCategories && (
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-foreground">Subcategories enabled</div>
                    <YesNo
                      value={setup.hasSubcategories}
                      onChange={(v) =>
                        setSetup((s) => ({
                          ...s,
                          hasSubcategories: v,
                          subcategoriesFileName: v ? s.subcategoriesFileName : undefined,
                          subcategoriesList: v ? s.subcategoriesList : undefined,
                        }))
                      }
                    />
                  </div>
                  {setup.hasSubcategories && (
                    <UploadField
                      id="sub-upload-edit"
                      fileName={setup.subcategoriesFileName}
                      itemCount={subcategoriesList.length}
                      itemLabel="subcategories"
                      sampleFilename="license-subcategories-sample.csv"
                      sampleCsv={SUBCATEGORIES_SAMPLE_CSV}
                      onFile={handleSubcategoriesFile}
                      onClear={() =>
                        setSetup((s) => ({
                          ...s,
                          subcategoriesFileName: undefined,
                          subcategoriesList: [],
                        }))
                      }
                    />
                  )}
                </div>
              )}
            </div>
            {setup.hasCategories && categoriesList.length > 0 && (
              <div className="rounded-md border border-border overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 text-xs font-semibold text-foreground">
                  Trades ({categoriesList.length} categories
                  {setup.hasSubcategories ? `, ${subcategoriesList.length} subcategories` : ""})
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-9">Category</TableHead>
                      <TableHead className="h-9">Subcategory</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoriesList.map((cat) => {
                      const subs = setup.hasSubcategories
                        ? subcategoriesList.filter((s) => s.parent === cat)
                        : [];
                      if (subs.length === 0) {
                        return (
                          <TableRow key={cat}>
                            <TableCell className="py-2 text-sm">{cat}</TableCell>
                            <TableCell className="py-2 text-sm text-muted-foreground">—</TableCell>
                          </TableRow>
                        );
                      }
                      return subs.map((s, i) => (
                        <TableRow key={`${cat}-${s.name}`}>
                          <TableCell className="py-2 text-sm">{i === 0 ? cat : ""}</TableCell>
                          <TableCell className="py-2 text-sm">{s.name}</TableCell>
                        </TableRow>
                      ));
                    })}
                    <TableRow>
                      <TableCell className="py-2">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCategory();
                            }
                          }}
                          placeholder="Add category…"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={addCategory}
                          aria-label="Add category"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Renewal Policy */}
          {renewalEnabled && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Renewal policy</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  How long licenses stay valid before renewal is required.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <Step4RenewalPolicy
                  categories={categoriesList}
                  subcategories={subcategoriesList}
                  policy={policy}
                  setPolicy={setPolicy}
                  onContinue={() => {}}
                  hideHeader
                  hideContinue
                />
              </div>
            </div>
          )}

          {/* Workflow Scope */}
          {setup.hasCategories && categoriesList.length > 0 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Workflow scope</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Whether all categories share one workflow or each has its own.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <Step5WorkflowScope
                  value={scope}
                  onChange={setScope}
                  categoryCount={categoriesList.length}
                  onContinue={() => {}}
                  hideHeader
                  hideContinue
                />
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-background gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default MasterTemplateConfigurator;
