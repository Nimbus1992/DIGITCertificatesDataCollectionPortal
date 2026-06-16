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

export type CitizenSession = {
  id: string;
  phone: string;
  name?: string;
  createdAt: number;
};

type State = { session: CitizenSession | null; hydrated: boolean };
type Action =
  | { type: "HYDRATE"; session: CitizenSession | null }
  | { type: "LOGIN"; session: CitizenSession }
  | { type: "SET_NAME"; name: string }
  | { type: "LOGOUT" };

const initial: State = { session: null, hydrated: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { session: action.session, hydrated: true };
    case "LOGIN":
      return { ...state, session: action.session };
    case "SET_NAME":
      return state.session
        ? { ...state, session: { ...state.session, name: action.name } }
        : state;
    case "LOGOUT":
      return { ...state, session: null };
    default:
      return state;
  }
}

type AuthContextValue = {
  session: CitizenSession | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  needsName: boolean;
  login: (phone: string) => CitizenSession;
  setName: (name: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    const s = readJSON<CitizenSession | null>(STORAGE_KEYS.session, null);
    dispatch({ type: "HYDRATE", session: s });
  }, []);

  useEffect(() => {
    if (state.hydrated) writeJSON(STORAGE_KEYS.session, state.session);
  }, [state.session, state.hydrated]);

  const login = useCallback((phone: string) => {
    const existing = readJSON<CitizenSession | null>(STORAGE_KEYS.session, null);
    const session: CitizenSession =
      existing && existing.phone === phone
        ? existing
        : { id: `c_${Date.now()}`, phone, createdAt: Date.now() };
    dispatch({ type: "LOGIN", session });
    return session;
  }, []);

  const setName = useCallback((name: string) => {
    dispatch({ type: "SET_NAME", name });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: state.session,
      hydrated: state.hydrated,
      isAuthenticated: !!state.session,
      needsName: !!state.session && !state.session.name,
      login,
      setName,
      logout,
    }),
    [state, login, setName, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}