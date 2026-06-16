import { useCallback, useEffect, useRef, useState } from "react";
import {
  TRADE_NOTIFICATIONS,
  TRADE_STATE_TAG_COLORS,
} from "@/data/tradeLicenseTemplate";
import {
  RENEWAL_NOTIFICATIONS,
  RENEWAL_STATE_TAG_COLORS,
} from "@/data/renewalTemplate";

export const NOTIFICATIONS_UPDATED_EVENT = "notifications-updated";

export interface SharedNotification {
  id: string;
  workflowState: string;
  channel: "email" | "sms" | "push";
  recipientRole: string;
  subject: string;
  message: string;
  tag: string;
  tagColor: string;
}

const buildSeed = (renewal: boolean): SharedNotification[] => {
  const src = renewal ? RENEWAL_NOTIFICATIONS : TRADE_NOTIFICATIONS;
  const colors = renewal ? RENEWAL_STATE_TAG_COLORS : TRADE_STATE_TAG_COLORS;
  return src.map((n) => ({
    id: n.id,
    workflowState: n.workflowState,
    channel: n.channel,
    recipientRole: n.recipientRole,
    subject: n.subject,
    message: n.message,
    tag: n.tag,
    tagColor: colors[n.tag] ?? "bg-muted text-muted-foreground",
  }));
};

const readModule = (serviceId: string, moduleName: string, renewal: boolean): SharedNotification[] => {
  const key = `notifications:${serviceId}:${moduleName}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((x) => x != null);
    }
  } catch { /* ignore */ }
  return buildSeed(renewal);
};

/**
 * Shared reader for both Issuance and Renewal notification stores.
 * Live-updates on storage / NOTIFICATIONS_UPDATED_EVENT events so the
 * preview reflects edits made in NotificationsManager / WorkflowDesigner.
 */
export function useServiceNotifications(serviceId: string) {
  const read = useCallback(() => ({
    issuance: readModule(serviceId, "Issuance", false),
    renewal:  readModule(serviceId, "Renewal",  true),
  }), [serviceId]);

  const [store, setStore] = useState(read);
  const readRef = useRef(read);
  readRef.current = read;

  useEffect(() => { setStore(readRef.current()); }, [serviceId]);

  useEffect(() => {
    const reload = () => setStore(readRef.current());
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail as { serviceId?: string } | undefined;
      if (!detail || !detail.serviceId || detail.serviceId === serviceId) reload();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith(`notifications:${serviceId}:`)) reload();
    };
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [serviceId]);

  const forStateName = useCallback(
    (stateName: string, type: "NEW" | "RENEWAL"): SharedNotification[] => {
      const list = type === "RENEWAL" ? store.renewal : store.issuance;
      const target = stateName.trim().toLowerCase();
      return list.filter((n) => n.workflowState.trim().toLowerCase() === target);
    },
    [store]
  );

  return { ...store, forStateName };
}

export const emitNotificationsUpdated = (serviceId: string) => {
  try {
    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: { serviceId } })
    );
  } catch { /* ignore */ }
};
