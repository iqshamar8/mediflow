"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { Settings, Save, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: "عيادة النور الطبية التخصصية (Al-Noor Clinic)",
    phone: "+964 770 000 0001",
    email: "contact@alnoorclinic.test",
    address: "شارع المنصور، بغداد، العراق",
    timezone: "Asia/Baghdad",
    currency: "IQD",
    reminder24h: true,
    reminder2h: true,
  });

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
