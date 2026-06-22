import type { FormField } from "@/config/types";
import { isVisible } from "@/lib/citizen/validation";
import { Upload, Check } from "lucide-react";

type Props = {
  field: FormField;
  values: Record<string, unknown>;
  files: Record<string, { name: string; size: number } | undefined>;
  error?: string;
  onChange: (id: string, value: unknown) => void;
  onFile: (id: string, file: File | null) => void;
};

export function FormFieldRenderer({ field, values, files, error, onChange, onFile }: Props) {
  if (!isVisible(field, values)) return null;

  const baseInput =
    "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30";
  const labelEl = (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {field.label}
      {field.required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  );

  let control: React.ReactNode = null;
  const v = values[field.id] ?? "";

  if (field.type === "textarea") {
    control = (
      <textarea
        rows={3}
        value={String(v)}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={baseInput}
      />
    );
  } else if (field.type === "dropdown") {
    let opts = field.options ?? [];
    if (field.dependsOn && field.dependsValueMap) {
      const depVal = String(values[field.dependsOn] ?? "");
      opts = field.dependsValueMap[depVal] ?? [];
    }
    control = (
      <select
        value={String(v)}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={baseInput}
      >
        <option value="">{field.placeholder ?? `Select ${field.label.toLowerCase()}`}</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  } else if (field.type === "radio") {
    control = (
      <div className="flex flex-wrap gap-2">
        {(field.options ?? []).map((o) => {
          const checked = String(v) === o.value;
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => onChange(field.id, o.value)}
              className={`rounded-md border px-3 py-2 text-sm font-medium ${
                checked
                  ? "border-brand-teal bg-brand-teal/10 text-brand-teal"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  } else if (field.type === "file") {
    const f = files[field.id];
    control = (
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-input bg-surface-muted px-3 py-3 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          {f ? <Check className="h-4 w-4 shrink-0 text-success" /> : <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <span className="truncate text-foreground">{f ? f.name : `Upload ${field.label}`}</span>
        </div>
        <span className="shrink-0 rounded-md bg-brand-navy px-2.5 py-1 text-xs font-semibold text-brand-navy-foreground">
          {f ? "Replace" : "Choose"}
        </span>
        <input
          type="file"
          accept={field.accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file && field.maxSizeMb && file.size > field.maxSizeMb * 1024 * 1024) {
              alert(`File exceeds ${field.maxSizeMb} MB`);
              return;
            }
            onFile(field.id, file);
          }}
        />
      </label>
    );
  } else {
    control = (
      <input
        type={field.type === "tel" ? "tel" : field.type === "date" ? "date" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
        value={String(v)}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={baseInput}
      />
    );
  }

  return (
    <div>
      {labelEl}
      {control}
      {field.helper && !error && (
        <p className="mt-1 text-[11px] text-muted-foreground">{field.helper}</p>
      )}
      {error && <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}