import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

type User = {
  _id: string;
  email: string;
  role: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthed: boolean;
  checked: boolean; // ✅ true once we’ve verified/decided the session
  login: (user: User, token: string, remember: boolean) => void;
  logout: () => Promise<void>;
  verify: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // Load cached auth on first mount, then verify with server
  useEffect(() => {
    const t = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    const u = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
    setToken(t);
    setUser(u ? JSON.parse(u) : null);

    // kick off a verify; mark checked when done (success or fail)
    verify().finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist to chosen storage and clear the other to avoid duplicates
  const persist = (u: User, t: string, remember: boolean) => {
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    store.setItem("auth_token", t);
    store.setItem("auth_user", JSON.stringify(u));
    other.removeItem("auth_token");
    other.removeItem("auth_user");
  };

  const login = (u: User, t: string, remember: boolean) => {
    persist(u, t, remember);
    setUser(u);
    setToken(t);
  };

  const logout = async () => {
    try {
      // optional: backend logout to clear cookie/session if you use one
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // ignore errors for token-only setups
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_user");
      setUser(null);
      setToken(null);
    }
  };

  const verify = async () => {
    const t = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!t) {
      // no token -> unauthenticated
      setUser(null);
      setToken(null);
      return;
    }
    try {
      // Your backend: GET /api/auth/verify -> { success, data: { user } }
      const resp = await apiFetch<{ success: boolean; data: { user: User } }>("/auth/verify");
      const freshUser = resp.data.user;

      // keep storage in sync with server
      const store = localStorage.getItem("auth_token") ? localStorage : sessionStorage;
      store.setItem("auth_user", JSON.stringify(freshUser));
      setUser(freshUser);
      setToken(t);
    } catch {
      // invalid/expired token
      await logout();
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthed: !!token,
      checked,
      login,
      logout,
      verify,
    }),
    [user, token, checked]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
