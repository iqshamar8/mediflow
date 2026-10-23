import { NextResponse } from "next/server";
import { db, Prescription, WhatsAppMessage, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");

  let list = (db.prescriptions || []).filter(
    (rx) => rx.clinic_id === clinicId || (!rx.clinic_id && clinicId === "clinic-1")
  );

  if (patientId) {
    list = list.filter((rx) => rx.patient_id === patientId);
  }

  return NextResponse.json({
    data: list,
    total: list.length,
    clinic_id: clinicId,
  });
}

export async function POST(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const { patient_id, diagnosis, items, general_advice, send_whatsapp } = body;

    if (!patient_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "المريض وقائمة الأدوية مطلوبة لإنشاء الوصفة الطبية" },
        { status: 400 }
      );
    }

    const patient = db.patients.find(
      (p) => p.id === patient_id && (p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1"))
    );
    if (!patient) {
      return NextResponse.json({ error: "المريض غير موجود في هذه العيادة" }, { status: 404 });
    }

    const clinic = db.clinics?.find((c) => c.id === clinicId) || db.clinics?.[0];

    const newPrescription: Prescription = {
      id: `rx-${Date.now()}`,
      clinic_id: clinicId,
      patient_id,
      patient_name: patient.full_name,
      patient_phone: patient.phone,
      doctor_name: clinic?.doctor_name || "الطبيب المعالج",
      diagnosis: diagnosis || "كشف واستشارة طبية",
      items,
      general_advice: general_advice || "",
      created_at: new Date().toISOString(),
    };

    if (!db.prescriptions) {
      db.prescriptions = [];
    }
    db.prescriptions.unshift(newPrescription);

    // If requested, send Rx summary to patient via WhatsApp
    if (send_whatsapp && patient.phone) {
      const rxLines = items
        .map(
          (m: any, i: number) =>
            `${i + 1}. 💊 *${m.medication_name}*\n   الجرعة: ${m.dosage} | ${m.frequency}\n   المدة: ${m.duration}${m.instructions ? ` (${m.instructions})` : ""}`
        )
        .join("\n\n");

      const waContent =
        `📋 *وصفة طبية إلكترونية رسمية (Rx)*\n` +
        `من: ${clinic?.name || "العيادة الطبية"} — ${clinic?.doctor_name || ""}\n\n` +
        `👤 المريض: ${patient.full_name}\n` +
        `🩺 التشخيص: ${newPrescription.diagnosis}\n` +
        `📅 التاريخ: ${new Date().toLocaleDateString("ar-IQ")}\n\n` +
        `قائمة الأدوية الموصوفة:\n` +
        `${rxLines}\n\n` +
        (general_advice ? `💡 إرشادات ونصائح: ${general_advice}\n\n` : "") +
        `نتمنى لك الشفاء العاجل ودوام العافية! 🩺`;

      const outboundMsg: WhatsAppMessage = {
        id: `msg-rx-${Date.now()}`,
        clinic_id: clinicId,
        direction: "outbound",
        sender_phone: clinic?.phone || "+9647700000001",
        receiver_phone: patient.phone,
        content: waContent,
        status: "delivered",
        created_at: new Date().toISOString(),
      };
      db.messages.push(outboundMsg);
    }

    return NextResponse.json(newPrescription, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل حفظ الوصفة الطبية" }, { status: 500 });
  }
}
