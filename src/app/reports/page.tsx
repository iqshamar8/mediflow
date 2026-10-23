"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClinic } from "@/lib/clinic/context";
import { formatCurrency } from "@/lib/utils";
import {
  Receipt,
  Printer,
  CreditCard,
  Banknote,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  DollarSign,
  PieChart,
  RefreshCw,
  Building2,
} from "lucide-react";

export default function ReportsPage() {
  const { currentClinic } = useClinic();
  const [closingData, setClosingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClosingReport();
  }, [currentClinic?.id]);

  async function loadClosingReport() {
    try {
      setIsLoading(true);
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const res = await fetch(`/api/reports/closing?clinic_id=${currentClinic?.id || ""}`, { headers });
      const json = await res.json();
      setClosingData(json);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }

  const totals = closingData?.totals || { cash: 0, card: 0, transfer: 0, grandTotal: 0 };
  const counts = closingData?.counts || { transactions: 0, appointments: 0, visits: 0, averageTicket: 0 };
  const paymentsList = closingData?.paymentsList || [];
  const serviceBreakdown = closingData?.serviceBreakdown || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-500/20 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                تقرير تقفيل الصندوق والإيرادات (Daily Financial Closing)
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              مطابقة المقبوضات النقدية والبطاقات، إجمالي الحركات اليومية، وتوليد تقرير تقفيل الحسابات
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs font-semibold">
              <Printer className="w-4 h-4" />
              طباعة تقرير التقفيل الرسمي
            </Button>
            <Button size="sm" variant="outline" onClick={loadClosingReport} className="p-2">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
          {/* Total Collected */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>إجمالي الإيرادات المقبوضة</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-mono text-primary">
                {formatCurrency(totals.grandTotal, "IQD")}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                إجمالي الدخل المحصل اليوم
              </p>
            </CardContent>
          </Card>

          {/* Cash */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>النقد في الصندوق (Cash)</span>
                <Banknote className="w-4 h-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-emerald-600">
                {formatCurrency(totals.cash, "IQD")}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                المبلغ النقدي الفعلي بالدرج
              </p>
            </CardContent>
          </Card>

          {/* Card / Electronic */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>الدفع الإلكتروني (Cards/Qi)</span>
                <CreditCard className="w-4 h-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-blue-600">
                {formatCurrency(totals.card + totals.transfer, "IQD")}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                مدفوعات ماستركارد وزين كاش
              </p>
            </CardContent>
          </Card>

          {/* Average Ticket */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>متوسط الفاتورة / الكشف</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatCurrency(counts.averageTicket, "IQD")}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                عدد الحركات: {counts.transactions} إيصال
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Services Breakdown */}
          <Card className="md:col-span-5 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <PieChart className="w-4 h-4 text-primary" />
                <span>حركة الخدمات الطبية لهذا اليوم</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {serviceBreakdown.length > 0 ? (
                serviceBreakdown.map((srv: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40">
                    <span className="font-semibold text-foreground">{srv.name}</span>
                    <Badge variant="outline" className="font-bold">
                      {srv.count} مريض
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">لا توجد خدمات مسجلة اليوم</p>
              )}
            </CardContent>
          </Card>

          {/* Cashier Audit Ledger */}
          <Card className="md:col-span-7 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <span>جدول المقبوضات ووصولات القبض</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="p-2.5 text-start">رقم الوصل</th>
                      <th className="p-2.5 text-start">المريض</th>
                      <th className="p-2.5 text-start">طريقة الدفع</th>
                      <th className="p-2.5 text-end">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paymentsList.map((p: any) => (
                      <tr key={p.id} className="hover:bg-muted/50">
                        <td className="p-2.5 font-mono text-muted-foreground">{p.reference_number}</td>
                        <td className="p-2.5 font-semibold text-foreground">{p.patient_name}</td>
                        <td className="p-2.5">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {p.payment_method === "cash" ? "كاش نقدي" : "بطاقة / إلكتروني"}
                          </Badge>
                        </td>
                        <td className="p-2.5 text-end font-mono font-bold text-primary">
                          {formatCurrency(p.amount, p.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Printable Official Closing Voucher (Hidden except on print) */}
        <div className="hidden print:block font-serif text-black p-8 bg-white border border-slate-400 rounded-lg max-w-2xl mx-auto my-4">
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">{currentClinic?.name}</h2>
            <p className="text-sm font-semibold mt-0.5">تقرير إغلاق الصندوق اليومي (Cashier Daily Closing)</p>
            <p className="text-xs text-slate-600 mt-1 font-mono">
              التاريخ: {closingData?.date || new Date().toISOString().slice(0, 10)} | الطبيب المشرف: {currentClinic?.doctor_name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-6 border p-3 rounded bg-slate-50">
            <div>
              <p><strong>إجمالي الكاش النقدي: </strong>{formatCurrency(totals.cash, "IQD")}</p>
              <p className="mt-1"><strong>إجمالي البطاقات: </strong>{formatCurrency(totals.card + totals.transfer, "IQD")}</p>
            </div>
            <div className="text-end">
              <p className="text-base font-bold"><strong>المجموع الكلي: </strong>{formatCurrency(totals.grandTotal, "IQD")}</p>
              <p className="mt-1">عدد الوصولات: {counts.transactions}</p>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t flex justify-between text-xs">
            <div className="text-center">
              <p className="font-bold">توقيع أمين الصندوق / الاستقبال</p>
              <div className="w-32 border-b border-dashed border-slate-500 mt-8 mx-auto" />
            </div>
            <div className="text-center">
              <p className="font-bold">توقيع واعتماد الطبيب المشرف</p>
              <div className="w-32 border-b border-dashed border-slate-500 mt-8 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
