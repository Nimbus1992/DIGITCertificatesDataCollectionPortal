import { useState } from "react";
import type { ImplementationConfig, FormConfig, FormDocument, CustomFormField, FieldType, DeploymentConfig } from "../types";
import { StepWrapper } from "./StepWrapper";
import { Plus, Trash2, Lock, Info, Pencil, AlertTriangle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  config: ImplementationConfig;
  updateConfig: <K extends keyof ImplementationConfig>(key: K, value: ImplementationConfig[K]) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
}

interface RecommendedField {
  name: string;
  fieldType: FieldType;
  mandatory: boolean;
  validation: string;
  removable: boolean;
}

interface RecommendedSubsection {
  name: string; // "" means no label
  fields: RecommendedField[];
}

interface RecommendedSection {
  id: string;
  title: string;
  borderColor: string;
  canAddFields: boolean;
  canAddSubsections: boolean;
  subsections: RecommendedSubsection[];
}

// ── Hardcoded recommended sections ───────────────────────────────────────────

// All recommended fields support inline editing except ID Type (managed via chips)

const RECOMMENDED_SECTIONS: RecommendedSection[] = [
  {
    id: "applicant",
    title: "Applicant Details",
    borderColor: "border-blue-500",
    canAddFields: true,
    canAddSubsections: false,
    subsections: [
      {
        name: "",
        fields: [
          { name: "Full Name",     fieldType: "text",     mandatory: true,  validation: "Min 3 characters", removable: false },
          { name: "Mobile Number", fieldType: "phone",    mandatory: true,  validation: "10-digit number",  removable: false },
          { name: "Email Address", fieldType: "email",    mandatory: false, validation: "—",                      removable: false },
          { name: "ID Type",       fieldType: "dropdown", mandatory: true,  validation: "From accepted ID types",  removable: false },
          { name: "ID Number",     fieldType: "text",     mandatory: true,  validation: "—",                      removable: false },
        ],
      },
      {
        name: "Applicant Address",
        fields: [
          { name: "House No / Apartment Name", fieldType: "text", mandatory: true,  validation: "—",              removable: false },
          { name: "Address Line 1",            fieldType: "text", mandatory: true,  validation: "—",              removable: false },
          { name: "Address Line 2",            fieldType: "text", mandatory: false, validation: "—",              removable: false },
          { name: "Postal Code",               fieldType: "text", mandatory: true,  validation: "6-digit number", removable: false },
        ],
      },
    ],
  },
  {
    id: "business",
    title: "Business Details",
    borderColor: "border-emerald-500",
    canAddFields: true,
    canAddSubsections: true,
    subsections: [
      {
        name: "General",
        fields: [
          { name: "Business / Trade Name",        fieldType: "text",     mandatory: true,  validation: "Min 3 characters",           removable: false },
          { name: "Trade Category",               fieldType: "dropdown", mandatory: true,  validation: "—",  removable: false },
          { name: "Sub-category",                 fieldType: "dropdown", mandatory: true,  validation: "—",  removable: false },
          { name: "Business Registration Number", fieldType: "text",     mandatory: false, validation: "15-char alphanumeric",        removable: true  },
          { name: "Tax Identification Number",    fieldType: "text",     mandatory: false, validation: "10-char alphanumeric",        removable: true  },
          { name: "Year of Establishment",        fieldType: "year",     mandatory: true,  validation: "—",                          removable: false },
        ],
      },
      {
        name: "Business Address",
        fields: [
          { name: "House No / Apartment Name", fieldType: "text", mandatory: true,  validation: "—",              removable: false },
          { name: "Address Line 1",            fieldType: "text", mandatory: true,  validation: "—",              removable: false },
          { name: "Address Line 2",            fieldType: "text", mandatory: false, validation: "—",              removable: false },
          { name: "Postal Code",               fieldType: "text", mandatory: true,  validation: "6-digit number", removable: false },
        ],
      },
      {
        name: "Operations Details",
        fields: [
          { name: "Business Area",          fieldType: "number",   mandatory: true,  validation: "In sq ft, min 1", removable: false },
          { name: "Number of Employees",    fieldType: "number",   mandatory: true,  validation: "Min 1",           removable: false },
          { name: "Operating Hours",        fieldType: "text",     mandatory: false, validation: "—",               removable: true  },
          { name: "Is Business Hazardous?", fieldType: "dropdown", mandatory: true,  validation: "Yes / No",        removable: false },
        ],
      },
    ],
  },
  {
    id: "declaration",
    title: "Declaration",
    borderColor: "border-amber-500",
    canAddFields: false,
    canAddSubsections: false,
    subsections: [
      {
        name: "",
        fields: [
          { name: "I declare all information provided is true", fieldType: "checkbox", mandatory: true, validation: "—", removable: false },
          { name: "I agree to the Terms and Conditions",        fieldType: "checkbox", mandatory: true, validation: "—", removable: false },
        ],
      },
    ],
  },
];

const FIELD_TYPES: FieldType[] = [
  "text", "number", "date", "year", "dropdown", "phone",
  "email", "textarea", "checkbox", "file",
];

// ── Utility ───────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function labelFieldType(ft: FieldType): string {
  const map: Record<FieldType, string> = {
    text: "Text", number: "Number", date: "Date", year: "Year",
    dropdown: "Dropdown", phone: "Phone", email: "Email",
    textarea: "Textarea", checkbox: "Checkbox", file: "File",
  };
  return map[ft] ?? ft;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface AddFieldFormProps {
  sectionId: string;
  onAdd: (field: CustomFormField) => void;
  onCancel: () => void;
}

function AddFieldForm({ sectionId, onAdd, onCancel }: AddFieldFormProps) {
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [mandatory, setMandatory] = useState(false);
  const [validation, setValidation] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      id: uid(),
      sectionId,
      subsectionName: "",
      name: trimmed,
      fieldType,
      mandatory,
      validation: validation.trim() || "—",
      ...(fieldType === "dropdown" ? { dropdownOptions } : {}),
    });
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Add Custom Field</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Field Name</label>
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. Alternate Phone"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Field Type</label>
          <select
            className={inputCls}
            value={fieldType}
            onChange={(e) => { setFieldType(e.target.value as FieldType); setDropdownOptions([]); }}
          >
            {FIELD_TYPES.map((ft) => (
              <option key={ft} value={ft}>{labelFieldType(ft)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Validation / Notes</label>
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. Max 100 characters"
            value={validation}
            onChange={(e) => setValidation(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setMandatory((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${mandatory ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${mandatory ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
            <span className="text-sm text-slate-700">Mandatory</span>
          </label>
        </div>
      </div>

      {/* Dropdown options — shown only when type = dropdown */}
      {fieldType === "dropdown" && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
          <label className="block text-xs text-slate-500 font-medium">Dropdown Options</label>
          {dropdownOptions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dropdownOptions.map((opt, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  {opt}
                  <button
                    type="button"
                    onClick={() => setDropdownOptions(dropdownOptions.filter((_, idx) => idx !== i))}
                    className="text-blue-400 hover:text-red-500 ml-0.5 leading-none"
                  >×</button>
                </span>
              ))}
            </div>
          )}
          <DocTypeAdder
            onAdd={(val) => { if (val && !dropdownOptions.includes(val)) setDropdownOptions([...dropdownOptions, val]); }}
          />
          {dropdownOptions.length === 0 && (
            <p className="text-xs text-slate-400 italic">No options added yet — type an option above and press Enter or +</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Field
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface AddSubsectionFormProps {
  onAdd: (name: string) => void;
  onCancel: () => void;
}

function AddSubsectionForm({ onAdd, onCancel }: AddSubsectionFormProps) {
  const [name, setName] = useState("");

  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Add Custom Subsection</p>
      <div className="flex items-center gap-3">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          placeholder="e.g. Bank Details"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => { if (name.trim()) onAdd(name.trim()); }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

interface EditedFieldOverride {
  name?: string; fieldType?: string; mandatory?: boolean; validation?: string;
}

interface SectionCardProps {
  section: RecommendedSection;
  customFields: CustomFormField[];
  customSubsections: string[];
  deletedRecommendedFields: string[];
  editedRecommendedFields: Record<string, EditedFieldOverride>;
  idTypes: string[];
  onIdTypesChange: (vals: string[]) => void;
  onAddField: (field: CustomFormField) => void;
  onDeleteField: (id: string) => void;
  onDeleteRecommendedField: (name: string) => void;
  onEditRecommendedField: (originalName: string, override: EditedFieldOverride) => void;
  onAddSubsection: (name: string) => void;
  onDeleteSubsection: (name: string) => void;
  deployment: DeploymentConfig;
  declarationMobileOtpEnabled: boolean;
  onToggleDeclarationOtp: () => void;
}

function SectionCard({
  section,
  customFields,
  customSubsections,
  deletedRecommendedFields,
  editedRecommendedFields,
  idTypes,
  onIdTypesChange,
  onAddField,
  onDeleteField,
  onDeleteRecommendedField,
  onEditRecommendedField,
  onAddSubsection,
  onDeleteSubsection,
  deployment,
  declarationMobileOtpEnabled,
  onToggleDeclarationOtp,
}: SectionCardProps) {
  const [showAddField, setShowAddField] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [lockedMsg, setLockedMsg] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditedFieldOverride>({});

  const renderBoundaryRows = (subName: string) => {
    const { availabilityScope, areas } = deployment;
    const hasAreas = areas.some((a) => a.city.trim());
    const isSelectScope = availabilityScope !== "entire_state";
    const badgeCls = "inline-block px-2 py-0.5 rounded-md text-xs font-medium";
    const fromBadge = <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 font-normal ml-1">Boundary</span>;
    const lockCell = <td className="px-4 py-2.5 text-center"><Lock size={13} className="text-slate-200 mx-auto" /></td>;
    const rowCls = "bg-indigo-50/20";

    if (isSelectScope && !hasAreas) {
      return (
        <tr key={`${subName}-boundary-warn`}>
          <td colSpan={5} className="px-4 py-2">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              <span>Boundary not configured. Go to <strong>Step 3 — Boundary</strong> and add your cities/districts — they will appear as dropdown fields in this address.</span>
            </div>
          </td>
        </tr>
      );
    }

    const areaLabel = availabilityScope === "select_districts" ? "District" : "City";
    const hasZones = areas.some((a) => a.zones.some((z) => z.trim()));

    if (availabilityScope === "entire_state") {
      return (
        <tr key={`${subName}-city`} className={rowCls}>
          <td className="px-4 py-2.5 text-sm text-slate-800 font-medium"><span className="flex items-center">City / Area{fromBadge}</span></td>
          <td className="px-4 py-2.5"><span className={`${badgeCls} bg-slate-100 text-slate-600`}>Text</span></td>
          <td className="px-4 py-2.5"><span className={`${badgeCls} bg-red-50 text-red-600`}>Required</span></td>
          <td className="px-4 py-2.5 text-xs text-slate-500">State-wide — free text</td>
          {lockCell}
        </tr>
      );
    }

    const cityValues = areas.map((a) => a.city).filter(Boolean).join(", ");
    return (
      <>
        <tr key={`${subName}-area`} className={rowCls}>
          <td className="px-4 py-2.5 text-sm text-slate-800 font-medium"><span className="flex items-center">{areaLabel}{fromBadge}</span></td>
          <td className="px-4 py-2.5"><span className={`${badgeCls} bg-slate-100 text-slate-600`}>Dropdown</span></td>
          <td className="px-4 py-2.5"><span className={`${badgeCls} bg-red-50 text-red-600`}>Required</span></td>
          <td className="px-4 py-2.5 text-xs text-slate-500">{cityValues || `Configured ${areaLabel.toLowerCase()}s`}</td>
          {lockCell}
        </tr>
        {hasZones && (
          <tr key={`${subName}-zone`} className={rowCls}>
            <td className="px-4 py-2.5 text-sm text-slate-800 font-medium"><span className="flex items-center">Zone / Ward{fromBadge}</span></td>
            <td className="px-4 py-2.5"><span className={`${badgeCls} bg-slate-100 text-slate-600`}>Dropdown</span></td>
            <td className="px-4 py-2.5"><span className={`${badgeCls} bg-slate-100 text-slate-500`}>Optional</span></td>
            <td className="px-4 py-2.5 text-xs text-slate-500">Linked to selected {areaLabel.toLowerCase()}</td>
            {lockCell}
          </tr>
        )}
      </>
    );
  };

  const sectionCustomFields = customFields.filter((f) => f.sectionId === section.id);

  const handleAddField = (field: CustomFormField) => {
    onAddField(field);
    setShowAddField(false);
  };

  const handleAddSubsection = (name: string) => {
    onAddSubsection(name);
    setShowAddSub(false);
  };

  const CATEGORY_FIELDS = new Set(["Trade Category", "Sub-category"]);

  const handleLockedClick = (fieldName: string) => {
    setLockedMsg(fieldName);
    setTimeout(() => setLockedMsg(null), 3000);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden border-t-4 ${section.borderColor}`}>
      {/* Card header */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{section.title}</h3>
      </div>

      {/* Locked field message */}
      {lockedMsg && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          <Lock size={12} className="shrink-0 text-amber-500" />
          {CATEGORY_FIELDS.has(lockedMsg) ? (
            <span><strong>{lockedMsg}</strong> values come from your <strong>Overall Configuration</strong> (Step 5). To add or remove categories, go back to the Overall Configuration step.</span>
          ) : (
            <span><strong>{lockedMsg}</strong> is part of the standard template and cannot be removed.</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Actions</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Field Name</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Type</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Required</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Validation / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {section.subsections.map((sub, si) => (
              <>
                {sub.name && (
                  <tr key={`sub-${si}`} className="bg-slate-50">
                    <td colSpan={5} className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {sub.name}
                    </td>
                  </tr>
                )}
                {sub.fields
                  .filter((field) => !deletedRecommendedFields.includes(field.name))
                  .map((field, fi) => {
                    const isIdType = field.name === "ID Type";
                    const isSystemMandatory = field.mandatory && !field.removable;
                    const override = editedRecommendedFields[field.name] ?? {};
                    const displayName = override.name ?? field.name;
                    const displayType = (override.fieldType ?? field.fieldType) as FieldType;
                    const displayMandatory = override.mandatory ?? field.mandatory;
                    const displayValidation = override.validation ?? field.validation;
                    const isEditingThis = editingField === field.name;

                    const lockedCls = "w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm bg-slate-100 text-slate-400 cursor-not-allowed";
                    const editCls   = "w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white";

                    if (isEditingThis) {
                      return (
                        <tr key={`${si}-${fi}`}>
                          <td colSpan={5} className="px-4 py-3 bg-blue-50/50 border-l-2 border-blue-400">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              {/* Field Name */}
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Field Name</label>
                                <input
                                  type="text"
                                  disabled={isSystemMandatory}
                                  value={editDraft.name ?? displayName}
                                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                                  className={isSystemMandatory ? lockedCls : editCls}
                                />
                              </div>
                              {/* Type */}
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Type</label>
                                <select
                                  disabled={isSystemMandatory}
                                  value={editDraft.fieldType ?? displayType}
                                  onChange={(e) => setEditDraft({ ...editDraft, fieldType: e.target.value })}
                                  className={isSystemMandatory ? lockedCls : editCls}
                                >
                                  {FIELD_TYPES.map((ft) => <option key={ft} value={ft}>{labelFieldType(ft)}</option>)}
                                </select>
                              </div>
                              {/* Required */}
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Required</label>
                                <select
                                  disabled={isSystemMandatory}
                                  value={String(editDraft.mandatory ?? displayMandatory)}
                                  onChange={(e) => setEditDraft({ ...editDraft, mandatory: e.target.value === "true" })}
                                  className={isSystemMandatory ? lockedCls : editCls}
                                >
                                  <option value="true">Required</option>
                                  <option value="false">Optional</option>
                                </select>
                              </div>
                              {/* Validation / Notes */}
                              <div>
                                <label className="block text-xs text-slate-500 mb-1">Validation / Notes</label>
                                <input
                                  type="text"
                                  value={editDraft.validation ?? displayValidation}
                                  onChange={(e) => setEditDraft({ ...editDraft, validation: e.target.value })}
                                  className={editCls}
                                />
                              </div>
                            </div>
                            {isSystemMandatory && (
                              <p className="text-xs text-slate-400 mb-2 italic">Field name, type, and required status are locked for system fields — only Validation / Notes can be changed.</p>
                            )}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { onEditRecommendedField(field.name, { ...override, ...editDraft }); setEditingField(null); setEditDraft({}); }}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                              >Save</button>
                              <button
                                onClick={() => { setEditingField(null); setEditDraft({}); }}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
                              >Cancel</button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={`${si}-${fi}`} className="hover:bg-slate-50/50 transition-colors align-top">
                        {/* Actions */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-0.5">
                            {!isIdType && !CATEGORY_FIELDS.has(field.name) && (
                              <button
                                onClick={() => { setEditingField(field.name); setEditDraft({}); }}
                                className="text-slate-300 hover:text-blue-500 transition-colors p-1 rounded"
                                title="Edit field"
                              >
                                <Pencil size={13} />
                              </button>
                            )}
                            {field.removable ? (
                              <button
                                onClick={() => onDeleteRecommendedField(field.name)}
                                className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                                title="Remove field"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleLockedClick(field.name)}
                                className="text-slate-200 cursor-not-allowed p-1 rounded"
                                title="Cannot remove"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-800 font-medium">{displayName}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium capitalize">
                            {labelFieldType(displayType)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {displayMandatory
                            ? <span className="inline-block px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-medium">Required</span>
                            : <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">Optional</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {isIdType ? (
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap gap-1">
                                {idTypes.map((val, i) => (
                                  <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                    {val}
                                    <button onClick={() => onIdTypesChange(idTypes.filter((_, idx) => idx !== i))} className="text-blue-400 hover:text-red-500 ml-0.5 leading-none" title="Remove">×</button>
                                  </span>
                                ))}
                              </div>
                              <DocTypeAdder onAdd={(v) => { if (!idTypes.includes(v)) onIdTypesChange([...idTypes, v]); }} />
                            </div>
                          ) : CATEGORY_FIELDS.has(field.name) ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                              Values set in Overall Configuration
                            </span>
                          ) : (
                            <input
                              type="text"
                              value={displayValidation === "—" ? "" : displayValidation}
                              onChange={(e) => {
                                const val = e.target.value.trim() || "—";
                                onEditRecommendedField(field.name, { ...override, validation: val });
                              }}
                              onBlur={(e) => {
                                if (!e.target.value.trim()) onEditRecommendedField(field.name, { ...override, validation: "—" });
                              }}
                              placeholder="Add notes…"
                              className="w-full px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-slate-300 focus:ring-1 focus:ring-blue-400 text-xs text-slate-600 bg-transparent focus:bg-white transition-colors"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {(sub.name === "Applicant Address" || sub.name === "Business Address") && renderBoundaryRows(sub.name)}
              </>
            ))}

            {/* Custom subsections (Business Details only) */}
            {section.id === "business" && customSubsections.map((subName, si) => (
              <tr key={`custom-sub-${si}`} className="bg-slate-50 group">
                <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {subName}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => onDeleteSubsection(subName)}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete subsection"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Custom fields for this section */}
            {sectionCustomFields.map((field) => (
              <tr key={field.id} className="hover:bg-red-50/20 transition-colors group">
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onDeleteField(field.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                    title="Remove field"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-800 font-medium">{field.name}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-medium capitalize">
                    {labelFieldType(field.fieldType)}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {field.mandatory
                    ? <span className="inline-block px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-medium">Required</span>
                    : <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">Optional</span>}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">
                  {field.fieldType === "dropdown" && (field.dropdownOptions?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {field.dropdownOptions!.map((opt, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{opt}</span>
                      ))}
                    </div>
                  ) : (
                    field.validation === "—" ? "" : field.validation
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 border-t border-slate-100 space-y-2">
        {showAddField ? (
          <AddFieldForm
            sectionId={section.id}
            onAdd={handleAddField}
            onCancel={() => setShowAddField(false)}
          />
        ) : section.canAddFields ? (
          <button
            onClick={() => setShowAddField(true)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Add Field
          </button>
        ) : null}

        {section.canAddSubsections && (
          showAddSub ? (
            <AddSubsectionForm
              onAdd={handleAddSubsection}
              onCancel={() => setShowAddSub(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddSub(true)}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add Subsection
            </button>
          )
        )}
      </div>

      {/* Declaration: Mobile OTP toggle */}
      {section.id === "declaration" && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-4">
          <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-800">Mobile OTP Confirmation</p>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Identity Verification</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When enabled, applicants must verify their identity by entering a one-time password (OTP) sent to their registered mobile number before they can submit the declaration. This ensures the person submitting the application is the same person whose mobile number is on record.
              </p>
            </div>
            <button
              onClick={onToggleDeclarationOtp}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors shrink-0 mt-0.5 ${declarationMobileOtpEnabled ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${declarationMobileOtpEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Documents Card ────────────────────────────────────────────────────────────

const COMMON_FORMATS = ["PDF", "JPG", "PNG", "DOCX", "XLSX"];

interface DocCardProps {
  documents: FormDocument[];
  onChange: (docs: FormDocument[]) => void;
}

function DocCard({ documents, onChange }: DocCardProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; formats: string[]; required: boolean; docTypes: string[] }>({
    name: "", formats: [], required: true, docTypes: [],
  });

  // Add-form state
  const [newName, setNewName] = useState("");
  const [newFormats, setNewFormats] = useState<string[]>(["PDF"]);
  const [newRequired, setNewRequired] = useState(true);
  const [newDocTypes, setNewDocTypes] = useState<string[]>([]);

  const deleteDoc = (id: string) => onChange(documents.filter((d) => d.id !== id));

  const startEdit = (doc: FormDocument) => {
    setEditingId(doc.id);
    setEditDraft({ name: doc.name, formats: [...doc.formats], required: doc.required, docTypes: [...doc.docTypes] });
  };

  const saveEdit = (id: string) => {
    if (!editDraft.name.trim()) return;
    onChange(documents.map((d) => d.id === id ? {
      ...d,
      name: editDraft.name.trim(),
      formats: editDraft.formats,
      required: editDraft.required,
      docTypes: editDraft.docTypes,
      hasDocTypeDropdown: editDraft.docTypes.length > 0,
    } : d));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleAddDoc = () => {
    if (!newName.trim()) return;
    onChange([...documents, {
      id: uid(),
      name: newName.trim(),
      formats: newFormats,
      required: newRequired,
      docTypes: newDocTypes,
      hasDocTypeDropdown: newDocTypes.length > 0,
      isRecommended: false,
    }]);
    setNewName(""); setNewFormats(["PDF"]); setNewRequired(true); setNewDocTypes([]);
    setShowAdd(false);
  };

  const fmtToggle = (fmt: string, current: string[], set: (v: string[]) => void) => {
    set(current.includes(fmt) ? current.filter((f) => f !== fmt) : [...current, fmt]);
  };

  const inputCls = "w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white";
  const formInputCls = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

  const FormatChips = ({ formats, setFormats }: { formats: string[]; setFormats: (v: string[]) => void }) => (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {COMMON_FORMATS.map((fmt) => (
          <button
            key={fmt}
            type="button"
            onClick={() => fmtToggle(fmt, formats, setFormats)}
            className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
              formats.includes(fmt) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-300 hover:border-blue-400"
            }`}
          >{fmt}</button>
        ))}
      </div>
      <DocTypeAdder onAdd={(v) => { const u = v.toUpperCase(); if (!formats.includes(u)) setFormats([...formats, u]); }} />
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden border-t-4 border-rose-500">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">Documents</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Actions</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Document Name</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Accepted Formats</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Required</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doc Types</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => {
              const isEditing = editingId === doc.id;

              if (isEditing) {
                return (
                  <tr key={doc.id}>
                    <td colSpan={5} className="px-4 py-3 bg-blue-50/50 border-l-2 border-blue-400">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {/* Name */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs text-slate-500 mb-1">Document Name</label>
                          <input type="text" value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} className={inputCls} />
                        </div>
                        {/* Required */}
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Required</label>
                          <select value={String(editDraft.required)} onChange={(e) => setEditDraft({ ...editDraft, required: e.target.value === "true" })} className={inputCls}>
                            <option value="true">Required</option>
                            <option value="false">Optional</option>
                          </select>
                        </div>
                      </div>
                      {/* Formats */}
                      <div className="mb-3">
                        <label className="block text-xs text-slate-500 mb-1">Accepted Formats</label>
                        <FormatChips formats={editDraft.formats} setFormats={(v) => setEditDraft({ ...editDraft, formats: v })} />
                      </div>
                      {/* Doc Types */}
                      <div className="mb-3">
                        <label className="block text-xs text-slate-500 mb-1">Doc Types <span className="text-slate-400 font-normal">(optional)</span></label>
                        <div className="space-y-1.5">
                          {editDraft.docTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {editDraft.docTypes.map((dt, i) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                  {dt}
                                  <button onClick={() => setEditDraft({ ...editDraft, docTypes: editDraft.docTypes.filter((_, idx) => idx !== i) })} className="text-blue-400 hover:text-red-500 ml-0.5 leading-none">×</button>
                                </span>
                              ))}
                            </div>
                          )}
                          <DocTypeAdder onAdd={(v) => { if (!editDraft.docTypes.includes(v)) setEditDraft({ ...editDraft, docTypes: [...editDraft.docTypes, v] }); }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => saveEdit(doc.id)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors">Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-50 transition-colors">Cancel</button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors align-top">
                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => startEdit(doc)} className="text-slate-300 hover:text-blue-500 transition-colors p-1 rounded" title="Edit">
                        <Pencil size={13} />
                      </button>
                      {doc.isRecommended ? (
                        <button className="text-slate-200 cursor-not-allowed p-1 rounded" title="Recommended — cannot be removed">
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <button onClick={() => deleteDoc(doc.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded" title="Remove">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                  {/* Name */}
                  <td className="px-4 py-2.5 text-sm text-slate-800 font-medium">{doc.name}</td>
                  {/* Formats */}
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {doc.formats.map((fmt) => (
                        <span key={fmt} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">{fmt}</span>
                      ))}
                    </div>
                  </td>
                  {/* Required */}
                  <td className="px-4 py-2.5">
                    {doc.required
                      ? <span className="inline-block px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-medium">Required</span>
                      : <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">Optional</span>}
                  </td>
                  {/* Doc Types */}
                  <td className="px-4 py-2.5">
                    {doc.docTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {doc.docTypes.map((dt, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{dt}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add document */}
      <div className="px-5 py-3 border-t border-slate-100">
        {showAdd ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Add Document</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Document Name</label>
                <input type="text" className={formInputCls} placeholder="e.g. Fire Safety Certificate" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Required</label>
                <select className={formInputCls} value={String(newRequired)} onChange={(e) => setNewRequired(e.target.value === "true")}>
                  <option value="true">Required</option>
                  <option value="false">Optional</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-2">Accepted Formats</label>
              <FormatChips formats={newFormats} setFormats={setNewFormats} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Doc Types <span className="text-slate-400 font-normal">(optional — leave empty if no sub-type selection needed)</span></label>
              {newDocTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {newDocTypes.map((dt, i) => (
                    <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {dt}
                      <button onClick={() => setNewDocTypes(newDocTypes.filter((_, idx) => idx !== i))} className="text-blue-400 hover:text-red-500 ml-0.5 leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
              <DocTypeAdder onAdd={(v) => { if (!newDocTypes.includes(v)) setNewDocTypes([...newDocTypes, v]); }} />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleAddDoc} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Add Document</button>
              <button onClick={() => { setShowAdd(false); setNewName(""); setNewFormats(["PDF"]); setNewRequired(true); setNewDocTypes([]); }} className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-medium hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={14} />
            Add Document
          </button>
        )}
      </div>
    </div>
  );
}

// ── DocTypeAdder: small inline adder for doc-type chips ───────────────────────

function DocTypeAdder({ onAdd }: { onAdd: (val: string) => void }) {
  const [val, setVal] = useState("");
  const submit = () => {
    const t = val.trim();
    if (t) { onAdd(t); setVal(""); }
  };
  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs text-slate-800 focus:ring-1 focus:ring-blue-400 bg-white"
        placeholder="Add type…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
      />
      <button
        onClick={submit}
        className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
      >
        +
      </button>
    </div>
  );
}

// ── Owner / Proprietor Card ───────────────────────────────────────────────────

interface OwnerFieldRowProps {
  name: string;
  type: string;
  required: boolean;
  notes: string;
  onNotesChange?: (notes: string) => void;
  dropdownOptions?: string[];
  onDropdownOptionsChange?: (opts: string[]) => void;
}

function OwnerFieldRow({ name, type, required, notes, onNotesChange, dropdownOptions, onDropdownOptionsChange }: OwnerFieldRowProps) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors align-top">
      <td className="px-3 py-2.5 w-20"><Lock size={13} className="text-slate-200" /></td>
      <td className="px-4 py-2.5 text-sm text-slate-800 font-medium">{name}</td>
      <td className="px-4 py-2.5 w-24">
        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{type}</span>
      </td>
      <td className="px-4 py-2.5 w-24">
        {required
          ? <span className="inline-block px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs font-medium">Required</span>
          : <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">Optional</span>}
      </td>
      <td className="px-4 py-2.5 text-xs text-slate-500 leading-relaxed">
        {dropdownOptions !== undefined ? (
          <div className="space-y-1.5">
            {dropdownOptions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {dropdownOptions.map((opt, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {opt}
                    {onDropdownOptionsChange && (
                      <button onClick={() => onDropdownOptionsChange(dropdownOptions.filter((_, idx) => idx !== i))} className="text-blue-400 hover:text-red-500 ml-0.5 leading-none">×</button>
                    )}
                  </span>
                ))}
              </div>
            )}
            {onDropdownOptionsChange && (
              <DocTypeAdder onAdd={(v) => { if (!dropdownOptions.includes(v)) onDropdownOptionsChange([...dropdownOptions, v]); }} />
            )}
          </div>
        ) : onNotesChange ? (
          <input
            type="text"
            value={notes === "—" ? "" : notes}
            onChange={(e) => onNotesChange(e.target.value || "—")}
            placeholder="Add notes…"
            className="w-full px-2 py-1 rounded border border-transparent hover:border-slate-200 focus:border-slate-300 focus:ring-1 focus:ring-blue-400 text-xs text-slate-600 bg-transparent focus:bg-white transition-colors"
          />
        ) : (
          notes
        )}
      </td>
    </tr>
  );
}

function OwnerTableHead() {
  return (
    <thead>
      <tr className="bg-slate-50 border-b border-slate-200">
        <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Actions</th>
        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Field Name</th>
        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Type</th>
        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Required</th>
        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Validation / Notes</th>
      </tr>
    </thead>
  );
}

function OwnerProprietorCard() {
  const [tab, setTab] = useState<"individual" | "organization">("individual");

  // Individual tab state
  const [indivNotes, setIndivNotes] = useState<Record<string, string>>({
    "Full Name": "—", "Mobile Number": "—", "Email": "—",
  });
  const [indivIdTypes, setIndivIdTypes] = useState<string[]>(["Passport", "Driving License"]);

  // Organization tab state
  const [institutionTypes, setInstitutionTypes] = useState<string[]>(["Private", "Government"]);
  const [institutionSubtypes, setInstitutionSubtypes] = useState<string[]>([
    "Sole Proprietorship", "Partnership", "LLC", "Corporation", "Co-operative", "Local", "Central",
  ]);
  const [orgIdTypes, setOrgIdTypes] = useState<string[]>(["Passport", "Driving License"]);

  const tabCls = (active: boolean) =>
    `px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${active ? "border-purple-500 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-700"}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden border-t-4 border-purple-500">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Owner / Proprietor Details</h3>
          <p className="text-xs text-slate-400 mt-0.5">Conditional fields shown based on owner type — system-defined</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">System</span>
      </div>

      {/* Owner Type row */}
      <div className="overflow-x-auto border-b border-slate-200">
        <table className="w-full text-sm">
          <OwnerTableHead />
          <tbody>
            <OwnerFieldRow name="Owner Type" type="Dropdown" required={true}
              notes="" dropdownOptions={["Individual", "Institution"]} />
          </tbody>
        </table>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 px-5 pt-3 pb-0 flex gap-0">
        <button onClick={() => setTab("individual")} className={tabCls(tab === "individual")}>If Individual</button>
        <button onClick={() => setTab("organization")} className={tabCls(tab === "organization")}>If Organization / Govt Entity</button>
      </div>

      {/* Individual fields */}
      {tab === "individual" && (
        <>
          <div className="px-5 py-2 bg-blue-50/40 border-b border-slate-100">
            <p className="text-xs text-blue-700">Multiple individuals can be added — an "Add Individual" button appends a new entry; each entry can be removed individually.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <OwnerTableHead />
              <tbody className="divide-y divide-slate-100">
                <OwnerFieldRow name="Same as Applicant" type="Toggle" required={false} notes="Pre-fills all fields below from Applicant Details; fields remain editable after toggle" />
                <OwnerFieldRow name="Full Name" type="Text" required={true}
                  notes={indivNotes["Full Name"]}
                  onNotesChange={(v) => setIndivNotes((n) => ({ ...n, "Full Name": v }))} />
                <OwnerFieldRow name="Mobile Number" type="Phone" required={true}
                  notes={indivNotes["Mobile Number"]}
                  onNotesChange={(v) => setIndivNotes((n) => ({ ...n, "Mobile Number": v }))} />
                <OwnerFieldRow name="Email" type="Email" required={false}
                  notes={indivNotes["Email"]}
                  onNotesChange={(v) => setIndivNotes((n) => ({ ...n, "Email": v }))} />
                <OwnerFieldRow name="ID Type" type="Dropdown" required={true}
                  notes="" dropdownOptions={indivIdTypes} onDropdownOptionsChange={setIndivIdTypes} />
                <OwnerFieldRow name="ID Number" type="Text" required={true} notes="—" />
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Organization / Govt Entity fields */}
      {tab === "organization" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <OwnerTableHead />
            <tbody className="divide-y divide-slate-100">
              <OwnerFieldRow name="Institution Type" type="Dropdown" required={true}
                notes="" dropdownOptions={institutionTypes} onDropdownOptionsChange={setInstitutionTypes} />
              <OwnerFieldRow name="Institution Subtype" type="Dropdown" required={true}
                notes="" dropdownOptions={institutionSubtypes} onDropdownOptionsChange={setInstitutionSubtypes} />
              <OwnerFieldRow name="Organization Name" type="Text" required={true} notes="—" />
              <OwnerFieldRow name="Representative Name" type="Text" required={true} notes="—" />
              <OwnerFieldRow name="Representative same as Applicant" type="Toggle" required={false} notes="Pre-fills Mobile, Email, ID Type, ID Number from Applicant Details; fields remain editable" />
              <OwnerFieldRow name="Mobile Number" type="Phone" required={true} notes="—" />
              <OwnerFieldRow name="Email" type="Email" required={false} notes="—" />
              <OwnerFieldRow name="ID Type" type="Dropdown" required={true}
                notes="" dropdownOptions={orgIdTypes} onDropdownOptionsChange={setOrgIdTypes} />
              <OwnerFieldRow name="ID Number" type="Text" required={true} notes="—" />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Step4FormConfig({ config, updateConfig, onNext, onBack, onSaveDraft }: Props) {
  const f = config.formConfig;
  const set = (patch: Partial<FormConfig>) => updateConfig("formConfig", { ...f, ...patch });

  const handleAddField = (field: CustomFormField) => {
    set({ customFields: [...f.customFields, field] });
  };

  const handleDeleteField = (id: string) => {
    set({ customFields: f.customFields.filter((cf) => cf.id !== id) });
  };

  const handleDeleteRecommendedField = (name: string) => {
    set({ deletedRecommendedFields: [...(f.deletedRecommendedFields ?? []), name] });
  };

  const handleEditRecommendedField = (originalName: string, override: EditedFieldOverride) => {
    set({ editedRecommendedFields: { ...(f.editedRecommendedFields ?? {}), [originalName]: override } });
  };

  const handleAddSubsection = (name: string) => {
    if (!f.customSubsections.includes(name)) {
      set({ customSubsections: [...f.customSubsections, name] });
    }
  };

  const handleDeleteSubsection = (name: string) => {
    set({ customSubsections: f.customSubsections.filter((s) => s !== name) });
  };

  const handleDocsChange = (docs: FormDocument[]) => {
    set({ documents: docs });
  };

  const formSummaryItems = [
    {
      label: "Custom Fields",
      value: f.customFields.length > 0
        ? `${f.customFields.length} field${f.customFields.length !== 1 ? "s" : ""} added`
        : "None",
    },
    {
      label: "Documents Required",
      value: f.documents.length > 0
        ? `${f.documents.length} document type${f.documents.length !== 1 ? "s" : ""}`
        : "None",
    },
    {
      label: "ID Types Accepted",
      value: f.idTypes.length > 0 ? f.idTypes : ["Not set"],
    },
    {
      label: "Custom Subsections",
      value: f.customSubsections.length > 0 ? f.customSubsections : ["None"],
    },
  ];

  return (
    <StepWrapper
      step={6}
      title="Application Form"
      subtitle="Configure the fields your applicants will fill in when applying for a Business License."
      onNext={onNext}
      onBack={onBack}
      onSaveDraft={onSaveDraft}
      summaryItems={formSummaryItems}
      nextSectionLabel="Configure Roles"
    >
      <div className="space-y-5">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Mandatory fields</strong> (marked Required) are fixed by the system and cannot be removed or renamed — but you can update their validation rules.</p>
            <p><strong>Recommended fields</strong> are included by default but can be removed, renamed, or have their type, required status, and validation changed.</p>
            <p>You can also <strong>add your own fields</strong> or subsections to any section.</p>
          </div>
        </div>

        {/* Section cards */}
        {/* Applicant Details */}
        <SectionCard
          key="applicant"
          section={RECOMMENDED_SECTIONS[0]}
          customFields={f.customFields}
          customSubsections={[]}
          deletedRecommendedFields={f.deletedRecommendedFields ?? []}
          editedRecommendedFields={f.editedRecommendedFields ?? {}}
          idTypes={f.idTypes}
          onIdTypesChange={(vals) => set({ idTypes: vals })}
          onAddField={handleAddField}
          onDeleteField={handleDeleteField}
          onDeleteRecommendedField={handleDeleteRecommendedField}
          onEditRecommendedField={handleEditRecommendedField}
          onAddSubsection={handleAddSubsection}
          onDeleteSubsection={handleDeleteSubsection}
          deployment={config.deployment}
          declarationMobileOtpEnabled={f.declarationMobileOtpEnabled ?? false}
          onToggleDeclarationOtp={() => set({ declarationMobileOtpEnabled: !f.declarationMobileOtpEnabled })}
        />

        {/* Owner / Proprietor Details — between Applicant and Business */}
        <OwnerProprietorCard />

        {/* Business Details + Declaration */}
        {RECOMMENDED_SECTIONS.slice(1).map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            customFields={f.customFields}
            customSubsections={section.id === "business" ? f.customSubsections : []}
            deletedRecommendedFields={f.deletedRecommendedFields ?? []}
            editedRecommendedFields={f.editedRecommendedFields ?? {}}
            idTypes={f.idTypes}
            onIdTypesChange={(vals) => set({ idTypes: vals })}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
            onDeleteRecommendedField={handleDeleteRecommendedField}
            onEditRecommendedField={handleEditRecommendedField}
            onAddSubsection={handleAddSubsection}
            onDeleteSubsection={handleDeleteSubsection}
            deployment={config.deployment}
            declarationMobileOtpEnabled={f.declarationMobileOtpEnabled ?? false}
            onToggleDeclarationOtp={() => set({ declarationMobileOtpEnabled: !f.declarationMobileOtpEnabled })}
          />
        ))}

        {/* Documents card */}
        <DocCard
          documents={f.documents}
          onChange={handleDocsChange}
        />
      </div>
    </StepWrapper>
  );
}
