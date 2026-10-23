"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { useClinic } from "@/lib/clinic/context";
import { ClinicSwitcher } from "@/components/clinic/clinic-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Bell, Sun, Moon } from "lucide-react";

export function Header() {
  const { language, setLanguage, t } = useI18n();
  const { isDark, toggleTheme } = useTheme();
  const { currentClinic } = useClinic();

  return (
    <header className="h-16 border-b bg-card/60 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary font-bold tracking-wide">
            MediFlow
          </Badge>
          <Badge variant="warning" className="hidden lg:inline-flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t("whatsappMockActive")}
          </Badge>
        </div>

        {/* Doctor & Clinic Workspace Switcher */}
        <ClinicSwitcher />
      </div>

      <div className="flex items-center gap-2">
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

        {/* Notifications Icon */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
        </Button>

        {/* Active Doctor Profile Badge */}
        <div className="flex items-center gap-2 ps-2 border-s border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {currentClinic?.doctor_name ? currentClinic.doctor_name.replace("د. ", "").charAt(0) : "د"}
          </div>
          <div className="hidden lg:block text-start leading-tight">
            <p className="text-xs font-semibold">{currentClinic?.doctor_name || "د. أحمد الراوي"}</p>
            <p className="text-[10px] text-muted-foreground">{t("roleOwner")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
