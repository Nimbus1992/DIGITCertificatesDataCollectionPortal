import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, ClipboardCheck, Trash2, Info } from "lucide-react";
import ChecklistPreview from "./preview/ChecklistPreview";

type FieldType = "text" | "radio" | "checkbox" | "dropdown" | "file_upload";

interface Question {
  id: string;
  text: string;
  fieldType: FieldType;
  required: boolean;
  options?: string[];
}

interface Checklist {
  id: string;
  name: string;
  workflowState: string;
  questions: Question[];
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "dropdown", label: "Dropdown" },
  { value: "file_upload", label: "File Upload" },
];

import { TRADE_CHECKLISTS, TRADE_STATE_NAMES } from "@/data/tradeLicenseTemplate";
import {
  RENEWAL_CHECKLISTS,
  RENEWAL_STATE_NAMES,
  isRenewalModule,
} from "@/data/renewalTemplate";
import { useModuleState } from "@/lib/moduleStorage";

const fieldTypeBadgeColor: Record<FieldType, string> = {
  text: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  radio: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  checkbox: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  dropdown: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  file_upload: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const buildDefaultChecklists = (moduleName: string): Checklist[] => {
  const src = isRenewalModule(moduleName) ? RENEWAL_CHECKLISTS : TRADE_CHECKLISTS;
  return src.map((c) => ({
    id: c.id,
    name: c.name,
    workflowState: c.workflowState,
    questions: c.questions.map((q) => ({
      id: q.id,
      text: q.text,
      fieldType: q.fieldType,
      required: q.required,
      options: q.options ? [...q.options] : undefined,
    })),
  }));
};

interface Props {
  moduleName: string;
  onBack: () => void;
}

const ChecklistBuilder: React.FC<Props> = ({ moduleName, onBack }) => {
  const { id: serviceId = "service" } = useParams();
  const WORKFLOW_STATES = isRenewalModule(moduleName) ? RENEWAL_STATE_NAMES : TRADE_STATE_NAMES;
  const [checklists, setChecklists] = useModuleState<Checklist[]>(
    "checklists", serviceId, moduleName, () => buildDefaultChecklists(moduleName),
  );
  const [showDialog, setShowDialog] = useState(false);
  const [newChecklist, setNewChecklist] = useState({ name: "", workflowState: "" });
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);

  const editingChecklist = checklists.find((c) => c.id === editingChecklistId) ?? null;

  const handleCreateChecklist = () => {
    if (!newChecklist.name.trim() || !newChecklist.workflowState) return;
    setChecklists((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newChecklist.name, workflowState: newChecklist.workflowState, questions: [] },
    ]);
    setNewChecklist({ name: "", workflowState: "" });
    setShowDialog(false);
  };

  const addQuestion = (checklistId: string) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? { ...cl, questions: [...cl.questions, { id: crypto.randomUUID(), text: "", fieldType: "text" as FieldType, required: false }] }
          : cl
      )
    );
  };

  const updateQuestion = (checklistId: string, questionId: string, updates: Partial<Question>) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? { ...cl, questions: cl.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)) }
          : cl
      )
    );
  };

  const HAS_OPTIONS: FieldType[] = ["dropdown", "radio", "checkbox"];

  const changeFieldType = (checklistId: string, q: Question, newType: FieldType) => {
    const needsOptions = HAS_OPTIONS.includes(newType);
    const nextOptions = needsOptions
      ? (q.options && q.options.length > 0 ? q.options : ["", ""])
      : undefined;
    updateQuestion(checklistId, q.id, { fieldType: newType, options: nextOptions });
  };

  const addOption = (checklistId: string, questionId: string) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? { ...cl, questions: cl.questions.map((q) => q.id === questionId ? { ...q, options: [...(q.options ?? []), ""] } : q) }
          : cl
      )
    );
  };

  const updateOption = (checklistId: string, questionId: string, index: number, value: string) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? { ...cl, questions: cl.questions.map((q) => q.id === questionId ? { ...q, options: (q.options ?? []).map((o, i) => i === index ? value : o) } : q) }
          : cl
      )
    );
  };

  const removeOption = (checklistId: string, questionId: string, index: number) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? { ...cl, questions: cl.questions.map((q) => q.id === questionId ? { ...q, options: (q.options ?? []).filter((_, i) => i !== index) } : q) }
          : cl
      )
    );
  };

  const removeQuestion = (checklistId: string, questionId: string) => {
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? { ...cl, questions: cl.questions.filter((q) => q.id !== questionId) }
          : cl
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{moduleName} — Manage Checklists</h1>
            <p className="text-xs text-muted-foreground">Standardize verification and approvals</p>
          </div>
          <Button onClick={() => setShowDialog(true)} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            <Plus className="h-4 w-4" /> Create New Checklist
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-5">
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Checklists help standardize verification and approvals. Click a checklist to manage its questions.
          </p>
        </div>

        <div className="grid gap-3">
          {checklists.map((checklist) => (
            <Card
              key={checklist.id}
              className="px-5 py-4 cursor-pointer hover:border-accent/50 transition-colors"
              onClick={() => setEditingChecklistId(checklist.id)}
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-4 w-4 text-accent shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{checklist.name}</h3>
                  <p className="text-xs text-muted-foreground">{checklist.workflowState}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {checklist.questions.length} question{checklist.questions.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Questions Editor Dialog */}
      <Dialog open={!!editingChecklistId} onOpenChange={(open) => { if (!open) setEditingChecklistId(null); }}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingChecklist?.name ?? "Checklist"}</DialogTitle>
          </DialogHeader>
          {editingChecklist && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              <div className="space-y-3">
              {editingChecklist.questions.map((q, idx) => (
                <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                  <span className="text-xs text-muted-foreground font-medium mt-2 w-5 shrink-0">{idx + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={q.text}
                      onChange={(e) => updateQuestion(editingChecklist.id, q.id, { text: e.target.value })}
                      placeholder="Question text"
                      className="text-sm"
                    />
                    <div className="flex items-center gap-3 flex-wrap">
                      <Select
                        value={q.fieldType}
                        onValueChange={(v) => changeFieldType(editingChecklist.id, q, v as FieldType)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((ft) => (
                            <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${fieldTypeBadgeColor[q.fieldType]}`}>
                        {FIELD_TYPES.find((f) => f.value === q.fieldType)?.label}
                      </Badge>
                      {q.options && q.options.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {q.options.length} option{q.options.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-xs text-muted-foreground">Required</span>
                        <Switch
                          checked={q.required}
                          onCheckedChange={(v) => updateQuestion(editingChecklist.id, q.id, { required: v })}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                        onClick={() => removeQuestion(editingChecklist.id, q.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {HAS_OPTIONS.includes(q.fieldType) && (
                      <div className="mt-2 rounded-md border border-border/60 bg-background p-2.5 space-y-1.5">
                        <p className="text-[11px] font-medium text-muted-foreground mb-1">Options</p>
                        {(q.options ?? []).map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground w-4 shrink-0">{oi + 1}.</span>
                            <Input
                              value={opt}
                              onChange={(e) => updateOption(editingChecklist.id, q.id, oi, e.target.value)}
                              placeholder={`Option ${oi + 1}`}
                              className="h-7 text-xs"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
                              disabled={(q.options?.length ?? 0) <= 1}
                              onClick={() => removeOption(editingChecklist.id, q.id, oi)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(editingChecklist.id, q.id)}
                          className="gap-1.5 text-[11px] h-7 mt-1"
                        >
                          <Plus className="h-3 w-3" /> Add Option
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addQuestion(editingChecklist.id)} className="gap-1.5 text-xs">
                <Plus className="h-3 w-3" /> Add Question
              </Button>
              </div>
              <div className="border-l lg:pl-6 lg:sticky lg:top-0 lg:self-start">
                <ChecklistPreview checklist={editingChecklist} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEditingChecklistId(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Checklist Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Checklist Name</Label>
              <Input value={newChecklist.name} onChange={(e) => setNewChecklist((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Payment Verification" />
            </div>
            <div>
              <Label>Workflow State</Label>
              <Select value={newChecklist.workflowState} onValueChange={(v) => setNewChecklist((p) => ({ ...p, workflowState: v }))}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {WORKFLOW_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateChecklist} disabled={!newChecklist.name.trim() || !newChecklist.workflowState} className="bg-accent text-accent-foreground hover:bg-accent/90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChecklistBuilder;
