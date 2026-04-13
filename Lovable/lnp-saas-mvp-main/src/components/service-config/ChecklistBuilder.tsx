import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Plus, ClipboardCheck, Trash2, Info } from "lucide-react";

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

const WORKFLOW_STATES = [
  "Scrutiny Pending",
  "Inspection Pending",
  "Approval Pending",
  "Application Submitted",
  "Query Raised",
];

const fieldTypeBadgeColor: Record<FieldType, string> = {
  text: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  radio: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  checkbox: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  dropdown: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  file_upload: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const defaultChecklists: Checklist[] = [
  {
    id: "scrutiny",
    name: "Scrutiny Checklist",
    workflowState: "Scrutiny Pending",
    questions: [
      { id: "s1", text: "Applicant details verified", fieldType: "checkbox", required: true },
      { id: "s2", text: "Business address verified", fieldType: "checkbox", required: true },
      { id: "s3", text: "Documents complete", fieldType: "checkbox", required: true },
      { id: "s4", text: "Business category valid", fieldType: "dropdown", required: true, options: ["Valid", "Invalid", "Needs Review"] },
      { id: "s5", text: "Remarks", fieldType: "text", required: false },
    ],
  },
  {
    id: "inspection",
    name: "Inspection Checklist",
    workflowState: "Inspection Pending",
    questions: [
      { id: "i1", text: "Business exists at location", fieldType: "radio", required: true, options: ["Yes", "No"] },
      { id: "i2", text: "Safety compliance met", fieldType: "radio", required: true, options: ["Yes", "No", "Partial"] },
      { id: "i3", text: "Photos uploaded", fieldType: "file_upload", required: true },
      { id: "i4", text: "Inspection Remarks", fieldType: "text", required: false },
    ],
  },
  {
    id: "approval",
    name: "Approval Checklist",
    workflowState: "Approval Pending",
    questions: [
      { id: "a1", text: "Scrutiny completed", fieldType: "checkbox", required: true },
      { id: "a2", text: "Inspection completed", fieldType: "checkbox", required: true },
      { id: "a3", text: "Fees paid", fieldType: "checkbox", required: true },
      { id: "a4", text: "Approve license", fieldType: "radio", required: true, options: ["Approve", "Reject"] },
    ],
  },
];

interface Props {
  moduleName: string;
  onBack: () => void;
}

const ChecklistBuilder: React.FC<Props> = ({ moduleName, onBack }) => {
  const [checklists, setChecklists] = useState<Checklist[]>(defaultChecklists);
  const [showDialog, setShowDialog] = useState(false);
  const [newChecklist, setNewChecklist] = useState({ name: "", workflowState: "" });

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
            Checklists help standardize verification and approvals. Ensure consistent verification before approval.
          </p>
        </div>

        <Accordion type="multiple" defaultValue={checklists.map((c) => c.id)} className="space-y-3">
          {checklists.map((checklist) => (
            <AccordionItem key={checklist.id} value={checklist.id} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <ClipboardCheck className="h-4 w-4 text-accent shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{checklist.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {checklist.workflowState} · {checklist.questions.length} question{checklist.questions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <div className="space-y-3">
                  {checklist.questions.map((q, idx) => (
                    <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                      <span className="text-xs text-muted-foreground font-medium mt-2 w-5 shrink-0">{idx + 1}.</span>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={q.text}
                          onChange={(e) => updateQuestion(checklist.id, q.id, { text: e.target.value })}
                          placeholder="Question text"
                          className="text-sm"
                        />
                        <div className="flex items-center gap-3">
                          <Select
                            value={q.fieldType}
                            onValueChange={(v) => updateQuestion(checklist.id, q.id, { fieldType: v as FieldType })}
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
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-xs text-muted-foreground">Required</span>
                            <Switch
                              checked={q.required}
                              onCheckedChange={(v) => updateQuestion(checklist.id, q.id, { required: v })}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                            onClick={() => removeQuestion(checklist.id, q.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addQuestion(checklist.id)} className="gap-1.5 text-xs">
                    <Plus className="h-3 w-3" /> Add Question
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

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
