"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useClinic } from "@/lib/clinic/context";
import { SearchablePatientSelect } from "@/components/patients/searchable-patient-select";
import {
  Volume2,
  Users,
  Maximize2,
  Minimize2,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Stethoscope,
  Sparkles,
  RefreshCw,
  BellRing,
} from "lucide-react";

// Web Audio API Hospital/Clinic Pleasant Chime
function playClinicChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Tone 1: High tone (660Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(660, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Tone 2: Lower tone (520Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(520, now + 0.3);
    gain2.gain.setValueAtTime(0.3, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 1.2);
  } catch {
    // Audio context fallback
  }
}

export default function QueuePage() {
  const { currentClinic } = useClinic();
  const [queueData, setQueueData] = useState<any>({
    data: [],
    currentlyIn: null,
    nextInLine: null,
    waitingCount: 0,
    completedCount: 0,
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [selectedWalkinPatientId, setSelectedWalkinPatientId] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("ar-IQ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadQueue();
    loadPatients();
  }, [currentClinic?.id]);

  async function loadQueue() {
    try {
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const res = await fetch(`/api/queue?clinic_id=${currentClinic?.id || ""}`, { headers });
      const json = await res.json();
      setQueueData(json);
    } catch {
      // Fallback
    }
  }

  async function loadPatients() {
    try {
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const res = await fetch(`/api/patients?clinic_id=${currentClinic?.id || ""}`, { headers });
      const json = await res.json();
      setPatients(json.data || []);
    } catch {
      // Fallback
    }
  }

  // Doctor Action: Call Next Patient in Line
  async function handleCallNext() {
    try {
      setIsCalling(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) headers["x-clinic-id"] = currentClinic.id;

      const res = await fetch(`/api/queue?clinic_id=${currentClinic?.id || ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "call_next" }),
      });

      const json = await res.json();
      await loadQueue();

      if (json.called) {
        // Play Chime
        playClinicChime();

        // Browser speech announcement if supported
        if ("speechSynthesis" in window) {
          try {
            const utterance = new SpeechSynthesisUtterance(
              `المريض رقم ${json.called.queue_number}، ${json.called.patient_name}، يرجى التفضل إلى العيادة.`
            );
            utterance.lang = "ar";
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
          } catch {
            // Speech error fallback
          }
        }
      } else {
        alert("لا يوجد مرضى في قائمة الانتظار حالياً.");
      }
    } catch {
      alert("حدث خطأ أثناء استدعاء المريض.");
    } finally {
      setIsCalling(false);
    }
  }

  // Add walk-in patient to queue
  async function handleAddWalkin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWalkinPatientId) return;

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) headers["x-clinic-id"] = currentClinic.id;

      await fetch(`/api/queue?clinic_id=${currentClinic?.id || ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "add_walkin",
          patient_id: selectedWalkinPatientId,
        }),
      });

      setIsWalkinModalOpen(false);
      setSelectedWalkinPatientId("");
      await loadQueue();
    } catch {
      alert("فشل إضافة المريض لقائمة الدور");
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentlyIn = queueData.currentlyIn;
  const nextInLine = queueData.nextInLine;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                شاشة صالة الانتظار والدور (Waiting Room TV Queue)
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              عرض تسلسل دور المرضى في الوقت الفعلي مع التنبيه الصوتي — مخصص للشاشات وصالة الاستقبال
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock Pill */}
            <div className="px-3.5 py-1.5 rounded-xl border border-border bg-card font-mono text-sm font-bold text-foreground flex items-center gap-2 shadow-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>{currentTime || "10:30:00 ص"}</span>
            </div>

            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-1.5 text-xs font-semibold">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">شاشة كاملة للـ TV</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={loadQueue}
              className="p-2"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Doctor Control Console (Call Next Button) */}
        <div className="p-4 rounded-2xl bg-card border border-primary/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shrink-0">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">لوحة تحكم الطبيب والاستقبال</h3>
              <p className="text-xs text-muted-foreground">
                قائمة الانتظار الحالية: <strong className="text-foreground">{queueData.waitingCount || 0} مرضى</strong> | أنجز اليوم: <strong className="text-emerald-600">{queueData.completedCount || 0} مريض</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWalkinModalOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              إضافة مريض واصل للعيادة
            </Button>

            <Button
              type="button"
              disabled={isCalling || queueData.waitingCount === 0}
              onClick={handleCallNext}
              className="gap-2 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Volume2 className="w-4 h-4" />
              {isCalling ? "جاري النداء..." : "📢 استدعاء المريض التالي (Call Next)"}
            </Button>
          </div>
        </div>

        {/* HERO TV QUEUE DISPLAY (2 BIG CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Currently Inside */}
          <Card className="border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-card to-card shadow-xl overflow-hidden relative">
            <div className="absolute top-0 start-0 end-0 h-1.5 bg-emerald-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  داخل العيادة حالياً مع الطبيب
                </span>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-bold">
                  Now In Consultation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              {currentlyIn ? (
                <div className="flex items-center gap-6">
                  {/* Giant Queue Number */}
                  <div className="w-24 h-24 rounded-3xl bg-emerald-600 text-white flex flex-col items-center justify-center font-black shadow-xl shrink-0">
                    <span className="text-xs opacity-80">رقم</span>
                    <span className="text-4xl leading-none font-mono">
                      {String(currentlyIn.queue_number).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {currentlyIn.patient_name}
                    </h2>
                    <p className="text-sm font-semibold text-primary">
                      {currentlyIn.service_name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      دخل الساعة: {currentlyIn.called_at || "10:00 ص"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto opacity-40 mb-2" />
                  <p className="font-semibold text-sm">العيادة جاهزة لاستقبال المريض القادم</p>
                  <p className="text-xs">اضغط على زر (استدعاء المريض التالي) لبدء الكشف</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Next In Line */}
          <Card className="border-primary/40 bg-gradient-to-b from-primary/10 via-card to-card shadow-xl overflow-hidden relative">
            <div className="absolute top-0 start-0 end-0 h-1.5 bg-primary" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  المريض التالي في الدور
                </span>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 font-bold">
                  Next Patient
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              {nextInLine ? (
                <div className="flex items-center gap-6">
                  {/* Queue Number */}
                  <div className="w-24 h-24 rounded-3xl bg-primary text-primary-foreground flex flex-col items-center justify-center font-black shadow-xl shrink-0">
                    <span className="text-xs opacity-80">رقم</span>
                    <span className="text-4xl leading-none font-mono">
                      {String(nextInLine.queue_number).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      {nextInLine.patient_name}
                    </h2>
                    <p className="text-sm font-semibold text-primary">
                      {nextInLine.service_name}
                    </p>
                    <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                      <span>يرجى الاستعداد للدخول</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto opacity-40 mb-2 text-emerald-500" />
                  <p className="font-semibold text-sm">لا يوجد مرضى تالين في الانتظار</p>
                  <p className="text-xs">تمت معاينة جميع المراجعين المسجلين لهذا اليوم</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FULL PATIENT QUEUE TABLE */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>قائمة المراجعين لليوم بالكامل ({queueData.data?.length || 0})</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th className="p-3 text-center w-16">رقم الدور</th>
                    <th className="p-3 text-start">اسم المريض</th>
                    <th className="p-3 text-start">الخدمة المطلوبة</th>
                    <th className="p-3 text-start">وقت الوصول</th>
                    <th className="p-3 text-start">الحالة الحالية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {queueData.data && queueData.data.length > 0 ? (
                    queueData.data.map((item: any) => {
                      const isCurrent = item.status === "in_consultation";
                      const isNext = nextInLine?.id === item.id;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isCurrent
                              ? "bg-emerald-500/10 font-bold"
                              : isNext
                              ? "bg-primary/5 font-semibold"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <td className="p-3 text-center">
                            <span
                              className={`w-8 h-8 rounded-xl font-mono font-bold text-xs inline-flex items-center justify-center ${
                                isCurrent
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : isNext
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {String(item.queue_number).padStart(2, "0")}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-foreground">
                            {item.patient_name}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {item.service_name}
                          </td>
                          <td className="p-3 text-muted-foreground font-mono">
                            {item.arrival_time}
                          </td>
                          <td className="p-3">
                            {item.status === "in_consultation" && (
                              <Badge variant="success" className="gap-1 text-[11px] py-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                داخل العيادة الآن
                              </Badge>
                            )}
                            {item.status === "waiting" && (
                              <Badge variant="secondary" className="text-[11px] py-0.5">
                                {isNext ? "التالي في الدور" : "قيد الانتظار"}
                              </Badge>
                            )}
                            {item.status === "completed" && (
                              <Badge variant="outline" className="text-[11px] py-0.5 text-muted-foreground">
                                ✓ اكتمل الكشف
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        لا توجد حجوزات أو مراجعين مسجلين في قائمة الانتظار اليوم
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Walkin Patient Modal */}
      {isWalkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-foreground mb-4">
              إضافة مريض واصل للعيادة إلى قائمة الدور
            </h3>
            <form onSubmit={handleAddWalkin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5">اختر المريض *</label>
                <SearchablePatientSelect
                  patients={patients}
                  value={selectedWalkinPatientId}
                  onChange={(id) => setSelectedWalkinPatientId(id)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setIsWalkinModalOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={!selectedWalkinPatientId}>
                  إضافة لقائمة الانتظار
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
