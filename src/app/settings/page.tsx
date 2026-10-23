"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { useClinic } from "@/lib/clinic/context";
import { Settings, Save, ShieldCheck, CheckCircle2, Sun, Moon, Laptop, Stethoscope, Building2 } from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { currentClinic } = useClinic();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: currentClinic?.name || "عيادة د. أحمد الراوي التخصصية",
    doctorName: currentClinic?.doctor_name || "د. أحمد الراوي",
    specialty: currentClinic?.specialty || "استشاري الأمراض الباطنية والقلب",
    phone: currentClinic?.phone || "+964 770 000 0001",
    email: currentClinic?.email || "dr.ahmed@mediflow.iq",
    address: currentClinic?.address || "بغداد - المنصور - شارع 14 رمضان",
    timezone: "Asia/Baghdad",
    currency: "IQD",
    reminder24h: true,
    reminder2h: true,
  });

  React.useEffect(() => {
    if (currentClinic) {
      setFormData((prev) => ({
        ...prev,
        clinicName: currentClinic.name,
        doctorName: currentClinic.doctor_name,
        specialty: currentClinic.specialty,
        phone: currentClinic.phone,
        email: currentClinic.email || "",
        address: currentClinic.address || "",
      }));
    }
  }, [currentClinic]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navSettings")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              بيانات العيادة، أوقات العمل، وقواعد التذكيرات التلقائية
            </p>
          </div>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">تم حفظ إعدادات العيادة بنجاح!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العيادة العامة</CardTitle>
              <CardDescription>الاسم والعنوان المعتمدان في رسائل وتأكيدات الواتساب</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">اسم العيادة الرسمي</label>
                <Input
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">رقم الهاتف الرسمي</label>
                  <Input
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">البريد الإلكتروني</label>
                  <Input
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">العنوان الجغرافي للعيادة</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">المنطقة الزمنية</label>
                  <Input disabled value={formData.timezone} dir="ltr" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">العملة الأساسية</label>
                  <Input disabled value={formData.currency} dir="ltr" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات التذكيرات الآلية (WhatsApp Reminders)</CardTitle>
              <CardDescription>جدولة الرسائل التلقائية قبل الموعد</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="rem24"
                  checked={formData.reminder24h}
                  onChange={(e) => setFormData({ ...formData, reminder24h: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="rem24" className="text-sm font-medium cursor-pointer">
                  إرسال تذكير تلقائي عبر الواتساب قبل 24 ساعة من الموعد
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="rem2h"
                  checked={formData.reminder2h}
                  onChange={(e) => setFormData({ ...formData, reminder2h: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="rem2h" className="text-sm font-medium cursor-pointer">
                  إرسال تذكير تأكيدي قبل ساعتين من وقت الموعد
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>مظهر النظام والوضع الليلي (Appearance & Night Mode)</CardTitle>
              <CardDescription>اختر النمط البصري المريح لعينيك أثناء إدارة العيادة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-muted-foreground/40 text-muted-foreground"
                  }`}
                >
                  <Sun className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-sm">الوضع النهاري</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-muted-foreground/40 text-muted-foreground"
                  }`}
                >
                  <Moon className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-sm">الوضع الليلي</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Night Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    theme === "system"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-muted-foreground/40 text-muted-foreground"
                  }`}
                >
                  <Laptop className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-sm">تلقائي حسب الجهاز</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">System Default</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              <span>{t("save")}</span>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
