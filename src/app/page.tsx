"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  PlusCircle,
  CalendarPlus,
  MessageCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  BellRing,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

import { useClinic } from "@/lib/clinic/context";

interface DashboardData {
  totalPatients: number;
  todayAppointmentsCount: number;
  confirmedAppointmentsCount: number;
  totalRevenue: number;
  upcomingAppointments: Array<{
    id: string;
    patient_name: string;
    service_name: string;
    start_time: string;
    status: string;
    booking_source: string;
  }>;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { currentClinic } = useClinic();
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    totalPatients: 0,
    todayAppointmentsCount: 0,
    confirmedAppointmentsCount: 0,
    totalRevenue: 0,
    upcomingAppointments: [],
  });

  useEffect(() => {
    // Fetch live dashboard metrics from API isolated to the active clinic
    async function loadMetrics() {
      try {
        const clinicHeaders: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
        const [patRes, aptRes, payRes] = await Promise.all([
          fetch(`/api/patients?clinic_id=${currentClinic?.id || ""}`, { headers: clinicHeaders }),
          fetch(`/api/appointments?clinic_id=${currentClinic?.id || ""}`, { headers: clinicHeaders }),
          fetch(`/api/payments?clinic_id=${currentClinic?.id || ""}`, { headers: clinicHeaders }),
        ]);
        const patData = await patRes.json();
        const aptData = await aptRes.json();
        const payData = await payRes.json();

        setData({
          totalPatients: patData.total || patData.data?.length || 0,
          todayAppointmentsCount: aptData.data?.length || 0,
          confirmedAppointmentsCount: aptData.data?.filter((a: any) => a.status === "confirmed").length || 0,
          totalRevenue: payData.totalCollected || 0,
          upcomingAppointments: aptData.data?.slice(0, 5) || [],
        });
      } catch {
        // Keeps fallback
      }
    }
    loadMetrics();
  }, [currentClinic?.id]);

  async function handleSendQuickReminder(aptId: string) {
    try {
      const res = await fetch("/api/appointments/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: aptId }),
      });
      if (res.ok) {
        setReminderSentId(aptId);
        setTimeout(() => setReminderSentId(null), 3500);
      }
    } catch {
      // Error
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary/15 text-primary border border-primary/25">
                {currentClinic?.specialty || "نظام مستقل"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {currentClinic ? currentClinic.name : "نظام العيادة الطبية"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              مرحباً بك {currentClinic?.doctor_name || "دكتور"}، لديك {data.todayAppointmentsCount} مواعيد مجدولة في عيادتك الخاصة.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/appointments">
              <Button className="gap-2 shadow-sm">
                <CalendarPlus className="w-4 h-4" />
                <span>{t("newAppointment")}</span>
              </Button>
            </Link>
            <Link href="/patients">
              <Button variant="outline" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>{t("newPatient")}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("totalPatients")}
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-600 font-medium">محدث فورياً</span>
                من قاعدة البيانات
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("confirmedAppointments")}
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.confirmedAppointmentsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                تشمل حجوزات الواتساب والمكتب
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("totalRevenue")}
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                سجل المدفوعات المسجلة
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("whatsappStatus")}
              </CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                متصل وجاهز
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                مساعد الحجز التلقائي الذكي نشط
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics & Financial Trends Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 1: Revenue Trends */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>حركة الإيرادات والتحصيل الأسبوعي</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  تتبع المقبوضات المالية بالدينار العراقي (IQD)
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { day: "الأحد", revenue: 45000 },
                      { day: "الاثنين", revenue: 65000 },
                      { day: "الثلاثاء", revenue: 90000 },
                      { day: "الأربعاء", revenue: 75000 },
                      { day: "الخميس", revenue: 115000 },
                      { day: "السبت", revenue: 60000 },
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      formatter={(value: any) => [`${Number(value).toLocaleString()} د.ع`, "الإيرادات"]}
                      labelStyle={{ fontWeight: "bold" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Services & Bookings Breakdown */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>توزيع الحجوزات حسب الخدمات الطبية</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  نسبة الإقبال على العيادات التخصصية
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { service: "كشف عام", count: 8 },
                      { service: "سونار", count: 5 },
                      { service: "أسنان", count: 4 },
                      { service: "مراجعة", count: 6 },
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => [`${value} مريض`, "الحجوزات"]} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Upcoming Appointments Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("recentAppointments")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                قائمة بأحدث المواعيد المسجلة في جدول العيادة
              </p>
            </div>
            <Link href="/appointments">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                <span>عرض الكل</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground border-b">
                  <tr>
                    <th className="py-3 px-4 text-start font-medium">{t("patientName")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("service")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("dateTime")}</th>
                    <th className="py-3 px-4 text-start font-medium">{t("status")}</th>
                    <th className="py-3 px-4 text-start font-medium">مصدر الحجز</th>
                    <th className="py-3 px-4 text-center font-medium">تذكير فوري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.upcomingAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {apt.patient_name}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {apt.service_name}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(apt.start_time).toLocaleString("ar-IQ", { dateStyle: "short", timeStyle: "short" })}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={apt.status === "confirmed" ? "success" : "warning"}>
                          {apt.status === "confirmed" ? t("statusConfirmed") : t("statusPending")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {apt.booking_source === "whatsapp" ? "واتساب (آلي)" : "لوحة التحكم"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendQuickReminder(apt.id)}
                          className={`h-7 px-2.5 text-xs gap-1 font-medium ${
                            reminderSentId === apt.id
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                              : "border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                          }`}
                          title="إرسال تذكير واتساب للمريض فورياً"
                        >
                          {reminderSentId === apt.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>تم الإرسال</span>
                            </>
                          ) : (
                            <>
                              <BellRing className="w-3.5 h-3.5 text-amber-600" />
                              <span>تذكير واتساب</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
