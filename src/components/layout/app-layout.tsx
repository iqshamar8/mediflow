"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useI18n } from "@/lib/i18n/context";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { direction } = useI18n();

  return (
    <div className="min-h-screen flex bg-background text-foreground" dir={direction}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
