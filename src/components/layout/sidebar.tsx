"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
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
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/", label: t("navDashboard"), icon: LayoutDashboard },
    { href: "/patients", label: t("navPatients"), icon: Users },
    { href: "/appointments", label: t("navAppointments"), icon: CalendarDays },
    { href: "/services", label: t("navServices"), icon: Stethoscope },
    { href: "/payments", label: t("navPayments"), icon: CreditCard },
    { href: "/visits", label: t("navVisits"), icon: FileText },
    { href: "/whatsapp", label: t("navWhatsApp"), icon: MessageCircle },
    { href: "/settings", label: t("navSettings"), icon: Settings },
  ];

  return (
    <aside className="w-64 border-e bg-card flex flex-col shrink-0 min-h-screen">
      {/* Brand logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <HeartPulse className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="text-start">
          <span className="font-bold text-base tracking-tight text-foreground block">
            {t("appName")}
          </span>
          <span className="text-[10px] text-muted-foreground block truncate">
            Al-Noor Clinic
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="p-4 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "stroke-[2.2]" : "stroke-[1.8]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Clinic Info */}
      <div className="p-4 border-t text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">عيادة النور التخصصية</p>
        <p>المنصور، بغداد • +964 770 000 0001</p>
      </div>
    </aside>
  );
}
