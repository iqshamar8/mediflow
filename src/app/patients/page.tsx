"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { PlusCircle, Search, User, Phone, Calendar, CheckCircle2, X, FileSpreadsheet, Download, ExternalLink } from "lucide-react";
import { PatientImportDialog } from "@/components/patients/patient-import-dialog";
import { PatientDetailsDialog } from "@/components/patients/patient-details-dialog";
import { useClinic } from "@/lib/clinic/context";

export default function PatientsPage() {
  const { t } = useI18n();
  const { currentClinic } = useClinic();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  function handleExportPatientsCSV() {
    const headers = ["رقم الملف", "الاسم الكامل", "رقم الهاتف", "تاريخ الميلاد", "الجنس", "موافقة الواتساب", "ملاحظات"];
    const rows = filteredPatients.map((p) => [
      p.patient_number,
      p.full_name,
      p.phone,
      p.date_of_birth || "",
      p.gender === "female" ? "أنثى" : "ذكر",
      p.whatsapp_consent ? "نعم" : "لا",
      p.admin_notes || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mediflow-patients-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    gender: "male",
    whatsapp_consent: true,
    admin_notes: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [currentClinic?.id]);

  async function fetchPatients() {
    try {
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const res = await fetch(`/api/patients?clinic_id=${currentClinic?.id || ""}`, { headers });
      const json = await res.json();
      setPatients(json.data || []);
    } catch {
      // Fallback
    }
  }

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) {
        headers["x-clinic-id"] = currentClinic.id;
      }
      const res = await fetch(`/api/patients?clinic_id=${currentClinic?.id || ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMsg(errorData.error || "فشل حفظ المريض");
        setIsLoading(false);
        return;
      }

      await fetchPatients();
      setIsModalOpen(false);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
        gender: "male",
        whatsapp_consent: true,
        admin_notes: "",
      });
    } catch {
      setErrorMsg("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPatients = patients.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search) ||
      p.patient_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navPatients")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              إدارة السجلات الطبية وبيانات المرضى والتواصل عبر الواتساب
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportPatientsCSV}
              className="gap-2"
              title="تصدير قائمة المرضى إلى ملف CSV"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
              <span>تصدير CSV</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="gap-2 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>استيراد ملف (Excel / CSV)</span>
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>{t("addPatient")}</span>
            </Button>
          </div>
        </div>

        {/* Search input */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-3 start-3 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم، رقم الهاتف (+964...)، أو رقم الملف..."
                className="ps-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              قائمة المرضى ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground border-b">
                  <tr>
                    <th className="py-3 px-4 text-start font-medium">{t("patientNumber")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("patientName")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("phoneNumber")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("dateOfBirth")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("whatsappConsent")}</th>
                    <th className="py-3 px-4 text-start font-medium">ملاحظات</th>
                    <th className="py-3 px-4 text-center font-medium">الملف الطبي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        {t("noPatientsFound")}
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-primary">
                          {patient.patient_number}
                        </td>
                        <td className="py-3 px-4 font-semibold flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span>{patient.full_name}</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono" dir="ltr">
                          {patient.phone}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {patient.date_of_birth || "—"}
                        </td>
                        <td className="py-3 px-4">
                          {patient.whatsapp_consent ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>مفعل</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline">معطل</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs truncate max-w-xs">
                          {patient.admin_notes || "—"}
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedPatient(patient)}
                            className="h-7 px-2.5 text-xs text-primary hover:bg-primary/10 gap-1 font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>فتح الملف</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Patient Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-lg rounded-2xl border shadow-xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 end-5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4">{t("addPatient")}</h2>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAddPatient} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">{t("patientName")} *</label>
                  <Input
                    required
                    placeholder="الاسم الثلاثي..."
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">{t("phoneNumber")} *</label>
                  <Input
                    required
                    placeholder="+9647700000000"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1">{t("dateOfBirth")}</label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">{t("gender")}</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    >
                      <option value="male">{t("genderMale")}</option>
                      <option value="female">{t("genderFemale")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">ملاحظات إدارية / حساسية</label>
                  <Input
                    placeholder="ملاحظات سريرية أو إدارية هامة..."
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={formData.whatsapp_consent}
                    onChange={(e) => setFormData({ ...formData, whatsapp_consent: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                  />
                  <label htmlFor="consent" className="text-xs font-medium cursor-pointer">
                    موافقة المريض على استلام رسائل وتأكيدات الواتساب
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t("loading") : t("save")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Patient Batch Import Dialog (Excel / CSV) */}
        <PatientImportDialog
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={fetchPatients}
        />

        {/* Patient Full Details / Medical History Dialog */}
        <PatientDetailsDialog
          patient={selectedPatient}
          isOpen={Boolean(selectedPatient)}
          onClose={() => setSelectedPatient(null)}
          onUpdate={fetchPatients}
        />
      </div>
    </AppLayout>
  );
}
