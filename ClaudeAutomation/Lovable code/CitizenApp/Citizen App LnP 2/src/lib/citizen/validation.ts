import type { FormField, FormStep } from "@/config/types";
import { ID_VALIDATION } from "@/config/maps";

export function isVisible(field: FormField, values: Record<string, unknown>): boolean {
  if (!field.showIf) return true;
  const v = values[field.showIf.fieldId];
  const eq = field.showIf.equals;
  if (Array.isArray(eq)) return eq.includes(String(v));
  return String(v) === String(eq);
}

export function validateField(
  field: FormField,
  raw: unknown,
  values: Record<string, unknown>
): string | null {
  if (!isVisible(field, values)) return null;
  const v = raw == null ? "" : String(raw).trim();
  if (field.required && !v) return `${field.label} is required`;
  if (!v) return null;

  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return "Enter a valid email";
  }

  // ID-type contextual validation
  if (field.id === "idNumber") {
    const idType = String(values["idType"] ?? "");
    const rule = ID_VALIDATION[idType];
    if (rule && !new RegExp(rule.regex).test(v)) return rule.message;
  }

  const r = field.validation;
  if (r) {
    if (r.regex && !new RegExp(r.regex).test(v)) return r.regexMessage ?? "Invalid value";
    if (r.minLength != null && v.length < r.minLength) return `Min ${r.minLength} characters`;
    if (r.maxLength != null && v.length > r.maxLength) return `Max ${r.maxLength} characters`;
    if (field.type === "number") {
      const n = Number(v);
      if (Number.isNaN(n)) return "Enter a number";
      if (r.min != null && n < r.min) return `Min ${r.min}`;
      if (r.max != null && n > r.max) return `Max ${r.max}`;
    }
    if (r.pastDateOnly) {
      const d = new Date(v);
      if (Number.isNaN(d.getTime()) || d.getTime() > Date.now()) return "Must be a past date";
    }
  }

  return null;
}

export function validateStep(
  step: FormStep,
  values: Record<string, unknown>,
  files: Record<string, { name: string } | undefined>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of step.fields) {
    if (!isVisible(f, values)) continue;
    if (f.type === "file") {
      if (f.required && !files[f.id]) errors[f.id] = `${f.label} is required`;
      continue;
    }
    const err = validateField(f, values[f.id], values);
    if (err) errors[f.id] = err;
  }
  return errors;
}