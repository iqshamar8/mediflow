import { NextResponse } from "next/server";
import { db, Payment, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);

  // Strict tenant isolation: return payments belonging to active clinic
  const payments = (db.payments || []).filter(
    (p) => p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1")
  );

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  return NextResponse.json({
    data: payments,
    totalCount: payments.length,
    totalCollected,
    clinic_id: clinicId,
  });
}

export async function POST(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const { patient_id, appointment_id, amount, payment_method, notes } = body;

    if (!patient_id || !amount || amount <= 0) {
      return NextResponse.json({ error: "Patient and a valid amount are required" }, { status: 400 });
    }

    const patient = db.patients.find(
      (p) => p.id === patient_id && (p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1"))
    );
    if (!patient) {
      return NextResponse.json({ error: "Patient not found in this clinic" }, { status: 404 });
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      clinic_id: clinicId,
      patient_id,
      patient_name: patient.full_name,
      appointment_id: appointment_id || undefined,
      amount: Number(amount),
      currency: "IQD",
      payment_method: payment_method || "cash",
      payment_date: new Date().toISOString(),
      reference_number: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes || "",
    };

    db.payments.unshift(newPayment);

    return NextResponse.json(newPayment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
