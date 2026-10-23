import { NextResponse } from "next/server";
import { db, WhatsAppMessage } from "@/server/mock-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appointment_id } = body;

    if (!appointment_id) {
      return NextResponse.json({ error: "معرف الموعد مطلوب" }, { status: 400 });
    }

    const apt = db.appointments.find((a) => a.id === appointment_id);
    if (!apt) {
      return NextResponse.json({ error: "الموعد غير موجود" }, { status: 404 });
    }

    const patient = db.patients.find((p) => p.id === apt.patient_id);
    const phone = apt.patient_phone || patient?.phone;

    if (!phone) {
      return NextResponse.json({ error: "لا يوجد رقم هاتف مسجل لهذا المريض" }, { status: 400 });
    }

    const clinic = db.clinics?.find((c) => c.id === apt.clinic_id) || db.clinics?.[0] || {
      name: "عيادة د. أحمد الراوي التخصصية",
      address: "بغداد - الحارثية - مجمع الكندي الطبي",
      phone: "+9647711110000",
    };

    const patientName = apt.patient_name || patient?.full_name || "المراجع الكريم";
    const serviceName = apt.service_name || "كشف واستشارة";
    const aptDate = new Date(apt.start_time);
    const dateFormatted = aptDate.toLocaleDateString("ar-IQ", { dateStyle: "full" });
    const timeFormatted = aptDate.toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" });

    // Compose polite, official clinic reminder customized to this specific doctor's clinic
    const reminderText =
      `تذكير بموعدك الطبي القادم ⏰\n\n` +
      `عزيزي/عزيزتي: ${patientName}،\n` +
      `نود تذكيرك بموعدك في ${clinic.name}:\n` +
      `🩺 الخدمة: ${serviceName}\n` +
      `📅 التاريخ: ${dateFormatted}\n` +
      `⏰ الوقت: الساعة ${timeFormatted}\n` +
      `📍 العنوان: ${clinic.address}\n\n` +
      `لأي استفسار أو لتعديل الموعد، يمكنك الرد مباشرة على هذه الرسالة.\nنتمنى لك دوام الصحة والعافية!`;

    // Log to WhatsApp outbound messages
    const outboundMsg: WhatsAppMessage = {
      id: `msg-rem-manual-${Date.now()}`,
      clinic_id: apt.clinic_id,
      direction: "outbound",
      sender_phone: clinic.phone || "+9647700000001",
      receiver_phone: phone,
      content: reminderText,
      status: "delivered",
      created_at: new Date().toISOString(),
    };

    db.messages.push(outboundMsg);

    // Update appointment record with timestamp of this manual reminder
    apt.last_reminder_sent_at = new Date().toISOString();

    return NextResponse.json({
      status: "success",
      message: `تم إرسال التذكير بنجاح للمريض ${patientName} على الرقم (${phone})`,
      reminderText,
    });
  } catch {
    return NextResponse.json({ error: "فشل إرسال رسالة التذكير" }, { status: 500 });
  }
}
