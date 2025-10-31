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
  isAuthed: boolean; // ✅ derived from user for immediate UI reaction
  checked: boolean; // ✅ true once we’ve decided the session state
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
    if (t) setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        setUser(null);
      }
    }
    // Kick off a verify; ALWAYS mark checked afterwards.
    verify().finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to chosen storage and clear the other to avoid duplicates
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
    setUser(u); // ✅ update immediately
    setToken(t);
    setChecked(true); // ✅ session is now known
  };

  const clearLocalAuth = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    setUser(null);
    setToken(null);
  };

  const logout = async () => {
    try {
      // If your backend uses cookies/sessions, this invalidates them:
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout; we still clear locally.
    } finally {
      // ✅ Make UI reflect logout immediately (no refresh needed)
      clearLocalAuth();
      setChecked(true);
    }
  };

  const verify = async () => {
    const t = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    // If no token, consider unauthenticated (works for purely cookie backends too,
    // because /auth/verify below will just 401 and we clear user).
    try {
      const resp = await apiFetch<{ success: boolean; data: { user: User } }>("/auth/verify", { method: "GET", headers: { "Content-Type": "application/json" } });
      // Accept either {success:true,data:{user}} or looser shapes if your API differs:
      const freshUser = resp?.data?.user as User;
      if (freshUser) {
        const store = localStorage.getItem("auth_token") ? localStorage : sessionStorage;
        store.setItem("auth_user", JSON.stringify(freshUser));
        setUser(freshUser);
        if (t) setToken(t);
        return;
      }
      // If shape unexpected, treat as unauth
      clearLocalAuth();
    } catch {
      // 401/expired/etc → clear locally (don’t call logout() to avoid extra redirects)
      clearLocalAuth();
    }
  };

  // ✅ Use user presence for UI gating — updates instantly on logout()
  const isAuthed = !!user;

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthed,
      checked,
      login,
      logout,
      verify,
    }),
    [user, token, isAuthed, checked]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
