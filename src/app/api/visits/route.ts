import { NextResponse } from "next/server";
import { db, Visit } from "@/server/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");

  let visits = db.visits || [];
  if (patientId) {
    visits = visits.filter((v) => v.patient_id === patientId);
  }

  return NextResponse.json({
    data: visits,
    total: visits.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, doctor_name, service_name, diagnosis, clinical_notes, prescription, follow_up_date } = body;

    if (!patient_id || !diagnosis) {
      return NextResponse.json({ error: "المريض والتشخيص الطبي مطلوبان" }, { status: 400 });
    }

    const patient = db.patients.find((p) => p.id === patient_id);
    if (!patient) {
      return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
    }

    const newVisit: Visit = {
      id: `vis-${Date.now()}`,
      patient_id,
      patient_name: patient.full_name,
      doctor_name: doctor_name || "د. أحمد الراوي",
      service_name: service_name || "كشف واستشارة",
      visit_date: new Date().toISOString(),
      diagnosis,
      clinical_notes: clinical_notes || "",
      prescription: prescription || "",
      follow_up_date: follow_up_date || undefined,
    };

    if (!db.visits) {
      db.visits = [];
    }
    db.visits.unshift(newVisit);

    return NextResponse.json(newVisit, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل حفظ السجل السريري" }, { status: 500 });
  }
}
