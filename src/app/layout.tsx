import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "@/lib/theme/context";
import { ClinicProvider } from "@/lib/clinic/context";
import { RoleProvider } from "@/lib/auth/role-context";

export const metadata: Metadata = {
  title: "MediFlow CRM — إدارة العيادات والمواعيد",
  description: "Medical Clinic CRM & WhatsApp Automation Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            <ClinicProvider>
              <RoleProvider>
                {children}
              </RoleProvider>
            </ClinicProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
