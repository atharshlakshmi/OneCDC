import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { authStorage } from "../lib/storage";
import { logError } from "../lib/errorHandler";
import type { User } from "../lib/types";

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
    const t = authStorage.getToken();
    const u = authStorage.getUserData<User>();
    if (t) setToken(t);
    if (u) {
      try {
        setUser(u);
      } catch (error) {
        logError(error, "AuthContext - loading user data");
        setUser(null);
      }
    }
    // Kick off a verify; ALWAYS mark checked afterwards.
    verify().finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to storage
  const persist = (u: User, t: string, remember: boolean) => {
    // Note: Currently authStorage uses localStorage only
    // If you need sessionStorage for "remember me" functionality,
    // you can extend the storage utility to support both
    authStorage.setToken(t);
    authStorage.setUserData(u);
  };

  const login = (u: User, t: string, remember: boolean) => {
    persist(u, t, remember);
    setUser(u); // ✅ update immediately
    setToken(t);
    setChecked(true); // ✅ session is now known
  };

  const clearLocalAuth = () => {
    authStorage.clearAll();
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
    const t = authStorage.getToken();
    // If no token, consider unauthenticated (works for purely cookie backends too,
    // because /auth/verify below will just 401 and we clear user).
    try {
      const resp = await apiFetch<{ success: boolean; data: { user: User } }>("/auth/verify", { method: "GET", headers: { "Content-Type": "application/json" } });
      // Accept either {success:true,data:{user}} or looser shapes if your API differs:
      const freshUser = resp?.data?.user as User;
      if (freshUser) {
        authStorage.setUserData(freshUser);
        setUser(freshUser);
        if (t) setToken(t);
        return;
      }
      // If shape unexpected, treat as unauth
      clearLocalAuth();
    } catch (error) {
      // 401/expired/etc → clear locally (don't call logout() to avoid extra redirects)
      logError(error, "AuthContext - verify");
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
