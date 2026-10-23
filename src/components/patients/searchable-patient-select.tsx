"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Phone, Check, ChevronDown, X, Hash } from "lucide-react";

export interface PatientOption {
  id: string;
  patient_number?: string;
  full_name: string;
  phone: string;
  gender?: string;
}

interface SearchablePatientSelectProps {
  patients: PatientOption[];
  value: string;
  onChange: (patientId: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function SearchablePatientSelect({
  patients,
  value,
  onChange,
  placeholder = "ابحث بالاسم أو رقم الهاتف أو رقم الملف...",
  required = false,
}: SearchablePatientSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected patient details
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === value) || null;
  }, [patients, value]);

  // Filtered patients based on name, phone, or patient_number
  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;

    // Normalize phone numbers for easy matching (e.g. strips spaces, dashes, +964 or 07)
    const cleanQ = q.replace(/[\s\-\(\)\+]/g, "");
    const localQ = cleanQ.startsWith("07") ? cleanQ.slice(1) : cleanQ;

    return patients.filter((p) => {
      const nameMatch = p.full_name.toLowerCase().includes(q);
      const numberMatch = p.patient_number?.toLowerCase().includes(q);

      const cleanPhone = p.phone.replace(/[\s\-\(\)\+]/g, "");
      const phoneMatch =
        cleanPhone.includes(cleanQ) ||
        cleanPhone.includes(localQ) ||
        p.phone.toLowerCase().includes(q);

      return Boolean(nameMatch || numberMatch || phoneMatch);
    });
  }, [patients, query]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Handle outside clicks to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (patientId: string) => {
    onChange(patientId);
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input for form validation if required */}
      <input
        type="text"
        tabIndex={-1}
        className="sr-only"
        value={value}
        required={required}
        onChange={() => {}}
      />

      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full min-h-[42px] px-3 py-1.5 rounded-xl border bg-background text-sm flex items-center justify-between gap-2 cursor-pointer transition-all shadow-sm ${
          isOpen
            ? "border-primary ring-2 ring-primary/20 shadow-md"
            : "border-input hover:border-primary/50"
        }`}
      >
        {selectedPatient ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-start truncate leading-tight">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-foreground text-xs sm:text-sm">
                  {selectedPatient.full_name}
                </span>
                {selectedPatient.patient_number && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono text-muted-foreground">
                    {selectedPatient.patient_number}
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono" dir="ltr">
                {selectedPatient.phone}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
            <Search className="w-4 h-4 text-muted-foreground/70" />
            <span>{placeholder}</span>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {selectedPatient && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              title="إلغاء التحديد"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Search & Suggestions Popover */}
      {isOpen && (
        <div className="absolute top-full start-0 mt-1.5 w-full bg-card rounded-2xl border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Search Input */}
          <div className="p-2.5 border-b border-border bg-muted/30">
            <div className="relative">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب اسم المريض أو رقم الهاتف أو رقم الملف..."
                className="ps-9 pe-8 h-9 text-xs sm:text-sm rounded-xl bg-background"
                onClick={(e) => e.stopPropagation()}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              💡 يمكنك البحث مباشرة بكتابة جزء من الاسم (مثلاً: علي) أو جزء من الهاتف (مثلاً: 1111)
            </p>
          </div>

          {/* Suggestions List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => {
                const isSelected = patient.id === value;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handleSelect(patient.id)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-start transition-all ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold border border-primary/30"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="leading-tight text-start truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold">{patient.full_name}</span>
                          {patient.patient_number && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                              {patient.patient_number}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5" dir="ltr">
                          <Phone className="w-3 h-3" />
                          <span className="font-mono">{patient.phone}</span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-6 px-4 text-center space-y-1">
                <Search className="w-6 h-6 text-muted-foreground mx-auto opacity-50 mb-1" />
                <p className="text-xs font-semibold text-foreground">لم يتم العثور على أي مريض</p>
                <p className="text-[11px] text-muted-foreground">
                  لا توجد نتائج مطابقة لـ &quot;{query}&quot;. تأكد من صحة الاسم أو رقم الهاتف.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
