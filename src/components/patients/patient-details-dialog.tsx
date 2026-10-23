"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  User,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Pill,
} from "lucide-react";

interface PatientDetailsDialogProps {
  patient: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function PatientDetailsDialog({
  patient,
  isOpen,
  onClose,
  onUpdate,
}: PatientDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<"info" | "appointments" | "payments" | "visits">("info");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Edit fields
  const [editData, setEditData] = useState({
    full_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    gender: "male",
    whatsapp_consent: true,
    admin_notes: "",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (patient && isOpen) {
      setEditData({
        full_name: patient.full_name || "",
        phone: patient.phone || "",
        email: patient.email || "",
        date_of_birth: patient.date_of_birth || "",
        gender: patient.gender || "male",
        whatsapp_consent: patient.whatsapp_consent !== false,
        admin_notes: patient.admin_notes || "",
      });
      loadPatientHistory(patient.id);
    }
  }, [patient, isOpen]);

  async function loadPatientHistory(patientId: string) {
    setIsLoadingHistory(true);
    try {
      const [aptRes, payRes, visRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/payments"),
        fetch(`/api/visits?patient_id=${patientId}`),
      ]);

      const aptJson = await aptRes.json();
      const payJson = await payRes.json();
      const visJson = await visRes.json();

      setAppointments(
        (aptJson.data || []).filter((a: any) => a.patient_id === patientId)
      );
      setPayments(
        (payJson.data || []).filter((p: any) => p.patient_id === patientId)
      );
      setVisits(visJson.data || []);
    } catch {
      // Fallback
    } finally {
      setIsLoadingHistory(false);
    }
  }

  if (!isOpen || !patient) return null;

  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-2xl border shadow-2xl p-6 relative my-8 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 text-muted-foreground hover:text-foreground p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Patient Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{patient.full_name}</h2>
                <Badge variant="outline" className="font-mono text-primary font-bold">
                  {patient.patient_number}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">
                {patient.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patient.whatsapp_consent ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>الواتساب مفعل</span>
              </Badge>
            ) : (
              <Badge variant="outline">الواتساب معطل</Badge>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b py-2 text-xs font-semibold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "info"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>البيانات الشخصية</span>
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "appointments"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>سجل المواعيد ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "payments"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>المدفوعات ({formatCurrency(totalPaid)})</span>
          </button>

          <button
            onClick={() => setActiveTab("visits")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "visits"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>السجلات السريرية ({visits.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-4 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: INFO */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">الاسم الكامل</label>
                  <Input value={patient.full_name} disabled className="bg-secondary/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">رقم الهاتف</label>
                  <Input value={patient.phone} disabled dir="ltr" className="bg-secondary/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">تاريخ الميلاد</label>
                  <Input value={patient.date_of_birth || "غير محدد"} disabled className="bg-secondary/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">الجنس</label>
                  <Input
                    value={patient.gender === "female" ? "أنثى" : "ذكر"}
                    disabled
                    className="bg-secondary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">الملاحظات الإدارية / الحساسية</label>
                <div className="p-3 rounded-xl bg-secondary/30 border text-sm text-muted-foreground">
                  {patient.admin_notes || "لا توجد ملاحظات مسجلة لهذا المريض."}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>تاريخ فتح الملف في العيادة: </span>
                <strong className="text-foreground">
                  {new Date(patient.created_at).toLocaleDateString("ar-IQ", { dateStyle: "long" })}
                </strong>
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  لا توجد مواعيد مسجلة لهذا المريض حتى الآن.
                </div>
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-foreground">{apt.service_name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>
                          {new Date(apt.start_time).toLocaleString("ar-IQ", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        <span>•</span>
                        <span>{apt.duration_minutes} دقيقة</span>
                      </div>
                    </div>
                    <div>
                      <Badge
                        variant={
                          apt.status === "confirmed"
                            ? "success"
                            : apt.status === "completed"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {apt.status === "confirmed"
                          ? "مؤكد"
                          : apt.status === "completed"
                          ? "مكتمل"
                          : "ملغي"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 flex items-center justify-between">
                <span className="text-xs font-semibold">إجمالي المبالغ المدفوعة:</span>
                <span className="text-lg font-bold">{formatCurrency(totalPaid)}</span>
              </div>

              {payments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  لا توجد إيصالات دفع مسجلة لهذا المريض.
                </div>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border bg-secondary/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-primary">{p.reference_number}</div>
                      <div className="text-muted-foreground mt-0.5">
                        طريقة الدفع: {p.payment_method === "cash" ? "نقدي" : "بطاقة / تحويل"}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="font-bold text-sm text-emerald-600">
                        {formatCurrency(p.amount, p.currency)}
                      </div>
                      <div className="text-muted-foreground text-[10px]">
                        {new Date(p.payment_date).toLocaleDateString("ar-IQ")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: VISITS */}
          {activeTab === "visits" && (
            <div className="space-y-3">
              {visits.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  لا توجد تقارير أو تشخيصات سريرية سابقة لهذا المريض.
                </div>
              ) : (
                visits.map((vis) => (
                  <div key={vis.id} className="p-4 rounded-xl border bg-secondary/20 space-y-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <span>{vis.diagnosis}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(vis.visit_date).toLocaleDateString("ar-IQ")}
                      </span>
                    </div>

                    {vis.clinical_notes && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {vis.clinical_notes}
                      </p>
                    )}

                    {vis.prescription && (
                      <div className="p-2.5 rounded-lg bg-card border text-xs">
                        <strong className="text-primary block mb-0.5">الوصفة:</strong>
                        <span className="font-mono text-muted-foreground">{vis.prescription}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>
            إغلاق الملف
          </Button>
        </div>
      </div>
    </div>
  );
}
