"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sun,
  Sunset,
  CalendarDays,
  Sparkles,
  Sliders,
} from "lucide-react";

interface ProfessionalDateTimePickerProps {
  value: string; // ISO string or datetime-local format "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  existingAppointments?: Array<{
    id?: string;
    start_time: string;
    end_time?: string;
    duration_minutes?: number;
    status: string;
  }>;
  excludeAppointmentId?: string;
  serviceDurationMinutes?: number;
  required?: boolean;
}

// Standard clinic time slots
const MORNING_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];
const EVENING_SLOTS = ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];

const ARABIC_MONTHS = [
  "كانون الثاني (يناير)",
  "شباط (فبراير)",
  "آذار (مارس)",
  "نيسان (أبريل)",
  "أيار (مايو)",
  "حزيران (يونيو)",
  "تموز (يوليو)",
  "آب (أغسطس)",
  "أيلول (سبتمبر)",
  "تشرين الأول (أكتوبر)",
  "تشرين الثاني (نوفمبر)",
  "كانون الأول (ديسمبر)",
];

const WEEKDAYS = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export function ProfessionalDateTimePicker({
  value,
  onChange,
  existingAppointments = [],
  excludeAppointmentId,
  serviceDurationMinutes = 30,
  required = false,
}: ProfessionalDateTimePickerProps) {
  // Input mode: "calendar" (interactive visual picker) or "direct" (native datetime-local picker)
  const [pickerMode, setPickerMode] = useState<"calendar" | "direct">("calendar");

  // Local helper to parse date
  const parseDateFromValue = (val: string): { date: Date | null; timeStr: string } => {
    if (!val) return { date: null, timeStr: "10:00" };
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return { date: null, timeStr: "10:00" };
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return { date: d, timeStr: `${hours}:${minutes}` };
    } catch {
      return { date: null, timeStr: "10:00" };
    }
  };

  const initialParsed = parseDateFromValue(value);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return initialParsed.date || new Date();
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    return initialParsed.date;
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(() => {
    return initialParsed.timeStr;
  });

  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState(() => initialParsed.timeStr);

  // Sync internal state whenever `value` prop changes from outside
  useEffect(() => {
    if (!value) return;
    const parsed = parseDateFromValue(value);
    if (parsed.date) {
      setSelectedDate(parsed.date);
      setCurrentMonth(new Date(parsed.date.getFullYear(), parsed.date.getMonth(), 1));
      setSelectedTimeSlot(parsed.timeStr);
      setCustomTimeInput(parsed.timeStr);
    }
  }, [value]);

  // Helper to commit date and time to parent onChange reliably
  const commitDateTime = (date: Date, timeSlot: string) => {
    const [hours, minutes] = (timeSlot || "10:00").split(":").map(Number);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const h = String(hours).padStart(2, "0");
    const m = String(minutes).padStart(2, "0");

    // Local ISO format (YYYY-MM-DDTHH:mm)
    const formatted = `${year}-${month}-${day}T${h}:${m}`;
    onChange(formatted);
  };

  // Calculate days for the calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Padding for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      const prevDate = new Date(year, month, 1 - (firstDayIndex - i));
      prevDate.setHours(0, 0, 0, 0);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: prevDate.getTime() === today.getTime(),
        isPast: prevDate < today,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      currentDate.setHours(0, 0, 0, 0);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.getTime() === today.getTime(),
        isPast: currentDate < today,
      });
    }

    // Padding to complete 7-column rows
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      nextDate.setHours(0, 0, 0, 0);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: nextDate.getTime() === today.getTime(),
        isPast: nextDate < today,
      });
    }

    return days;
  }, [currentMonth]);

  // Check if a specific time slot is occupied on the selected date
  const isSlotBooked = (slotTime: string): boolean => {
    if (!selectedDate) return false;

    const [slotHours, slotMinutes] = slotTime.split(":").map(Number);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(slotHours, slotMinutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + serviceDurationMinutes * 60000);

    return existingAppointments.some((apt) => {
      if (apt.id && excludeAppointmentId && apt.id === excludeAppointmentId) return false;
      if (apt.status === "cancelled") return false;

      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = apt.end_time
        ? new Date(apt.end_time).getTime()
        : aptStart + (apt.duration_minutes || 30) * 60000;

      return slotStart.getTime() < aptEnd && slotEnd.getTime() > aptStart;
    });
  };

  // Date click handler: selects date and commits immediately with active slot
  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
    const slotToUse = selectedTimeSlot || "10:00";
    setSelectedTimeSlot(slotToUse);
    commitDateTime(d, slotToUse);
  };

  // Time slot click handler
  const handleSelectSlot = (slot: string) => {
    setSelectedTimeSlot(slot);
    setShowCustomTime(false);
    const dateToUse = selectedDate || new Date();
    setSelectedDate(dateToUse);
    commitDateTime(dateToUse, slot);
  };

  // Custom time handler
  const handleCustomTimeSubmit = () => {
    if (!customTimeInput) return;
    setSelectedTimeSlot(customTimeInput);
    const dateToUse = selectedDate || new Date();
    setSelectedDate(dateToUse);
    commitDateTime(dateToUse, customTimeInput);
    setShowCustomTime(false);
  };

  // Quick preset dates (Today, Tomorrow, After tomorrow)
  const handleQuickPreset = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    target.setHours(0, 0, 0, 0);
    setSelectedDate(target);
    setCurrentMonth(new Date(target.getFullYear(), target.getMonth(), 1));

    const slotToUse = selectedTimeSlot || "10:00";
    setSelectedTimeSlot(slotToUse);
    commitDateTime(target, slotToUse);
  };

  // Format time in 12-hour Arabic (e.g. "10:30 ص" or "04:30 م")
  const formatSlotLabel = (slot: string) => {
    const [h, m] = slot.split(":").map(Number);
    const isPm = h >= 12;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const period = isPm ? "م" : "ص";
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  // Check if date is selected
  const isDaySelected = (d: Date): boolean => {
    if (!selectedDate) return false;
    return (
      d.getFullYear() === selectedDate.getFullYear() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getDate() === selectedDate.getDate()
    );
  };

  // Value formatted for direct datetime-local input
  const directInputValue = useMemo(() => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${h}:${m}`;
    } catch {
      return "";
    }
  }, [value]);

  return (
    <div className="space-y-3.5">
      {/* 1. Header Overview: Selected Date & Time Badge + Mode Toggle */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="leading-tight text-start">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">الموعد المحدد:</span>
              {selectedDate ? (
                <Badge variant="success" className="gap-1 text-[11px] py-0 px-2 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  تم التحديد بنجاح
                </Badge>
              ) : (
                <Badge variant="warning" className="text-[10px] py-0 px-2 font-bold">
                  اضغط على أي يوم للتحديد
                </Badge>
              )}
            </div>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {selectedDate ? (
                <span>
                  {selectedDate.toLocaleDateString("ar-IQ", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {selectedTimeSlot ? ` — الساعة ${formatSlotLabel(selectedTimeSlot)}` : ""}
                </span>
              ) : (
                "لم يتم تحديد تاريخ بعد"
              )}
            </p>
          </div>
        </div>

        {/* Quick Date Shortcuts & Mode Switch */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => handleQuickPreset(0)}
            className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors font-medium"
          >
            اليوم
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(1)}
            className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors font-medium"
          >
            غداً
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(2)}
            className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors font-medium"
          >
            بعد غد
          </button>
          <button
            type="button"
            onClick={() => setPickerMode(pickerMode === "calendar" ? "direct" : "calendar")}
            className="px-2 py-1 text-xs rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-colors font-semibold flex items-center gap-1"
            title="التبديل بين التقويم والإدخال اليدوي المباشر"
          >
            <Sliders className="w-3 h-3" />
            <span>{pickerMode === "calendar" ? "إدخال مباشر" : "التقويم"}</span>
          </button>
        </div>
      </div>

      {/* 2. MODE A: DIRECT DATETIME INPUT */}
      {pickerMode === "direct" ? (
        <div className="p-4 rounded-2xl border border-border bg-card/60 shadow-sm space-y-3">
          <label className="text-xs font-semibold block text-foreground">
            حدد التاريخ والوقت مباشرة عبر منتقي النظام:
          </label>
          <div className="flex items-center gap-3">
            <input
              type="datetime-local"
              value={directInputValue}
              onChange={(e) => {
                if (e.target.value) {
                  onChange(e.target.value);
                  const parsed = parseDateFromValue(e.target.value);
                  if (parsed.date) {
                    setSelectedDate(parsed.date);
                    setSelectedTimeSlot(parsed.timeStr);
                  }
                }
              }}
              className="flex h-10 w-full sm:w-auto rounded-xl border border-input bg-background px-3 py-2 text-sm font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPickerMode("calendar")}
              className="text-xs font-semibold"
            >
              العودة للتقويم المرئي
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            يمكنك إدخال أي وقت وتاريخ مباشرة من هنا.
          </p>
        </div>
      ) : (
        /* 2. MODE B: INTERACTIVE CALENDAR & TIME SLOTS */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Column (Calendar Month Grid) */}
          <div className="md:col-span-6 p-4 rounded-2xl border border-border bg-card/60 shadow-sm space-y-3">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {ARABIC_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="الشهر السابق"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="الشهر القادم"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((w, idx) => (
                <span key={idx} className="text-[11px] font-semibold text-muted-foreground py-1">
                  {w}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = isDaySelected(day.date);
                const isDisabled = day.isPast || !day.isCurrentMonth;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(day.date)}
                    className={`h-8 text-xs rounded-xl flex items-center justify-center font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-md scale-105"
                        : isDisabled
                        ? "text-muted-foreground/30 cursor-not-allowed"
                        : day.isToday
                        ? "border border-primary text-primary font-bold hover:bg-primary/10"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/60">
              اضغط على أي يوم لاختياره فوراً — التحديد يتم بضغطة زر واحدة
            </p>
          </div>

          {/* Right Column (Time Slots) */}
          <div className="md:col-span-6 p-4 rounded-2xl border border-border bg-card/60 shadow-sm space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  الفترات الزمنية المتاحة بالعيادة
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  المدة: {serviceDurationMinutes} دقيقة
                </span>
              </div>

              {/* Morning Shift */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>الفترة الصباحية:</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {MORNING_SLOTS.map((slot) => {
                    const booked = isSlotBooked(slot);
                    const isSelected = selectedTimeSlot === slot && !showCustomTime;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={booked}
                        onClick={() => handleSelectSlot(slot)}
                        className={`py-1.5 px-1 rounded-xl text-xs font-medium transition-all text-center flex flex-col items-center justify-center relative ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold shadow-md scale-105"
                            : booked
                            ? "bg-destructive/10 text-destructive/50 line-through cursor-not-allowed border border-destructive/20"
                            : "border border-input hover:border-primary hover:bg-primary/5 text-foreground"
                        }`}
                        title={booked ? "هذا الوقت محجوز مسبقاً" : "وقت متاح للحجز"}
                      >
                        <span className="leading-none">{formatSlotLabel(slot)}</span>
                        {booked && <span className="text-[9px] no-underline font-normal">محجوز</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evening Shift */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <Sunset className="w-3 h-3 text-orange-500" />
                  <span>الفترة المسائية:</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {EVENING_SLOTS.map((slot) => {
                    const booked = isSlotBooked(slot);
                    const isSelected = selectedTimeSlot === slot && !showCustomTime;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={booked}
                        onClick={() => handleSelectSlot(slot)}
                        className={`py-1.5 px-1 rounded-xl text-xs font-medium transition-all text-center flex flex-col items-center justify-center relative ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold shadow-md scale-105"
                            : booked
                            ? "bg-destructive/10 text-destructive/50 line-through cursor-not-allowed border border-destructive/20"
                            : "border border-input hover:border-primary hover:bg-primary/5 text-foreground"
                        }`}
                        title={booked ? "هذا الوقت محجوز مسبقاً" : "وقت متاح للحجز"}
                      >
                        <span className="leading-none">{formatSlotLabel(slot)}</span>
                        {booked && <span className="text-[9px] no-underline font-normal">محجوز</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Time Option Toggle */}
            <div className="pt-2 border-t border-border/60">
              {!showCustomTime ? (
                <button
                  type="button"
                  onClick={() => setShowCustomTime(true)}
                  className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <span>⚙️ كتابة وقت أو دقيقة مخصصة يدوياً</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border">
                  <input
                    type="time"
                    value={customTimeInput}
                    onChange={(e) => setCustomTimeInput(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-input text-xs font-mono bg-background text-foreground"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className="h-8 text-xs font-semibold px-2.5"
                    onClick={handleCustomTimeSubmit}
                  >
                    تثبيت الوقت
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowCustomTime(false)}
                    className="text-xs text-muted-foreground hover:text-foreground ms-auto"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
