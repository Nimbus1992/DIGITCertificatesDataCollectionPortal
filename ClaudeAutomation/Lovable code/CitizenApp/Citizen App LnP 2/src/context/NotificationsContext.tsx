import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { readJSON, writeJSON, STORAGE_KEYS } from "@/lib/citizen/storage";

export type CitizenNotification = {
  id: string;
  appId?: string;
  serviceId?: string;
  title: string;
  body: string;
  createdAt: number;
  read?: boolean;
};

type State = { items: CitizenNotification[]; hydrated: boolean };
type Action =
  | { type: "HYDRATE"; items: CitizenNotification[] }
  | { type: "ADD"; item: CitizenNotification }
  | { type: "READ_ALL" }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, hydrated: true };
    case "ADD":
      return { ...state, items: [action.item, ...state.items] };
    case "READ_ALL":
      return { ...state, items: state.items.map((i) => ({ ...i, read: true })) };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

type NotificationsContextValue = {
  items: CitizenNotification[];
  unreadCount: number;
  add: (n: Omit<CitizenNotification, "id" | "createdAt">) => void;
  markAllRead: () => void;
  clear: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });

  useEffect(() => {
    const items = readJSON<CitizenNotification[]>(STORAGE_KEYS.notifications, []);
    dispatch({ type: "HYDRATE", items });
  }, []);

  useEffect(() => {
    if (state.hydrated) writeJSON(STORAGE_KEYS.notifications, state.items);
  }, [state.items, state.hydrated]);

  const add = useCallback((n: Omit<CitizenNotification, "id" | "createdAt">) => {
    dispatch({
      type: "ADD",
      item: { ...n, id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, createdAt: Date.now() },
    });
  }, []);

  const markAllRead = useCallback(() => dispatch({ type: "READ_ALL" }), []);
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items: state.items,
      unreadCount: state.items.filter((i) => !i.read).length,
      add,
      markAllRead,
      clear,
    }),
    [state.items, add, markAllRead, clear]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}