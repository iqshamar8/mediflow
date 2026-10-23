"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  UserCheck,
  Stethoscope,
  RefreshCw,
  BellRing,
  Calendar,
  AlertCircle,
  Send,
  UserPlus,
  Flame,
  Phone,
  FileText,
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
    targetAppointments: [],
    date: "",
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Walk-in Modal States
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [walkinTab, setWalkinTab] = useState<"existing" | "new">("existing");
  const [selectedWalkinPatientId, setSelectedWalkinPatientId] = useState("");
  const [walkinServiceId, setWalkinServiceId] = useState("");
  const [walkinPriority, setWalkinPriority] = useState<"normal" | "urgent">("normal");
  const [walkinNotes, setWalkinNotes] = useState("");
  const [walkinSendWhatsapp, setWalkinSendWhatsapp] = useState(true);

  // New Patient Form States
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newGender, setNewGender] = useState<"male" | "female">("male");
  const [newAge, setNewAge] = useState("");
  const [isSubmittingWalkin, setIsSubmittingWalkin] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
    loadServices();
  }, [currentClinic?.id]);

  async function loadQueue() {
    try {
      setIsLoading(true);
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const res = await fetch(`/api/queue?clinic_id=${currentClinic?.id || ""}`, { headers });
      const json = await res.json();
      setQueueData(json);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
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

  async function loadServices() {
    try {
      const headers: Record<string, string> = currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {};
      const res = await fetch(`/api/services?clinic_id=${currentClinic?.id || ""}`, { headers });
      const json = await res.json();
      setServices(json.data || []);
      if (json.data && json.data.length > 0 && !walkinServiceId) {
        setWalkinServiceId(json.data[0].id);
      }
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
        showFeedback(json.message || "لا يوجد مرضى في قائمة الانتظار حالياً.", "error");
      }
    } catch {
      showFeedback("حدث خطأ أثناء استدعاء المريض.", "error");
    } finally {
      setIsCalling(false);
    }
  }

  // Check-in an appointment scheduled for TODAY
  async function handleCheckinAppointment(appointmentId: string) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) headers["x-clinic-id"] = currentClinic.id;

      const res = await fetch(`/api/queue?clinic_id=${currentClinic?.id || ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "checkin_appointment",
          appointment_id: appointmentId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error || "فشل تسجيل حضور المريض بالدور", "error");
        return;
      }

      showFeedback(`تم تسجيل حضور المريض بنجاح في صالة الانتظار برقم الدور #${json.queue_number}`, "success");
      await loadQueue();
    } catch {
      showFeedback("حدث خطأ أثناء تسجيل المريض", "error");
    }
  }

  // Add Walk-in (Direct Patient visiting without prior booking)
  async function handleAddWalkinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingWalkin(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentClinic?.id) headers["x-clinic-id"] = currentClinic.id;

      const selectedService = services.find((s) => s.id === walkinServiceId);

      let payload: any = {
        action: "add_walkin",
        service_id: walkinServiceId,
        service_name: selectedService?.name_ar || "كشف واستشارة طبية",
        priority: walkinPriority,
        notes: walkinNotes,
        send_whatsapp: walkinSendWhatsapp,
      };

      if (walkinTab === "existing") {
        if (!selectedWalkinPatientId) {
          showFeedback("يرجى اختيار المريض من القائمة", "error");
          setIsSubmittingWalkin(false);
          return;
        }
        payload.patient_id = selectedWalkinPatientId;
      } else {
        if (!newFullName.trim() || !newPhone.trim()) {
          showFeedback("يرجى كتابة اسم المريض ورقم الهاتف كاملاً", "error");
          setIsSubmittingWalkin(false);
          return;
        }
        payload.is_new_patient = true;
        payload.full_name = newFullName.trim();
        payload.phone = newPhone.trim();
        payload.gender = newGender;
        payload.notes = walkinNotes;
      }

      const res = await fetch(`/api/queue?clinic_id=${currentClinic?.id || ""}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        showFeedback(json.error || "فشل إضافة الحالة لقائمة الانتظار", "error");
        setIsSubmittingWalkin(false);
        return;
      }

      showFeedback(`تم إدراج المريض بنجاح في طابور الانتظار برقم الدور #${json.queue_number}`, "success");
      setIsWalkinModalOpen(false);
      resetWalkinForm();
      await loadQueue();
      await loadPatients();
    } catch {
      showFeedback("حدث خطأ أثناء إضافة المريض المباشر", "error");
    } finally {
      setIsSubmittingWalkin(false);
    }
  }

  function resetWalkinForm() {
    setSelectedWalkinPatientId("");
    setNewFullName("");
    setNewPhone("");
    setNewAge("");
    setWalkinNotes("");
    setWalkinPriority("normal");
  }

  function showFeedback(text: string, type: "success" | "error") {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
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
  const targetAppointments = queueData.targetAppointments || [];
  const todayFormatted = new Date().toLocaleDateString("ar-IQ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Toast / Notification Banner */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 shadow-md border text-sm font-semibold transition-all ${
              feedbackMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent border border-emerald-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                شاشة صالة الانتظار والدور (Waiting Room TV Queue)
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-primary">
                <Calendar className="w-3.5 h-3.5" />
                اليوم: {todayFormatted}
              </span>
              <span>•</span>
              <span>يتم إدراج الحجوزات فقط في يوم الموعد مع إمكانية التسجيل اليدوي للحالات المباشرة</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Clock Pill */}
            <div className="px-3.5 py-1.5 rounded-xl border border-border bg-card font-mono text-sm font-bold text-foreground flex items-center gap-2 shadow-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>{currentTime || "10:30:00 ص"}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="gap-1.5 text-xs font-semibold"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">شاشة كاملة للـ TV</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={loadQueue}
              disabled={isLoading}
              className="p-2"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Control Console (Call Next Button & Direct Walkin Button) */}
        <div className="p-4 rounded-2xl bg-card border border-primary/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shrink-0">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">لوحة تحكم الطبيب والاستقبال</h3>
              <p className="text-xs text-muted-foreground">
                طابور الانتظار الآن: <strong className="text-foreground">{queueData.waitingCount || 0} مرضى</strong> | أنجز اليوم: <strong className="text-emerald-600">{queueData.completedCount || 0} مريض</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => {
                resetWalkinForm();
                setIsWalkinModalOpen(true);
              }}
              className="gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              تسجيل حالة مباشرة واصلة للعيادة (Walk-in)
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
                  {/* Giant Queue Number */}
                  <div className="w-24 h-24 rounded-3xl bg-primary text-primary-foreground flex flex-col items-center justify-center font-black shadow-xl shrink-0">
                    <span className="text-xs opacity-80">رقم</span>
                    <span className="text-4xl leading-none font-mono">
                      {String(nextInLine.queue_number).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                        {nextInLine.patient_name}
                      </h2>
                      {nextInLine.priority === "urgent" && (
                        <Badge variant="destructive" className="gap-1 text-[10px] py-0 px-1.5">
                          <Flame className="w-3 h-3" /> طارئ
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {nextInLine.service_name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      وقت الوصول: {nextInLine.arrival_time}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto opacity-40 mb-2 text-emerald-500" />
                  <p className="font-semibold text-sm">صالة الانتظار فارغة حالياً</p>
                  <p className="text-xs">لا يوجد مرضى بانتظار الدخول الآن</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SECTION: TODAY'S SCHEDULED APPOINTMENTS (Check-in to Queue) */}
        <Card className="border shadow-md">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-base font-bold">
                  حجوزات ومواعيد اليوم المؤكدة (Scheduled Today)
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs font-bold">
                  {targetAppointments.length} مواعيد اليوم
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                المواعيد المحجوزة أونلاين أو هاتفياً لهذا اليوم فقط — سجّل حضور المريض فور وصوله لصالة الانتظار
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {targetAppointments.length > 0 ? (
              <div className="divide-y divide-border">
                {targetAppointments.map((apt: any) => {
                  const timeFormatted = new Date(apt.start_time).toLocaleTimeString("ar-IQ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={apt.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {timeFormatted}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{apt.patient_name}</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                              {apt.booking_source === "whatsapp" ? "واتساب آلي" : "لوحة العيادة"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {apt.service_name} • {apt.patient_phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {apt.is_in_queue ? (
                          <Badge variant="success" className="gap-1.5 py-1 px-3 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            مسجل بالدور (رقم #{apt.queue_number})
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleCheckinAppointment(apt.id)}
                            className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            تسجيل حضور وإدخال في الدور
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground space-y-1">
                <Clock className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-sm font-semibold">لا توجد حجوزات مسبقة مجدولة لتاريخ اليوم</p>
                <p className="text-xs">
                  يمكنك استخدام زر (تسجيل حالة مباشرة واصلة للعيادة) لإضافة أي مريض يصل مباشرة
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FULL TODAY'S QUEUE WAITING LIST */}
        <Card className="border shadow-md">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-base font-bold">
                  تسلسل طابور الانتظار اليوم (Live Queue Sequence)
                </CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                إجمالي الدور اليوم: {queueData.data?.length || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-muted/50 text-xs text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="p-3 text-center w-16">رقم الدور</th>
                    <th className="p-3 text-start">اسم المريض</th>
                    <th className="p-3 text-start">الخدمة المطلوبة</th>
                    <th className="p-3 text-start">نوع الحضور</th>
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
                            <div className="flex items-center gap-2">
                              <span>{item.patient_name}</span>
                              {item.priority === "urgent" && (
                                <Badge variant="destructive" className="text-[10px] py-0 px-1">
                                  طارئ
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {item.service_name}
                          </td>
                          <td className="p-3 text-xs">
                            {item.is_walk_in ? (
                              <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/5 text-[11px]">
                                مباشر (Walk-in)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[11px]">
                                حجز مسبق
                              </Badge>
                            )}
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
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
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

      {/* DUAL-TAB WALKIN REGISTRATION MODAL */}
      {isWalkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative my-8">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  تسجيل حالة واصلة للعيادة مباشرة (Walk-in)
                </h3>
                <p className="text-xs text-muted-foreground">
                  إصدار تذكرة دور فورية وإدراج المريض في صالة الانتظار اليوم
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsWalkinModalOpen(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setWalkinTab("existing")}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  walkinTab === "existing"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                مريض مسجل مسبقاً بالسجل
              </button>
              <button
                type="button"
                onClick={() => setWalkinTab("new")}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  walkinTab === "new"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                مريض جديد لأول مرة (تسجيل فوري)
              </button>
            </div>

            <form onSubmit={handleAddWalkinSubmit} className="space-y-4">
              {walkinTab === "existing" ? (
                <div>
                  <label className="text-xs font-semibold block mb-1.5">
                    اختر المريض (بحث بالاسم أو الهاتف) *
                  </label>
                  <SearchablePatientSelect
                    patients={patients}
                    value={selectedWalkinPatientId}
                    onChange={(id) => setSelectedWalkinPatientId(id)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-muted/30 rounded-xl border">
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      الاسم الكامل للمريض *
                    </label>
                    <Input
                      type="text"
                      placeholder="مثال: حسين علي جابر"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold block mb-1">
                        رقم الهاتف (واتساب) *
                      </label>
                      <Input
                        type="tel"
                        placeholder="07700000000"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        required
                        className="text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">الجنس</label>
                      <select
                        value={newGender}
                        onChange={(e) => setNewGender(e.target.value as any)}
                        className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                      >
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICE SELECTOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    الخدمة الطبية المطلوبة
                  </label>
                  <select
                    value={walkinServiceId}
                    onChange={(e) => setWalkinServiceId(e.target.value)}
                    className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_ar} ({s.price?.toLocaleString()} {s.currency || "IQD"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">أولوية الحالة</label>
                  <select
                    value={walkinPriority}
                    onChange={(e) => setWalkinPriority(e.target.value as any)}
                    className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground font-semibold"
                  >
                    <option value="normal">عادي (حسب تسلسل الوصول)</option>
                    <option value="urgent">🚨 مستعجل / طارئ (تقديم في الدور)</option>
                  </select>
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  ملاحظات أو شكوى المريض الأولية (اختياري)
                </label>
                <Input
                  type="text"
                  placeholder="مثال: يعاني من ألم حاد في الصدر، مراجعة سريعة..."
                  value={walkinNotes}
                  onChange={(e) => setWalkinNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* WHATSAPP TICKET TOGGLE */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">إرسال تذكرة الدور بالواتساب</p>
                    <p className="text-[11px] text-muted-foreground">
                      إرسال رسالة ترحيبية وتأكيد رقم الدور فوراً لهاتف المريض
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={walkinSendWhatsapp}
                  onChange={(e) => setWalkinSendWhatsapp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWalkinModalOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmittingWalkin ||
                    (walkinTab === "existing" && !selectedWalkinPatientId) ||
                    (walkinTab === "new" && (!newFullName.trim() || !newPhone.trim()))
                  }
                  className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmittingWalkin ? "جاري التسجيل..." : "✓ تسجيل فوري وإصدار رقم دور"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
