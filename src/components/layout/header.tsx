"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { useClinic } from "@/lib/clinic/context";
import { useRole, UserRole } from "@/lib/auth/role-context";
import { ClinicSwitcher } from "@/components/clinic/clinic-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  Menu,
  Tv,
  MessageCircle,
  Receipt,
  CheckCheck,
} from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { language, setLanguage, t } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const { currentClinic } = useClinic();
  const { role, setRole, roleNameAr } = useRole();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: "n1",
      title: "صالة الانتظار والدور",
      message: "يوجد مرضى مسجلون في قائمة الانتظار بانتظار استدعاء الكشف الطبي",
      time: "منذ 5 دقائق",
      type: "queue",
      href: "/queue",
      unread: true,
    },
    {
      id: "n2",
      title: "تأكيد مواعيد اليوم",
      message: "تم إرسال تذكيرات الواتساب الآلية للمرضى لجدول مواعيد اليوم",
      time: "منذ 20 دقيقة",
      type: "whatsapp",
      href: "/appointments",
      unread: true,
    },
    {
      id: "n3",
      title: "تقفيل الصندوق المالي",
      message: "التقرير المالي اليومي Z-Report جاهز للمراجعة ومطابقة المقبوضات",
      time: "منذ ساعة",
      type: "reports",
      href: "/reports",
      unread: true,
    },
  ]);

  return (
    <header className="h-16 border-b bg-card/60 backdrop-blur px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-1.5 h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
          onClick={onMenuClick}
          aria-label="القائمة الرئيسية"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-primary font-bold tracking-wide">
            MediFlow
          </Badge>
          <Badge variant="warning" className="hidden lg:inline-flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t("whatsappMockActive")}
          </Badge>
        </div>

        {/* Doctor & Clinic Workspace Switcher */}
        <div className="min-w-0">
          <ClinicSwitcher />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Staff Role Switcher */}
        <div className="hidden sm:flex items-center gap-1 border border-border rounded-xl px-2 py-1 bg-muted/40">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] text-muted-foreground font-semibold">الدور:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="text-xs bg-transparent font-bold text-foreground focus:outline-none cursor-pointer"
            title="تبديل صلاحية المستخدم للتجربة والمعاينة"
          >
            <option value="doctor">👨‍⚕️ طبيب (كامل)</option>
            <option value="receptionist">👩‍💼 استقبال</option>
            <option value="cashier">💼 كاشير</option>
          </select>
        </div>

        {/* Night Mode / Theme Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-medium"
          onClick={toggleTheme}
          title={isDark ? "تفعيل الوضع النهاري (Light Mode)" : "تفعيل الوضع الليلي (Dark Mode)"}
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="hidden md:inline">الوضع النهاري</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-slate-700" />
              <span className="hidden md:inline">الوضع الليلي</span>
            </>
          )}
        </Button>

        {/* Language Switcher */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 font-medium"
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="hidden md:inline">{language === "ar" ? "English" : "العربية"}</span>
        </Button>

        {/* Notifications Popover */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-muted-foreground hover:text-foreground"
            title="الإشعارات والتنبيهات"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
              <div className="absolute end-0 mt-2 w-80 sm:w-96 max-w-[90vw] bg-card rounded-2xl border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 bg-muted/40 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="font-bold text-xs text-foreground">مركز الإشعارات والتنبيهات</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                        {unreadCount} جديد
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUnreadCount(0);
                        setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
                      }}
                      className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>تحديد كمقروء</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                  {notificationsList.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.href}
                      onClick={() => setIsNotificationsOpen(false)}
                      className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-muted/50 ${
                        notif.unread ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        {notif.type === "queue" && <Tv className="w-4 h-4 text-primary" />}
                        {notif.type === "whatsapp" && <MessageCircle className="w-4 h-4 text-emerald-500" />}
                        {notif.type === "reports" && <Receipt className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-foreground">{notif.title}</p>
                          <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{notif.message}</p>
                      </div>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </Link>
                  ))}
                </div>

                <div className="p-2.5 bg-muted/20 border-t border-border text-center">
                  <p className="text-[10px] text-muted-foreground">يتم تحديث التنبيهات تلقائياً مع حركة المرضى والواتساب</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Active Doctor Profile Badge */}
        <div className="flex items-center gap-2 ps-2 border-s border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {currentClinic?.doctor_name ? currentClinic.doctor_name.replace("د. ", "").charAt(0) : "د"}
          </div>
          <div className="hidden lg:block text-start leading-tight">
            <p className="text-xs font-semibold">{currentClinic?.doctor_name || "د. أحمد الراوي"}</p>
            <p className="text-[10px] text-muted-foreground">{roleNameAr}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
