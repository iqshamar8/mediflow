"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Tv,
  FileText,
  Menu,
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { direction } = useI18n();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground" dir={direction}>
      {/* Sidebar (Desktop Persistent + Mobile Slide-over) */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-6 pb-20 md:pb-6 overflow-y-auto min-w-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Thumb-friendly native experience) */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t flex items-center justify-around h-16 px-1 shadow-lg">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-colors",
              pathname === "/" ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>

          <Link
            href="/patients"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-colors",
              pathname === "/patients" ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span>المرضى</span>
          </Link>

          <Link
            href="/queue"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-colors relative",
              pathname === "/queue" ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Tv className="w-4 h-4" />
            <span>الدور</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 end-1.5 animate-pulse" />
          </Link>

          <Link
            href="/visits"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-colors",
              pathname === "/visits" ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>الزيارات</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-4 h-4" />
            <span>المزيد</span>
          </button>
        </div>
      </div>
    </div>
  );
}
