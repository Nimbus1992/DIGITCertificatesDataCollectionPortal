import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Per-module persistence helper used by every service-config configurator.
 *
 * Keys state under `${prefix}:${serviceId}:${moduleName}` so Issuance and
 * Renewal edits live side by side without colliding.
 *
 * Emits a `MODULE_STATE_EVENT` on every write so subscribers in the same
 * tab (e.g. the live preview) can react without reloading.
 */

export const MODULE_STATE_EVENT = "module-state-updated";

export interface ModuleStateEventDetail {
  prefix: string;
  serviceId: string;
  moduleName: string;
  key: string;
}

export const emitModuleStateUpdated = (detail: ModuleStateEventDetail) => {
  try {
    window.dispatchEvent(new CustomEvent(MODULE_STATE_EVENT, { detail }));
  } catch { /* ignore */ }
};

export function useModuleState<T>(
  prefix: string,
  serviceId: string,
  moduleName: string,
  buildSeed: () => T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const key = `${prefix}:${serviceId}:${moduleName}`;
  const seedRef = useRef(buildSeed);
  seedRef.current = buildSeed;

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed != null) {
          if (Array.isArray(parsed)) {
            return parsed.filter((x) => x != null) as unknown as T;
          }
          return parsed as T;
        }
      }
    } catch { /* ignore */ }
    return seedRef.current();
  });

  const cleanValue = useCallback((next: T): T => {
    if (Array.isArray(next)) {
      const hasNulls = next.some((x) => x == null);
      return (hasNulls ? next.filter((x) => x != null) : next) as unknown as T;
    }
    return next;
  }, []);


  const setCleanValue: React.Dispatch<React.SetStateAction<T>> = useCallback((next) => {
    setValue((prev) => {
      const cleanPrev = cleanValue(prev);
      const resolved = typeof next === "function"
        ? (next as (value: T) => T)(cleanPrev)
        : next;
      return cleanValue(resolved);
    });
  }, [cleanValue]);

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
    emitModuleStateUpdated({ prefix, serviceId, moduleName, key });
  }, [key, value, prefix, serviceId, moduleName]);

  return [cleanValue(value), setCleanValue];
}
