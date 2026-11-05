"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useClinic } from "@/lib/clinic/context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  CreditCard,
  FileText,
  MessageCircle,
  Settings,
  HeartPulse,
  Tv,
  CalendarClock,
  Receipt,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { currentClinic } = useClinic();

  const navItems = [
    { href: "/", label: t("navDashboard"), icon: LayoutDashboard },
    { href: "/patients", label: t("navPatients"), icon: Users },
    { href: "/appointments", label: t("navAppointments"), icon: CalendarDays },
    { href: "/queue", label: "شاشة الدور والانتظار", icon: Tv, highlight: true },
    { href: "/services", label: t("navServices"), icon: Stethoscope },
    { href: "/payments", label: t("navPayments"), icon: CreditCard },
    { href: "/reports", label: "تقفيل الصندوق والتقارير", icon: Receipt },
    { href: "/visits", label: t("navVisits"), icon: FileText },
    { href: "/follow-ups", label: "المتابعات الدورية", icon: CalendarClock },
    { href: "/whatsapp", label: t("navWhatsApp"), icon: MessageCircle },
    { href: "/settings", label: t("navSettings"), icon: Settings },
  ];

  const sidebarContent = (
    <>
      {/* Brand logo */}
      <div className="h-16 px-5 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="text-start truncate">
            <span className="font-bold text-base tracking-tight text-foreground block">
              {t("appName")}
            </span>
            <span className="text-[10px] text-muted-foreground block truncate max-w-[130px]">
              {currentClinic ? currentClinic.name : "Al-Noor Clinic"}
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "stroke-[2.2]" : "stroke-[1.8]")} />
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Clinic Info */}
      <div className="p-4 border-t text-xs text-muted-foreground space-y-1 bg-muted/20">
        <p className="font-bold text-foreground truncate">{currentClinic?.name || "عيادة النور التخصصية"}</p>
        <p className="truncate">{currentClinic?.address || "المنصور، بغداد"}</p>
        <p className="font-mono text-[11px]" dir="ltr">{currentClinic?.phone || "+964 770 000 0001"}</p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-e bg-card shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
          />
          <aside className="relative z-50 w-72 max-w-[85vw] bg-card border-e shadow-2xl flex flex-col h-full animate-in slide-in-from-start duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
