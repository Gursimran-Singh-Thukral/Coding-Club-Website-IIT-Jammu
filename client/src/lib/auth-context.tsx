"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Role, SessionUser } from "@/lib/types";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  isCoordinator: boolean;
  refresh: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// A plain (JS-readable, non-auth-bearing) marker for "this browser has logged in
// before" - lets a first-time/logged-out visitor skip the /api/profile "who am
// I" check entirely instead of firing it (and its automatic /api/auth/refresh
// retry) on every single page load just to learn what we already know. A
// storage read failure is treated as "maybe" rather than "no", so it never
// suppresses the real check for someone who actually has a valid session.
const SESSION_HINT_KEY = "cc_has_session";

function readSessionHint(): boolean {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return true;
  }
}

function writeSessionHint(loggedIn: boolean) {
  try {
    if (loggedIn) localStorage.setItem(SESSION_HINT_KEY, "1");
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // Storage unavailable (private mode, disabled, etc) - nothing to persist.
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: SessionUser | null) => {
    setUserState(next);
    writeSessionHint(!!next);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ status: string; user: SessionUser }>("/api/profile");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    // No prior-login hint on this browser - skip the network round trip
    // (and its 401) and go straight to "signed out" instead of asking.
    if (!readSessionHint()) {
      setLoading(false);
      return;
    }
    // Restoring the session means asking the API "who am I" — an external
    // system — so this fetch-on-mount can't be replaced with derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }, [setUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isCoordinator: user?.role === "Coordinator" || user?.role === "Technical Secretary",
      refresh,
      setUser,
      logout,
    }),
    [user, loading, refresh, setUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function hasRole(user: SessionUser | null, ...roles: Role[]) {
  return !!user && roles.includes(user.role);
}
