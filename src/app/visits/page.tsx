"use client";

import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { FileText, ShieldAlert, User, Clock } from "lucide-react";

export default function VisitsPage() {
  const { t } = useI18n();

  const visits = [
    {
      id: "vis-001",
      patient_name: "علي حسن الكرخي",
      doctor_name: "د. أحمد الراوي",
      service_name: "كشف عام واستشارة",
      visit_date: new Date(Date.now() - 86400000 * 3).toISOString(),
      diagnosis: "التهاب خفيف في القصبات الهوائية مع ارتفاع طفيف في ضغط الدم",
      clinical_notes: "تم وصف مضاد حيوي وخافض حرارة. مراجعة بعد 5 أيام.",
      prescription: "Amoxicillin 500mg (3 times/day) + Paracetamol 500mg",
    },
    {
      id: "vis-002",
      patient_name: "مريم أحمد البياتي",
      doctor_name: "د. سارة العبيدي",
      service_name: "فحص موجات فوق صوتية (سونار)",
      visit_date: new Date(Date.now() - 86400000 * 10).toISOString(),
      diagnosis: "فحص روتيني سليم للبطن والحوض",
      clinical_notes: "جميع الأعضاء الحيوية طبيعية ولا توجد أي علامات تضخم.",
      prescription: "فيتامين D3 ومكملات غذائية عامة",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navVisits")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              السجلات السريرية المحمية، التشخيصات، والملاحظات الطبية المعتمدة
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 py-1 px-3 border-primary/30 text-primary">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>محمي بسياسة الصلاحيات الطبية (RBAC & RLS)</span>
          </Badge>
        </div>

        <div className="space-y-4">
          {visits.map((visit) => (
            <Card key={visit.id} className="overflow-hidden">
              <CardHeader className="bg-secondary/30 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">{visit.patient_name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{visit.doctor_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(visit.visit_date).toLocaleDateString("ar-IQ", { dateStyle: "long" })}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    التشخيص الطبي:
                  </h4>
                  <p className="text-sm font-medium text-foreground">{visit.diagnosis}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    الملاحظات السريرية:
                  </h4>
                  <p className="text-sm text-muted-foreground">{visit.clinical_notes}</p>
                </div>

                <div className="p-3 bg-secondary/50 rounded-xl border text-xs space-y-1">
                  <span className="font-semibold text-primary block">الوصفة الطبية والعلاج:</span>
                  <p className="font-mono text-muted-foreground">{visit.prescription}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
