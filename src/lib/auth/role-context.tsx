"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "doctor" | "receptionist" | "cashier";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roleNameAr: string;
  canViewClinicalNotes: boolean;
  canManageFinances: boolean;
  canManageAppointments: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "mediflow_active_role";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("doctor");

  useEffect(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
    if (saved && (saved === "doctor" || saved === "receptionist" || saved === "cashier")) {
      setRoleState(saved);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  const roleNameAr =
    role === "doctor"
      ? "طبيب (كامل الصلاحيات)"
      : role === "receptionist"
      ? "استقبال وسكرتارية"
      : "أمين صندوق ومحاسب";

  const canViewClinicalNotes = role === "doctor";
  const canManageFinances = role === "doctor" || role === "cashier";
  const canManageAppointments = role === "doctor" || role === "receptionist";

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        roleNameAr,
        canViewClinicalNotes,
        canManageFinances,
        canManageAppointments,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
