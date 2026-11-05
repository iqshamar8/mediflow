"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ClinicSpecialtyType } from "@/server/mock-db";

export interface Clinic {
  id: string;
  name: string;
  doctor_name: string;
  specialty: string;
  specialty_type?: ClinicSpecialtyType;
  phone: string;
  email: string;
  address: string;
  currency: string;
  created_at: string;
}

interface ClinicContextType {
  currentClinic: Clinic | null;
  clinics: Clinic[];
  isLoading: boolean;
  switchClinic: (clinicId: string) => void;
  registerClinic: (data: {
    name: string;
    doctor_name: string;
    specialty: string;
    specialty_type?: ClinicSpecialtyType;
    phone: string;
    email?: string;
    address?: string;
  }) => Promise<Clinic>;
  refreshClinics: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const STORAGE_KEY = "mediflow_clinic_id";

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchClinics = useCallback(async () => {
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const clinicHeaders: Record<string, string> = storedId ? { "x-clinic-id": storedId } : {};
      const res = await fetch("/api/clinics", {
        headers: clinicHeaders,
      });
      if (!res.ok) throw new Error("Failed to fetch clinics");
      const json = await res.json();
      const list: Clinic[] = json.clinics || [];
      setClinics(list);

      // Determine active clinic
      let active = list.find((c) => c.id === storedId);
      if (!active && list.length > 0) {
        active = list[0];
      }

      if (active) {
        setCurrentClinic(active);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, active.id);
          document.cookie = `${STORAGE_KEY}=${active.id}; path=/; max-age=31536000; SameSite=Lax`;
        }
      }
    } catch (e) {
      console.error("Error loading clinics:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const switchClinic = useCallback(
    (clinicId: string) => {
      const target = clinics.find((c) => c.id === clinicId);
      if (target) {
        setCurrentClinic(target);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, target.id);
          document.cookie = `${STORAGE_KEY}=${target.id}; path=/; max-age=31536000; SameSite=Lax`;
          window.dispatchEvent(new CustomEvent("mediflow-clinic-changed", { detail: { clinicId: target.id } }));
        }
      }
    },
    [clinics]
  );

  const registerClinic = useCallback(
    async (data: {
      name: string;
      doctor_name: string;
      specialty: string;
      phone: string;
      email?: string;
      address?: string;
    }): Promise<Clinic> => {
      const res = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "فشل تسجيل العيادة");
      }

      const resJson = await res.json();
      const newClinic: Clinic = resJson.clinic;

      setClinics((prev) => [...prev, newClinic]);
      setCurrentClinic(newClinic);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, newClinic.id);
        document.cookie = `${STORAGE_KEY}=${newClinic.id}; path=/; max-age=31536000; SameSite=Lax`;
        window.dispatchEvent(new CustomEvent("mediflow-clinic-changed", { detail: { clinicId: newClinic.id } }));
      }

      return newClinic;
    },
    []
  );

  return (
    <ClinicContext.Provider
      value={{
        currentClinic,
        clinics,
        isLoading,
        switchClinic,
        registerClinic,
        refreshClinics: fetchClinics,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error("useClinic must be used within a ClinicProvider");
  }
  return context;
}
