/**
 * Admin Authentication — Skina do Frango & Assados
 *
 * Temporary local auth for development. Replace with Supabase Auth + RBAC
 * once the real authentication flow is implemented.
 *
 * Credentials are verified client-side only. In production, validation MUST
 * happen server-side and the API key / sensitive data should never reach the
 * browser.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { AdminRole } from "./permissions";
import { ROLE_PERMISSIONS } from "./permissions";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AdminUser = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  permissions: string[];
};

type AdminAuthContextValue = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

/* ------------------------------------------------------------------ */
/*  Test credentials (dev only — never expose in production)           */
/* ------------------------------------------------------------------ */

const TEST_USERS: Array<{ username: string; password: string; user: AdminUser }> = [
  {
    username: "Skinadofrangoroo@gmail.com",
    password: "skina2026",
    user: {
      id: "admin-master-001",
      username: "Skinadofrangoroo@gmail.com",
      displayName: "Skina Admin (Master)",
      role: "ADMIN_MASTER",
      permissions: ROLE_PERMISSIONS.ADMIN_MASTER,
    },
  },
  {
    username: "admin_teste",
    password: "skina2026",
    user: {
      id: "admin-test-001",
      username: "admin_teste",
      displayName: "Administrador",
      role: "ADMIN_MASTER",
      permissions: ROLE_PERMISSIONS.ADMIN_MASTER,
    },
  },
];

const STORAGE_KEY = "skina_admin_session";

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminUser;
        // Verify that the stored user is still valid
        const found = TEST_USERS.find(
          (u) => u.user.username.toLowerCase() === parsed.username.toLowerCase()
        );
        if (found) {
          setUser({ ...found.user });
        } else {
          // Update to current master user if old session exists
          const masterUser = TEST_USERS[0]?.user;
          if (masterUser) {
            setUser({ ...masterUser });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(masterUser));
          }
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const found = TEST_USERS.find(
      (u) =>
        (u.username.toLowerCase() === cleanUsername ||
         (cleanUsername === "admin" && u.username === "admin_teste")) &&
        u.password === cleanPassword
    );

    if (!found) return false;
    setUser(found.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found.user));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
