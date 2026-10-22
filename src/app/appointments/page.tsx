"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { CalendarPlus, Clock, CheckCircle2, AlertTriangle, X, Filter } from "lucide-react";

export default function AppointmentsPage() {
  const { t } = useI18n();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    patient_id: "",
    service_id: "",
    start_time: "",
    notes: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [aptRes, patRes, srvRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/patients"),
        fetch("/api/services"),
      ]);
      const aptJson = await aptRes.json();
      const patJson = await patRes.json();
      const srvJson = await srvRes.json();

      setAppointments(aptJson.data || []);
      setPatients(patJson.data || []);
      setServices(srvJson.data || []);

      if (patJson.data?.length > 0 && srvJson.data?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          patient_id: patJson.data[0].id,
          service_id: srvJson.data[0].id,
        }));
      }
    } catch {
      // Fallback
    }
  }

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMsg(errorData.error || "تعذر حجز الموعد");
        setIsLoading(false);
        return;
      }

      await loadData();
      setIsModalOpen(false);
    } catch {
      setErrorMsg("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === "all") return true;
    return apt.status === statusFilter;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navAppointments")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              جدول المواعيد اليومية، فحص التعارض الزمني، ومزامنة الحجوزات
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <CalendarPlus className="w-4 h-4" />
            <span>{t("newAppointment")}</span>
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            {t("all")} ({appointments.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "confirmed" ? "default" : "outline"}
            onClick={() => setStatusFilter("confirmed")}
          >
            {t("statusConfirmed")}
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
          >
            {t("statusPending")}
          </Button>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              المواعيد المجدولة ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground border-b">
                  <tr>
                    <th className="py-3 px-4 text-start font-medium">{t("patientName")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("phoneNumber")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("service")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("dateTime")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("duration")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("status")}</th>
                    <th className="py-3 px-4 text-start font-medium">المصدر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        لا توجد مواعيد مسجلة
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {apt.patient_name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono" dir="ltr">
                          {apt.patient_phone || "—"}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {apt.service_name}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{new Date(apt.start_time).toLocaleString("ar-IQ", { dateStyle: "short", timeStyle: "short" })}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {apt.duration_minutes} دقيقة
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={apt.status === "confirmed" ? "success" : "warning"}>
                            {apt.status === "confirmed" ? t("statusConfirmed") : t("statusPending")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {apt.booking_source === "whatsapp" ? "واتساب (آلي)" : "لوحة التحكم"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* New Appointment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-2xl border shadow-xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 end-5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4">{t("newAppointment")}</h2>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">{t("patientName")} *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">{t("service")} *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.service_id}
                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_ar} — {s.price?.toLocaleString()} د.ع ({s.duration_minutes} د)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">{t("dateTime")} *</label>
                  <Input
                    type="datetime-local"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    يقوم النظام آلياً بفحص التعارض الزمني مع المواعيد الأخرى.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">{t("notes")}</label>
                  <Input
                    placeholder="ملاحظات الحجز..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t("loading") : t("confirm")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
