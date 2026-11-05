"use client";

import React, { useState, useEffect } from "react";
import { ClinicSpecialtyType } from "@/server/mock-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Heart,
  Baby,
  Eye,
  Sparkles,
  Smile,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Plus,
  RotateCcw,
  Stethoscope,
  Info,
  Check,
} from "lucide-react";

export interface SpecialtyClinicalSuiteProps {
  initialSpecialty?: ClinicSpecialtyType;
  value?: Record<string, any>;
  onChange?: (data: Record<string, any>, specialty: ClinicSpecialtyType) => void;
  readOnly?: boolean;
}

export function SpecialtyClinicalSuite({
  initialSpecialty = "cardiology_general",
  value = {},
  onChange,
  readOnly = false,
}: SpecialtyClinicalSuiteProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<ClinicSpecialtyType>(initialSpecialty);
  const [specialtyData, setSpecialtyData] = useState<Record<string, any>>(value);

  useEffect(() => {
    if (initialSpecialty) {
      setSelectedSpecialty(initialSpecialty);
    }
  }, [initialSpecialty]);

  useEffect(() => {
    if (value) {
      setSpecialtyData(value);
    }
  }, [value]);

  const updateData = (newFields: Record<string, any>) => {
    const updated = { ...specialtyData, ...newFields };
    setSpecialtyData(updated);
    if (onChange) {
      onChange(updated, selectedSpecialty);
    }
  };

  const specialties = [
    { id: "cardiology_general", label: "الباطنية والقلب", icon: Heart, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
    { id: "dentistry", label: "الأسنان وجراحة الفم", icon: Smile, color: "text-sky-500 bg-sky-50 dark:bg-sky-950/30" },
    { id: "ophthalmology", label: "العيون والبصريات", icon: Eye, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
    { id: "obgyn", label: "النسائية والتوليد والسونار", icon: Activity, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30" },
    { id: "pediatrics", label: "الأطفال واللقاحات", icon: Baby, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
    { id: "dermatology", label: "الجلدية والليزر والتجميل", icon: Sparkles, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" },
  ];

  return (
    <div className="space-y-4">
      {/* Specialty Selector Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b">
        {specialties.map((spec) => {
          const Icon = spec.icon;
          const isActive = selectedSpecialty === spec.id;
          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => {
                setSelectedSpecialty(spec.id as ClinicSpecialtyType);
                if (onChange) {
                  onChange(specialtyData, spec.id as ClinicSpecialtyType);
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{spec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Specialty Specific Component */}
      <div className="transition-all">
        {selectedSpecialty === "cardiology_general" && (
          <GeneralCardiologyPanel data={specialtyData} onChange={updateData} readOnly={readOnly} />
        )}
        {selectedSpecialty === "dentistry" && (
          <DentistryOdontogram data={specialtyData} onChange={updateData} readOnly={readOnly} />
        )}
        {selectedSpecialty === "ophthalmology" && (
          <OphthalmologyRefractionPanel data={specialtyData} onChange={updateData} readOnly={readOnly} />
        )}
        {selectedSpecialty === "obgyn" && (
          <ObGynUltrasoundPanel data={specialtyData} onChange={updateData} readOnly={readOnly} />
        )}
        {selectedSpecialty === "pediatrics" && (
          <PediatricsVaccinePanel data={specialtyData} onChange={updateData} readOnly={readOnly} />
        )}
        {selectedSpecialty === "dermatology" && (
          <DermatologyLaserPanel data={specialtyData} onChange={updateData} readOnly={readOnly} />
        )}
      </div>
    </div>
  );
}

// ==========================================
// 1. CARDIOLOGY & GENERAL MEDICINE PANEL
// ==========================================
function GeneralCardiologyPanel({
  data,
  onChange,
  readOnly,
}: {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  readOnly: boolean;
}) {
  const systolic = Number(data.systolic) || 0;
  const diastolic = Number(data.diastolic) || 0;
  const pulse = Number(data.pulse) || 0;
  const spo2 = Number(data.spo2) || 0;
  const bloodSugar = Number(data.blood_sugar) || 0;
  const heightCm = Number(data.height_cm) || 0;
  const weightKg = Number(data.weight_kg) || 0;

  // Calculate BMI
  let bmi = 0;
  let bmiCategory = "";
  if (heightCm > 0 && weightKg > 0) {
    const heightM = heightCm / 100;
    bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
    if (bmi < 18.5) bmiCategory = "نقص في الوزن (Underweight)";
    else if (bmi < 25) bmiCategory = "وزن مثالي طبيعي (Normal)";
    else if (bmi < 30) bmiCategory = "زيادة وزن (Overweight)";
    else bmiCategory = "سمنة سريرية (Obese)";
  }

  // Blood Pressure Classification (AHA guidelines)
  let bpStatus = { label: "غير مسجل", color: "bg-muted text-muted-foreground" };
  if (systolic > 0 && diastolic > 0) {
    if (systolic > 180 || diastolic > 120) {
      bpStatus = { label: "أزمة ضغط دم طارئة (Crisis)", color: "bg-rose-600 text-white animate-pulse" };
    } else if (systolic >= 140 || diastolic >= 90) {
      bpStatus = { label: "ارتفاع ضغط المرحلة 2 (Stage 2 HTN)", color: "bg-red-500 text-white" };
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      bpStatus = { label: "ارتفاع ضغط المرحلة 1 (Stage 1 HTN)", color: "bg-amber-500 text-white" };
    } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
      bpStatus = { label: "ضغط دم مرتفع نسبياً (Elevated)", color: "bg-yellow-500 text-black" };
    } else if (systolic < 120 && diastolic < 80) {
      bpStatus = { label: "ضغط دم طبيعي ومثالي (Normal)", color: "bg-emerald-500 text-white" };
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="py-3 px-4 bg-rose-50/50 dark:bg-rose-950/20 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          <CardTitle className="text-sm font-bold">لوحة العلامات الحيوية وصحة القلب والأوعية</CardTitle>
        </div>
        <Badge className={bpStatus.color}>{bpStatus.label}</Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Row 1: Vitals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              ضغط الدم الانقباضي (Systolic mmHg)
            </label>
            <Input
              type="number"
              placeholder="120"
              disabled={readOnly}
              value={data.systolic || ""}
              onChange={(e) => onChange({ systolic: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              ضغط الدم الانبساطي (Diastolic mmHg)
            </label>
            <Input
              type="number"
              placeholder="80"
              disabled={readOnly}
              value={data.diastolic || ""}
              onChange={(e) => onChange({ diastolic: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              معدل النبض (Pulse bpm)
            </label>
            <Input
              type="number"
              placeholder="72"
              disabled={readOnly}
              value={data.pulse || ""}
              onChange={(e) => onChange({ pulse: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              تشبع الأكسجين (SpO2 %)
            </label>
            <Input
              type="number"
              placeholder="98"
              disabled={readOnly}
              value={data.spo2 || ""}
              onChange={(e) => onChange({ spo2: e.target.value })}
            />
          </div>
        </div>

        {/* Row 2: Metabolic & Anthropometric */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              سكر الدم (mg/dL)
            </label>
            <Input
              type="number"
              placeholder="110"
              disabled={readOnly}
              value={data.blood_sugar || ""}
              onChange={(e) => onChange({ blood_sugar: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              التراكمي HbA1c (%)
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="5.7"
              disabled={readOnly}
              value={data.hba1c || ""}
              onChange={(e) => onChange({ hba1c: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              الطول (cm)
            </label>
            <Input
              type="number"
              placeholder="175"
              disabled={readOnly}
              value={data.height_cm || ""}
              onChange={(e) => onChange({ height_cm: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              الوزن (kg)
            </label>
            <Input
              type="number"
              placeholder="75"
              disabled={readOnly}
              value={data.weight_kg || ""}
              onChange={(e) => onChange({ weight_kg: e.target.value })}
            />
          </div>
        </div>

        {/* Summary Indicators */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-secondary/40 rounded-xl text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-semibold">مؤشر كتلة الجسم (BMI):</span>
            <span className="font-bold text-foreground">{bmi > 0 ? `${bmi} kg/m²` : "غير محسوب"}</span>
            {bmiCategory && <Badge variant="outline" className="text-[10px]">{bmiCategory}</Badge>}
          </div>
          {spo2 > 0 && spo2 < 94 && (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <AlertCircle className="w-3 h-3" />
              <span>تحذير: نقص نسبي في أكسجة الدم</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 2. DENTISTRY ODONTOGRAM PANEL (FDI NOTATION)
// ==========================================
function DentistryOdontogram({
  data,
  onChange,
  readOnly,
}: {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  readOnly: boolean;
}) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const teethRecords: Record<string, any> = data.teeth || {};

  // FDI 32 Adult Teeth Quad groups
  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const statuses = [
    { id: "healthy", label: "سليم / طبيعي", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-300" },
    { id: "caries", label: "تسوس / نخر فعال", color: "bg-rose-500 text-white border-rose-600" },
    { id: "filling", label: "حشوة ضوئية / تجميلية", color: "bg-blue-500 text-white border-blue-600" },
    { id: "root_canal", label: "علاج عصب / حشوة جذر", color: "bg-purple-600 text-white border-purple-700" },
    { id: "crown", label: "تاج / تلبيسة خزفية", color: "bg-amber-500 text-white border-amber-600" },
    { id: "missing", label: "سن مفقود / مقلوع", color: "bg-zinc-400 text-zinc-900 border-zinc-500 line-through" },
    { id: "implant", label: "زرعة سنية (Implant)", color: "bg-emerald-600 text-white border-emerald-700" },
  ];

  const updateToothStatus = (toothNum: number, statusId: string, notes?: string) => {
    const updated = {
      ...teethRecords,
      [toothNum]: {
        ...(teethRecords[toothNum] || {}),
        status: statusId,
        notes: notes !== undefined ? notes : (teethRecords[toothNum]?.notes || ""),
        updated_at: new Date().toISOString(),
      },
    };
    onChange({ teeth: updated });
  };

  const getToothBadgeColor = (toothNum: number) => {
    const info = teethRecords[toothNum];
    if (!info) return "bg-secondary text-foreground hover:bg-primary/20";
    const found = statuses.find((s) => s.id === info.status);
    return found ? found.color : "bg-primary text-primary-foreground";
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="py-3 px-4 bg-sky-50/50 dark:bg-sky-950/20 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile className="w-4 h-4 text-sky-500" />
          <CardTitle className="text-sm font-bold">مخطط الأسنان السريري التفاعلي (FDI Odontogram)</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground font-mono">32 سن دائم + ترقيم دولي</span>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Upper Arch (الجهة العلوية) */}
        <div>
          <div className="text-[11px] font-semibold text-center text-muted-foreground mb-1.5">
            الفك العلوي (Maxilla)
          </div>
          <div className="flex justify-center gap-1 sm:gap-2">
            {/* Upper Right */}
            <div className="flex gap-1 border-e-2 border-primary/30 pe-1.5 sm:pe-3">
              {upperRight.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTooth(t)}
                  className={`w-7 h-9 sm:w-8 sm:h-10 rounded-md border text-xs font-bold transition-all flex flex-col items-center justify-center ${getToothBadgeColor(
                    t
                  )} ${selectedTooth === t ? "ring-2 ring-primary ring-offset-2 scale-105" : ""}`}
                >
                  <span className="text-[10px]">{t}</span>
                </button>
              ))}
            </div>
            {/* Upper Left */}
            <div className="flex gap-1 ps-1.5 sm:ps-3">
              {upperLeft.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTooth(t)}
                  className={`w-7 h-9 sm:w-8 sm:h-10 rounded-md border text-xs font-bold transition-all flex flex-col items-center justify-center ${getToothBadgeColor(
                    t
                  )} ${selectedTooth === t ? "ring-2 ring-primary ring-offset-2 scale-105" : ""}`}
                >
                  <span className="text-[10px]">{t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Arch (الجهة السفلية) */}
        <div>
          <div className="flex justify-center gap-1 sm:gap-2">
            {/* Lower Right */}
            <div className="flex gap-1 border-e-2 border-primary/30 pe-1.5 sm:pe-3">
              {lowerRight.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTooth(t)}
                  className={`w-7 h-9 sm:w-8 sm:h-10 rounded-md border text-xs font-bold transition-all flex flex-col items-center justify-center ${getToothBadgeColor(
                    t
                  )} ${selectedTooth === t ? "ring-2 ring-primary ring-offset-2 scale-105" : ""}`}
                >
                  <span className="text-[10px]">{t}</span>
                </button>
              ))}
            </div>
            {/* Lower Left */}
            <div className="flex gap-1 ps-1.5 sm:ps-3">
              {lowerLeft.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTooth(t)}
                  className={`w-7 h-9 sm:w-8 sm:h-10 rounded-md border text-xs font-bold transition-all flex flex-col items-center justify-center ${getToothBadgeColor(
                    t
                  )} ${selectedTooth === t ? "ring-2 ring-primary ring-offset-2 scale-105" : ""}`}
                >
                  <span className="text-[10px]">{t}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="text-[11px] font-semibold text-center text-muted-foreground mt-1.5">
            الفك السفلي (Mandible)
          </div>
        </div>

        {/* Selected Tooth Action Box */}
        {selectedTooth && (
          <div className="p-3 bg-secondary/50 rounded-xl border border-border/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                السن المحدد رقم: <strong className="text-primary font-mono text-sm">{selectedTooth}</strong>
              </span>
              {teethRecords[selectedTooth]?.status && (
                <Badge variant="outline" className="text-[10px]">
                  الحالة الحالية: {statuses.find((s) => s.id === teethRecords[selectedTooth].status)?.label}
                </Badge>
              )}
            </div>

            {!readOnly && (
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateToothStatus(selectedTooth, st.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all ${st.color} ${
                      teethRecords[selectedTooth]?.status === st.id ? "ring-2 ring-primary" : "opacity-85 hover:opacity-100"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="ملاحظات تشخيصية أو رقم السطح (O, M, D, B, L)..."
                disabled={readOnly}
                value={teethRecords[selectedTooth]?.notes || ""}
                onChange={(e) => updateToothStatus(selectedTooth, teethRecords[selectedTooth]?.status || "healthy", e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================================
// 3. OPHTHALMOLOGY & REFRACTION PANEL
// ==========================================
function OphthalmologyRefractionPanel({
  data,
  onChange,
  readOnly,
}: {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  readOnly: boolean;
}) {
  const iopOD = Number(data.iop_od) || 0;
  const iopOS = Number(data.iop_os) || 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="py-3 px-4 bg-blue-50/50 dark:bg-blue-950/20 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-500" />
          <CardTitle className="text-sm font-bold">كرت فحص البصر وانكسار العين (Visual Acuity & Refraction)</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground font-mono">OD (اليمنى) / OS (اليسرى)</span>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Refraction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-secondary/70 border-b text-muted-foreground">
                <th className="p-2 text-start font-semibold">العين</th>
                <th className="p-2 font-semibold">SPH (قصر/بعد)</th>
                <th className="p-2 font-semibold">CYL (استجماتيزم)</th>
                <th className="p-2 font-semibold">AXIS (المحور °)</th>
                <th className="p-2 font-semibold">ADD (قراءة)</th>
                <th className="p-2 font-semibold">حدة الإبصار (VA)</th>
                <th className="p-2 font-semibold">ضغط العين (IOP mmHg)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* OD: Right Eye */}
              <tr>
                <td className="p-2 text-start font-bold text-primary">OD (العين اليمنى)</td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="-1.75"
                    disabled={readOnly}
                    value={data.od_sph || ""}
                    onChange={(e) => onChange({ od_sph: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="-0.50"
                    disabled={readOnly}
                    value={data.od_cyl || ""}
                    onChange={(e) => onChange({ od_cyl: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="90"
                    disabled={readOnly}
                    value={data.od_axis || ""}
                    onChange={(e) => onChange({ od_axis: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="+1.25"
                    disabled={readOnly}
                    value={data.od_add || ""}
                    onChange={(e) => onChange({ od_add: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="6/6"
                    disabled={readOnly}
                    value={data.od_va || ""}
                    onChange={(e) => onChange({ od_va: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="15"
                    disabled={readOnly}
                    value={data.iop_od || ""}
                    onChange={(e) => onChange({ iop_od: e.target.value })}
                  />
                </td>
              </tr>
              {/* OS: Left Eye */}
              <tr>
                <td className="p-2 text-start font-bold text-primary">OS (العين اليسرى)</td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="-2.00"
                    disabled={readOnly}
                    value={data.os_sph || ""}
                    onChange={(e) => onChange({ os_sph: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="-0.75"
                    disabled={readOnly}
                    value={data.os_cyl || ""}
                    onChange={(e) => onChange({ os_cyl: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="85"
                    disabled={readOnly}
                    value={data.os_axis || ""}
                    onChange={(e) => onChange({ os_axis: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="+1.25"
                    disabled={readOnly}
                    value={data.os_add || ""}
                    onChange={(e) => onChange({ os_add: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="6/9"
                    disabled={readOnly}
                    value={data.os_va || ""}
                    onChange={(e) => onChange({ os_va: e.target.value })}
                  />
                </td>
                <td className="p-1">
                  <Input
                    className="h-8 text-center"
                    placeholder="16"
                    disabled={readOnly}
                    value={data.iop_os || ""}
                    onChange={(e) => onChange({ iop_os: e.target.value })}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Additional Eye Measurements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              المسافة بين البؤبؤين (PD mm)
            </label>
            <Input
              placeholder="63 mm"
              disabled={readOnly}
              value={data.pd_distance || ""}
              onChange={(e) => onChange({ pd_distance: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              نوع العدسات الموصى به
            </label>
            <Input
              placeholder="عدسات عاكسة للضوء الأزرق / بلو كت..."
              disabled={readOnly}
              value={data.lens_type || ""}
              onChange={(e) => onChange({ lens_type: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              ملاحظات قعر العين والشبكية (Fundus)
            </label>
            <Input
              placeholder="الشبكية سليمة، لا توجد اعتلالات سكرية..."
              disabled={readOnly}
              value={data.fundus_notes || ""}
              onChange={(e) => onChange({ fundus_notes: e.target.value })}
            />
          </div>
        </div>

        {(iopOD > 21 || iopOS > 21) && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>تنبيه: ضغط العين أعلى من المعدل الطبيعي (21 mmHg)، يُوصى بمتابعة فحص الجلوكوما (Glaucoma).</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================================
// 4. OB/GYN & FETAL ULTRASOUND PANEL
// ==========================================
function ObGynUltrasoundPanel({
  data,
  onChange,
  readOnly,
}: {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  readOnly: boolean;
}) {
  const lmpDate = data.lmp_date || "";

  // Naegele's rule calculation: EDD = LMP + 1 year - 3 months + 7 days (or LMP + 280 days)
  let eddCalculated = "";
  let gestationalWeeks = 0;
  let gestationalDays = 0;
  let trimester = "";

  if (lmpDate) {
    const lmp = new Date(lmpDate);
    if (!isNaN(lmp.getTime())) {
      const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
      eddCalculated = edd.toISOString().split("T")[0];

      const diffMs = Date.now() - lmp.getTime();
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (totalDays > 0) {
        gestationalWeeks = Math.floor(totalDays / 7);
        gestationalDays = totalDays % 7;
        if (gestationalWeeks < 13) trimester = "الثلث الأول (First Trimester)";
        else if (gestationalWeeks < 27) trimester = "الثلث الثاني (Second Trimester)";
        else trimester = "الثلث الثالث (Third Trimester)";
      }
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="py-3 px-4 bg-pink-50/50 dark:bg-pink-950/20 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pink-500" />
          <CardTitle className="text-sm font-bold">حاسبة الحمل التوليدي وسونار الجنين (OB/GYN & Fetal Sonar)</CardTitle>
        </div>
        {trimester && <Badge className="bg-pink-500 text-white">{trimester}</Badge>}
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* LMP & Obstetric History */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              أول يوم لآخر دورة شهرية (LMP)
            </label>
            <Input
              type="date"
              disabled={readOnly}
              value={data.lmp_date || ""}
              onChange={(e) => onChange({ lmp_date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              الموعد المتوقع للولادة (EDD)
            </label>
            <Input
              type="text"
              readOnly
              value={eddCalculated || "اختر تاريخ الدورة"}
              className="bg-secondary/40 font-semibold text-primary"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              عمر الحمل السريري المقدر (Gestational Age)
            </label>
            <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-secondary/40 border border-border text-xs font-bold text-foreground">
              {gestationalWeeks > 0 ? (
                <span>
                  {gestationalWeeks} أسبوع و {gestationalDays} يوم
                </span>
              ) : (
                <span className="text-muted-foreground font-normal">يتم الحساب تلقائياً عبر قاعدة نيغل (Naegele)</span>
              )}
            </div>
          </div>
        </div>

        {/* Obstetric History: G P A L */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-secondary/30 rounded-xl">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">G (الأحمال)</label>
            <Input
              className="h-8 text-center"
              placeholder="G1"
              disabled={readOnly}
              value={data.gravida || ""}
              onChange={(e) => onChange({ gravida: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">P (الولادات)</label>
            <Input
              className="h-8 text-center"
              placeholder="P0"
              disabled={readOnly}
              value={data.para || ""}
              onChange={(e) => onChange({ para: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">A (الإسقاطات)</label>
            <Input
              className="h-8 text-center"
              placeholder="A0"
              disabled={readOnly}
              value={data.abortions || ""}
              onChange={(e) => onChange({ abortions: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground block mb-1">L (أطفال أحياء)</label>
            <Input
              className="h-8 text-center"
              placeholder="L0"
              disabled={readOnly}
              value={data.living || ""}
              onChange={(e) => onChange({ living: e.target.value })}
            />
          </div>
        </div>

        {/* Fetal Biometry (قياسات الجنين بالسونار) */}
        <div>
          <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
            <span>قياسات سونار نمو الجنين (Fetal Biometry):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">BPD (قطر الرأس mm)</label>
              <Input
                placeholder="65 mm"
                disabled={readOnly}
                value={data.sonar_bpd || ""}
                onChange={(e) => onChange({ sonar_bpd: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">FL (طول الفخذ mm)</label>
              <Input
                placeholder="48 mm"
                disabled={readOnly}
                value={data.sonar_fl || ""}
                onChange={(e) => onChange({ sonar_fl: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">EFW (الوزن المقدر g)</label>
              <Input
                placeholder="1100 g"
                disabled={readOnly}
                value={data.sonar_efw || ""}
                onChange={(e) => onChange({ sonar_efw: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">نبض الجنين (FHR bpm)</label>
              <Input
                placeholder="145 bpm"
                disabled={readOnly}
                value={data.fetal_heart_rate || ""}
                onChange={(e) => onChange({ fetal_heart_rate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 5. PEDIATRICS & VACCINE SCHEDULE PANEL
// ==========================================
function PediatricsVaccinePanel({
  data,
  onChange,
  readOnly,
}: {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  readOnly: boolean;
}) {
  const childAgeMonths = Number(data.child_age_months) || 0;
  const childWeight = Number(data.child_weight_kg) || 0;
  const childHeight = Number(data.child_height_cm) || 0;
  const headCirc = Number(data.head_circ_cm) || 0;
  const vaccinesGiven: Record<string, boolean> = data.vaccines || {};

  const nationalVaccines = [
    { id: "bcg_hepb", age: "عند الولادة", name: "لقاح التدرن الرئوي (BCG) + الكبد الفيروسي ب + شلل الأطفال فموي" },
    { id: "hex_2m", age: "عمر شهرين", name: "السداسي (DTPa-HepB-IPV-Hib) + الروتا + المكورات الرئوية PCV" },
    { id: "hex_4m", age: "عمر 4 أشهر", name: "الجرعة الثانية السداسي + الروتا + المكورات الرئوية PCV" },
    { id: "hex_6m", age: "عمر 6 أشهر", name: "الجرعة الثالثة السداسي + الروتا + شلل الأطفال + فيتامين أ" },
    { id: "measles_9m", age: "عمر 9 أشهر", name: "لقاح الحصبة المنفردة (Measles) + قطرات فيتامين أ" },
    { id: "mmr_15m", age: "عمر 15 شهر", name: "الحصبة المختلطة (MMR: حصبة، نكاف، حصبة ألمانية)" },
    { id: "booster_18m", age: "عمر 18 شهر", name: "الجرعة التنشيطية الأولى (DTP + Polio) + فيتامين أ" },
    { id: "preschool_4y", age: "عمر 4-6 سنوات", name: "جرعة ما قبل المدرسة المدرسية (DTP + Polio + MMR)" },
  ];

  const toggleVaccine = (vacId: string) => {
    if (readOnly) return;
    const updated = { ...vaccinesGiven, [vacId]: !vaccinesGiven[vacId] };
    onChange({ vaccines: updated });
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="py-3 px-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Baby className="w-4 h-4 text-emerald-500" />
          <CardTitle className="text-sm font-bold">متابعة نمو الطفل وجدول اللقاحات الوطنية (Pediatrics & Vaccines)</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground font-mono">معايير منظمة الصحة العالمية (WHO)</span>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Child Growth Measurements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              عمر الطفل (بالأشهر)
            </label>
            <Input
              type="number"
              placeholder="12 شهر"
              disabled={readOnly}
              value={data.child_age_months || ""}
              onChange={(e) => onChange({ child_age_months: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              الوزن الحالي (kg)
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="9.5 kg"
              disabled={readOnly}
              value={data.child_weight_kg || ""}
              onChange={(e) => onChange({ child_weight_kg: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              الطول (cm)
            </label>
            <Input
              type="number"
              step="0.5"
              placeholder="76 cm"
              disabled={readOnly}
              value={data.child_height_cm || ""}
              onChange={(e) => onChange({ child_height_cm: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              محيط الرأس (Head Circ cm)
            </label>
            <Input
              type="number"
              step="0.5"
              placeholder="46 cm"
              disabled={readOnly}
              value={data.head_circ_cm || ""}
              onChange={(e) => onChange({ head_circ_cm: e.target.value })}
            />
          </div>
        </div>

        {/* National Vaccination Schedule Checklist */}
        <div>
          <div className="text-xs font-bold text-foreground mb-2 flex items-center justify-between">
            <span>سجل اللقاحات الدورية المعتمدة:</span>
            <span className="text-[11px] text-muted-foreground">انقر للتحديد وتوثيق التطعيم</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nationalVaccines.map((vac) => {
              const isChecked = Boolean(vaccinesGiven[vac.id]);
              return (
                <button
                  key={vac.id}
                  type="button"
                  onClick={() => toggleVaccine(vac.id)}
                  disabled={readOnly}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-start transition-all ${
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/40 text-foreground"
                      : "bg-secondary/40 border-border/80 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 border ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold block text-primary">{vac.age}</span>
                    <span className="text-xs font-medium leading-snug">{vac.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 6. DERMATOLOGY & LASER PANEL
// ==========================================
function DermatologyLaserPanel({
  data,
  onChange,
  readOnly,
}: {
  data: Record<string, any>;
  onChange: (d: Record<string, any>) => void;
  readOnly: boolean;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="py-3 px-4 bg-purple-50/50 dark:bg-purple-950/20 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <CardTitle className="text-sm font-bold">جلسات الليزر والتجميل والجلدية (Dermatology & Aesthetics)</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground font-mono">Laser / Botox / Fillers</span>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Laser Session Parameters */}
        <div>
          <div className="text-xs font-bold text-foreground mb-2">إعدادات جلسة الليزر (Laser Parameters):</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">نوع الجهاز (Device)</label>
              <Input
                placeholder="Candela GentleMax Pro"
                disabled={readOnly}
                value={data.laser_device || ""}
                onChange={(e) => onChange({ laser_device: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">المنطقة المعالجة (Area)</label>
              <Input
                placeholder="الوجه كامل + الإبطين"
                disabled={readOnly}
                value={data.laser_area || ""}
                onChange={(e) => onChange({ laser_area: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">طاقة النبضة (Fluence J/cm²)</label>
              <Input
                placeholder="16 J/cm²"
                disabled={readOnly}
                value={data.laser_fluence || ""}
                onChange={(e) => onChange({ laser_fluence: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">حجم البقعة (Spot Size mm)</label>
              <Input
                placeholder="18 mm"
                disabled={readOnly}
                value={data.laser_spot_size || ""}
                onChange={(e) => onChange({ laser_spot_size: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Aesthetic Injectables (Botox & Fillers) */}
        <div className="pt-2 border-t">
          <div className="text-xs font-bold text-foreground mb-2">حقن التجميل والفيلر والبوتوكس:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                وحدات البوتوكس (Botox Units)
              </label>
              <Input
                placeholder="40 Units (جبهة + حول العينين)"
                disabled={readOnly}
                value={data.botox_units || ""}
                onChange={(e) => onChange({ botox_units: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                كمية الفيلر (Filler Syringes/ml)
              </label>
              <Input
                placeholder="1.0 ml (تحديد الشفاه)"
                disabled={readOnly}
                value={data.filler_volume || ""}
                onChange={(e) => onChange({ filler_volume: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                توصيات العناية بعد الإجراء
              </label>
              <Input
                placeholder="واقي شمس SPF 50+ وتجنب الحرارة 48 ساعة"
                disabled={readOnly}
                value={data.aftercare_notes || ""}
                onChange={(e) => onChange({ aftercare_notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
