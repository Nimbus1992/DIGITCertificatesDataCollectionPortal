import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  usePreview,
  type PreviewDocument,
  type FormFieldConfig,
  ID_VALIDATION,
} from "../PreviewContext";
import type { WizardStep, WizardField } from "@/data/wizardForm";
import CitizenScreenShell from "./_shell/CitizenScreenShell";
import WizardProgress from "./_shell/WizardProgress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, FileUp, X, FolderOpen, Repeat,
  FileText, AlertCircle, Sparkles, MapPin, Pencil,
} from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────
const todayISO = () => new Date().toISOString().slice(0, 10);

const isFieldVisible = (field: FormFieldConfig, formData: Record<string, string>) => {
  if (!field.showIf) return true;
  return formData[field.showIf.field] === field.showIf.equals;
};

const getDropdownOptions = (field: FormFieldConfig, formData: Record<string, string>): string[] => {
  if (field.dependsOn && field.dependsValueMap) {
    const parentVal = formData[field.dependsOn];
    return parentVal ? (field.dependsValueMap[parentVal] || []) : [];
  }
  return field.options || [];
};

const validateField = (
  field: FormFieldConfig,
  formData: Record<string, string>,
  docs: PreviewDocument[],
): string | null => {
  if (!isFieldVisible(field, formData)) return null;

  if (field.type === "file") {
    if (field.required && docs.filter(d => d.type === field.label).length === 0) {
      return `${field.label} is required`;
    }
    return null;
  }
  if (field.type === "checkbox") {
    if (field.required && formData[field.id] !== "true") return "You must confirm to proceed";
    return null;
  }
  const raw = (formData[field.id] || "").trim();
  if (field.required && !raw) return `${field.label} is required`;
  if (!raw) return null;
  const v = field.validation;
  if (v) {
    if (v.minLength && raw.length < v.minLength) return `Must be at least ${v.minLength} characters`;
    if (v.maxLength && raw.length > v.maxLength) return `Must be at most ${v.maxLength} characters`;
    if (v.pattern && !new RegExp(v.pattern).test(raw)) return v.patternMessage || "Invalid format";
    if (field.type === "number" || field.type === "tel") {
      const n = Number(raw);
      if (!Number.isNaN(n)) {
        if (v.min !== undefined && n < v.min) return `Minimum ${v.min}`;
        if (v.max !== undefined && n > v.max) return `Maximum ${v.max}`;
      }
    }
    if (field.type === "date" && v.pastDateOnly && raw >= todayISO()) return "Must be a date in the past";
  }
  if (field.id === "idNumber") {
    const idType = formData["idType"];
    const rule = idType ? ID_VALIDATION[idType] : undefined;
    if (rule && !rule.pattern.test(raw)) return rule.message;
  }
  return null;
};

// ─── Runtime sub-screen shape ──────────────────
// One entry per wizard sub-screen, derived from the canonical form steps
// edited in the FormBuilder.
interface SubScreen {
  step: number;          // 1-based step index used by WizardProgress
  stepName: string;
  title: string;
  subtitle?: string;
  fields: WizardField[];
  optional?: boolean;
  isMap?: boolean;
  helperBanner?: string;
}

const buildSubScreens = (steps: WizardStep[]): SubScreen[] => {
  const out: SubScreen[] = [];
  steps.forEach((step, sIdx) => {
    step.subScreens.forEach((sub) => {
      out.push({
        step: sIdx + 1,
        stepName: step.name,
        title: sub.title,
        subtitle: sub.subtitle,
        fields: sub.fields,
        optional: sub.optional,
        isMap: sub.isMap,
        helperBanner: sub.helperBanner,
      });
    });
  });
  return out;
};

// ─── Component ──────────────────────────────────
const ApplicationForm: React.FC = () => {
  const {
    formSections, serviceName, submitApplication, submitRenewal, getFormSteps,
    setScreen, screen, applications, userDocuments,
  } = usePreview();

  const isRenewal = screen.type === "renew";
  const parentApp = isRenewal && screen.parentLicenseId
    ? applications.find((a) => a.id === screen.parentLicenseId)
    : undefined;

  const draftKey = `tl-draft-${parentApp?.id ?? "new"}`;

  const steps = useMemo(
    () => getFormSteps(isRenewal ? "RENEWAL" : "NEW"),
    [getFormSteps, isRenewal],
  );
  const subScreens = useMemo(() => buildSubScreens(steps), [steps]);
  const stepNames = useMemo(() => steps.map((s) => s.name), [steps]);
  const totalSteps = stepNames.length || 1;
  const reviewIndex = subScreens.length;

  const [stepIndex, setStepIndex] = useState(0); // 0..SUB_SCREENS.length (last = review)
  const [formData, setFormData] = useState<Record<string, string>>(parentApp ? { ...parentApp.formData } : {});
  const [docs, setDocs] = useState<PreviewDocument[]>(parentApp ? [...parentApp.documents] : []);
  const [pickerField, setPickerField] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [draftRestored, setDraftRestored] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [declaration, setDeclaration] = useState(false);
  const initRef = useRef(false);
  const reviewScrollRef = useRef<HTMLDivElement | null>(null);

  // Field index lookup
  const fieldsById = useMemo(() => {
    const m: Record<string, FormFieldConfig> = {};
    formSections.forEach(s => s.fields.forEach(f => { m[f.id] = f; }));
    return m;
  }, [formSections]);

  // Restore draft
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (isRenewal) return;
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (parsed.formData) setFormData(parsed.formData);
        if (Array.isArray(parsed.docs)) setDocs(parsed.docs);
        if (typeof parsed.stepIndex === "number") setStepIndex(parsed.stepIndex);
        setDraftRestored(true);
      }
    } catch { /* ignore */ }
  }, [draftKey, isRenewal]);

  // Persist
  useEffect(() => {
    if (!initRef.current) return;
    const handle = setTimeout(() => {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify({ stepIndex, formData, docs, currentStep: stepIndex }));
      } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(handle);
  }, [stepIndex, formData, docs, draftKey]);

  const isReview = stepIndex >= reviewIndex;
  const sub = !isReview ? subScreens[stepIndex] : null;

  const visibleFields = useMemo(() => {
    if (!sub) return [] as WizardField[];
    return sub.fields.filter((f) => isFieldVisible(f as unknown as FormFieldConfig, formData));
  }, [sub, formData]);
  const visibleFieldIds = useMemo(() => visibleFields.map((f) => f.id), [visibleFields]);

  const errors = useMemo(() => {
    if (!sub) return {} as Record<string, string>;
    const out: Record<string, string> = {};
    visibleFields.forEach((wf) => {
      const f = fieldsById[wf.id] ?? (wf as unknown as FormFieldConfig);
      const err = validateField(f, formData, docs);
      if (err) out[wf.id] = err;
    });
    return out;
  }, [sub, visibleFields, fieldsById, formData, docs]);

  const subValid = Object.keys(errors).length === 0;

  const updateField = (fieldId: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldId]: value };
      steps.forEach((st) =>
        st.subScreens.forEach((s) =>
          s.fields.forEach((f) => {
            if (f.dependsOn === fieldId) next[f.id] = "";
            if (f.showIf?.field === fieldId && f.showIf.equals !== value) next[f.id] = "";
          }),
        ),
      );
      return next;
    });
  };

  const addMockDoc = (label: string) => {
    setDocs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `${label.toLowerCase().replace(/\s+/g, "-")}.pdf`, type: label, uploadedAt: Date.now(), status: "Pending" },
    ]);
  };
  const addReusedDoc = (userDocId: string, label: string) => {
    const userDoc = userDocuments.find((d) => d.id === userDocId);
    if (!userDoc) return;
    setDocs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: userDoc.name, type: label, uploadedAt: Date.now(), status: "Pending", reused: true },
    ]);
  };
  const removeDoc = (idx: number) => setDocs((prev) => prev.filter((_, i) => i !== idx));

  const discardDraft = () => {
    sessionStorage.removeItem(draftKey);
    setFormData({});
    setDocs([]);
    setStepIndex(0);
    setTouched({});
    setDraftRestored(false);
  };

  const handleNext = () => {
    if (isReview) {
      if (!declaration) { toast.error("Please confirm the declaration"); return; }
      const result = isRenewal && parentApp
        ? submitRenewal(parentApp.id, formData, docs)
        : submitApplication(formData, docs);
      try { sessionStorage.removeItem(draftKey); } catch { /* ignore */ }
      if (result.paymentPending) {
        setScreen({ type: "payment", applicationId: result.id });
      } else {
        setScreen({ type: "success", applicationId: result.id });
      }
      return;
    }
    if (!subValid) {
      const t = { ...touched };
      visibleFieldIds.forEach(id => { t[id] = true; });
      setTouched(t);
      toast.error("Please complete required fields", { description: "Some fields need attention before continuing." });
      return;
    }
    setStepIndex(i => i + 1);
  };

  const handleBack = () => {
    if (stepIndex === 0) { setScreen({ type: "apply_intro" }); return; }
    setStepIndex(i => i - 1);
  };

  const handleSkip = () => {
    setStepIndex(i => i + 1);
  };

  const showError = (id: string) => touched[id] && errors[id];

  // Scroll-gating for declaration
  useEffect(() => {
    if (!isReview) { setScrolledToBottom(false); setDeclaration(false); return; }
    // Find the actual scroll container (a parent with overflow-y auto/scroll).
    let el: HTMLElement | null = reviewScrollRef.current?.parentElement ?? null;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === "auto" || oy === "scroll") break;
      el = el.parentElement;
    }
    if (!el) return;
    const scroller = el;
    const check = () => {
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8) {
        setScrolledToBottom(true);
      }
    };
    const raf = requestAnimationFrame(check);
    scroller.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
    ro?.observe(scroller);
    if (reviewScrollRef.current) ro?.observe(reviewScrollRef.current);
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      ro?.disconnect();
    };
  }, [isReview]);

  // ─── Render a single field ───
  const renderField = (field: FormFieldConfig) => {
    const err = showError(field.id);
    const labelEl = field.type !== "checkbox" && (
      <Label className="text-sm" style={{ color: "#1D3557" }}>
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
    );

    let control: React.ReactNode = null;

    if (field.type === "dropdown") {
      const opts = getDropdownOptions(field, formData);
      const disabled = !!field.dependsOn && opts.length === 0;
      control = (
        <Select
          value={formData[field.id] || ""}
          onValueChange={(v) => { updateField(field.id, v); setTouched(t => ({ ...t, [field.id]: true })); }}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white" onBlur={() => setTouched(t => ({ ...t, [field.id]: true }))}>
            <SelectValue placeholder={disabled ? field.placeholder : (field.placeholder || "Select...")} />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {opts.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    } else if (field.type === "radio") {
      control = (
        <div className="flex gap-2">
          {(field.options || []).map((opt) => {
            const selected = formData[field.id] === opt;
            return (
              <button
                key={opt} type="button"
                onClick={() => { updateField(field.id, opt); setTouched(t => ({ ...t, [field.id]: true })); }}
                className="flex-1 px-3 py-2 rounded-md text-xs font-medium border transition"
                style={{
                  backgroundColor: selected ? "#1D3557" : "#F5F7FA",
                  color: selected ? "#FFFFFF" : "#363636",
                  borderColor: selected ? "#1D3557" : "#E0E0E0",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    } else if (field.type === "date") {
      control = (
        <Input type="date"
          max={field.validation?.pastDateOnly ? todayISO() : undefined}
          value={formData[field.id] || ""}
          onChange={(e) => updateField(field.id, e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, [field.id]: true }))}
          className="bg-white" />
      );
    } else if (field.type === "checkbox") {
      control = (
        <label className="flex items-start gap-2 rounded-md border bg-card p-3 cursor-pointer" style={{ borderColor: "#E0E0E0" }}>
          <Checkbox
            checked={formData[field.id] === "true"}
            onCheckedChange={(c) => { updateField(field.id, c ? "true" : ""); setTouched(t => ({ ...t, [field.id]: true })); }}
            className="mt-0.5"
          />
          <span className="text-xs leading-snug" style={{ color: "#1D3557" }}>
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </span>
        </label>
      );
    } else if (field.type === "file") {
      control = (
        <div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button"
              onClick={() => { addMockDoc(field.label); setTouched(t => ({ ...t, [field.id]: true })); }}
              className="border-2 border-dashed rounded-lg p-2.5 text-center text-[11px] flex items-center justify-center gap-1.5"
              style={{ borderColor: "#1D3557", color: "#1D3557", backgroundColor: "#EAF2FB" }}>
              <FileUp className="h-3.5 w-3.5" /> Upload New
            </button>
            <button type="button"
              onClick={() => { setPickerField(field.label); setTouched(t => ({ ...t, [field.id]: true })); }}
              className="border-2 border-dashed rounded-lg p-2.5 text-center text-[11px] flex items-center justify-center gap-1.5"
              style={{ borderColor: "#F4A261", color: "#A0522D", backgroundColor: "#FFF3E5" }}>
              <FolderOpen className="h-3.5 w-3.5" /> My Documents
            </button>
          </div>
          <p className="text-[10px] mt-1" style={{ color: "#6B7280" }}>PDF / JPG / PNG · max 5 MB</p>
          <div className="mt-2 space-y-1">
            {docs.filter((d) => d.type === field.label).map((d) => {
              const idx = docs.findIndex((x) => x.id === d.id);
              return (
                <div key={d.id} className="flex items-center justify-between text-[11px] rounded px-2 py-1" style={{ backgroundColor: "#F5F7FA" }}>
                  <span className="truncate flex items-center gap-1.5">
                    <span className="truncate">{d.name}</span>
                    {d.reused && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                        <Repeat className="h-2.5 w-2.5" /> Reused
                      </span>
                    )}
                  </span>
                  <button onClick={() => removeDoc(idx)} className="text-destructive shrink-0 ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      control = (
        <Input
          type={field.type === "number" || field.type === "tel" ? "tel" : (field.type === "email" ? "email" : "text")}
          placeholder={field.placeholder || ""}
          value={formData[field.id] || ""}
          onChange={(e) => updateField(field.id, e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, [field.id]: true }))}
          className="bg-white"
        />
      );
    }

    // Per-field helper override for ID
    let helper = field.helpText;
    if (field.id === "idNumber" && formData["idType"]) {
      const rule = ID_VALIDATION[formData["idType"]];
      if (rule) helper = rule.message;
    }

    return (
      <div key={field.id} className={`space-y-1.5 ${field.showIf ? "animate-in fade-in slide-in-from-top-1" : ""}`}>
        {labelEl}
        {control}
        {helper && !err && <p className="text-[10px]" style={{ color: "#6B7280" }}>{helper}</p>}
        {err && (
          <p className="text-[10px] text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {errors[field.id]}
          </p>
        )}
      </div>
    );
  };

  // ─── Sticky footer for wizard sub-screens ───
  const wizardFooter = (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleBack} className="gap-1 flex-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <Button
          size="sm"
          onClick={handleNext}
          className="flex-1 gap-1 text-white"
          style={{ backgroundColor: "#F4A261" }}
        >
          Next <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      {sub?.optional && (
        <button onClick={handleSkip} className="w-full text-[11px] text-center" style={{ color: "#6B7280" }}>
          Skip for now
        </button>
      )}
    </div>
  );

  // ─── Review footer (sticky declaration + submit) ───
  const reviewFooter = (
    <div className="space-y-2">
      <label className={`flex items-start gap-2 rounded-md border p-2.5 ${scrolledToBottom ? "" : "opacity-60"}`} style={{ borderColor: "#E0E0E0", backgroundColor: scrolledToBottom ? "#FFF" : "#F5F7FA" }}>
        <Checkbox
          checked={declaration}
          disabled={!scrolledToBottom}
          onCheckedChange={(c) => setDeclaration(!!c)}
          className="mt-0.5"
        />
        <span className="text-[11px] leading-snug" style={{ color: "#1D3557" }}>
          I confirm that all the details provided are correct
        </span>
      </label>
      {!scrolledToBottom && (
        <p className="text-[10px] text-center" style={{ color: "#6B7280" }}>
          Scroll to the bottom to confirm
        </p>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleBack} className="gap-1 flex-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!declaration}
          className="flex-1 gap-1 text-white disabled:opacity-50"
          style={{ backgroundColor: "#1D3557" }}
        >
          Submit <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  // ─── Render review ───
  if (isReview) {
    // Map field ids to first sub-screen index for "Edit"
    const fieldToSub: Record<string, number> = {};
    subScreens.forEach((s, i) =>
      s.fields.forEach((f) => { if (!(f.id in fieldToSub)) fieldToSub[f.id] = i; }),
    );

    return (
      <>
        <CitizenScreenShell
          onBack={handleBack}
          backLabel="Back"
          progress={<WizardProgress step={totalSteps} total={totalSteps} stepName="Review" />}
          footer={reviewFooter}
        >
          <div ref={reviewScrollRef} className="h-full">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-3" style={{ border: "1px solid #E0E0E0" }}>
              <h2 className="text-base font-bold leading-snug" style={{ color: "#1D3557" }}>
                Review your application
              </h2>
              <p className="text-[11px] mt-1" style={{ color: "#6B7280" }}>
                Check each section carefully before submitting.
              </p>
            </div>

            <div className="space-y-3">
              {formSections.map((sec) => {
                if (sec.fields.every(f => f.type === "checkbox")) return null; // declaration handled in footer
                const isDocs = sec.fields.some((f) => f.type === "file");
                const visibleFields = sec.fields.filter(
                  (f) => isFieldVisible(f, formData) && f.type !== "file" && f.type !== "checkbox"
                );
                const firstFieldId = sec.fields[0]?.id;
                const editIdx = firstFieldId !== undefined ? fieldToSub[firstFieldId] ?? 0 : 0;

                return (
                  <div key={sec.id} className="bg-white rounded-xl shadow-sm p-3" style={{ border: "1px solid #E0E0E0" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#1D3557" }}>{sec.name}</p>
                      <button onClick={() => setStepIndex(editIdx)} className="text-[10px] font-medium inline-flex items-center gap-1" style={{ color: "#F4A261" }}>
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    </div>
                    {isDocs ? (
                      docs.length === 0 ? (
                        <p className="text-[11px]" style={{ color: "#6B7280" }}>No documents uploaded.</p>
                      ) : (
                        <ul className="text-[11px] space-y-0.5">
                          {docs.map((d) => (
                            <li key={d.id} className="flex items-center gap-1.5" style={{ color: "#363636" }}>
                              • {d.type} — {d.name}
                              {d.reused && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  <Repeat className="h-2.5 w-2.5" /> Reused
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )
                    ) : visibleFields.length === 0 ? (
                      <p className="text-[11px]" style={{ color: "#6B7280" }}>No details provided.</p>
                    ) : (
                      <dl className="grid grid-cols-2 gap-y-1 text-[11px]">
                        {visibleFields.map((f) => (
                          <React.Fragment key={f.id}>
                            <dt style={{ color: "#6B7280" }}>{f.label}</dt>
                            <dd className="font-medium" style={{ color: "#1D3557" }}>{formData[f.id] || "—"}</dd>
                          </React.Fragment>
                        ))}
                      </dl>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CitizenScreenShell>

        <Dialog open={pickerField !== null} onOpenChange={(o) => !o && setPickerField(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-indigo-500" /> Pick from My Documents
              </DialogTitle>
              <DialogDescription>
                Select a document to attach as <span className="font-semibold">{pickerField}</span>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPickerField(null)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ─── Render wizard sub-screen ───
  if (!sub) return null;

  return (
    <>
      <CitizenScreenShell
        onBack={handleBack}
        backLabel="Back"
        progress={<WizardProgress step={sub.step} total={totalSteps} stepName={sub.stepName} />}
        footer={wizardFooter}
      >
        {draftRestored && !isRenewal && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[10px]"
            style={{ backgroundColor: "#FFF3E5", border: "1px solid #F4A261", color: "#A0522D" }}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Draft restored — continue where you left off.
            </span>
            <button onClick={discardDraft} className="underline font-medium">Discard</button>
          </div>
        )}

        {isRenewal && (
          <div className="mb-2 rounded-md px-2.5 py-1.5 text-[10px]"
            style={{ backgroundColor: "#EAF2FB", border: "1px solid #1D3557", color: "#1D3557" }}>
            Renewing {serviceName} — details pre-filled from your existing license.
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4" style={{ border: "1px solid #E0E0E0" }}>
          <h2 className="text-[15px] font-bold leading-snug mb-1" style={{ color: "#1D3557" }}>
            {sub.title}
          </h2>
          {sub.subtitle && (
            <p className="text-[11px] mb-3" style={{ color: "#6B7280" }}>{sub.subtitle}</p>
          )}

          {sub.helperBanner && (
            <div className="mb-3 rounded-md p-2 text-[11px]" style={{ backgroundColor: "#EAF2FB", color: "#1D3557" }}>
              {sub.helperBanner}
            </div>
          )}

          {sub.isMap ? (
            <div className="space-y-3">
              <Input placeholder="Search by pincode or area" className="bg-white" />
              <div className="relative h-44 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: "#EAF2FB", border: "1px dashed #1D3557" }}>
                <div className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }} />
                <div className="relative text-center">
                  <MapPin className="h-7 w-7 mx-auto" style={{ color: "#F4A261" }} />
                  <p className="text-[10px] mt-1" style={{ color: "#1D3557" }}>Long press to drop a pin</p>
                </div>
              </div>
              <Button
                onClick={() => setStepIndex(i => i + 1)}
                className="w-full text-white"
                style={{ backgroundColor: "#1D3557" }}
              >
                Confirm Location
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {visibleFields
                .map((wf) => fieldsById[wf.id] ?? (wf as unknown as FormFieldConfig))
                .map(renderField)}
            </div>
          )}
        </div>
      </CitizenScreenShell>

      <Dialog open={pickerField !== null} onOpenChange={(o) => !o && setPickerField(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-indigo-500" /> Pick from My Documents
            </DialogTitle>
            <DialogDescription>
              Select a document to attach as <span className="font-semibold">{pickerField}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {userDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                You haven't uploaded any documents yet. Visit "My Documents" from the home screen to add some.
              </p>
            ) : (
              userDocuments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { if (pickerField) addReusedDoc(d.id, pickerField); setPickerField(null); }}
                  className="w-full text-left flex items-center gap-3 rounded-lg border p-3 hover:bg-indigo-50/50"
                >
                  <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.type} • {new Date(d.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerField(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationForm;
