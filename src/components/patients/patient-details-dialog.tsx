"use client";

import React, { useState, useEffect } from "react";
import { useClinic } from "@/lib/clinic/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PrescriptionDialog } from "@/components/prescriptions/prescription-dialog";
import { SpecialtyClinicalSuite } from "@/components/clinical/specialty-suite";
import { ClinicSpecialtyType } from "@/server/mock-db";
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
  FolderOpen,
  Image as ImageIcon,
  Upload,
  Eye,
  Trash2,
  Printer,
  Download,
  Plus,
  Activity,
  Smile,
  Sparkles,
  Baby,
  Heart,
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
  const { currentClinic } = useClinic();
  const [activeTab, setActiveTab] = useState<
    "info" | "specialty" | "prescriptions" | "attachments" | "visits" | "appointments" | "payments"
  >("info");

  const [appointments, setAppointments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Specialty Clinical Data State
  const [patientSpecialtyRecords, setPatientSpecialtyRecords] = useState<Record<string, any>>({});
  const [isSavingSpecialty, setIsSavingSpecialty] = useState(false);
  const [specialtySuccess, setSpecialtySuccess] = useState(false);

  // New Rx Modal
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);

  // New Attachment Modal
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [newAttachForm, setNewAttachForm] = useState({
    file_name: "",
    category: "sonar" as "sonar" | "xray" | "lab" | "report",
    notes: "",
  });

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
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSavePatient(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) {
        headers["x-clinic-id"] = currentClinic.id;
      }
      const res = await fetch(`/api/patients?clinic_id=${currentClinic?.id || ""}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          id: patient.id,
          ...editData,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "فشل حفظ التعديلات");
        setIsSaving(false);
        return;
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onUpdate();
    } catch {
      setErrorMsg("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePatient() {
    if (!confirm(`هل أنت متأكد من حذف سجل المريض (${patient.full_name}) نهائياً؟`)) {
      return;
    }
    try {
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const res = await fetch(`/api/patients?id=${patient.id}&clinic_id=${currentClinic?.id || ""}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch {
      // Error
    }
  }

  async function handleSaveSpecialty() {
    setIsSavingSpecialty(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) {
        headers["x-clinic-id"] = currentClinic.id;
      }
      const res = await fetch(`/api/patients?clinic_id=${currentClinic?.id || ""}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          id: patient.id,
          specialty_records: patientSpecialtyRecords,
        }),
      });
      if (res.ok) {
        setSpecialtySuccess(true);
        setTimeout(() => setSpecialtySuccess(false), 3000);
        onUpdate();
      }
    } catch {
      // Error
    } finally {
      setIsSavingSpecialty(false);
    }
  }

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
      setPatientSpecialtyRecords(patient.specialty_records || {});
      loadPatientHistory(patient.id);
    }
  }, [patient, isOpen, currentClinic?.id]);

  async function loadPatientHistory(patientId: string) {
    setIsLoadingHistory(true);
    try {
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const [aptRes, payRes, visRes, attRes, rxRes] = await Promise.all([
        fetch(`/api/appointments?clinic_id=${currentClinic?.id || ""}`, { headers }),
        fetch(`/api/payments?clinic_id=${currentClinic?.id || ""}`, { headers }),
        fetch(`/api/visits?patient_id=${patientId}&clinic_id=${currentClinic?.id || ""}`, { headers }),
        fetch(`/api/attachments?patient_id=${patientId}&clinic_id=${currentClinic?.id || ""}`, { headers }),
        fetch(`/api/prescriptions?patient_id=${patientId}&clinic_id=${currentClinic?.id || ""}`, { headers }),
      ]);

      const aptJson = await aptRes.json();
      const payJson = await payRes.json();
      const visJson = await visRes.json();
      const attJson = await attRes.json();
      const rxJson = await rxRes.json();

      setAppointments((aptJson.data || []).filter((a: any) => a.patient_id === patientId));
      setPayments((payJson.data || []).filter((p: any) => p.patient_id === patientId));
      setVisits(visJson.data || []);
      setAttachments(attJson.data || []);
      setPrescriptions(rxJson.data || []);
    } catch {
      // Fallback
    } finally {
      setIsLoadingHistory(false);
    }
  }

  // Upload Attachment
  async function handleAddAttachment(e: React.FormEvent) {
    e.preventDefault();
    if (!newAttachForm.file_name.trim()) return;

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) headers["x-clinic-id"] = currentClinic.id;

      await fetch(`/api/attachments?clinic_id=${currentClinic?.id || ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          patient_id: patient.id,
          file_name: newAttachForm.file_name,
          category: newAttachForm.category,
          notes: newAttachForm.notes,
          file_type: newAttachForm.category === "report" ? "application/pdf" : "image/png",
          file_size_kb: Math.floor(400 + Math.random() * 1500),
        }),
      });

      setIsAttachModalOpen(false);
      setNewAttachForm({ file_name: "", category: "sonar", notes: "" });
      loadPatientHistory(patient.id);
    } catch {
      alert("فشل إضافة المرفق");
    }
  }

  // Delete Attachment
  async function handleDeleteAttachment(attId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المرفق؟")) return;
    try {
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      await fetch(`/api/attachments?id=${attId}&clinic_id=${currentClinic?.id || ""}`, {
        method: "DELETE",
        headers,
      });
      loadPatientHistory(patient.id);
    } catch {
      // Error
    }
  }

  if (!isOpen || !patient) return null;

  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-card w-full max-w-4xl rounded-2xl border shadow-2xl p-6 relative my-8 flex flex-col max-h-[92vh]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 end-5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-foreground">{patient.full_name}</h2>
                  <Badge variant="outline" className="font-mono text-xs">
                    {patient.patient_number}
                  </Badge>
                  <Badge variant={patient.gender === "female" ? "secondary" : "default"}>
                    {patient.gender === "female" ? "أنثى" : "ذكر"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 font-mono" dir="ltr">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {patient.phone}
                  </span>
                  {patient.date_of_birth && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {patient.date_of_birth}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAttachModalOpen(true)}
                className="gap-1.5 text-xs font-semibold border-primary/30 hover:bg-primary/5 text-primary"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                رفع أشعة / سونار
              </Button>

              <Button
                size="sm"
                onClick={() => setIsRxModalOpen(true)}
                className="gap-1.5 text-xs font-bold shadow-sm"
              >
                <Pill className="w-3.5 h-3.5" />
                كتابة راشتة طبية (Rx)
              </Button>
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
              onClick={() => setActiveTab("specialty")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "specialty"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>الملف الطبي التخصصي</span>
            </button>

            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "prescriptions"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>الراشتات الطبية ({prescriptions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("attachments")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "attachments"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>الأشعة والمرفقات ({attachments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("visits")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "visits"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>التقارير السريرية ({visits.length})</span>
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
              <span>المواعيد ({appointments.length})</span>
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
              <span>المدفوعات ({payments.length})</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="py-4 overflow-y-auto flex-1 space-y-4">
            {/* TAB 1: INFO & EDIT */}
            {activeTab === "info" && (
              <form onSubmit={handleSavePatient} className="space-y-4">
                {saveSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>تم حفظ تعديلات المريض بنجاح</span>
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1">الاسم الكامل *</label>
                    <Input
                      value={editData.full_name}
                      onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">رقم الهاتف *</label>
                    <Input
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1">تاريخ الميلاد</label>
                    <Input
                      type="date"
                      value={editData.date_of_birth}
                      onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">الجنس</label>
                    <select
                      value={editData.gender}
                      onChange={(e) => setEditData({ ...editData, gender: e.target.value as any })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">البريد الإلكتروني</label>
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">ملاحظات طبية وإدارية</label>
                  <Input
                    value={editData.admin_notes}
                    onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })}
                    placeholder="حساسية أدوية، أمراض مزمنة..."
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDeletePatient}
                    className="text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    حذف المريض نهائياً
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </Button>
                </div>
              </form>
            )}

            {/* TAB: SPECIALTY CLINICAL SUITE */}
            {activeTab === "specialty" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-secondary/30 rounded-xl border">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      الملف الطبي التخصصي التراكمي للمريض
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      مخطط الأسنان، فحص البصر، قياسات سونار الحمل، متابعة اللقاحات، وجلسات التجميل
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={isSavingSpecialty}
                    onClick={handleSaveSpecialty}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSavingSpecialty ? "جاري الحفظ..." : "حفظ التحديثات التخصصية"}</span>
                  </Button>
                </div>

                {specialtySuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>تم حفظ البيانات السريرية في الملف التخصصي للمريض بنجاح</span>
                  </div>
                )}

                <SpecialtyClinicalSuite
                  initialSpecialty={(currentClinic?.specialty_type || "cardiology_general") as ClinicSpecialtyType}
                  value={patientSpecialtyRecords}
                  onChange={(newData, spec) => {
                    setPatientSpecialtyRecords((prev) => ({
                      ...prev,
                      [spec]: newData,
                      ...newData,
                    }));
                  }}
                />
              </div>
            )}

            {/* TAB: PRESCRIPTIONS (الراشتات الطبية) */}
            {activeTab === "prescriptions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    سجل الراشتات والوصفات الطبية الموصوفة لهذا المريض
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsRxModalOpen(true)}
                    className="gap-1.5 text-xs font-semibold h-8"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    كتابة راشتة جديدة
                  </Button>
                </div>

                {prescriptions.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                    <Pill className="w-10 h-10 mx-auto opacity-30 mb-2" />
                    <p className="font-semibold text-sm">لا توجد وصفات طبية مسجلة سابقاً</p>
                    <p className="text-xs">اضغط على زر (كتابة راشتة جديدة) لتوليد وصفة قابلة للطباعة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="p-4 rounded-xl border bg-card/60 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between border-b pb-2.5">
                          <div>
                            <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              <span className="text-primary font-serif font-black text-base">℞</span>
                              <span>{rx.diagnosis}</span>
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              بواسطة: {rx.doctor_name} — {new Date(rx.created_at).toLocaleDateString("ar-IQ")}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="gap-1 text-xs h-7 border-primary/30 text-primary"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            طباعة
                          </Button>
                        </div>

                        <div className="space-y-1.5">
                          {rx.items?.map((it: any, i: number) => (
                            <div key={i} className="text-xs flex items-start gap-2 bg-muted/40 p-2 rounded-lg">
                              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <div>
                                <strong className="text-foreground">{it.medication_name}</strong>
                                <span className="text-muted-foreground ms-2">
                                  ({it.dosage} — {it.frequency} — {it.duration})
                                </span>
                                {it.instructions && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">تعليمات: {it.instructions}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {rx.general_advice && (
                          <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10">
                            💡 {rx.general_advice}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ATTACHMENTS & SCANS (الأشعة والسونار) */}
            {activeTab === "attachments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    أرشيف صور السونار والأشعة والتقارير المخبرية
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAttachModalOpen(true)}
                    className="gap-1.5 text-xs font-semibold h-8 border-primary/40 text-primary"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    رفع مرفق جديد
                  </Button>
                </div>

                {attachments.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                    <FolderOpen className="w-10 h-10 mx-auto opacity-30 mb-2" />
                    <p className="font-semibold text-sm">لا توجد أشعة أو مرفقات محفوظة لهذا المريض</p>
                    <p className="text-xs">يمكنك رفع صور السونار، الأشعة، أو ملفات التحاليل وحفظها في سجله الطبي</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3.5 rounded-xl border border-border bg-card/60 shadow-sm flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                            {att.category === "sonar" ? (
                              <ImageIcon className="w-5 h-5" />
                            ) : att.category === "xray" ? (
                              <FileText className="w-5 h-5 text-amber-500" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div className="overflow-hidden leading-tight">
                            <h4 className="text-xs font-bold text-foreground truncate">{att.file_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[9px] py-0 px-1 font-semibold">
                                {att.category === "sonar"
                                  ? "سونار"
                                  : att.category === "xray"
                                  ? "أشعة X-Ray"
                                  : att.category === "lab"
                                  ? "تحاليل دم"
                                  : "تقرير طبي"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {att.file_size_kb} KB
                              </span>
                            </div>
                            {att.notes && (
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                                {att.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t text-xs">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(att.uploaded_at).toLocaleDateString("ar-IQ")}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(att.id)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="حذف المرفق"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2 gap-1">
                              <Download className="w-3 h-3" />
                              تحميل
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: VISITS */}
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
                        <p className="text-xs text-muted-foreground leading-relaxed">{vis.clinical_notes}</p>
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

            {/* TAB: APPOINTMENTS */}
            {activeTab === "appointments" && (
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    لا توجد مواعيد سابقة أو مجدولة لهذا المريض.
                  </div>
                ) : (
                  appointments.map((apt) => (
                    <div key={apt.id} className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-foreground">{apt.service_name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(apt.start_time).toLocaleString("ar-IQ")}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          apt.status === "confirmed"
                            ? "success"
                            : apt.status === "pending"
                            ? "warning"
                            : "outline"
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === "payments" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 flex items-center justify-between">
                  <span className="text-xs font-semibold">إجمالي المبالغ المسددة من المريض:</span>
                  <span className="font-bold font-mono text-sm">{formatCurrency(totalPaid, "IQD")}</span>
                </div>

                {payments.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    لا توجد وصولات دفع مسجلة لهذا المريض.
                  </div>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl border bg-card flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm font-mono text-foreground">
                          {formatCurrency(p.amount, p.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          طريقة الدفع: {p.payment_method === "cash" ? "نقداً (كاش)" : "بطاقة دفع"} | وصل رقم:{" "}
                          <span className="font-mono">{p.reference_number}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.payment_date).toLocaleDateString("ar-IQ")}
                      </span>
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

      {/* Prescription Dialog Modal */}
      {isRxModalOpen && (
        <PrescriptionDialog
          isOpen={isRxModalOpen}
          onClose={() => setIsRxModalOpen(false)}
          patients={[patient]}
          initialPatientId={patient.id}
          initialDiagnosis={visits[0]?.diagnosis || "كشف واستشارة طبية"}
          onSuccess={() => loadPatientHistory(patient.id)}
        />
      )}

      {/* Upload Attachment Modal */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <span>إرفاق صورة سونار أو أشعة أو تقرير مخبري</span>
            </h3>

            <form onSubmit={handleAddAttachment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">نوع المرفق *</label>
                <select
                  value={newAttachForm.category}
                  onChange={(e) => setNewAttachForm({ ...newAttachForm, category: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="sonar">فحص سونار (Ultrasound Scan)</option>
                  <option value="xray">أشعة سينية (X-Ray / OPG)</option>
                  <option value="lab">تحاليل مخبرية ودم (Lab Results)</option>
                  <option value="report">تقرير أو مستند طبي (Medical Report)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">عنوان الملف أو الفحص *</label>
                <Input
                  required
                  placeholder="مثال: سونار بطن وحوض شامل - أسبوع 24"
                  value={newAttachForm.file_name}
                  onChange={(e) => setNewAttachForm({ ...newAttachForm, file_name: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">ملاحظات الطبيب حول الفحص</label>
                <Input
                  placeholder="نتيجة الفحص أو تفاصيل مهمة..."
                  value={newAttachForm.notes}
                  onChange={(e) => setNewAttachForm({ ...newAttachForm, notes: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-primary/30 rounded-xl text-center bg-primary/5">
                <Upload className="w-6 h-6 mx-auto text-primary mb-1 opacity-70" />
                <p className="text-xs font-semibold text-foreground">جاهز للحفظ في سجل المريض</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">يدعم صور PNG, JPEG وملفات PDF</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAttachModalOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={!newAttachForm.file_name.trim()}>
                  حفظ في الملف الطبي
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
