import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Admin } from "@shared/schema";

interface AdminAuthContextType {
  admin: Omit<Admin, "password"> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (roles: Admin["role"][]) => boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Omit<Admin, "password"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      console.error("Check auth error:", error);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Đăng nhập thất bại");
    }

    const data = await response.json();
    setAdmin(data.admin);
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAdmin(null);
    }
  };

  const hasRole = (roles: Admin["role"][]) => {
    if (!admin) return false;
    return roles.includes(admin.role);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
    checkAuth,
    hasRole,
    isSuperAdmin: admin?.role === "superadmin",
    isAdmin: admin?.role === "admin" || admin?.role === "superadmin",
    isStaff: admin?.role === "staff",
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
