import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft, Plus, GitBranch, Pencil, Trash2, ArrowRight,
  Info, CheckCircle2, Circle, ChevronDown, Zap, Bell, FileText,
} from "lucide-react";

interface WorkflowCondition {
  field: string;
  operator: string;
  value: string;
}

interface SystemAction {
  type: "notify" | "generate_document" | "calculate_fee";
  trigger: "on_enter" | "on_exit";
  label: string;
}

interface WorkflowTransition {
  id: string;
  label: string;
  toStage: string;
  requiresComment: boolean;
  conditions: WorkflowCondition[];
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  allowedRoles: string[];
  isInitial: boolean;
  isTerminal: boolean;
  slaHours: number;
  transitions: WorkflowTransition[];
  systemActions: SystemAction[];
}

const ROLES = ["Citizen", "Counter Operator", "Scrutiny Officer", "Field Inspector", "Approving Authority"];
const OPERATORS = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "not equals" },
  { value: "gt", label: "greater than" },
  { value: "lt", label: "less than" },
  { value: "contains", label: "contains" },
];

const defaultStages: WorkflowStage[] = [
  {
    id: "submitted",
    name: "Application Submitted",
    description: "Applicant has submitted the application.",
    allowedRoles: ["Citizen"],
    isInitial: true,
    isTerminal: false,
    slaHours: 24,
    systemActions: [{ type: "notify", trigger: "on_enter", label: "Notify applicant: submission received" }],
    transitions: [
      { id: "t1", label: "Accept for Review", toStage: "under_scrutiny", requiresComment: false, conditions: [] },
      { id: "t2", label: "Return to Applicant", toStage: "query_raised", requiresComment: true, conditions: [] },
    ],
  },
  {
    id: "under_scrutiny",
    name: "Under Scrutiny",
    description: "Documents and form data are being verified by a scrutiny officer.",
    allowedRoles: ["Counter Operator", "Scrutiny Officer"],
    isInitial: false,
    isTerminal: false,
    slaHours: 48,
    systemActions: [{ type: "notify", trigger: "on_enter", label: "Notify applicant: under review" }],
    transitions: [
      { id: "t3", label: "Send for Field Inspection", toStage: "field_inspection", requiresComment: false, conditions: [] },
      { id: "t4", label: "Raise Query", toStage: "query_raised", requiresComment: true, conditions: [] },
      { id: "t5", label: "Reject", toStage: "rejected", requiresComment: true, conditions: [] },
    ],
  },
  {
    id: "field_inspection",
    name: "Field Inspection",
    description: "Physical inspection of the premises or site.",
    allowedRoles: ["Field Inspector"],
    isInitial: false,
    isTerminal: false,
    slaHours: 72,
    systemActions: [],
    transitions: [
      { id: "t6", label: "Inspection Passed", toStage: "pending_approval", requiresComment: false, conditions: [] },
      { id: "t7", label: "Inspection Failed", toStage: "rejected", requiresComment: true, conditions: [] },
    ],
  },
  {
    id: "query_raised",
    name: "Query Raised",
    description: "Applicant has been asked for additional information or documents.",
    allowedRoles: ["Citizen"],
    isInitial: false,
    isTerminal: false,
    slaHours: 168,
    systemActions: [{ type: "notify", trigger: "on_enter", label: "Notify applicant: action required" }],
    transitions: [
      { id: "t8", label: "Respond to Query", toStage: "under_scrutiny", requiresComment: true, conditions: [] },
    ],
  },
  {
    id: "pending_approval",
    name: "Pending Approval",
    description: "Application is awaiting final approval by the authority.",
    allowedRoles: ["Approving Authority"],
    isInitial: false,
    isTerminal: false,
    slaHours: 24,
    systemActions: [],
    transitions: [
      { id: "t9", label: "Approve", toStage: "approved", requiresComment: false, conditions: [] },
      { id: "t10", label: "Reject", toStage: "rejected", requiresComment: true, conditions: [] },
    ],
  },
  {
    id: "approved",
    name: "Approved",
    description: "Application has been approved. Certificate will be generated.",
    allowedRoles: [],
    isInitial: false,
    isTerminal: true,
    slaHours: 0,
    systemActions: [
      { type: "notify", trigger: "on_enter", label: "Notify applicant: approved" },
      { type: "generate_document", trigger: "on_enter", label: "Generate certificate PDF" },
    ],
    transitions: [],
  },
  {
    id: "rejected",
    name: "Rejected",
    description: "Application has been rejected.",
    allowedRoles: [],
    isInitial: false,
    isTerminal: true,
    slaHours: 0,
    systemActions: [{ type: "notify", trigger: "on_enter", label: "Notify applicant: rejected with reason" }],
    transitions: [],
  },
];

interface WorkflowBuilderProps {
  moduleName: string;
  onBack: () => void;
}

const systemActionIcon = (type: SystemAction["type"]) => {
  if (type === "notify") return <Bell className="h-3 w-3" />;
  if (type === "generate_document") return <FileText className="h-3 w-3" />;
  return <Zap className="h-3 w-3" />;
};

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ moduleName, onBack }) => {
  const [stages, setStages] = useState<WorkflowStage[]>(defaultStages);
  const [editingStage, setEditingStage] = useState<WorkflowStage | null>(null);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [editingTransition, setEditingTransition] = useState<{ stageId: string; transition: WorkflowTransition | null } | null>(null);
  const [saved, setSaved] = useState(false);

  const openNewStage = () => {
    setEditingStage({
      id: `stage_${Date.now()}`,
      name: "",
      description: "",
      allowedRoles: [],
      isInitial: false,
      isTerminal: false,
      slaHours: 24,
      transitions: [],
      systemActions: [],
    });
    setShowStageDialog(true);
  };

  const openEditStage = (stage: WorkflowStage) => {
    setEditingStage({ ...stage });
    setShowStageDialog(true);
  };

  const saveStage = () => {
    if (!editingStage) return;
    setStages((prev) => {
      const exists = prev.find((s) => s.id === editingStage.id);
      if (exists) return prev.map((s) => (s.id === editingStage.id ? editingStage : s));
      return [...prev, editingStage];
    });
    setShowStageDialog(false);
    setEditingStage(null);
  };

  const deleteStage = (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const openNewTransition = (stageId: string) => {
    setEditingTransition({
      stageId,
      transition: { id: `tr_${Date.now()}`, label: "", toStage: "", requiresComment: false, conditions: [] },
    });
    setShowTransitionDialog(true);
  };

  const saveTransition = () => {
    if (!editingTransition?.transition) return;
    const { stageId, transition } = editingTransition;
    setStages((prev) =>
      prev.map((s) => {
        if (s.id !== stageId) return s;
        const exists = s.transitions.find((t) => t.id === transition.id);
        return {
          ...s,
          transitions: exists
            ? s.transitions.map((t) => (t.id === transition.id ? transition : t))
            : [...s.transitions, transition],
        };
      })
    );
    setShowTransitionDialog(false);
    setEditingTransition(null);
  };

  const deleteTransition = (stageId: string, transitionId: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId ? { ...s, transitions: s.transitions.filter((t) => t.id !== transitionId) } : s
      )
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleRole = (role: string) => {
    if (!editingStage) return;
    const has = editingStage.allowedRoles.includes(role);
    setEditingStage({
      ...editingStage,
      allowedRoles: has
        ? editingStage.allowedRoles.filter((r) => r !== role)
        : [...editingStage.allowedRoles, role],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-foreground">{moduleName} — Workflow Builder</h1>
              <p className="text-xs text-muted-foreground">
                Design stages, transitions, and system actions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openNewStage} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Stage
            </Button>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
              onClick={handleSave}
            >
              {saved ? <CheckCircle2 className="h-4 w-4" /> : null}
              {saved ? "Saved!" : "Save Workflow"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {/* Info */}
        <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Each <strong>stage</strong> represents a step in your approval process. Add{" "}
            <strong>transitions</strong> to define what actions can move an application to the next stage.
            Mark one stage as <strong>Initial</strong> and at least one as <strong>Terminal</strong>.
          </p>
        </div>

        {/* Visual flow overview */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Flow Overview</p>
            <div className="flex flex-wrap items-center gap-2">
              {stages.map((stage, idx) => (
                <React.Fragment key={stage.id}>
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border ${
                      stage.isInitial
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : stage.isTerminal
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-muted border-border text-foreground"
                    }`}
                  >
                    {stage.isInitial ? (
                      <Circle className="h-2.5 w-2.5 fill-current" />
                    ) : stage.isTerminal ? (
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : (
                      <GitBranch className="h-2.5 w-2.5" />
                    )}
                    {stage.name}
                  </div>
                  {idx < stages.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stages */}
        <Accordion type="multiple" defaultValue={["submitted"]} className="space-y-3">
          {stages.map((stage) => (
            <AccordionItem
              key={stage.id}
              value={stage.id}
              className="border rounded-xl overflow-hidden bg-card"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      stage.isInitial
                        ? "bg-blue-100 text-blue-600"
                        : stage.isTerminal
                        ? "bg-green-100 text-green-600"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{stage.name}</span>
                      {stage.isInitial && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700">
                          Initial
                        </Badge>
                      )}
                      {stage.isTerminal && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700">
                          Terminal
                        </Badge>
                      )}
                      {stage.slaHours > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          SLA: {stage.slaHours}h
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{stage.description}</p>
                  </div>
                  <div className="flex items-center gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditStage(stage)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {!stage.isInitial && !stage.isTerminal && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteStage(stage.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Allowed Roles */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Allowed Roles
                    </p>
                    {stage.allowedRoles.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">System stage — no user roles</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {stage.allowedRoles.map((r) => (
                          <Badge key={r} variant="secondary" className="text-xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* System Actions */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      System Actions
                    </p>
                    {stage.systemActions.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No system actions configured</p>
                    ) : (
                      <div className="space-y-1">
                        {stage.systemActions.map((a, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-foreground">
                            <span className="text-accent">{systemActionIcon(a.type)}</span>
                            <span className="text-muted-foreground capitalize">{a.trigger}:</span>
                            <span>{a.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transitions */}
                {!stage.isTerminal && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Transitions
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs gap-1 text-accent"
                        onClick={() => openNewTransition(stage.id)}
                      >
                        <Plus className="h-3 w-3" /> Add
                      </Button>
                    </div>
                    {stage.transitions.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No transitions yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {stage.transitions.map((t) => {
                          const toStage = stages.find((s) => s.id === t.toStage);
                          return (
                            <div
                              key={t.id}
                              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                            >
                              <div className="flex items-center gap-2 text-xs">
                                <ArrowRight className="h-3.5 w-3.5 text-accent" />
                                <span className="font-medium">{t.label}</span>
                                {toStage && (
                                  <span className="text-muted-foreground">→ {toStage.name}</span>
                                )}
                                {t.requiresComment && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1">
                                    Requires Comment
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteTransition(stage.id, t.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

      {/* Stage Dialog */}
      <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStage?.name ? "Edit Stage" : "Add Stage"}</DialogTitle>
          </DialogHeader>
          {editingStage && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Stage Name *</Label>
                <Input
                  value={editingStage.name}
                  onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                  placeholder="e.g. Under Scrutiny"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={editingStage.description}
                  onChange={(e) => setEditingStage({ ...editingStage, description: e.target.value })}
                  placeholder="What happens at this stage?"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>SLA (hours)</Label>
                <Input
                  type="number"
                  value={editingStage.slaHours}
                  onChange={(e) => setEditingStage({ ...editingStage, slaHours: Number(e.target.value) })}
                  placeholder="24"
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        editingStage.allowedRoles.includes(role)
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background border-border text-foreground hover:border-accent"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingStage.isInitial}
                    onCheckedChange={(v) => setEditingStage({ ...editingStage, isInitial: v, isTerminal: v ? false : editingStage.isTerminal })}
                  />
                  <Label>Initial Stage</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingStage.isTerminal}
                    onCheckedChange={(v) => setEditingStage({ ...editingStage, isTerminal: v, isInitial: v ? false : editingStage.isInitial })}
                  />
                  <Label>Terminal Stage</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStageDialog(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={saveStage}
              disabled={!editingStage?.name}
            >
              Save Stage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transition Dialog */}
      <Dialog open={showTransitionDialog} onOpenChange={setShowTransitionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Transition</DialogTitle>
          </DialogHeader>
          {editingTransition?.transition && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Action Label *</Label>
                <Input
                  value={editingTransition.transition.label}
                  onChange={(e) =>
                    setEditingTransition({
                      ...editingTransition,
                      transition: { ...editingTransition.transition!, label: e.target.value },
                    })
                  }
                  placeholder="e.g. Approve Application"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Move to Stage *</Label>
                <Select
                  value={editingTransition.transition.toStage}
                  onValueChange={(v) =>
                    setEditingTransition({
                      ...editingTransition,
                      transition: { ...editingTransition.transition!, toStage: v },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages
                      .filter((s) => s.id !== editingTransition.stageId)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingTransition.transition.requiresComment}
                  onCheckedChange={(v) =>
                    setEditingTransition({
                      ...editingTransition,
                      transition: { ...editingTransition.transition!, requiresComment: v },
                    })
                  }
                />
                <Label>Require comment when taking this action</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransitionDialog(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={saveTransition}
              disabled={!editingTransition?.transition?.label || !editingTransition?.transition?.toStage}
            >
              Save Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowBuilder;
