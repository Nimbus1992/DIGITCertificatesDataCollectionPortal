import { createFileRoute, Navigate, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FlowHeader } from "@/components/citizen/FlowHeader";
import { WizardProgress } from "@/components/citizen/WizardProgress";
import { WizardFooter } from "@/components/citizen/WizardFooter";
import { FormFieldRenderer } from "@/components/citizen/FormFieldRenderer";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import { useApplications, type StoredDocument } from "@/context/ApplicationsContext";
import { validateStep } from "@/lib/citizen/validation";
import { DEMO_APPLICANT, DEMO_DOCUMENTS } from "@/lib/citizen/seed";
import { toast } from "sonner";

export const Route = createFileRoute("/apply/$serviceId")({
  component: ApplyPage,
});

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function ApplyPage() {
  const { serviceId } = useParams({ from: "/apply/$serviceId" });
  const navigate = useNavigate();
  const { isAuthenticated, hydrated, session } = useAuth();
  const { getService } = useConfig();
  const { submitApplication, saveDraft, clearDraft, getDraft } = useApplications();

  const service = getService(serviceId);
  const draft = getDraft(serviceId);

  const [stepIdx, setStepIdx] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [docs, setDocs] = useState<StoredDocument[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hydratedDraft, setHydratedDraft] = useState(false);

  useEffect(() => {
    if (hydratedDraft || !service) return;
    if (draft && draft.serviceId === service.id) {
      setValues(draft.values);
      setStepIdx(Math.min(draft.stepIndex, service.form.length - 1));
      setDocs(draft.documents);
    } else if (service.id === "trade-license") {
      // Demo experience: prefill with realistic defaults but start the user
      // at Step 1 so they walk through the full wizard.
      const validSaMobile = /^[6-8]\d{8}$/;
      setValues({
        ...DEMO_APPLICANT,
        fullName: session?.name ?? DEMO_APPLICANT.fullName,
        mobile: session?.phone && validSaMobile.test(session.phone)
          ? session.phone
          : DEMO_APPLICANT.mobile,
      });
      setDocs(DEMO_DOCUMENTS);
      setStepIdx(0);
    } else if (session) {
      const validSaMobile = /^[6-8]\d{8}$/;
      setValues({
        fullName: session.name ?? "",
        mobile: session.phone && validSaMobile.test(session.phone) ? session.phone : "",
      });
    }
    setHydratedDraft(true);
  }, [draft, service, session, hydratedDraft]);

  const fileMeta = useMemo(() => {
    const m: Record<string, { name: string; size: number }> = {};
    for (const id in files) m[id] = { name: files[id].name, size: files[id].size };
    for (const d of docs) if (!m[d.fieldId]) m[d.fieldId] = { name: d.name, size: d.size };
    return m;
  }, [files, docs]);

  if (!hydrated) return <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (!service) return <Navigate to="/services" />;

  const step = service.form[stepIdx];
  const isLast = stepIdx === service.form.length - 1;

  function setValue(id: string, value: unknown) {
    setValues((prev) => {
      const next = { ...prev, [id]: value };
      // clear dependent field if parent changes
      for (const f of service!.form.flatMap((s) => s.fields)) {
        if (f.dependsOn === id && next[f.id]) next[f.id] = "";
      }
      return next;
    });
    setErrors((e) => ({ ...e, [id]: "" }));
  }

  function setFile(id: string, file: File | null) {
    setFiles((prev) => {
      const next = { ...prev };
      if (file) next[id] = file;
      else delete next[id];
      return next;
    });
    setErrors((e) => ({ ...e, [id]: "" }));
  }

  async function next() {
    const errs = validateStep(step, values, fileMeta);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }

    // persist any newly attached files for this step into docs
    const newDocs: StoredDocument[] = [...docs];
    for (const f of step.fields) {
      if (f.type !== "file") continue;
      const file = files[f.id];
      if (!file) continue;
      const dataUrl = await fileToDataUrl(file);
      const idx = newDocs.findIndex((d) => d.fieldId === f.id);
      const entry: StoredDocument = {
        fieldId: f.id,
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        uploadedAt: Date.now(),
      };
      if (idx >= 0) newDocs[idx] = entry;
      else newDocs.push(entry);
    }
    setDocs(newDocs);
    setFiles({});

    if (isLast) {
      setSubmitting(true);
      const app = submitApplication(service!, {
        applicantName: String(values.fullName ?? session?.name ?? "Citizen"),
        phone: String(values.mobile ?? session?.phone ?? ""),
        values,
        documents: newDocs,
      });
      clearDraft(service!.id);
      navigate({ to: "/success/$arn", params: { arn: app.id } });
      return;
    }

    saveDraft(service!.id, { stepIndex: stepIdx + 1, values, documents: newDocs });
    setStepIdx((i) => i + 1);
    window.scrollTo({ top: 0 });
  }

  function back() {
    if (stepIdx === 0) {
      navigate({ to: "/services" });
      return;
    }
    setStepIdx((i) => i - 1);
  }

  function skip() {
    if (!step.skippable) return;
    saveDraft(service!.id, { stepIndex: stepIdx + 1, values, documents: docs });
    setStepIdx((i) => Math.min(i + 1, service!.form.length - 1));
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[420px] flex-col bg-surface">
      <FlowHeader title="City of Cape Town" onBack={back} />
      <WizardProgress total={service.form.length} current={stepIdx} stepLabel={step.shortLabel} />
      <main className="flex-1 px-4 pt-3 pb-6">
        <div className="mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-orange">{service.name}</div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">{step.title}</h1>
          {step.subtitle && <p className="mt-1 text-xs text-muted-foreground">{step.subtitle}</p>}
        </div>
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          {step.fields.map((f) => (
            <FormFieldRenderer
              key={f.id}
              field={f}
              values={values}
              files={fileMeta}
              error={errors[f.id]}
              onChange={setValue}
              onFile={setFile}
            />
          ))}
        </div>
      </main>
      <WizardFooter
        onBack={back}
        onNext={next}
        nextLabel={isLast ? "Submit" : "Next"}
        showSkip={!!step.skippable && !isLast}
        onSkip={skip}
        submitting={submitting}
      />
    </div>
  );
}