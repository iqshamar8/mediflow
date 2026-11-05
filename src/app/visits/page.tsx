"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { useClinic } from "@/lib/clinic/context";
import { SearchablePatientSelect } from "@/components/patients/searchable-patient-select";
import { SpecialtyClinicalSuite } from "@/components/clinical/specialty-suite";
import { ClinicSpecialtyType } from "@/server/mock-db";
import {
  FileText,
  ShieldAlert,
  User,
  Clock,
  PlusCircle,
  Search,
  Calendar,
  X,
  CheckCircle2,
  Stethoscope,
  Pill,
  Sparkles,
  Smile,
  Eye,
  Heart,
  Baby,
  Activity,
} from "lucide-react";

export default function VisitsPage() {
  const { t } = useI18n();
  const { currentClinic } = useClinic();
  const [visits, setVisits] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_name: currentClinic?.doctor_name || "د. أحمد الراوي",
    service_name: "كشف واستشارة طبية",
    diagnosis: "",
    clinical_notes: "",
    prescription: "",
    follow_up_date: "",
    specialty_type: (currentClinic?.specialty_type || "cardiology_general") as ClinicSpecialtyType,
    specialty_data: {} as Record<string, any>,
  });

  useEffect(() => {
    loadData();
    if (currentClinic?.doctor_name) {
      setFormData((prev) => ({ 
        ...prev, 
        doctor_name: currentClinic.doctor_name,
        specialty_type: (currentClinic.specialty_type || "cardiology_general") as ClinicSpecialtyType
      }));
    }
  }, [currentClinic?.id, currentClinic?.doctor_name, currentClinic?.specialty_type]);

  async function loadData() {
    try {
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const [visRes, patRes] = await Promise.all([
        fetch(`/api/visits?clinic_id=${currentClinic?.id || ""}`, { headers }),
        fetch(`/api/patients?clinic_id=${currentClinic?.id || ""}`, { headers }),
      ]);
      const visJson = await visRes.json();
      const patJson = await patRes.json();

      setVisits(visJson.data || []);
      setPatients(patJson.data || []);

      if (patJson.data?.length > 0) {
        setFormData((prev) => ({ ...prev, patient_id: patJson.data[0].id }));
      }
    } catch {
      // Fallback
    }
  }

  async function handleAddVisit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) {
        headers["x-clinic-id"] = currentClinic.id;
      }
      const res = await fetch(`/api/visits?clinic_id=${currentClinic?.id || ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadData();
        setIsModalOpen(false);
        setFormData((prev) => ({
          ...prev,
          diagnosis: "",
          clinical_notes: "",
          prescription: "",
          follow_up_date: "",
          specialty_data: {},
        }));
      }
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  }

  const filteredVisits = visits.filter(
    (v) =>
      v.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      v.doctor_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navVisits")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              السجلات السريرية المحمية، التشخيصات، والوصفات الطبية المعتمدة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 py-1 px-3 border-primary/30 text-primary hidden sm:inline-flex">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>محمي بسياسة الصلاحيات (RBAC & RLS)</span>
            </Badge>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل زيارة سريرية</span>
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute top-3 start-3 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم المريض، الطبيب المعالج، أو التشخيص الطبي..."
                className="ps-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visits List */}
        <div className="space-y-4">
          {filteredVisits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                لا توجد سجلات طبية مطابقة للبحث.
              </CardContent>
            </Card>
          ) : (
            filteredVisits.map((visit) => (
              <Card key={visit.id} className="overflow-hidden hover:border-primary/40 transition-colors">
                <CardHeader className="bg-secondary/40 pb-3 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">
                          {visit.patient_name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{visit.doctor_name}</span>
                          {visit.service_name && (
                            <>
                              <span>•</span>
                              <span>{visit.service_name}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(visit.visit_date).toLocaleDateString("ar-IQ", {
                          dateStyle: "long",
                        })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3.5">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-primary" />
                      <span>التشخيص الطبي:</span>
                    </h4>
                    <p className="text-sm font-semibold text-foreground">{visit.diagnosis}</p>
                  </div>

                  {/* Specialty Clinical Data Snippet */}
                  {visit.specialty_data && Object.keys(visit.specialty_data).length > 0 && (
                    <div className="p-3 bg-secondary/40 rounded-xl border text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-primary">
                        {visit.specialty_type === "dentistry" && <Smile className="w-3.5 h-3.5" />}
                        {visit.specialty_type === "ophthalmology" && <Eye className="w-3.5 h-3.5" />}
                        {visit.specialty_type === "obgyn" && <Activity className="w-3.5 h-3.5" />}
                        {visit.specialty_type === "pediatrics" && <Baby className="w-3.5 h-3.5" />}
                        {visit.specialty_type === "dermatology" && <Sparkles className="w-3.5 h-3.5" />}
                        {(!visit.specialty_type || visit.specialty_type === "cardiology_general") && <Heart className="w-3.5 h-3.5" />}
                        <span>بيانات الفحص التخصصي:</span>
                      </div>
                      {visit.specialty_data.systolic && (
                        <div className="flex flex-wrap gap-2 text-muted-foreground">
                          <span className="font-semibold text-foreground">ضغط الدم:</span> {visit.specialty_data.systolic}/{visit.specialty_data.diastolic} mmHg
                          {visit.specialty_data.pulse && <>• <span className="font-semibold text-foreground">النبض:</span> {visit.specialty_data.pulse} bpm</>}
                          {visit.specialty_data.spo2 && <>• <span className="font-semibold text-foreground">SpO2:</span> {visit.specialty_data.spo2}%</>}
                          {visit.specialty_data.blood_sugar && <>• <span className="font-semibold text-foreground">السكر:</span> {visit.specialty_data.blood_sugar} mg/dL</>}
                        </div>
                      )}
                      {visit.specialty_data.teeth && (
                        <div className="text-muted-foreground">
                          تم توثيق <strong className="text-foreground">{Object.keys(visit.specialty_data.teeth).length}</strong> سن على مخطط الأسنان FDI
                        </div>
                      )}
                      {(visit.specialty_data.od_sph || visit.specialty_data.os_sph) && (
                        <div className="flex flex-wrap gap-2 text-muted-foreground font-mono">
                          <span>OD: {visit.specialty_data.od_sph || "0"} / {visit.specialty_data.od_cyl || "0"} x {visit.specialty_data.od_axis || "0"}°</span>
                          <span>•</span>
                          <span>OS: {visit.specialty_data.os_sph || "0"} / {visit.specialty_data.os_cyl || "0"} x {visit.specialty_data.os_axis || "0"}°</span>
                        </div>
                      )}
                      {visit.specialty_data.lmp_date && (
                        <div className="text-muted-foreground">
                          LMP: {visit.specialty_data.lmp_date} {visit.specialty_data.sonar_efw && `• وزن الجنين: ${visit.specialty_data.sonar_efw}`}
                        </div>
                      )}
                      {visit.specialty_data.laser_device && (
                        <div className="text-muted-foreground">
                          جهاز: {visit.specialty_data.laser_device} • طاقة: {visit.specialty_data.laser_fluence || "-"} J/cm²
                        </div>
                      )}
                      {visit.specialty_data.child_weight_kg && (
                        <div className="text-muted-foreground">
                          وزن الطفل: {visit.specialty_data.child_weight_kg} kg • الطول: {visit.specialty_data.child_height_cm || "-"} cm
                        </div>
                      )}
                    </div>
                  )}

                  {visit.clinical_notes && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        الملاحظات السريرية والفحص:
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {visit.clinical_notes}
                      </p>
                    </div>
                  )}

                  {visit.prescription && (
                    <div className="p-3 bg-secondary/60 rounded-xl border text-xs space-y-1">
                      <span className="font-semibold text-primary flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5" />
                        <span>الوصفة الطبية والعلاج المقترح:</span>
                      </span>
                      <p className="font-mono text-muted-foreground text-xs leading-relaxed">
                        {visit.prescription}
                      </p>
                    </div>
                  )}

                  {visit.follow_up_date && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>موعد المراجعة المقترح: </span>
                      <strong className="text-foreground">{visit.follow_up_date}</strong>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Visit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 end-5 text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-4">تسجيل تقرير سريري / زيارة طبية تخصصية</h2>

              <form onSubmit={handleAddVisit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5 flex items-center justify-between">
                    <span>المريض *</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (يمكنك البحث بالاسم أو الهاتف أو رقم الملف)
                    </span>
                  </label>
                  <SearchablePatientSelect
                    patients={patients}
                    value={formData.patient_id}
                    onChange={(patientId) => setFormData({ ...formData, patient_id: patientId })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1">الطبيب المعالج</label>
                    <Input
                      value={formData.doctor_name}
                      onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">الخدمة الطبية</label>
                    <Input
                      value={formData.service_name}
                      onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">التشخيص السريري *</label>
                  <Input
                    required
                    placeholder="التشخيص الأولي أو النهائي..."
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  />
                </div>

                {/* Integrated Specialty Clinical Suite */}
                <div className="pt-2 border-t">
                  <label className="text-xs font-semibold block mb-2">أدوات الفحص والتوثيق التخصصي السريري</label>
                  <SpecialtyClinicalSuite
                    initialSpecialty={formData.specialty_type}
                    value={formData.specialty_data}
                    onChange={(newData, newSpec) => {
                      setFormData((prev) => ({
                        ...prev,
                        specialty_type: newSpec,
                        specialty_data: newData,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">الملاحظات الطبية والفحص العام</label>
                  <textarea
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="تفاصيل الفحص السريري، الملاحظات الإضافية..."
                    value={formData.clinical_notes}
                    onChange={(e) => setFormData({ ...formData, clinical_notes: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">الوصفة الدوائية (العلاج)</label>
                  <Input
                    placeholder="الأدوية، الجرعات، وطريقة الاستعمال..."
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">تاريخ المراجعة (اختياري)</label>
                  <Input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-card py-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isLoading ? "جاري الحفظ..." : "حفظ التقرير الطبي"}</span>
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
