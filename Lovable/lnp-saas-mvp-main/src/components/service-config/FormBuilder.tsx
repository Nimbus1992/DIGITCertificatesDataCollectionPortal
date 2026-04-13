import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, HelpCircle, Plus, Search, X, ChevronLeft, ChevronRight, Save,
  User, MapPin, Phone, Mail, Hash, Type, AlignLeft, Calendar,
  Circle, CheckSquare, List, Tag, Upload, Info, GripVertical
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */

type FieldType = "text" | "number" | "dropdown" | "radio" | "checkbox" | "date" | "file" | "textarea" | "multiselect" | "section_header";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  defaultValue?: string;
  options?: string[];
}

interface FormSection {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
}

/* ─── Field palette categories ──────────────────────────── */

interface FieldTypeEntry { type: FieldType; label: string; icon: LucideIcon }
interface FieldCategory { name: string; items: FieldTypeEntry[] }

const FIELD_CATEGORIES: FieldCategory[] = [
  {
    name: "Input Fields",
    items: [
      { type: "text", label: "Name", icon: User },
      { type: "text", label: "Address", icon: MapPin },
      { type: "number", label: "Phone", icon: Phone },
      { type: "text", label: "Email", icon: Mail },
      { type: "number", label: "Numeric", icon: Hash },
      { type: "text", label: "Text Input", icon: Type },
      { type: "textarea", label: "Text Area", icon: AlignLeft },
      { type: "date", label: "Date Picker", icon: Calendar },
    ],
  },
  {
    name: "Selection",
    items: [
      { type: "radio", label: "Radio", icon: Circle },
      { type: "checkbox", label: "Checkbox", icon: CheckSquare },
      { type: "dropdown", label: "Dropdown", icon: List },
      { type: "multiselect", label: "Selection Tag", icon: Tag },
    ],
  },
  {
    name: "Upload",
    items: [
      { type: "file", label: "File Upload", icon: Upload },
    ],
  },
];

/* ─── Helpers ───────────────────────────────────────────── */

let fieldCounter = 100;
const createField = (type: FieldType, label: string): FormField => ({
  id: `field-${++fieldCounter}`,
  type,
  label: label || "Untitled Field",
  placeholder: "",
  helpText: "",
  required: false,
  options: ["dropdown", "radio", "checkbox", "multiselect"].includes(type)
    ? ["Option 1", "Option 2"]
    : undefined,
});

const DEFAULT_SECTIONS: FormSection[] = [
  {
    id: "sec-1",
    name: "Applicant Details",
    description: "Basic information about the applicant",
    fields: [
      { id: "f1", type: "text", label: "Applicant Name", placeholder: "Enter full name", helpText: "", required: true },
      { id: "f2", type: "number", label: "Mobile Number", placeholder: "10-digit mobile", helpText: "", required: true },
      { id: "f3", type: "text", label: "Email", placeholder: "email@example.com", helpText: "", required: true },
      { id: "f4", type: "file", label: "ID Proof", placeholder: "", helpText: "Upload a valid ID", required: true },
    ],
  },
  {
    id: "sec-2",
    name: "Business Details",
    description: "Information about the business",
    fields: [
      { id: "f5", type: "text", label: "Business Name", placeholder: "", helpText: "", required: true },
      { id: "f6", type: "dropdown", label: "Business Type", placeholder: "", helpText: "", required: true, options: ["Sole Proprietorship", "Partnership", "Company", "LLP"] },
      { id: "f7", type: "dropdown", label: "Business Category", placeholder: "", helpText: "", required: false, options: ["Food", "Retail", "Services", "Manufacturing"] },
      { id: "f8", type: "number", label: "Number of Employees", placeholder: "", helpText: "", required: false },
    ],
  },
  {
    id: "sec-3",
    name: "Address Details",
    description: "Location of the business",
    fields: [
      { id: "f9", type: "text", label: "Address Line 1", placeholder: "", helpText: "", required: true },
      { id: "f10", type: "dropdown", label: "City", placeholder: "", helpText: "", required: true, options: ["Mumbai", "Delhi", "Bangalore", "Chennai"] },
      { id: "f11", type: "dropdown", label: "State", placeholder: "", helpText: "", required: true, options: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"] },
      { id: "f12", type: "number", label: "Pincode", placeholder: "6-digit pincode", helpText: "", required: true },
    ],
  },
  {
    id: "sec-4",
    name: "Documents",
    description: "Required documents for verification",
    fields: [
      { id: "f13", type: "file", label: "Identity Proof", placeholder: "", helpText: "", required: true },
      { id: "f14", type: "file", label: "Address Proof", placeholder: "", helpText: "", required: true },
      { id: "f15", type: "file", label: "Business Proof", placeholder: "", helpText: "", required: false },
    ],
  },
];

/* ─── Component ─────────────────────────────────────────── */

interface FormBuilderProps {
  moduleName: string;
  onBack: () => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ moduleName, onBack }) => {
  const [sections, setSections] = useState<FormSection[]>(DEFAULT_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [rightTab, setRightTab] = useState<"elements" | "logic">("elements");

  const activeSection = sections.find((s) => s.id === activeSectionId)!;
  const activeSectionIndex = sections.findIndex((s) => s.id === activeSectionId);
  const selectedField = selectedFieldId
    ? activeSection.fields.find((f) => f.id === selectedFieldId) ?? null
    : null;

  /* ── Section helpers ── */
  const addSection = () => {
    const s: FormSection = {
      id: `sec-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      description: "",
      fields: [],
    };
    setSections((prev) => [...prev, s]);
    setActiveSectionId(s.id);
    setSelectedFieldId(null);
  };

  const updateSection = (updates: Partial<FormSection>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === activeSectionId ? { ...s, ...updates } : s))
    );
  };

  const deleteFieldFromSection = (fieldId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === activeSectionId
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s
      )
    );
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  /* ── Field helpers ── */
  const addFieldFromPalette = (type: FieldType, label: string) => {
    const f = createField(type, label);
    setSections((prev) =>
      prev.map((s) =>
        s.id === activeSectionId ? { ...s, fields: [...s.fields, f] } : s
      )
    );
    setSelectedFieldId(f.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === activeSectionId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : s
      )
    );
  };

  /* ── Navigation ── */
  const goSection = (dir: -1 | 1) => {
    const next = activeSectionIndex + dir;
    if (next >= 0 && next < sections.length) {
      setActiveSectionId(sections[next].id);
      setSelectedFieldId(null);
    }
  };

  /* ── Filtered palette ── */
  const filteredCategories = useMemo(() => {
    if (!paletteSearch.trim()) return FIELD_CATEGORIES;
    const q = paletteSearch.toLowerCase();
    return FIELD_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((c) => c.items.length > 0);
  }, [paletteSearch]);

  /* ── Render a single field on the canvas ── */
  const renderCanvasField = (field: FormField) => {
    const isSelected = selectedFieldId === field.id;
    return (
      <div
        key={field.id}
        onClick={() => setSelectedFieldId(field.id)}
        className={`group relative rounded-md border p-3 cursor-pointer transition-colors ${
          isSelected
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/30"
        }`}
      >
        <div className="flex items-center gap-1 mb-1">
          <Label className="text-sm font-medium text-foreground">
            {field.label}
          </Label>
          {field.required && (
            <span className="text-destructive text-xs">*</span>
          )}
        </div>

        {(field.type === "text" || field.type === "number") && (
          <Input
            disabled
            placeholder={field.placeholder || field.label}
            className="bg-background"
          />
        )}
        {field.type === "textarea" && (
          <Textarea
            disabled
            placeholder={field.placeholder || field.label}
            className="bg-background min-h-[60px]"
          />
        )}
        {field.type === "dropdown" && (
          <Select disabled>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
          </Select>
        )}
        {field.type === "multiselect" && (
          <Select disabled>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
          </Select>
        )}
        {field.type === "radio" && (
          <div className="flex gap-4">
            {(field.options || ["Option 1", "Option 2"]).map((o) => (
              <label
                key={o}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <input type="radio" disabled className="accent-primary" />
                {o}
              </label>
            ))}
          </div>
        )}
        {field.type === "checkbox" && (
          <div className="flex gap-4">
            {(field.options || ["Option 1", "Option 2"]).map((o) => (
              <label
                key={o}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <input type="checkbox" disabled className="accent-primary" />
                {o}
              </label>
            ))}
          </div>
        )}
        {field.type === "date" && (
          <Input disabled type="date" className="bg-background" />
        )}
        {field.type === "file" && (
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-3 text-center text-sm text-muted-foreground">
            Click or drag to upload
          </div>
        )}
      </div>
    );
  };

  /* ─── Render ──────────────────────────────────────────── */

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-card">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Service Dashboard
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4" /> Help
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-0 border-b bg-card overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSectionId(s.id);
              setSelectedFieldId(null);
            }}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              s.id === activeSectionId
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.name}
          </button>
        ))}
        <button
          onClick={addSection}
          className="flex items-center gap-1 px-4 py-2.5 text-sm text-primary hover:bg-primary/5 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" /> Add Section
        </button>
      </div>

      {/* Main 3-column area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Field Palette */}
        <div className="w-56 shrink-0 border-r bg-card flex flex-col">
          <div className="p-3 border-b">
            <h3 className="text-sm font-semibold mb-2 text-foreground">
              Form Fields
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {filteredCategories.map((cat) => (
                <div key={cat.name}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {cat.name}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={() =>
                            addFieldFromPalette(item.type, item.label)
                          }
                          className="flex flex-col items-center gap-1 p-2.5 rounded-md border border-border bg-background text-xs text-foreground hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="leading-tight text-center">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-card">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {activeSection.name}
                </h2>
                {activeSection.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {activeSection.description}
                  </p>
                )}
                <div className="space-y-1">
                  {activeSection.fields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Click a field type on the left to add fields
                    </p>
                  )}
                  {activeSection.fields.map(renderCanvasField)}
                </div>
                <div className="flex justify-end mt-6">
                  <Button size="sm" className="px-6">
                    Next
                  </Button>
                </div>
              </div>

              {/* Section navigation arrows */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={activeSectionIndex === 0}
                  onClick={() => goSection(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {activeSectionIndex + 1} / {sections.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={activeSectionIndex === sections.length - 1}
                  onClick={() => goSection(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right: Properties panel */}
        <div className="w-72 shrink-0 border-l bg-card flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">
                {selectedField ? "Field Properties" : "Section Properties"}
              </h3>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            {selectedField && (
              <button
                onClick={() => setSelectedFieldId(null)}
                className="text-xs text-primary mt-1 hover:underline"
              >
                ← Back to section
              </button>
            )}
          </div>

          {/* Elements / Logic tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setRightTab("elements")}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                rightTab === "elements"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Elements
            </button>
            <button
              onClick={() => setRightTab("logic")}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                rightTab === "logic"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Logic
            </button>
          </div>

          <ScrollArea className="flex-1">
            {rightTab === "elements" ? (
              selectedField ? (
                /* ── Field-level properties ── */
                <div className="p-3 space-y-4">
                  <div>
                    <Label className="text-xs">Field Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) =>
                        updateField(selectedField.id, { label: e.target.value })
                      }
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Field Type</Label>
                    <Select
                      value={selectedField.type}
                      onValueChange={(v) =>
                        updateField(selectedField.id, { type: v as FieldType })
                      }
                    >
                      <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "text",
                          "number",
                          "dropdown",
                          "radio",
                          "checkbox",
                          "date",
                          "file",
                          "textarea",
                          "multiselect",
                        ].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={selectedField.placeholder}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          placeholder: e.target.value,
                        })
                      }
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Help Text</Label>
                    <Input
                      value={selectedField.helpText}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          helpText: e.target.value,
                        })
                      }
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Validation
                  </p>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Required</Label>
                    <Switch
                      checked={selectedField.required}
                      onCheckedChange={(v) =>
                        updateField(selectedField.id, { required: v })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Min Length</Label>
                      <Input
                        type="number"
                        value={selectedField.minLength ?? ""}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            minLength: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Length</Label>
                      <Input
                        type="number"
                        value={selectedField.maxLength ?? ""}
                        onChange={(e) =>
                          updateField(selectedField.id, {
                            maxLength: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Pattern (Regex)</Label>
                    <Input
                      value={selectedField.pattern ?? ""}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          pattern: e.target.value,
                        })
                      }
                      className="mt-1 h-8 text-sm"
                      placeholder="e.g. ^[A-Z]+"
                    />
                  </div>
                  {selectedField.options && (
                    <>
                      <Separator />
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Options
                      </p>
                      {selectedField.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const opts = [
                                ...(selectedField.options || []),
                              ];
                              opts[i] = e.target.value;
                              updateField(selectedField.id, { options: opts });
                            }}
                            className="h-7 text-xs flex-1"
                          />
                          <button
                            onClick={() => {
                              const opts = (
                                selectedField.options || []
                              ).filter((_, j) => j !== i);
                              updateField(selectedField.id, { options: opts });
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          updateField(selectedField.id, {
                            options: [
                              ...(selectedField.options || []),
                              `Option ${
                                (selectedField.options?.length ?? 0) + 1
                              }`,
                            ],
                          })
                        }
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                /* ── Section-level properties ── */
                <div className="p-3 space-y-4">
                  <div>
                    <Label className="text-xs">Page Heading</Label>
                    <Input
                      value={activeSection.name}
                      onChange={(e) =>
                        updateSection({ name: e.target.value })
                      }
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Page Description</Label>
                    <Textarea
                      value={activeSection.description}
                      onChange={(e) =>
                        updateSection({ description: e.target.value })
                      }
                      className="mt-1 text-sm min-h-[60px]"
                    />
                  </div>
                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Fields
                  </p>
                  <div className="space-y-1">
                    {activeSection.fields.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFieldId(f.id)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
                          selectedFieldId === f.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{f.label}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {f.type}
                          </Badge>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFieldFromSection(f.id);
                            }}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {activeSection.fields.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No fields yet
                      </p>
                    )}
                  </div>
                </div>
              )
            ) : (
              /* ── Logic tab placeholder ── */
              <div className="p-4 text-sm text-muted-foreground text-center mt-8">
                <p className="font-medium mb-2">Conditional Logic</p>
                <p className="text-xs">
                  Configure field visibility rules and conditional logic here.
                  Coming soon.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t bg-card">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button
          size="sm"
          onClick={() => toast({ title: "Form saved successfully" })}
        >
          <Save className="h-4 w-4 mr-1" /> Save Form
        </Button>
      </div>
    </div>
  );
};

export default FormBuilder;
