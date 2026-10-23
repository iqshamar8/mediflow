import { NextResponse } from "next/server";
import { db, Visit, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");

  // Strict tenant isolation: only return medical visits belonging to this clinic
  let visits = (db.visits || []).filter(
    (v) => v.clinic_id === clinicId || (!v.clinic_id && clinicId === "clinic-1")
  );

  if (patientId) {
    visits = visits.filter((v) => v.patient_id === patientId);
  }

  return NextResponse.json({
    data: visits,
    total: visits.length,
    clinic_id: clinicId,
  });
}

export async function POST(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const { patient_id, doctor_name, service_name, diagnosis, clinical_notes, prescription, follow_up_date } = body;

    if (!patient_id || !diagnosis) {
      return NextResponse.json({ error: "المريض والتشخيص الطبي مطلوبان" }, { status: 400 });
    }

    const patient = db.patients.find(
      (p) => p.id === patient_id && (p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1"))
    );
    if (!patient) {
      return NextResponse.json({ error: "المريض غير موجود في هذه العيادة" }, { status: 404 });
    }

    const currentClinic = db.clinics?.find((c) => c.id === clinicId);

    const newVisit: Visit = {
      id: `vis-${Date.now()}`,
      clinic_id: clinicId,
      patient_id,
      patient_name: patient.full_name,
      doctor_name: doctor_name || currentClinic?.doctor_name || "الطبيب المعالج",
      service_name: service_name || "كشف واستشارة طبية",
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
