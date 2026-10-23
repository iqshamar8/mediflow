"use client";

import React, { useState } from "react";
import { useClinic } from "@/lib/clinic/context";
import { SearchablePatientSelect } from "@/components/patients/searchable-patient-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Send,
  Sparkles,
  Stethoscope,
  Pill,
  Clock,
  AlertCircle,
} from "lucide-react";

interface MedicationRow {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const COMMON_DRUGS = [
  "Amoxicillin 500mg",
  "Augmentin 1g (Amox/Clav)",
  "Paracetamol 500mg",
  "Ibuprofen 400mg",
  "Cataflam 50mg (Diclofenac)",
  "Omeprazole 20mg",
  "Pantoprazole 40mg",
  "Ciprofloxacin 500mg",
  "Azithromycin 500mg",
  "Metronidazole (Flagyl) 500mg",
  "Folic Acid 5mg",
  "Vitamin D3 50,000 IU",
  "Amlodipine 5mg",
  "Metformin 850mg",
];

const FREQUENCIES = [
  "3 مرات يومياً (بعد الطعام)",
  "مرتين يومياً (كل 12 ساعة)",
  "مرة واحدة يومياً (صباحاً)",
  "مرة واحدة يومياً (قبل النوم)",
  "عند اللزوم فقط (عند الألم)",
];

const DURATIONS = ["لمدة 3 أيام", "لمدة 5 أيام", "لمدة أسبوع", "لمدة أسبوعين", "لمدة شهر"];

interface PrescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patients: any[];
  initialPatientId?: string;
  initialDiagnosis?: string;
  onSuccess?: () => void;
}

export function PrescriptionDialog({
  isOpen,
  onClose,
  patients,
  initialPatientId = "",
  initialDiagnosis = "",
  onSuccess,
}: PrescriptionDialogProps) {
  const { currentClinic } = useClinic();

  const [patientId, setPatientId] = useState(initialPatientId);
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis || "كشف واستشارة طبية");
  const [generalAdvice, setGeneralAdvice] = useState("الراحة التامة، شرب كميات كافية من الماء، والالتزام بمواعيد الجرعات بدقة.");
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedPrescription, setSavedPrescription] = useState<any | null>(null);

  const [medications, setMedications] = useState<MedicationRow[]>([
    {
      medication_name: "Amoxicillin / Clavulanate 1g",
      dosage: "قرص واحد",
      frequency: "مرتين يومياً (كل 12 ساعة)",
      duration: "لمدة 7 أيام",
      instructions: "بعد الأكل مباشرة",
    },
    {
      medication_name: "Paracetamol 500mg",
      dosage: "قرصين",
      frequency: "عند اللزوم فقط (عند الألم)",
      duration: "لمدة 5 أيام",
      instructions: "مع كوب ماء كامل",
    },
  ]);

  if (!isOpen) return null;

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      {
        medication_name: "",
        dosage: "قرص واحد",
        frequency: "3 مرات يومياً (بعد الطعام)",
        duration: "لمدة 5 أيام",
        instructions: "",
      },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: keyof MedicationRow, val: string) => {
    const updated = [...medications];
    updated[index][field] = val;
    setMedications(updated);
  };

  const handleSavePrescription = async (triggerPrint = false) => {
    if (!patientId) {
      alert("يرجى اختيار المريض أولاً");
      return;
    }
    const validMeds = medications.filter((m) => m.medication_name.trim());
    if (validMeds.length === 0) {
      alert("يرجى إضافة دواء واحد على الأقل");
      return;
    }

    try {
      setIsSubmitting(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) headers["x-clinic-id"] = currentClinic.id;

      const res = await fetch(`/api/prescriptions?clinic_id=${currentClinic?.id || ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          patient_id: patientId,
          diagnosis,
          items: validMeds,
          general_advice: generalAdvice,
          send_whatsapp: sendWhatsApp,
        }),
      });

      if (!res.ok) throw new Error("فشل حفظ الوصفة");
      const savedRx = await res.json();
      setSavedPrescription(savedRx);

      if (onSuccess) onSuccess();

      if (triggerPrint) {
        setTimeout(() => {
          window.print();
        }, 300);
      }
    } catch {
      alert("حدث خطأ أثناء حفظ الوصفة الطبية");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPatientObj = patients.find((p) => p.id === patientId);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-card w-full max-w-3xl rounded-2xl border shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto print:max-h-none print:border-none print:shadow-none print:p-0">
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header (Hidden on Print) */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border print:hidden">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>الوصفة الطبية الإلكترونية الذكية (E-Prescription)</span>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Rx Generator
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              كتابة العلاج، الطباعة بتصميم راشتة رسمية، وإرسال نسخة تلقائية عبر الواتساب
            </p>
          </div>
        </div>

        {/* FORM INPUTS (HIDDEN IN PRINT MODE) */}
        <div className="space-y-4 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">المريض *</label>
              <SearchablePatientSelect
                patients={patients}
                value={patientId}
                onChange={(id) => setPatientId(id)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">التشخيص الطبي *</label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="التشخيص (مثال: التهاب لوزتين حاد، حساسية صدرية...)"
              />
            </div>
          </div>

          {/* Quick Drug Quick-Add Pills */}
          <div>
            <span className="text-[11px] text-muted-foreground block mb-1.5 font-medium">
              💡 أدوية شائعة للإضافة السريعة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_DRUGS.slice(0, 7).map((drug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMedications([
                      ...medications,
                      {
                        medication_name: drug,
                        dosage: "قرص واحد",
                        frequency: "مرتين يومياً (كل 12 ساعة)",
                        duration: "لمدة 5 أيام",
                        instructions: "بعد الأكل",
                      },
                    ]);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  + {drug}
                </button>
              ))}
            </div>
          </div>

          {/* Medications Dynamic List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                قائمة الأدوية والجرعات ({medications.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMedication}
                className="gap-1.5 text-xs h-8 border-dashed border-primary/50 text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة دواء جديد
              </Button>
            </div>

            <div className="space-y-2.5">
              {medications.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border bg-card/60 space-y-2.5 relative group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <Input
                      placeholder="اسم الدواء والعيار (مثال: Augmentin 1g)"
                      value={med.medication_name}
                      onChange={(e) => handleMedChange(idx, "medication_name", e.target.value)}
                      className="font-medium text-xs sm:text-sm h-8"
                    />
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(idx)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="حذف الدواء"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <Input
                        placeholder="الجرعة (قرص واحد)"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(idx, "dosage", e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedChange(idx, "frequency", e.target.value)}
                        className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                      >
                        {FREQUENCIES.map((f, i) => (
                          <option key={i} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={med.duration}
                        onChange={(e) => handleMedChange(idx, "duration", e.target.value)}
                        className="w-full h-7 text-xs rounded-md border border-input bg-background px-2"
                      >
                        {DURATIONS.map((d, i) => (
                          <option key={i} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Input
                        placeholder="تعليمات خاصة (بعد الأكل...)"
                        value={med.instructions}
                        onChange={(e) => handleMedChange(idx, "instructions", e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Advice */}
          <div>
            <label className="text-xs font-semibold block mb-1">نصائح وإرشادات عامة للمريض</label>
            <Input
              value={generalAdvice}
              onChange={(e) => setGeneralAdvice(e.target.value)}
              placeholder="نصائح مثل الراحة، الحمية الغذائية، موعد المراجعة..."
              className="text-xs"
            />
          </div>

          {/* WhatsApp send toggle */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                إرسال ملخص الوصفة والجرعات مباشرة إلى واتساب المريض ({selectedPatientObj?.phone || "المريض"})
              </span>
            </div>
            <input
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" type="button" onClick={onClose}>
              إغلاق
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSavePrescription(true)}
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            >
              <Printer className="w-4 h-4" />
              حفظ وطباعة الراشتة الرسمية
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSavePrescription(false)}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "جاري الحفظ..." : "حفظ الوصفة الطبية"}
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* OFFICIAL PRINTABLE MEDICAL PRESCRIPTION SHEET (PRINT VIEW)   */}
        {/* ------------------------------------------------------------- */}
        <div className="hidden print:block font-serif text-black p-8 bg-white border border-slate-300 rounded-lg max-w-2xl mx-auto my-4 shadow-sm">
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {currentClinic?.name || "عيادة النور الطبية التخصصية"}
              </h1>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {currentClinic?.doctor_name || "د. أحمد الراوي"}
              </p>
              <p className="text-xs text-slate-600">
                {currentClinic?.specialty || "استشاري الأمراض الباطنية والقلب"}
              </p>
            </div>
            <div className="text-end text-xs text-slate-600 leading-relaxed">
              <p>{currentClinic?.address || "بغداد - المنصور"}</p>
              <p dir="ltr">هاتف: {currentClinic?.phone || "+964 770 000 0001"}</p>
              <p className="mt-1 font-mono text-[10px]">تاريخ الكشف: {new Date().toLocaleDateString("ar-IQ")}</p>
            </div>
          </div>

          {/* Patient Details Row */}
          <div className="bg-slate-50 border border-slate-200 rounded p-2.5 mb-6 text-xs flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-800">اسم المريض: </span>
              <span className="font-semibold text-slate-900">{selectedPatientObj?.full_name || "المراجع الكريم"}</span>
            </div>
            {selectedPatientObj?.patient_number && (
              <div>
                <span className="font-bold text-slate-800">رقم الملف: </span>
                <span className="font-mono">{selectedPatientObj.patient_number}</span>
              </div>
            )}
            <div>
              <span className="font-bold text-slate-800">التشخيص: </span>
              <span>{diagnosis}</span>
            </div>
          </div>

          {/* Rx Symbol */}
          <div className="mb-4">
            <span className="text-4xl font-serif font-black text-slate-900 tracking-wider">℞</span>
          </div>

          {/* Medications Table */}
          <div className="min-h-[280px]">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-400 text-slate-700">
                  <th className="py-2 w-8 text-center">#</th>
                  <th className="py-2">اسم الدواء (Medication)</th>
                  <th className="py-2">الجرعة والتكرار (Dose & Frequency)</th>
                  <th className="py-2">المدة (Duration)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {medications
                  .filter((m) => m.medication_name.trim())
                  .map((med, i) => (
                    <tr key={i} className="py-2">
                      <td className="py-2.5 text-center font-bold text-slate-500">{i + 1}</td>
                      <td className="py-2.5">
                        <strong className="text-sm block text-slate-900">{med.medication_name}</strong>
                        {med.instructions && (
                          <span className="text-[11px] text-slate-600 block mt-0.5">تعليمات: {med.instructions}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-800">
                        <span>{med.dosage}</span> — <span>{med.frequency}</span>
                      </td>
                      <td className="py-2.5 text-slate-700">{med.duration}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Advice */}
          {generalAdvice && (
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-700">
              <strong className="text-slate-900">إرشادات الطبيب: </strong>
              <span>{generalAdvice}</span>
            </div>
          )}

          {/* Footer Signature */}
          <div className="mt-12 pt-4 border-t border-slate-300 flex justify-between items-end text-xs">
            <div className="text-[10px] text-slate-500">
              <p>حررت إلكترونياً عبر نظام MediFlow CRM الطبي</p>
              <p>رمز التحقق: {savedPrescription?.id || `RX-${Date.now().toString().slice(-6)}`}</p>
            </div>
            <div className="text-center">
              <p className="mb-8 font-bold text-slate-800">توقيع وختم الطبيب المعالج</p>
              <div className="w-36 border-b border-dashed border-slate-500 mx-auto" />
              <p className="text-[10px] text-slate-600 mt-1">{currentClinic?.doctor_name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
