import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { readJSON, writeJSON, STORAGE_KEYS } from "@/lib/citizen/storage";
import { generateArn, generateLicenseNo } from "@/lib/citizen/arn";
import { getService } from "@/config/services";
import { startState, getState, stageHasFee } from "@/lib/citizen/workflow";
import { renderTemplate } from "@/lib/citizen/templateEngine";
import { computeDemandForStage } from "@/lib/citizen/fees";
import { seedDemoApplications } from "@/lib/citizen/seed";
import type { ServiceConfig } from "@/config/types";
import { useNotifications } from "./NotificationsContext";
import { useAuth } from "./AuthContext";

export type StoredDocument = {
  fieldId: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: number;
};

export type Payment = {
  stageId: string;
  amount: number;
  paidAt: number;
  receiptId: string;
};

export type HistoryEntry = {
  stateId: string;
  at: number;
  note?: string;
};

export type CitizenApplication = {
  id: string; // ARN
  serviceId: string;
  applicantName: string;
  phone: string;
  values: Record<string, unknown>;
  documents: StoredDocument[];
  currentStateId: string;
  history: HistoryEntry[];
  payments: Payment[];
  licenseNo?: string;
  createdAt: number;
  updatedAt: number;
};

export type Draft = {
  serviceId: string;
  stepIndex: number;
  values: Record<string, unknown>;
  documents: StoredDocument[];
  updatedAt: number;
};

type State = {
  apps: CitizenApplication[];
  drafts: Record<string, Draft>; // key by serviceId
  hydrated: boolean;
};

type Action =
  | { type: "HYDRATE"; apps: CitizenApplication[]; drafts: Record<string, Draft> }
  | { type: "UPSERT_APP"; app: CitizenApplication }
  | { type: "REMOVE_APP"; id: string }
  | { type: "SET_DRAFT"; key: string; draft: Draft }
  | { type: "CLEAR_DRAFT"; key: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { apps: action.apps, drafts: action.drafts, hydrated: true };
    case "UPSERT_APP": {
      const idx = state.apps.findIndex((a) => a.id === action.app.id);
      const apps = [...state.apps];
      if (idx >= 0) apps[idx] = action.app;
      else apps.unshift(action.app);
      return { ...state, apps };
    }
    case "REMOVE_APP":
      return { ...state, apps: state.apps.filter((a) => a.id !== action.id) };
    case "SET_DRAFT":
      return { ...state, drafts: { ...state.drafts, [action.key]: action.draft } };
    case "CLEAR_DRAFT": {
      const { [action.key]: _removed, ...rest } = state.drafts;
      return { ...state, drafts: rest };
    }
    default:
      return state;
  }
}

type ApplicationsContextValue = {
  apps: CitizenApplication[];
  drafts: Record<string, Draft>;
  hydrated: boolean;
  getApp: (id: string) => CitizenApplication | undefined;
  getDraft: (serviceId: string) => Draft | undefined;
  saveDraft: (serviceId: string, draft: Omit<Draft, "serviceId" | "updatedAt">) => void;
  clearDraft: (serviceId: string) => void;
  submitApplication: (
    service: ServiceConfig,
    payload: { applicantName: string; phone: string; values: Record<string, unknown>; documents: StoredDocument[] }
  ) => CitizenApplication;
  advanceTransition: (appId: string, transitionId: string) => void;
  fastForwardToPayment: (appId: string) => void;
  payApplication: (appId: string) => Payment | null;
  isProcessing: (appId: string) => boolean;
};

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { apps: [], drafts: {}, hydrated: false });
  const { add: addNotification } = useNotifications();
  const { session } = useAuth();
  const [processing, setProcessing] = useState<Record<string, true>>({});
  const appsRef = useRef(state.apps);
  useEffect(() => {
    appsRef.current = state.apps;
  }, [state.apps]);

  const markProcessing = useCallback((id: string, on: boolean) => {
    setProcessing((prev) => {
      const next = { ...prev };
      if (on) next[id] = true;
      else delete next[id];
      return next;
    });
  }, []);

  useEffect(() => {
    let apps = readJSON<CitizenApplication[]>(STORAGE_KEYS.applications, []);
    const drafts = readJSON<Record<string, Draft>>(STORAGE_KEYS.drafts, {});
    const seeded = readJSON<boolean>(STORAGE_KEYS.seeded, false);
    if (!seeded) {
      apps = seedDemoApplications();
      writeJSON(STORAGE_KEYS.applications, apps);
      writeJSON(STORAGE_KEYS.drafts, {});
      writeJSON(STORAGE_KEYS.seeded, true);
      dispatch({ type: "HYDRATE", apps, drafts: {} });
      return;
    }
    dispatch({ type: "HYDRATE", apps, drafts });
  }, []);

  useEffect(() => {
    if (state.hydrated) writeJSON(STORAGE_KEYS.applications, state.apps);
  }, [state.apps, state.hydrated]);
  useEffect(() => {
    if (state.hydrated) writeJSON(STORAGE_KEYS.drafts, state.drafts);
  }, [state.drafts, state.hydrated]);

  const fireNotification = useCallback(
    (app: CitizenApplication, event: string) => {
      const service = getService(app.serviceId);
      if (!service) return;
      const tmpl = service.notifications.find((n) => n.event === event);
      if (!tmpl) return;
      const demand = computeDemandForStage(service, app.currentStateId, app.values);
      const title = renderTemplate(tmpl.title, {
        applicantName: app.applicantName,
        arn: app.id,
        serviceName: service.name,
      });
      const body = renderTemplate(tmpl.body, {
        applicantName: app.applicantName,
        arn: app.id,
        serviceName: service.name,
        stage: getState(service, app.currentStateId)?.label ?? "",
        amount: demand?.total ?? "",
        licenseNo: app.licenseNo ?? "",
      });
      addNotification({ appId: app.id, serviceId: service.id, title, body });
    },
    [addNotification]
  );

  const submitApplication = useCallback<
    ApplicationsContextValue["submitApplication"]
  >((service, payload) => {
    const start = startState(service);
    const now = Date.now();
    const app: CitizenApplication = {
      id: generateArn(service.arnPrefix),
      serviceId: service.id,
      applicantName: payload.applicantName,
      phone: payload.phone || session?.phone || "",
      values: payload.values,
      documents: payload.documents,
      currentStateId: start.id,
      history: [{ stateId: start.id, at: now, note: "Application submitted" }],
      payments: [],
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "UPSERT_APP", app });
    // fire submitted notification
    queueMicrotask(() => fireNotification(app, "submitted"));
    return app;
  }, [fireNotification, session?.phone]);

  const advanceTransition = useCallback((appId: string, transitionId: string) => {
    const app = state.apps.find((a) => a.id === appId);
    if (!app) return;
    const service = getService(app.serviceId);
    if (!service) return;
    const t = service.workflow.transitions.find((x) => x.id === transitionId && x.from === app.currentStateId);
    if (!t) return;
    const now = Date.now();
    let licenseNo = app.licenseNo;
    const targetState = getState(service, t.to);
    if (targetState?.endStatus === "issued" && !licenseNo) {
      licenseNo = generateLicenseNo(service.arnPrefix);
    }
    const updated: CitizenApplication = {
      ...app,
      currentStateId: t.to,
      history: [...app.history, { stateId: t.to, at: now, note: t.label }],
      licenseNo,
      updatedAt: now,
    };
    dispatch({ type: "UPSERT_APP", app: updated });
    if (t.notify) queueMicrotask(() => fireNotification(updated, t.notify!));
  }, [state.apps, fireNotification]);

  // Walk forward through the workflow until a stage that has a fee is
  // reached (skipping reject branches). Each intermediate state is recorded
  // in history so the timeline still shows progress.
  const fastForwardToPayment = useCallback((appId: string) => {
    const app = appsRef.current.find((a) => a.id === appId);
    if (!app) return;
    const service = getService(app.serviceId);
    if (!service) return;
    let current = app.currentStateId;
    const history = [...app.history];
    const now = Date.now();
    let last: CitizenApplication = app;
    let safety = 12;
    while (safety-- > 0 && !stageHasFee(service, current)) {
      const t = service.workflow.transitions.find(
        (x) => x.from === current && getState(service, x.to)?.endStatus !== "rejected"
      );
      if (!t) break;
      current = t.to;
      history.push({ stateId: current, at: Date.now(), note: t.label });
      last = {
        ...app,
        currentStateId: current,
        history,
        updatedAt: now,
      };
      if (t.notify) {
        const snap = last;
        queueMicrotask(() => fireNotification(snap, t.notify!));
      }
    }
    if (last !== app) dispatch({ type: "UPSERT_APP", app: last });
  }, [fireNotification]);

  // Walk forward until an "issued" end state. License number is assigned
  // when crossing into the issued state.
  const completeToIssued = useCallback((appId: string) => {
    const app = appsRef.current.find((a) => a.id === appId);
    if (!app) return;
    const service = getService(app.serviceId);
    if (!service) return;
    let current = app.currentStateId;
    const history = [...app.history];
    let licenseNo = app.licenseNo;
    let last: CitizenApplication = app;
    let safety = 12;
    while (safety-- > 0) {
      const cur = getState(service, current);
      if (cur?.kind === "end") break;
      const t = service.workflow.transitions.find(
        (x) => x.from === current && getState(service, x.to)?.endStatus !== "rejected"
      );
      if (!t) break;
      current = t.to;
      const target = getState(service, current);
      if (target?.endStatus === "issued" && !licenseNo) {
        licenseNo = generateLicenseNo(service.arnPrefix);
      }
      history.push({ stateId: current, at: Date.now(), note: t.label });
      last = {
        ...app,
        currentStateId: current,
        history,
        licenseNo,
        updatedAt: Date.now(),
      };
      if (t.notify) {
        const snap = last;
        queueMicrotask(() => fireNotification(snap, t.notify!));
      }
    }
    if (last !== app) dispatch({ type: "UPSERT_APP", app: last });
  }, [fireNotification]);

  const payApplication = useCallback<ApplicationsContextValue["payApplication"]>((appId) => {
    const app = state.apps.find((a) => a.id === appId);
    if (!app) return null;
    const service = getService(app.serviceId);
    if (!service) return null;
    const demand = computeDemandForStage(service, app.currentStateId, app.values);
    if (!demand) return null;
    const now = Date.now();
    const payment: Payment = {
      stageId: app.currentStateId,
      amount: demand.total,
      paidAt: now,
      receiptId: `RCPT-${now}`,
    };
    const updated: CitizenApplication = {
      ...app,
      payments: [...app.payments, payment],
      updatedAt: now,
    };
    dispatch({ type: "UPSERT_APP", app: updated });
    // Real-life feel: keep the user on a "Issuing licence…" state for 8s
    // before walking the rest of the workflow to the issued end state.
    markProcessing(appId, true);
    setTimeout(() => {
      completeToIssued(appId);
      markProcessing(appId, false);
    }, 8000);
    return payment;
  }, [state.apps, completeToIssued, markProcessing]);

  // Resume after reload: if a payment exists but the workflow is still
  // parked on the fee stage, fast-forward to issued immediately.
  useEffect(() => {
    if (!state.hydrated) return;
    for (const app of state.apps) {
      const svc = getService(app.serviceId);
      if (!svc) continue;
      if (app.payments.length > 0 && stageHasFee(svc, app.currentStateId)) {
        completeToIssued(app.id);
      }
    }
    // run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated]);

  const isProcessing = useCallback((id: string) => Boolean(processing[id]), [processing]);

  const saveDraft = useCallback<ApplicationsContextValue["saveDraft"]>(
    (serviceId, draft) => {
      dispatch({
        type: "SET_DRAFT",
        key: serviceId,
        draft: { serviceId, updatedAt: Date.now(), ...draft },
      });
    },
    []
  );

  const clearDraft = useCallback((serviceId: string) => {
    dispatch({ type: "CLEAR_DRAFT", key: serviceId });
  }, []);

  const getApp = useCallback(
    (id: string) => state.apps.find((a) => a.id === id),
    [state.apps]
  );

  const getDraft = useCallback(
    (serviceId: string) => state.drafts[serviceId],
    [state.drafts]
  );

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      apps: state.apps,
      drafts: state.drafts,
      hydrated: state.hydrated,
      getApp,
      getDraft,
      saveDraft,
      clearDraft,
      submitApplication,
      advanceTransition,
      fastForwardToPayment,
      payApplication,
      isProcessing,
    }),
    [state, getApp, getDraft, saveDraft, clearDraft, submitApplication, advanceTransition, fastForwardToPayment, payApplication, isProcessing]
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error("useApplications must be used within ApplicationsProvider");
  return ctx;
}