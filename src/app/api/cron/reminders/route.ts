import { NextResponse } from "next/server";
import { db } from "@/server/mock-db";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET || "mediflow_cron_secret";

  if (authHeader !== `Bearer ${expectedSecret}`) {
    // Check if development fallback is acceptable
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Scan appointments in the upcoming 24 hours
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 3600000);

  const eligibleAppointments = db.appointments.filter((apt) => {
    if (apt.status !== "confirmed") return false;
    const aptTime = new Date(apt.start_time);
    return aptTime > now && aptTime <= next24h;
  });

  const remindersSent: string[] = [];

  for (const apt of eligibleAppointments) {
    if (apt.patient_phone) {
      // Simulate sending WhatsApp reminder
      const reminderContent = `تذكير بموعدك الطبي ⏰\nعزيزي ${apt.patient_name || "المريض"}، نود تذكيرك بموعدك القادم غداً (${apt.service_name}) في تمام الساعة ${new Date(apt.start_time).toLocaleTimeString("ar-IQ")}.\nعيادة النور ترحب بك دائماً!`;

      db.messages.push({
        id: `msg-rem-${Date.now()}-${apt.id}`,
        direction: "outbound",
        sender_phone: "+9647700000001",
        receiver_phone: apt.patient_phone,
        content: reminderContent,
        status: "delivered",
        created_at: new Date().toISOString(),
      });

      remindersSent.push(apt.id);
    }
  }

  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    processedCount: eligibleAppointments.length,
    remindersSent,
  });
}
