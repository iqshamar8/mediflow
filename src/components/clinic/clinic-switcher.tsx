"use client";

import React, { useState } from "react";
import { useClinic } from "@/lib/clinic/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Stethoscope,
  ChevronDown,
  Check,
  PlusCircle,
  Building2,
  ShieldCheck,
  UserCheck,
  Phone,
  MapPin,
  X,
  Sparkles,
} from "lucide-react";

export function ClinicSwitcher() {
  const { currentClinic, clinics, switchClinic, registerClinic } = useClinic();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    doctor_name: "",
    name: "",
    specialty: "",
    specialty_type: "dentistry" as any,
    phone: "",
    address: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.doctor_name.trim() || !formData.name.trim()) {
      setErrorMsg("يرجى إدخال اسم الطبيب واسم العيادة");
      return;
    }

    try {
      setIsSubmitting(true);
      await registerClinic({
        doctor_name: formData.doctor_name,
        name: formData.name,
        specialty: formData.specialty || "طب عام واستشارات",
        specialty_type: formData.specialty_type,
        phone: formData.phone || "+9647700000000",
        address: formData.address || "العراق - بغداد",
      });

      setIsModalOpen(false);
      setIsOpen(false);
      setFormData({
        doctor_name: "",
        name: "",
        specialty: "",
        specialty_type: "dentistry",
        phone: "",
        address: "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء تسجيل العيادة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-start focus:outline-none focus:ring-2 focus:ring-primary/30"
          title="تبديل حساب الطبيب / العيادة"
        >
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
            <Stethoscope className="w-4 h-4" />
          </div>

          <div className="hidden sm:block leading-tight text-start">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">
                {currentClinic ? currentClinic.doctor_name : "جاري التحميل..."}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">
              {currentClinic ? currentClinic.specialty : "نظام العيادة"}
            </p>
          </div>

          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute start-0 sm:start-auto sm:end-0 mt-2 w-72 sm:w-80 max-w-[90vw] bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-3.5 bg-muted/40 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-foreground">
                      أنظمة العيادات المعزولة (Multi-Tenant)
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                    عزل كامل
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                  بيانات كل دكتور (مرضى، مواعيد، تقارير، أرباح) منفصلة تماماً ومحمية ولا تظهر لأي دكتور آخر.
                </p>
              </div>

              {/* Clinic list */}
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {clinics.map((clinic) => {
                  const isSelected = currentClinic?.id === clinic.id;
                  return (
                    <button
                      key={clinic.id}
                      onClick={() => {
                        switchClinic(clinic.id);
                        setIsOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-start justify-between text-start transition-all ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30 text-primary font-medium"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-xs font-bold">{clinic.doctor_name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-normal">
                          {clinic.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 font-normal">
                          {clinic.specialty}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action: Add new doctor/clinic */}
              <div className="p-2 border-t border-border bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold justify-center border-dashed border-primary/40 hover:bg-primary/5 hover:border-primary text-primary"
                  onClick={() => {
                    setIsOpen(false);
                    setIsModalOpen(true);
                  }}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  تسجيل حساب دكتور / عيادة جديدة
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Register New Doctor/Clinic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                    تسجيل عيادة ونظام مستقل لطبيب جديد
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    سيتم إنشاء مساحة عمل وقاعدة بيانات مستقلة تماماً لا يمكن لأحد غيره الاطلاع عليها
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRegister} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  اسم الطبيب الكامل <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="مثال: د. ليلى السعدي"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  اسم العيادة أو المركز الطبي <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="مثال: عيادة السعدي لطب الأطفال وحديثي الولادة"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-primary" />
                    المسار السريري التخصصي <span className="text-destructive">*</span>
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    value={formData.specialty_type}
                    onChange={(e) => setFormData({ ...formData, specialty_type: e.target.value })}
                  >
                    <option value="dentistry">🦷 طب وجراحة الأسنان (Tooth Chart)</option>
                    <option value="obgyn">🌸 النسائية والتوليد والسونار (Pregnancy & Sonar)</option>
                    <option value="ophthalmology">👁️ العيون والبصريات (Eye Refraction)</option>
                    <option value="pediatrics">👶 طب الأطفال واللقاحات (Growth & Vaccines)</option>
                    <option value="dermatology">✨ الجلدية والليزر والتجميل (Laser & Botox)</option>
                    <option value="cardiology_general">🫀 الباطنية والقلب والطب العام (Vitals)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-primary" />
                    المسمى الطبي واللقب العلمي
                  </label>
                  <Input
                    placeholder="مثال: أخصائي جراحة وزراعة الأسنان"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    رقم هاتف العيادة / الحجوزات
                  </label>
                  <Input
                    placeholder="07701234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    عنوان العيادة
                  </label>
                  <Input
                    placeholder="بغداد - الكرخ - حي الجامعة"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* Security info box */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <p className="leading-relaxed">
                  <strong>ضمان الخصوصية والعزل التام:</strong> بمجرد الحفظ، سيمتلك هذا الطبيب نظاماً منفصلاً تماماً للمرضى والمواعيد والتقارير والواتساب لا يشترك مع أي عيادة أخرى.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? "جاري إنشاء النظام..." : "إنشاء وبدء استخدام النظام الآن"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
