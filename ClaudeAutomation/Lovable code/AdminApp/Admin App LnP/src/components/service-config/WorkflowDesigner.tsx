import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Plus, Bell, Check, Circle, Play,
  Square, Save, ChevronRight, ChevronLeft,
  Info, Trash2, IndianRupee, UserCog, Pencil, ClipboardCheck, CreditCard,
  ZoomIn, ZoomOut, Maximize2, ChevronDown, FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useServiceRoles, canonicalRoleId } from "@/lib/useServiceRoles";
import RoleEditorDialog, { emptyRoleDraft, type RoleDraft } from "./RoleEditorDialog";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type StateType = "start" | "in_progress" | "end";
type RoleId = string;

interface WorkflowState {
  id: string;
  name: string;
  description: string;
  type: StateType;
  x: number;
  y: number;
  paymentStageId: string | null;
  notificationIds: string[];
  attachedDocumentIds?: string[];
}

interface WorkflowTransition {
  id: string;
  name: string;
  fromStateId: string;
  toStateId: string;
  roleId: RoleId;
  checklistIds: string[];
  conditionsEnabled: boolean;
}

type Selection =
  | { kind: "state"; id: string }
  | { kind: "transition"; id: string }
  | null;

/* ROLE_OPTIONS / roleName moved to per-component hook (useServiceRoles). */

/* Source list types (mirror configurator shapes) */
type FieldType = "text" | "radio" | "checkbox" | "dropdown" | "file_upload";
interface SrcQuestion { id: string; text: string; fieldType: FieldType; required: boolean; options?: string[]; }
interface SrcChecklist { id: string; name: string; workflowState: string; questions: SrcQuestion[]; }
interface SrcNotification {
  id: string; workflowState: string; subject: string; message: string;
  channel: "email" | "sms" | "push"; recipientRole: string;
  tag: string; tagColor: string;
}
type Gateway = "razorpay" | "paygov" | "custom";
interface SrcPaymentStage {
  id: string; name: string; workflowState: string; fees: string[];
  methods: { online: boolean; counter: boolean };
  gateway: Gateway; generateReceipt: boolean; receiptTemplate?: string;
}


const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "dropdown", label: "Dropdown" },
  { value: "file_upload", label: "File Upload" },
];

const VARIABLES = [
  "{applicationNumber}", "{applicantName}", "{businessName}", "{applicationStatus}",
];

/* ------------------------------------------------------------------ */
/*  Seed Data                                                          */
/* ------------------------------------------------------------------ */

import {
  TRADE_WORKFLOW_STATES,
  TRADE_WORKFLOW_TRANSITIONS,
  TRADE_NOTIFICATIONS,
  TRADE_CHECKLISTS,
  TRADE_STATE_TAG_COLORS,
  TRADE_FEE_NAMES,
} from "@/data/tradeLicenseTemplate";
import {
  RENEWAL_WORKFLOW_STATES,
  RENEWAL_WORKFLOW_TRANSITIONS,
  RENEWAL_NOTIFICATIONS,
  RENEWAL_CHECKLISTS,
  RENEWAL_STATE_LAYOUT,
  RENEWAL_STATE_TAG_COLORS,
  RENEWAL_FEE_NAMES,
  isRenewalModule,
} from "@/data/renewalTemplate";
import { TRADE_PAYMENT_STAGES } from "@/data/tradeLicenseTemplate";
import { RENEWAL_PAYMENT_STAGES } from "@/data/renewalTemplate";
import { useModuleState, MODULE_STATE_EVENT, type ModuleStateEventDetail } from "@/lib/moduleStorage";
import { emitNotificationsUpdated } from "@/lib/useServiceNotifications";
import { emitWorkflowUpdated } from "@/lib/useServiceWorkflow";
import { useServiceConfigOptional } from "@/contexts/ServiceConfigContext";
import ScopeSelector from "@/components/service-config/ScopeSelector";
import {
  Select as CatSelect,
  SelectContent as CatSelectContent,
  SelectItem as CatSelectItem,
  SelectTrigger as CatSelectTrigger,
  SelectValue as CatSelectValue,
} from "@/components/ui/select";

const ISSUANCE_STATE_LAYOUT: Record<string, { x: number; y: number }> = {
  s1:   { x: 60,   y: 100 },
  s_dv: { x: 320,  y: 100 },
  s_ip: { x: 580,  y: 100 },
  s3:   { x: 840,  y: 100 },
  s4:   { x: 1100, y: 100 },
  s5:   { x: 1360, y: 100 },
  s6:   { x: 1620, y: 100 },
  s7:   { x: 580,  y: 320 },
  s8:   { x: 840,  y: 320 },
};

const buildSeedNotifications = (moduleName: string): SrcNotification[] => {
  const renewal = isRenewalModule(moduleName);
  const src = renewal ? RENEWAL_NOTIFICATIONS : TRADE_NOTIFICATIONS;
  const colors = renewal ? RENEWAL_STATE_TAG_COLORS : TRADE_STATE_TAG_COLORS;
  return src.map(n => ({
    id: n.id,
    workflowState: n.workflowState,
    subject: n.subject,
    message: n.message,
    channel: n.channel,
    recipientRole: n.recipientRole,
    tag: n.tag,
    tagColor: colors[n.tag] ?? "bg-muted text-muted-foreground",
  }));
};

const buildSeedChecklists = (moduleName: string): SrcChecklist[] => {
  const src = isRenewalModule(moduleName) ? RENEWAL_CHECKLISTS : TRADE_CHECKLISTS;
  return src.map(c => ({
    id: c.id, name: c.name, workflowState: c.workflowState,
    questions: c.questions.map(q => ({
      id: q.id, text: q.text, fieldType: q.fieldType, required: q.required,
      options: q.options ? [...q.options] : undefined,
    })),
  }));
};

const buildSeedPaymentStages = (moduleName: string): SrcPaymentStage[] => {
  const src = isRenewalModule(moduleName) ? RENEWAL_PAYMENT_STAGES : TRADE_PAYMENT_STAGES;
  return src.map(s => ({
    id: s.id, name: s.name, workflowState: s.workflowState, fees: [...s.fees],
    methods: { online: s.methods.online, counter: s.methods.counter }, gateway: s.gateway,
    generateReceipt: s.generateReceipt, receiptTemplate: s.receiptTemplate,
  }));

};

// Auto-attached documents per state — IDs mirror DocumentDesigner template seeds.
const ISSUANCE_DOC_BY_STATE: Record<string, string[]> = {
  "Submitted":          ["doc-2", "doc-3"], // Application PDF, Acknowledgement
  "Inspection Pending": ["doc-4"],          // Inspection Report
  "Payment Pending":    ["doc-6"],          // Demand Notice
  "Paid":               ["doc-5"],          // Payment Receipt
  "License Issued":     ["doc-1"],          // License Certificate
};
const RENEWAL_DOC_BY_STATE: Record<string, string[]> = {
  "Submitted":       ["rdoc-2", "rdoc-3"],  // Renewal Application PDF, Acknowledgement
  "Payment Pending": ["rdoc-5"],            // Renewal Demand Notice
  "Paid":            ["rdoc-4"],            // Renewal Payment Receipt
  "License Renewed": ["rdoc-1"],            // Renewed License Certificate
};

const buildSeedStates = (
  moduleName: string,
  notifications: SrcNotification[],
  paymentStages: SrcPaymentStage[],
): WorkflowState[] => {
  const renewal = isRenewalModule(moduleName);
  const states = renewal ? RENEWAL_WORKFLOW_STATES : TRADE_WORKFLOW_STATES;
  const layout = renewal ? RENEWAL_STATE_LAYOUT : ISSUANCE_STATE_LAYOUT;
  const docMap = renewal ? RENEWAL_DOC_BY_STATE : ISSUANCE_DOC_BY_STATE;
  return states.map((s) => {
    const pos = layout[s.id] ?? { x: 60, y: 100 };
    const notificationIds = notifications.filter(n => n.workflowState === s.name).map(n => n.id);
    const stage = paymentStages.find(p => p.workflowState === s.name);
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      type: s.type,
      x: pos.x,
      y: pos.y,
      paymentStageId: stage?.id ?? null,
      notificationIds,
      attachedDocumentIds: docMap[s.name] ?? [],
    };
  });
};

// Map legacy camelCase role keys in template seeds to canonical role IDs.
const SEED_ROLE_MAP: Record<string, RoleId> = {
  citizen:          "citizen",
  documentVerifier: "document_verifier",
  fieldInspector:   "field_inspector",
  approver:         "approver",
};

const buildSeedTransitions = (
  moduleName: string,
  checklists: SrcChecklist[],
): WorkflowTransition[] => {
  const renewal = isRenewalModule(moduleName);
  const states = renewal ? RENEWAL_WORKFLOW_STATES : TRADE_WORKFLOW_STATES;
  const src = renewal ? RENEWAL_WORKFLOW_TRANSITIONS : TRADE_WORKFLOW_TRANSITIONS;
  return src.map((t) => {
    const toState = states.find(s => s.id === t.toStateId);
    const matchedChecklists = toState
      ? checklists.filter(c => c.workflowState === toState.name).map(c => c.id)
      : [];
    return {
      id: t.id,
      name: t.name,
      fromStateId: t.fromStateId,
      toStateId: t.toStateId,
      roleId: SEED_ROLE_MAP[t.role as string] ?? "approver",
      checklistIds: matchedChecklists,
      conditionsEnabled: false,
    };
  });
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const stateTypeConfig: Record<StateType, { label: string; color: string; borderColor: string; icon: React.ElementType }> = {
  start: { label: "Start", color: "text-green-600", borderColor: "border-l-green-500", icon: Play },
  in_progress: { label: "In Progress", color: "text-blue-600", borderColor: "border-l-blue-500", icon: Circle },
  end: { label: "End", color: "text-muted-foreground", borderColor: "border-l-muted-foreground", icon: Square },
};

const uid = () => Math.random().toString(36).slice(2, 9);
const NODE_W = 220;
const NODE_H = 140;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  moduleName: string;
  onBack: () => void;
}

const WorkflowDesigner: React.FC<Props> = ({ moduleName, onBack }) => {
  const { id: serviceId = "service" } = useParams();
  const storageSuffix = moduleName;

  /* ---- Source lists (shared with their configurator pages) ---- */
  const [notifications, setNotifications] = useModuleState<SrcNotification[]>(
    "notifications", serviceId, moduleName, () => buildSeedNotifications(moduleName),
  );
  const [checklists, setChecklists] = useModuleState<SrcChecklist[]>(
    "checklists", serviceId, moduleName, () => buildSeedChecklists(moduleName),
  );
  const [paymentStages, setPaymentStages] = useModuleState<SrcPaymentStage[]>(
    "payments", serviceId, moduleName, () => buildSeedPaymentStages(moduleName),
  );

  const [states, setStates] = useModuleState<WorkflowState[]>(
    "workflow-states-v4", serviceId, storageSuffix,
    () => buildSeedStates(moduleName, buildSeedNotifications(moduleName), buildSeedPaymentStages(moduleName)),
  );
  const [transitions, setTransitions] = useModuleState<WorkflowTransition[]>(
    "workflow-transitions-v4", serviceId, storageSuffix,
    () => buildSeedTransitions(moduleName, buildSeedChecklists(moduleName)),
  );

  /* ---- Reconcile state.notificationIds / paymentStageId / transition.checklistIds
         when notifications / checklists / paymentStages change (auto-attach by
         matching workflowState ↔ state.name, drop ids whose source is gone). ---- */
  useEffect(() => {
    const renewal = isRenewalModule(moduleName);
    const docMap = renewal ? RENEWAL_DOC_BY_STATE : ISSUANCE_DOC_BY_STATE;
    setStates((prev) => {
      let dirty = false;
      const validNotifIds = new Set(notifications.map((n) => n.id));
      const validStageIds = new Set(paymentStages.map((p) => p.id));
      const next = prev.map((s) => {
        const matched = notifications.filter((n) => n.workflowState === s.name).map((n) => n.id);
        const merged = Array.from(new Set([
          ...s.notificationIds.filter((id) => validNotifIds.has(id)),
          ...matched,
        ]));
        const stageById = s.paymentStageId && validStageIds.has(s.paymentStageId)
          ? s.paymentStageId
          : (paymentStages.find((p) => p.workflowState === s.name)?.id ?? null);
        // Merge in any newly-seeded doc attachments missing on saved states.
        const seedDocs = docMap[s.name] ?? [];
        const currentDocs = s.attachedDocumentIds ?? [];
        const mergedDocs = Array.from(new Set([...currentDocs, ...seedDocs]));
        const docsChanged = mergedDocs.length !== currentDocs.length;
        const changed =
          merged.length !== s.notificationIds.length ||
          merged.some((id, i) => id !== s.notificationIds[i]) ||
          stageById !== s.paymentStageId ||
          docsChanged;
        if (changed) dirty = true;
        return changed
          ? { ...s, notificationIds: merged, paymentStageId: stageById, attachedDocumentIds: mergedDocs }
          : s;
      });
      return dirty ? next : prev;
    });

    setTransitions((prev) => {
      let dirty = false;
      const validChecklistIds = new Set(checklists.map((c) => c.id));
      const next = prev.map((t) => {
        // map by destination state name
        const toState = states.find((s) => s.id === t.toStateId);
        const matched = toState
          ? checklists.filter((c) => c.workflowState === toState.name).map((c) => c.id)
          : [];
        const merged = Array.from(new Set([
          ...t.checklistIds.filter((id) => validChecklistIds.has(id)),
          ...matched,
        ]));
        const changed =
          merged.length !== t.checklistIds.length ||
          merged.some((id, i) => id !== t.checklistIds[i]);
        if (changed) dirty = true;
        return changed ? { ...t, checklistIds: merged } : t;
      });
      return dirty ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, checklists, paymentStages]);

  /* ---- Cross-page sync: when NotificationsManager / ChecklistBuilder /
         PaymentsConfigurator edit storage from another route, this listener
         doesn't re-read (useModuleState already owns the state), but it forces
         a re-render so children depending on derived values stay fresh. ---- */
  const [, forceTick] = useState(0);
  useEffect(() => {
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<ModuleStateEventDetail>).detail;
      if (!detail) return;
      if (detail.serviceId !== serviceId || detail.moduleName !== moduleName) return;
      if (detail.prefix === "notifications" || detail.prefix === "checklists" || detail.prefix === "payments") {
        forceTick((n) => n + 1);
      }
    };
    window.addEventListener(MODULE_STATE_EVENT, onEvent);
    return () => window.removeEventListener(MODULE_STATE_EVENT, onEvent);
  }, [serviceId, moduleName]);

  /* ---- Configured documents (read-only mirror of Document Designer) ---- */
  const docKey = `documents:${serviceId}:${moduleName}`;
  const readDocs = useCallback((): { id: string; name: string }[] => {
    try {
      const raw = localStorage.getItem(docKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((d) => d && typeof d.id === "string")
          .map((d) => ({ id: d.id as string, name: (d.name as string) || "Untitled" }));
      }
    } catch { /* ignore */ }
    return [];
  }, [docKey]);
  const [configuredDocs, setConfiguredDocs] = useState<{ id: string; name: string }[]>(() => readDocs());
  useEffect(() => {
    setConfiguredDocs(readDocs());
    const onStorage = (e: StorageEvent) => { if (e.key === docKey) setConfiguredDocs(readDocs()); };
    const onFocus = () => setConfiguredDocs(readDocs());
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [docKey, readDocs]);

  /* ---- Roles (shared across modules of this service) ---- */
  const [serviceRoles, setServiceRoles] = useServiceRoles(serviceId, moduleName);
  const ROLE_OPTIONS = serviceRoles.map((r) => ({ id: r.id, name: r.name }));
  const roleName = (id: RoleId) => {
    const canon = canonicalRoleId(id);
    return serviceRoles.find((r) => r.id === canon)?.name ?? id;
  };
  const fallbackRoleId: RoleId = serviceRoles[0]?.id ?? "approver";

  /* ---- Inline role creation (from any role Select) ---- */
  const CREATE_ROLE_SENTINEL = "__create_role__";
  const [roleDraft, setRoleDraft] = useState<RoleDraft | null>(null);
  // Where the freshly-created role id should be applied after save.
  const [roleCreationTarget, setRoleCreationTarget] = useState<
    | { kind: "newTransition" }
    | { kind: "transition"; transitionId: string }
    | null
  >(null);

  const handleRoleSelectChange = (
    value: string,
    apply: (roleId: RoleId) => void,
    target: { kind: "newTransition" } | { kind: "transition"; transitionId: string },
  ) => {
    if (value === CREATE_ROLE_SENTINEL) {
      setRoleCreationTarget(target);
      setRoleDraft(emptyRoleDraft());
      return;
    }
    apply(value as RoleId);
  };

  const saveNewRole = (values: { name: string; description: string; permissions: string[] }) => {
    const base = values.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "role";
    let id = base;
    let i = 1;
    while (serviceRoles.some((r) => r.id === id)) { i += 1; id = `${base}_${i}`; }
    setServiceRoles((prev) => [
      ...prev,
      { id, name: values.name, description: values.description, permissions: values.permissions },
    ]);
    if (roleCreationTarget?.kind === "newTransition") {
      setNewTransRole(id);
    } else if (roleCreationTarget?.kind === "transition") {
      updateTransition(roleCreationTarget.transitionId, { roleId: id });
    }
    setRoleCreationTarget(null);
    setRoleDraft(null);
    toast({ title: `Role "${values.name}" created` });
  };


  const [view, setView] = useState<"visual" | "table">("visual");
  const [tableTab, setTableTab] = useState<"states" | "actions">("actions");
  const [selection, setSelection] = useState<Selection>(null);
  const [showAddState, setShowAddState] = useState(false);
  const [newStateName, setNewStateName] = useState("");
  const [newStateType, setNewStateType] = useState<StateType>("in_progress");
  const [showAddTransition, setShowAddTransition] = useState(false);
  const [newTransName, setNewTransName] = useState("");
  const [newTransFrom, setNewTransFrom] = useState("");
  const [newTransTo, setNewTransTo] = useState("");
  const [newTransRole, setNewTransRole] = useState<RoleId>("approver");

  /* ---- Edit dialogs ---- */
  const [editingNotif, setEditingNotif] = useState<SrcNotification | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<SrcChecklist | null>(null);
  const [editingStage, setEditingStage] = useState<SrcPaymentStage | null>(null);

  const inspectorKey = `workflow-inspector-collapsed:${serviceId}`;
  const [inspectorCollapsed, setInspectorCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(inspectorKey) === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(inspectorKey, inspectorCollapsed ? "1" : "0"); } catch {}
  }, [inspectorCollapsed, inspectorKey]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number; moved: boolean } | null>(null);

  /* ---- Zoom & Pan ---- */
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { panRef.current = pan; }, [pan]);
  const panDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const clampZoom = (z: number) => Math.min(2, Math.max(0.3, z));
  const zoomIn = () => setZoom(z => clampZoom(z * 1.2));
  const zoomOut = () => setZoom(z => clampZoom(z / 1.2));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const onCanvasWheel = useCallback((e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newZoom = clampZoom(zoomRef.current * factor);
    // zoom toward cursor
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const ratio = newZoom / zoomRef.current;
    setPan(p => ({ x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio }));
    setZoom(newZoom);
  }, []);

  const onCanvasBgMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    panDragRef.current = { startX: e.clientX, startY: e.clientY, origX: panRef.current.x, origY: panRef.current.y };
  };

  const WORKFLOW_STATE_NAMES = useMemo(
    () => Array.from(new Set(states.map(s => s.name))),
    [states],
  );

  /* ---- Drag logic ---- */
  const handleMouseDown = useCallback((e: React.MouseEvent, stateId: string, sx: number, sy: number) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const z = zoomRef.current; const p = panRef.current;
    dragRef.current = {
      id: stateId,
      offsetX: e.clientX - rect.left - (sx * z + p.x),
      offsetY: e.clientY - rect.top - (sy * z + p.y),
      moved: false,
    };
    setSelection({ kind: "state", id: stateId });
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (panDragRef.current) {
        const dx = e.clientX - panDragRef.current.startX;
        const dy = e.clientY - panDragRef.current.startY;
        setPan({ x: panDragRef.current.origX + dx, y: panDragRef.current.origY + dy });
        return;
      }
      const drag = dragRef.current;
      if (!drag || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const z = zoomRef.current; const p = panRef.current;
      const nx = Math.max(0, (e.clientX - rect.left - p.x - drag.offsetX) / z);
      const ny = Math.max(0, (e.clientY - rect.top - p.y - drag.offsetY) / z);
      drag.moved = true;
      const draggedStateId = drag.id;
      setStates(prev => prev.map(s => s.id === draggedStateId ? { ...s, x: nx, y: ny } : s));
    };
    const onUp = () => { dragRef.current = null; panDragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [setStates]);

  /* ---- State CRUD ---- */
  const addState = () => {
    if (!newStateName.trim()) return;
    if (newStateType === "start" && states.some(s => s.type === "start")) {
      toast({ title: "Only one Start state allowed", variant: "destructive" });
      return;
    }
    const maxX = Math.max(...states.map(s => s.x), 0);
    setStates(prev => [...prev, {
      id: uid(), name: newStateName.trim(), description: "", type: newStateType,
      x: maxX + 280, y: 180, paymentStageId: null, notificationIds: [],
    }]);
    setNewStateName(""); setNewStateType("in_progress"); setShowAddState(false);
    emitWorkflowUpdated(serviceId);
  };

  const updateState = (id: string, updates: Partial<WorkflowState>) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    emitWorkflowUpdated(serviceId);
  };

  const deleteState = (id: string) => {
    const target = states.find(s => s.id === id);
    if (!target) return;
    if (target.type === "start" && states.filter(s => s.type === "start").length === 1) {
      toast({ title: "Cannot delete the only Start state", variant: "destructive" });
      return;
    }
    const linked = transitions.filter(t => t.fromStateId === id || t.toStateId === id);
    if (linked.length > 0) {
      const ok = window.confirm(
        `Delete "${target.name}"?\n\nThis will also remove ${linked.length} action${linked.length === 1 ? "" : "s"} connected to it.`
      );
      if (!ok) return;
      setTransitions(prev => prev.filter(t => t.fromStateId !== id && t.toStateId !== id));
    }
    setStates(prev => prev.filter(s => s.id !== id));
    setSelection(null);
    toast({ title: `State "${target.name}" deleted` });
    emitWorkflowUpdated(serviceId);
  };

  /* ---- Transition CRUD ---- */
  const addTransition = () => {
    if (!newTransName.trim() || !newTransFrom || !newTransTo) return;
    setTransitions(prev => [...prev, {
      id: uid(), name: newTransName.trim(), fromStateId: newTransFrom, toStateId: newTransTo,
      roleId: newTransRole, checklistIds: [], conditionsEnabled: false,
    }]);
    setNewTransName(""); setNewTransFrom(""); setNewTransTo(""); setNewTransRole("approver");
    setShowAddTransition(false);
    emitWorkflowUpdated(serviceId);
  };

  const updateTransition = (id: string, updates: Partial<WorkflowTransition>) => {
    setTransitions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    emitWorkflowUpdated(serviceId);
  };

  const deleteTransition = (id: string) => {
    setTransitions(prev => prev.filter(t => t.id !== id));
    setSelection(null);
    emitWorkflowUpdated(serviceId);
  };

  /* ---- Source CRUD helpers ---- */
  const upsertNotification = (n: SrcNotification) => {
    setNotifications(prev => prev.some(x => x.id === n.id)
      ? prev.map(x => x.id === n.id ? n : x)
      : [...prev, n]);
    emitNotificationsUpdated(serviceId);
  };
  const upsertChecklist = (c: SrcChecklist) => {
    setChecklists(prev => prev.some(x => x.id === c.id)
      ? prev.map(x => x.id === c.id ? c : x)
      : [...prev, c]);
  };
  const upsertStage = (s: SrcPaymentStage) => {
    setPaymentStages(prev => prev.some(x => x.id === s.id)
      ? prev.map(x => x.id === s.id ? s : x)
      : [...prev, s]);
  };

  const createNotificationFor = (stateId: string) => {
    const st = states.find(s => s.id === stateId);
    const tagColors = isRenewalModule(moduleName) ? RENEWAL_STATE_TAG_COLORS : TRADE_STATE_TAG_COLORS;
    const tag = st?.name ?? "";
    const draft: SrcNotification = {
      id: crypto.randomUUID(),
      workflowState: tag,
      subject: "",
      message: "",
      channel: "email",
      recipientRole: fallbackRoleId,
      tag,
      tagColor: tagColors[tag] ?? "bg-muted text-muted-foreground",
    };
    setEditingNotif(draft);
  };
  const createChecklistFor = (transitionId: string) => {
    const t = transitions.find(x => x.id === transitionId);
    const toState = t ? states.find(s => s.id === t.toStateId) : null;
    setEditingChecklist({
      id: crypto.randomUUID(),
      name: "",
      workflowState: toState?.name ?? "",
      questions: [],
    });
  };
  const createStageFor = (stateId: string) => {
    const st = states.find(s => s.id === stateId);
    setEditingStage({
      id: crypto.randomUUID(),
      name: "",
      workflowState: st?.name ?? "",
      fees: [],
      methods: { online: true, counter: false },


      gateway: "razorpay",
      generateReceipt: false,
    });
  };

  /* ---- Selected ---- */
  const selectedState = selection?.kind === "state" ? states.find(s => s.id === selection.id) : null;
  const selectedTransition = selection?.kind === "transition" ? transitions.find(t => t.id === selection.id) : null;

  /* ---- Arrow ---- */
  const computeArrow = (from: WorkflowState, to: WorkflowState) => {
    const x1 = from.x + NODE_W;
    const y1 = from.y + NODE_H / 2;
    const x2 = to.x;
    const y2 = to.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    return { x1, y1, x2, y2, mx, my: (y1 + y2) / 2, path: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` };
  };

  /* ---- Empty ---- */
  if (states.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header moduleName={moduleName} onBack={onBack} view={view} setView={setView} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Start by adding your first state</h2>
            <p className="text-sm text-muted-foreground mb-6">Define the steps in your process flow.</p>
            <Button onClick={() => setShowAddState(true)} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" /> Add First State
            </Button>
          </div>
        </div>
        <AddStateDialog open={showAddState} onOpenChange={setShowAddState} name={newStateName} setName={setNewStateName} type={newStateType} setType={setNewStateType} onAdd={addState} states={states} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header moduleName={moduleName} onBack={onBack} view={view} setView={setView}
        onSave={() => toast({ title: "Workflow saved" })}
        extra={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAddState(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add State
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddTransition(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Action
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          {view === "visual" ? (
            <div
              ref={canvasRef}
              className="relative w-full h-full min-h-[600px] overflow-hidden"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
                cursor: panDragRef.current ? "grabbing" : "default",
              }}
              onClick={() => setSelection(null)}
              onMouseDown={onCanvasBgMouseDown}
              onWheel={onCanvasWheel}
            >
              {/* Zoom controls */}
              <div className="absolute top-3 right-3 z-30 flex flex-col gap-1 bg-card border rounded-md shadow-sm p-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); zoomIn(); }} title="Zoom in">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); zoomOut(); }} title="Zoom out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); resetView(); }} title="Reset view">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <div className="text-[10px] text-center text-muted-foreground px-1">{Math.round(zoom * 100)}%</div>
              </div>
              <div className="absolute bottom-3 left-3 z-30 text-[10px] text-muted-foreground bg-card/80 border rounded px-2 py-1 pointer-events-none">
                Drag empty area to pan • Ctrl/⌘ + scroll to zoom
              </div>
              <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  width: 4000,
                  height: 2000,
                  pointerEvents: "none",
                }}
              >
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--accent))" />
                  </marker>
                </defs>
                {transitions.map(t => {
                  const from = states.find(s => s.id === t.fromStateId);
                  const to = states.find(s => s.id === t.toStateId);
                  if (!from || !to) return null;
                  const a = computeArrow(from, to);
                  const isSelected = selection?.kind === "transition" && selection.id === t.id;
                  return (
                    <g key={t.id}>
                      <path d={a.path} fill="none"
                        stroke={isSelected ? "hsl(var(--accent))" : "hsl(var(--border))"}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Transition labels */}
              {transitions.map(t => {
                const from = states.find(s => s.id === t.fromStateId);
                const to = states.find(s => s.id === t.toStateId);
                if (!from || !to) return null;
                const a = computeArrow(from, to);
                const isSelected = selection?.kind === "transition" && selection.id === t.id;
                return (
                  <button
                    key={`label-${t.id}`}
                    className={`absolute z-10 text-xs font-medium px-2 py-0.5 rounded-full border cursor-pointer transition-colors flex items-center gap-1.5 pointer-events-auto
                      ${isSelected
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card text-foreground border-border hover:border-accent"}`}
                    style={{ left: a.mx - 60, top: a.my - 12 }}
                    onClick={(e) => { e.stopPropagation(); setSelection({ kind: "transition", id: t.id }); }}
                  >
                    {t.name}
                    <span className={`text-[9px] px-1.5 rounded-full border ${isSelected ? "border-accent-foreground/30" : "border-border bg-muted/40 text-muted-foreground"}`}>
                      {roleName(t.roleId)}
                    </span>
                    {t.checklistIds.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
                        <Check className="h-2.5 w-2.5" />{t.checklistIds.length}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* State nodes */}
              {states.map(s => {
                const cfg = stateTypeConfig[s.type];
                const isSelected = selection?.kind === "state" && selection.id === s.id;
                const stage = s.paymentStageId ? paymentStages.find(p => p.id === s.paymentStageId) : null;
                const notifCount = s.notificationIds.length;
                return (
                  <div
                    key={s.id}
                    className={`absolute z-20 rounded-lg border-l-4 bg-card border shadow-sm cursor-grab select-none transition-shadow pointer-events-auto
                      ${cfg.borderColor}
                      ${isSelected ? "ring-2 ring-accent shadow-md" : "hover:shadow-md"}`}
                    style={{ left: s.x, top: s.y, width: NODE_W }}
                    onMouseDown={(e) => handleMouseDown(e, s.id, s.x, s.y)}
                    onClick={(e) => { e.stopPropagation(); setSelection({ kind: "state", id: s.id }); }}
                  >
                    <div className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-semibold tracking-wider ${cfg.color}`}>{cfg.label}</span>
                        <div className="flex items-center gap-1">
                          {notifCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <Bell className="h-3 w-3" />{notifCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground leading-tight">{s.name}</h4>
                      {s.description && (
                        <p className="text-[11px] text-muted-foreground leading-snug">{s.description}</p>
                      )}
                      {stage && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded px-1.5 py-0.5">
                          <IndianRupee className="h-2.5 w-2.5" /> {stage.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="p-6 space-y-4">
              <div className="flex rounded-md border overflow-hidden w-fit">
                <button onClick={() => setTableTab("states")}
                  className={`text-xs font-medium px-3 py-1.5 transition-colors ${tableTab === "states" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                  States ({states.length})
                </button>
                <button onClick={() => setTableTab("actions")}
                  className={`text-xs font-medium px-3 py-1.5 transition-colors ${tableTab === "actions" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                  Actions ({transitions.length})
                </button>
              </div>

              {tableTab === "states" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Payment Stage</TableHead>
                      <TableHead>Notifications</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {states.map(s => {
                      const stage = s.paymentStageId ? paymentStages.find(p => p.id === s.paymentStageId) : null;
                      return (
                        <TableRow key={s.id}
                          className={`cursor-pointer ${selection?.kind === "state" && selection.id === s.id ? "bg-accent/5" : ""}`}
                          onClick={() => { setSelection({ kind: "state", id: s.id }); setInspectorCollapsed(false); }}
                        >
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs capitalize">{stateTypeConfig[s.type].label}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {stage ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                <IndianRupee className="h-3 w-3" /> {stage.name}
                              </span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{s.notificationIds.length}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Checklists</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transitions.map(t => {
                      const from = states.find(s => s.id === t.fromStateId);
                      const to = states.find(s => s.id === t.toStateId);
                      const attached = t.checklistIds.map(id => checklists.find(c => c.id === id)).filter(Boolean) as SrcChecklist[];
                      return (
                        <TableRow key={t.id}
                          className={`cursor-pointer ${selection?.kind === "transition" && selection.id === t.id ? "bg-accent/5" : ""}`}
                          onClick={() => { setSelection({ kind: "transition", id: t.id }); setInspectorCollapsed(false); }}
                        >
                          <TableCell>{from?.name || "—"}</TableCell>
                          <TableCell>{to?.name || "—"}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{t.name}</Badge></TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-xs text-foreground">
                              <UserCog className="h-3 w-3 text-muted-foreground" />
                              {roleName(t.roleId)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {attached.length === 0
                              ? <span className="text-muted-foreground">—</span>
                              : <div className="flex flex-wrap gap-1">{attached.map(c => (
                                  <Badge key={c.id} variant="outline" className="text-[10px]">{c.name}</Badge>
                                ))}</div>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>

        {/* RIGHT INSPECTOR */}
        <div className={`border-l bg-card overflow-hidden shrink-0 transition-[width] duration-200 flex ${inspectorCollapsed ? "w-10" : "w-[360px]"}`}>
          <button
            onClick={() => setInspectorCollapsed(v => !v)}
            className="w-10 shrink-0 border-r flex items-start justify-center pt-3 hover:bg-muted/50 transition-colors"
            aria-label={inspectorCollapsed ? "Expand inspector" : "Collapse inspector"}
            title={inspectorCollapsed ? "Expand inspector" : "Collapse inspector"}
          >
            {inspectorCollapsed ? <ChevronLeft className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>

          {!inspectorCollapsed && (
            <div className="flex-1 overflow-y-auto">
              {!selection && (
                <div className="p-6 text-center text-sm text-muted-foreground mt-20">
                  <Info className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                  <p>Select a state or action to view its properties.</p>
                </div>
              )}

              {/* STATE INSPECTOR */}
              {selectedState && (
                <div className="p-4 space-y-5">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">State Properties</h3>
                    <p className="text-xs text-muted-foreground">Lifecycle status configuration</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State Name</Label>
                    <Input value={selectedState.name} onChange={e => updateState(selectedState.id, { name: e.target.value })} className="h-9 text-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State Type</Label>
                    <Select value={selectedState.type} onValueChange={(v: StateType) => {
                      if (v === "start" && states.some(s => s.type === "start" && s.id !== selectedState.id)) {
                        toast({ title: "Only one Start state allowed", variant: "destructive" });
                        return;
                      }
                      updateState(selectedState.id, { type: v });
                    }}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start">Start</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="end">End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</Label>
                    <Input value={selectedState.description} onChange={e => updateState(selectedState.id, { description: e.target.value })} className="h-9 text-sm" placeholder="Short description" />
                  </div>

                  {/* Payment stage picker */}
                  <div className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5 text-amber-600" />
                      <Label className="text-xs font-semibold text-foreground">Payment collected here</Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Pick a configured payment stage to charge the citizen when the application enters this state.
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Select
                        value={selectedState.paymentStageId ?? "__none"}
                        onValueChange={(v) => updateState(selectedState.id, { paymentStageId: v === "__none" ? null : v })}
                      >
                        <SelectTrigger className="h-9 text-sm flex-1"><SelectValue placeholder="No payment" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No payment</SelectItem>
                          {paymentStages.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedState.paymentStageId && (
                        <Button size="icon" variant="ghost" className="h-9 w-9"
                          onClick={() => {
                            const s = paymentStages.find(p => p.id === selectedState.paymentStageId);
                            if (s) setEditingStage({ ...s, methods: { ...s.methods }, fees: [...s.fees] });
                          }}
                          title="Edit stage"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs"
                      onClick={() => createStageFor(selectedState.id)}>
                      <Plus className="h-3 w-3" /> New payment stage
                    </Button>
                  </div>

                  {/* Notifications picker (dropdown) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications on entry</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between text-xs font-normal">
                          <span className="truncate">
                            {selectedState.notificationIds.length === 0
                              ? "None attached"
                              : `${selectedState.notificationIds.length} attached`}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[320px] p-0" align="start">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic p-3">No notifications configured yet.</p>
                        ) : (
                          <div className="max-h-64 overflow-y-auto p-1">
                            {notifications.map(n => {
                              const attached = selectedState.notificationIds.includes(n.id);
                              return (
                                <div key={n.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                                  <Checkbox
                                    checked={attached}
                                    onCheckedChange={() => {
                                      const next = attached
                                        ? selectedState.notificationIds.filter(id => id !== n.id)
                                        : [...selectedState.notificationIds, n.id];
                                      updateState(selectedState.id, { notificationIds: next });
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs font-medium text-foreground truncate">{n.subject || n.message?.slice(0, 40) || "(untitled)"}</p>
                                      <button onClick={() => setEditingNotif({ ...n })}
                                        className="text-muted-foreground hover:text-foreground shrink-0" title="Edit">
                                        <Pencil className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <div className="flex gap-1.5 mt-0.5">
                                      <span className="text-[9px] uppercase text-muted-foreground">{n.channel}</span>
                                      <span className="text-[9px] uppercase text-muted-foreground">· {roleName(n.recipientRole)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs"
                      onClick={() => createNotificationFor(selectedState.id)}>
                      <Plus className="h-3 w-3" /> New notification
                    </Button>
                  </div>

                  {/* Attached documents (dropdown) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attached documents</Label>
                    {(() => {
                      const attachedIds = (selectedState.attachedDocumentIds ?? []).filter(id => configuredDocs.some(d => d.id === id));
                      const attachedNames = attachedIds.map(id => configuredDocs.find(d => d.id === id)?.name).filter(Boolean) as string[];
                      return (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-between text-xs font-normal">
                              <span className="truncate text-left">
                                {attachedNames.length === 0 ? "None attached" : attachedNames.join(", ")}
                              </span>
                              <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[320px] p-0" align="start">
                            {configuredDocs.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic p-3">
                                No documents configured yet — add them in Document Designer.
                              </p>
                            ) : (
                              <div className="max-h-64 overflow-y-auto p-1">
                                {configuredDocs.map(d => {
                                  const checked = attachedIds.includes(d.id);
                                  return (
                                    <label key={d.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={() => {
                                          const next = checked
                                            ? attachedIds.filter(id => id !== d.id)
                                            : [...attachedIds, d.id];
                                          updateState(selectedState.id, { attachedDocumentIds: next });
                                        }}
                                      />
                                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <span className="text-xs text-foreground truncate">{d.name}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      );
                    })()}
                  </div>


                  <div className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => deleteState(selectedState.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete State
                    </Button>
                  </div>
                </div>
              )}

              {/* TRANSITION INSPECTOR */}
              {selectedTransition && (() => {
                const from = states.find(s => s.id === selectedTransition.fromStateId);
                const to = states.find(s => s.id === selectedTransition.toStateId);
                return (
                  <div className="p-4 space-y-5">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        {selectedTransition.name}
                        <Badge variant="secondary" className="text-[10px]">Action</Badge>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        From <span className="font-medium text-foreground">{from?.name ?? "—"}</span> → <span className="font-medium text-foreground">{to?.name ?? "—"}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Name</Label>
                      <Input value={selectedTransition.name} onChange={e => updateTransition(selectedTransition.id, { name: e.target.value })} className="h-9 text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</Label>
                        <Select value={selectedTransition.fromStateId} onValueChange={v => updateTransition(selectedTransition.id, { fromStateId: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</Label>
                        <Select value={selectedTransition.toStateId} onValueChange={v => updateTransition(selectedTransition.id, { toStateId: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performed by (Role)</Label>
                      <Select
                        value={selectedTransition.roleId}
                        onValueChange={(v) => handleRoleSelectChange(
                          v,
                          (roleId) => updateTransition(selectedTransition.id, { roleId }),
                          { kind: "transition", transitionId: selectedTransition.id },
                        )}
                      >
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                          <SelectItem value={CREATE_ROLE_SENTINEL} className="text-accent font-medium">
                            + Create new role…
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Checklist picker (dropdown) */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checklists to complete</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-between text-xs font-normal">
                            <span className="truncate">
                              {selectedTransition.checklistIds.length === 0
                                ? "None attached"
                                : `${selectedTransition.checklistIds.length} attached`}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0" align="start">
                          {checklists.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic p-3">No checklists configured yet.</p>
                          ) : (
                            <div className="max-h-64 overflow-y-auto p-1">
                              {checklists.map(c => {
                                const attached = selectedTransition.checklistIds.includes(c.id);
                                return (
                                  <div key={c.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                                    <Checkbox
                                      checked={attached}
                                      onCheckedChange={() => {
                                        const next = attached
                                          ? selectedTransition.checklistIds.filter(id => id !== c.id)
                                          : [...selectedTransition.checklistIds, c.id];
                                        updateTransition(selectedTransition.id, { checklistIds: next });
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-medium text-foreground truncate">{c.name || "(untitled)"}</p>
                                        <button onClick={() => setEditingChecklist({
                                          ...c, questions: c.questions.map(q => ({ ...q, options: q.options ? [...q.options] : undefined })),
                                        })} className="text-muted-foreground hover:text-foreground shrink-0" title="Edit">
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground">
                                        {c.workflowState ? `${c.workflowState} · ` : ""}{c.questions.length} question{c.questions.length === 1 ? "" : "s"}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs"
                        onClick={() => createChecklistFor(selectedTransition.id)}>
                        <Plus className="h-3 w-3" /> New checklist
                      </Button>
                    </div>


                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-foreground">Add Conditions</Label>
                        <Switch checked={selectedTransition.conditionsEnabled}
                          onCheckedChange={v => updateTransition(selectedTransition.id, { conditionsEnabled: v })} />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        When enabled, this action only appears if specific metadata criteria are met.
                      </p>
                    </div>

                    <div className="border-t pt-3">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => deleteTransition(selectedTransition.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete Action
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Add State / Action Dialogs */}
      <AddStateDialog open={showAddState} onOpenChange={setShowAddState} name={newStateName} setName={setNewStateName} type={newStateType} setType={setNewStateType} onAdd={addState} states={states} />

      <Dialog open={showAddTransition} onOpenChange={setShowAddTransition}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Action</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Action Name</Label>
              <Input value={newTransName} onChange={e => setNewTransName(e.target.value)} placeholder='e.g. "Approve"' className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">From State</Label>
                <Select value={newTransFrom} onValueChange={setNewTransFrom}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To State</Label>
                <Select value={newTransTo} onValueChange={setNewTransTo}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Performed by (Role)</Label>
              <Select
                value={newTransRole}
                onValueChange={(v) => handleRoleSelectChange(
                  v,
                  (roleId) => setNewTransRole(roleId),
                  { kind: "newTransition" },
                )}
              >
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  <SelectItem value={CREATE_ROLE_SENTINEL} className="text-accent font-medium">
                    + Create new role…
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTransition(false)}>Cancel</Button>
            <Button onClick={addTransition} className="bg-accent text-accent-foreground hover:bg-accent/90">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification edit dialog */}
      <NotificationEditDialog
        value={editingNotif}
        workflowStates={WORKFLOW_STATE_NAMES}
        roles={ROLE_OPTIONS}
        moduleName={moduleName}
        onClose={() => setEditingNotif(null)}
        onSave={(n) => {
          upsertNotification(n);
          // Auto-attach if state currently selected
          if (selectedState) {
            const ids = selectedState.notificationIds.includes(n.id)
              ? selectedState.notificationIds
              : [...selectedState.notificationIds, n.id];
            updateState(selectedState.id, { notificationIds: ids });
          }
          setEditingNotif(null);
        }}
        onDelete={(id) => {
          setNotifications(prev => prev.filter(n => n.id !== id));
          setStates(prev => prev.map(s => ({
            ...s, notificationIds: s.notificationIds.filter(nid => nid !== id),
          })));
          setEditingNotif(null);
          emitNotificationsUpdated(serviceId);
        }}
      />

      {/* Checklist edit dialog */}
      <ChecklistEditDialog
        value={editingChecklist}
        workflowStates={WORKFLOW_STATE_NAMES}
        onClose={() => setEditingChecklist(null)}
        onSave={(c) => {
          upsertChecklist(c);
          if (selectedTransition) {
            const ids = selectedTransition.checklistIds.includes(c.id)
              ? selectedTransition.checklistIds
              : [...selectedTransition.checklistIds, c.id];
            updateTransition(selectedTransition.id, { checklistIds: ids });
          }
          setEditingChecklist(null);
        }}
        onDelete={(id) => {
          setChecklists(prev => prev.filter(c => c.id !== id));
          setTransitions(prev => prev.map(t => ({
            ...t, checklistIds: t.checklistIds.filter(cid => cid !== id),
          })));
          setEditingChecklist(null);
          emitWorkflowUpdated(serviceId);
        }}
      />

      {/* Payment stage edit dialog */}
      <PaymentStageEditDialog
        value={editingStage}
        workflowStates={WORKFLOW_STATE_NAMES}
        moduleName={moduleName}
        onClose={() => setEditingStage(null)}
        onSave={(s) => {
          upsertStage(s);
          if (selectedState) {
            updateState(selectedState.id, { paymentStageId: s.id });
          }
          setEditingStage(null);
        }}
        onDelete={(id) => {
          setPaymentStages(prev => prev.filter(s => s.id !== id));
          setStates(prev => prev.map(s => s.paymentStageId === id ? { ...s, paymentStageId: null } : s));
          setEditingStage(null);
          emitWorkflowUpdated(serviceId);
        }}
      />

      {/* Inline create-role dialog (shared with Roles Designer) */}
      <RoleEditorDialog
        draft={roleDraft}
        onClose={() => { setRoleDraft(null); setRoleCreationTarget(null); }}
        onSave={saveNewRole}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const Header: React.FC<{
  moduleName: string;
  onBack: () => void;
  view: "visual" | "table";
  setView: (v: "visual" | "table") => void;
  onSave?: () => void;
  extra?: React.ReactNode;
}> = ({ moduleName, onBack, view, setView, onSave, extra }) => (
  <header className="border-b bg-card shrink-0">
    <div className="px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="font-bold text-foreground text-sm">{moduleName} — Workflow</h1>
          <p className="text-xs text-muted-foreground">Capture every state and action in your process</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {extra}
        <div className="flex rounded-md border overflow-hidden">
          <button onClick={() => setView("visual")}
            className={`text-xs font-medium px-3 py-1.5 transition-colors ${view === "visual" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
            Visual
          </button>
          <button onClick={() => setView("table")}
            className={`text-xs font-medium px-3 py-1.5 transition-colors ${view === "table" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
            Table
          </button>
        </div>
        {onSave && (
          <Button size="sm" variant="outline" onClick={onSave} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        )}
      </div>
    </div>
  </header>
);

const ScopeBar: React.FC<{
  cfg: ReturnType<typeof useServiceConfigOptional>;
  scope: "shared" | "by_category" | "by_subcategory";
  categories: string[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
}> = ({ cfg, scope, categories, activeCategory, setActiveCategory }) => {
  if (!cfg || !cfg.hasCategories) return null;
  return (
    <div className="border-b bg-muted/20 px-4 py-2 flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground">Apply to:</span>
      <ScopeSelector
        size="sm"
        value={scope}
        onChange={(s) => cfg.setWorkflowScope(s)}
        available={{ by_category: cfg.hasCategories, by_subcategory: false }}
      />
      {scope === "by_category" && categories.length > 0 && (
        <>
          <span className="text-xs text-muted-foreground ml-2">Editing:</span>
          <CatSelect value={activeCategory} onValueChange={setActiveCategory}>
            <CatSelectTrigger className="h-8 w-48 text-xs">
              <CatSelectValue placeholder="Pick a category" />
            </CatSelectTrigger>
            <CatSelectContent>
              {categories.map((c) => (
                <CatSelectItem key={c} value={c}>{c}</CatSelectItem>
              ))}
            </CatSelectContent>
          </CatSelect>
          <span className="text-[11px] text-muted-foreground italic ml-1">
            Changes apply only to this category's workflow.
          </span>
        </>
      )}
    </div>
  );
};

const AddStateDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  type: StateType;
  setType: (v: StateType) => void;
  onAdd: () => void;
  states: WorkflowState[];
}> = ({ open, onOpenChange, name, setName, type, setType, onAdd, states }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Add State</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">State Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. "Technical Review"' className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">State Type</Label>
          <Select value={type} onValueChange={(v: StateType) => setType(v)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="start" disabled={states.some(s => s.type === "start")}>Start</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="end">End</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onAdd} className="bg-accent text-accent-foreground hover:bg-accent/90">Add State</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ----- Notification Edit Dialog ----- */
const NotificationEditDialog: React.FC<{
  value: SrcNotification | null;
  workflowStates: string[];
  roles: { id: string; name: string }[];
  moduleName: string;
  onClose: () => void;
  onSave: (n: SrcNotification) => void;
  onDelete: (id: string) => void;
}> = ({ value, workflowStates, roles, moduleName, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState<SrcNotification | null>(value);
  useEffect(() => { setDraft(value); }, [value]);
  if (!draft) return null;

  const tagColors = isRenewalModule(moduleName) ? RENEWAL_STATE_TAG_COLORS : TRADE_STATE_TAG_COLORS;
  const insertVariable = (v: string) => setDraft(d => d ? { ...d, message: (d.message || "") + v } : d);
  const setChannel = (c: "email" | "sms" | "push") => setDraft(d => d ? { ...d, channel: c } : d);

  return (
    <Dialog open={!!value} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification</DialogTitle>
          <DialogDescription>Fired when the application enters this state.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Channel</Label>
            <div className="flex gap-2">
              {(["email", "sms", "push"] as const).map(c => (
                <button key={c} type="button" onClick={() => setChannel(c)}
                  className={`flex-1 px-3 py-1.5 rounded-md border text-xs capitalize transition-colors ${draft.channel === c ? "bg-accent text-accent-foreground border-accent" : "bg-background hover:bg-muted"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Workflow State *</Label>
              <Select value={draft.workflowState} onValueChange={(v) => setDraft(d => d ? { ...d, workflowState: v, tag: v, tagColor: tagColors[v] ?? d.tagColor } : d)}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {workflowStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Recipient Role *</Label>
              <Select value={draft.recipientRole} onValueChange={(v) => setDraft(d => d ? { ...d, recipientRole: v } : d)}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {draft.channel === "email" && (
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={draft.subject} onChange={(e) => setDraft(d => d ? { ...d, subject: e.target.value } : d)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea rows={4} value={draft.message} onChange={(e) => setDraft(d => d ? { ...d, message: e.target.value } : d)} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs text-muted-foreground">Variables:</span>
              {VARIABLES.map(v => (
                <button key={v} type="button" onClick={() => insertVariable(v)}
                  className="text-[10px] px-2 py-0.5 rounded-full border bg-muted hover:bg-accent/10 text-foreground transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            onClick={() => onDelete(draft.id)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!draft.workflowState || !draft.recipientRole || !draft.message.trim() || (draft.channel === "email" && !draft.subject.trim())}
              onClick={() => onSave(draft)}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ----- Checklist Edit Dialog ----- */
const ChecklistEditDialog: React.FC<{
  value: SrcChecklist | null;
  workflowStates: string[];
  onClose: () => void;
  onSave: (c: SrcChecklist) => void;
  onDelete: (id: string) => void;
}> = ({ value, workflowStates, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState<SrcChecklist | null>(value);
  useEffect(() => { setDraft(value); }, [value]);
  if (!draft) return null;

  const updateQ = (qid: string, updates: Partial<SrcQuestion>) =>
    setDraft(d => d ? { ...d, questions: d.questions.map(q => q.id === qid ? { ...q, ...updates } : q) } : d);
  const addQ = () => setDraft(d => d ? { ...d, questions: [...d.questions, { id: crypto.randomUUID(), text: "", fieldType: "text", required: false }] } : d);
  const removeQ = (qid: string) => setDraft(d => d ? { ...d, questions: d.questions.filter(q => q.id !== qid) } : d);

  return (
    <Dialog open={!!value} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-accent" /> Checklist</DialogTitle>
          <DialogDescription>Items the assignee must complete before this action runs.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft(d => d ? { ...d, name: e.target.value } : d)} />
            </div>
            <div className="space-y-1.5">
              <Label>Workflow State</Label>
              <Select value={draft.workflowState} onValueChange={(v) => setDraft(d => d ? { ...d, workflowState: v } : d)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {workflowStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {draft.questions.map((q, idx) => (
              <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <span className="text-xs text-muted-foreground font-medium mt-2 w-5 shrink-0">{idx + 1}.</span>
                <div className="flex-1 space-y-2">
                  <Input value={q.text} onChange={(e) => updateQ(q.id, { text: e.target.value })}
                    placeholder="Question text" className="text-sm" />
                  <div className="flex items-center gap-3 flex-wrap">
                    <Select value={q.fieldType} onValueChange={(v) => updateQ(q.id, { fieldType: v as FieldType })}>
                      <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-xs text-muted-foreground">Required</span>
                      <Switch checked={q.required} onCheckedChange={(v) => updateQ(q.id, { required: v })} />
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                      onClick={() => removeQ(q.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addQ} className="gap-1.5 text-xs">
              <Plus className="h-3 w-3" /> Add Question
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            onClick={() => onDelete(draft.id)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!draft.name.trim() || !draft.workflowState}
              onClick={() => onSave(draft)}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ----- Payment Stage Edit Dialog ----- */
const PaymentStageEditDialog: React.FC<{
  value: SrcPaymentStage | null;
  workflowStates: string[];
  moduleName: string;
  onClose: () => void;
  onSave: (s: SrcPaymentStage) => void;
  onDelete: (id: string) => void;
}> = ({ value, workflowStates, moduleName, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState<SrcPaymentStage | null>(value);
  useEffect(() => { setDraft(value); }, [value]);
  if (!draft) return null;

  const AVAILABLE_FEES = isRenewalModule(moduleName) ? RENEWAL_FEE_NAMES : TRADE_FEE_NAMES;
  const update = (u: Partial<SrcPaymentStage>) => setDraft(d => d ? { ...d, ...u } : d);
  const toggleFee = (fee: string) => setDraft(d => d ? {
    ...d, fees: d.fees.includes(fee) ? d.fees.filter(f => f !== fee) : [...d.fees, fee],
  } : d);
  const toggleMethod = (k: keyof SrcPaymentStage["methods"]) => setDraft(d => d ? {
    ...d, methods: { ...d.methods, [k]: !d.methods[k] },
  } : d);

  return (
    <Dialog open={!!value} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-accent" /> Payment Stage</DialogTitle>
          <DialogDescription>Configure when and how the citizen pays.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Stage Name</Label>
            <Input value={draft.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Application Fee" />
          </div>
          <div className="space-y-1.5">
            <Label>Workflow State</Label>
            <Select value={draft.workflowState} onValueChange={(v) => update({ workflowState: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {workflowStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fees</Label>
            <div className="rounded-md border p-2 space-y-1.5">
              {AVAILABLE_FEES.map(fee => (
                <label key={fee} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox checked={draft.fees.includes(fee)} onCheckedChange={() => toggleFee(fee)} />
                  <span>{fee}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Methods</Label>
            <div className="flex gap-3">
              {(["online", "counter"] as const).map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox checked={draft.methods[m]} onCheckedChange={() => toggleMethod(m)} />
                  <span className="capitalize">{m}</span>
                </label>
              ))}
            </div>
          </div>
          {draft.methods.online && (
            <div className="space-y-1.5">
              <Label>Gateway</Label>
              <Select value={draft.gateway} onValueChange={(v) => update({ gateway: v as Gateway })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="paygov">PayGov</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch checked={draft.generateReceipt} onCheckedChange={(v) => update({ generateReceipt: v })} />
            <Label>Generate Receipt</Label>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            onClick={() => onDelete(draft.id)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!draft.name.trim() || !draft.workflowState || draft.fees.length === 0}
              onClick={() => onSave(draft)}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowDesigner;
