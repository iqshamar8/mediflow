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
} from "lucide-react";

export function Sidebar() {
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

  return (
    <aside className="w-64 border-e bg-card flex flex-col shrink-0 min-h-screen">
      {/* Brand logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
          <HeartPulse className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="text-start truncate">
          <span className="font-bold text-base tracking-tight text-foreground block">
            {t("appName")}
          </span>
          <span className="text-[10px] text-muted-foreground block truncate">
            {currentClinic ? currentClinic.name : "Al-Noor Clinic"}
          </span>
        </div>
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
    </aside>
  );
}
