"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import {
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Filter,
  Edit3,
  XCircle,
  Check,
  User,
  MoreVertical,
  Calendar,
  BellRing,
} from "lucide-react";

export default function AppointmentsPage() {
  const { t } = useI18n();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSendingReminder, setIsSendingReminder] = useState<string | null>(null);
  const [reminderNotification, setReminderNotification] = useState<string | null>(null);

  // New Appointment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    service_id: "",
    start_time: "",
    notes: "",
  });

  // Edit Appointment Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    service_id: "",
    start_time: "",
    notes: "",
    status: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");
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

  // 1. Book New Appointment
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
      setFormData((prev) => ({ ...prev, notes: "", start_time: "" }));
    } catch {
      setErrorMsg("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Open Edit Modal
  function handleOpenEdit(apt: any) {
    setEditingApt(apt);
    // Format date string to YYYY-MM-DDTHH:mm for datetime-local
    const d = new Date(apt.start_time);
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setEditFormData({
      service_id: apt.service_id,
      start_time: localIso,
      notes: apt.notes || "",
      status: apt.status,
    });
    setEditErrorMsg("");
    setIsEditModalOpen(true);
  }

  // 3. Save Edited Appointment (Reschedule / Update)
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingApt) return;

    setEditErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingApt.id,
          service_id: editFormData.service_id,
          start_time: new Date(editFormData.start_time).toISOString(),
          notes: editFormData.notes,
          status: editFormData.status,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setEditErrorMsg(errorData.error || "فشل تحديث الموعد");
        setIsLoading(false);
        return;
      }

      await loadData();
      setIsEditModalOpen(false);
      setEditingApt(null);
    } catch {
      setEditErrorMsg("حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setIsLoading(false);
    }
  }

  // 4. Quick Status Change (Confirm, Cancel, Complete, No Show)
  async function handleQuickStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch {
      // Error
    }
  }

  // 5. Send Manual WhatsApp Reminder for an Appointment
  async function handleSendManualReminder(aptId: string) {
    setIsSendingReminder(aptId);
    try {
      const res = await fetch("/api/appointments/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: aptId }),
      });
      const data = await res.json();
      if (res.ok) {
        setReminderNotification(data.message || "تم إرسال تذكير الموعد عبر الواتساب بنجاح!");
        setTimeout(() => setReminderNotification(null), 4500);
        await loadData();
      } else {
        alert(data.error || "تعذر إرسال التذكير");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSendingReminder(null);
    }
  }

  // Filter by search name/phone/service and dropdown status
  const filteredAppointments = appointments.filter((apt) => {
    // Status filter
    if (statusFilter !== "all" && apt.status !== statusFilter) {
      return false;
    }
    // Search query filter (by patient name, phone, or service)
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = apt.patient_name?.toLowerCase().includes(q);
      const phoneMatch = apt.patient_phone?.includes(q);
      const srvMatch = apt.service_name?.toLowerCase().includes(q);
      return nameMatch || phoneMatch || srvMatch;
    }
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navAppointments")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              إدارة وتأكيد وتعديل وإلغاء المواعيد، مع فحص التعارض الزمني وإرسال تذكيرات الواتساب
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <CalendarPlus className="w-4 h-4" />
            <span>{t("newAppointment")}</span>
          </Button>
        </div>

        {/* Reminder Feedback Banner */}
        {reminderNotification && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-sm font-semibold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{reminderNotification}</span>
            </div>
            <button
              onClick={() => setReminderNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 dark:hover:text-emerald-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter and Search Bar Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search by Patient Name or Phone */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute top-3 start-3 text-muted-foreground" />
                <Input
                  placeholder="ابحث باسم المريض، رقم الهاتف، أو اسم الخدمة..."
                  className="ps-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status Dropdown Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground shrink-0">تصفية الحالة:</span>
                <select
                  className="flex h-9 rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-48"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">جميع الحالات ({appointments.length})</option>
                  <option value="confirmed">المؤكدة فقط (Confirmed)</option>
                  <option value="pending">قيد الانتظار (Pending)</option>
                  <option value="completed">المكتملة (Completed)</option>
                  <option value="cancelled">الملغاة (Cancelled)</option>
                  <option value="no_show">لم يحضر (No Show)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base font-semibold">
              المواعيد ({filteredAppointments.length})
            </CardTitle>
            {statusFilter !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                onClick={() => setStatusFilter("all")}
              >
                إلغاء التصفية
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="text-xs uppercase bg-secondary/60 text-muted-foreground border-y">
                  <tr>
                    <th className="py-3 px-4 text-start font-medium">{t("patientName")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("phoneNumber")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("service")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("dateTime")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("status")}</th>
                    <th className="py-3 px-4 text-start font-medium">المصدر</th>
                    <th className="py-3 px-4 text-center font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-muted-foreground">
                        لا توجد مواعيد مطابقة لخيارات البحث والتصفية.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-muted/40 transition-colors">
                        {/* Patient Name */}
                        <td className="py-3 px-4 font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span>{apt.patient_name}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs" dir="ltr">
                          {apt.patient_phone || "—"}
                        </td>

                        {/* Service */}
                        <td className="py-3 px-4 font-medium text-foreground text-xs">
                          {apt.service_name}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1.5 font-sans">
                            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>
                              {new Date(apt.start_time).toLocaleString("ar-IQ", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              apt.status === "confirmed"
                                ? "success"
                                : apt.status === "completed"
                                ? "default"
                                : apt.status === "cancelled" || apt.status === "no_show"
                                ? "destructive"
                                : "warning"
                            }
                            className="text-xs"
                          >
                            {apt.status === "confirmed"
                              ? "مؤكد"
                              : apt.status === "pending"
                              ? "قيد الانتظار"
                              : apt.status === "completed"
                              ? "مكتمل"
                              : apt.status === "cancelled"
                              ? "ملغي"
                              : "لم يحضر"}
                          </Badge>
                        </td>

                        {/* Booking Source */}
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[11px]">
                            {apt.booking_source === "whatsapp" ? "واتساب (آلي)" : "لوحة العيادة"}
                          </Badge>
                        </td>

                        {/* Actions (Manual Confirm / Cancel / Edit / WhatsApp Reminder) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Manual WhatsApp Reminder Button */}
                            {apt.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendManualReminder(apt.id)}
                                disabled={isSendingReminder === apt.id}
                                className="h-7 px-2.5 text-xs border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 gap-1 font-medium"
                                title="إرسال تذكير واتساب للمريض فورياً"
                              >
                                <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{isSendingReminder === apt.id ? "جاري الإرسال..." : "تذكير واتساب"}</span>
                              </Button>
                            )}

                            {/* If pending, show Quick Confirm button */}
                            {apt.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickStatusChange(apt.id, "confirmed")}
                                className="h-7 px-2 text-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
                                title="تأكيد الموعد يدوياً"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>تأكيد</span>
                              </Button>
                            )}

                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEdit(apt)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                              title="تعديل الموعد وإعادة الجدولة"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">تعديل</span>
                            </Button>

                            {/* Cancel Button (if not cancelled yet) */}
                            {apt.status !== "cancelled" ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من إلغاء موعد المريض (${apt.patient_name})؟`)) {
                                    handleQuickStatusChange(apt.id, "cancelled");
                                  }
                                }}
                                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 gap-1"
                                title="إلغاء الموعد"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">إلغاء</span>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleQuickStatusChange(apt.id, "confirmed")}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                title="إعادة تفعيل الموعد"
                              >
                                إعادة تفعيل
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 1. Modal: New Appointment */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 end-5 text-muted-foreground hover:text-foreground p-1 rounded-lg"
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
                    يقوم النظام آلياً بفحص التعارض الزمني مع المواعيد الأخرى قبل الحفظ.
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

        {/* 2. Modal: Edit / Reschedule Appointment */}
        {isEditModalOpen && editingApt && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-5 end-5 text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <h2 className="text-xl font-bold text-foreground">تعديل الموعد وإعادة الجدولة</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  المريض: <strong className="text-foreground">{editingApt.patient_name}</strong> ({editingApt.patient_phone})
                </p>
              </div>

              {editErrorMsg && (
                <div className="p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Service Selection */}
                <div>
                  <label className="text-xs font-semibold block mb-1">الخدمة الطبية *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={editFormData.service_id}
                    onChange={(e) => setEditFormData({ ...editFormData, service_id: e.target.value })}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_ar} — {s.price?.toLocaleString()} د.ع ({s.duration_minutes} د)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div>
                  <label className="text-xs font-semibold block mb-1">التاريخ والوقت الجديد *</label>
                  <Input
                    type="datetime-local"
                    required
                    value={editFormData.start_time}
                    onChange={(e) => setEditFormData({ ...editFormData, start_time: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    يتم التحقق تلقائياً من توفر التوقيت وعدم وجود تضارب مع مواعيد أخرى.
                  </p>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="text-xs font-semibold block mb-1">حالة الموعد *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="confirmed">مؤكد (Confirmed)</option>
                    <option value="pending">قيد الانتظار (Pending)</option>
                    <option value="completed">مكتمل (Completed)</option>
                    <option value="cancelled">ملغي (Cancelled)</option>
                    <option value="no_show">لم يحضر (No Show)</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold block mb-1">ملاحظات إضافية</label>
                  <Input
                    placeholder="سبب التعديل أو ملاحظات..."
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isLoading ? t("loading") : "حفظ التعديلات"}</span>
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
