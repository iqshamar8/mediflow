import { NextResponse } from "next/server";
import { db, Appointment } from "@/server/mock-db";

export async function GET() {
  return NextResponse.json({
    data: db.appointments,
    total: db.appointments.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, service_id, start_time, notes, booking_source } = body;

    if (!patient_id || !service_id || !start_time) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    const patient = db.patients.find((p) => p.id === patient_id);
    const service = db.services.find((s) => s.id === service_id);

    if (!patient || !service) {
      return NextResponse.json({ error: "Invalid patient or service" }, { status: 404 });
    }

    const startDate = new Date(start_time);
    const duration = service.duration_minutes || 30;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    // Business rule: Prevent overlapping appointments
    const hasOverlap = db.appointments.some((apt) => {
      if (apt.status === "cancelled") return false;
      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      const newStart = startDate.getTime();
      const newEnd = endDate.getTime();

      return newStart < aptEnd && newEnd > aptStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: "Slot conflict: An appointment already exists at this time." },
        { status: 409 }
      );
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patient_id,
      patient_name: patient.full_name,
      patient_phone: patient.phone,
      service_id,
      service_name: service.name_ar,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      duration_minutes: duration,
      status: "confirmed",
      booking_source: booking_source || "dashboard",
      notes: notes || "",
    };

    db.appointments.unshift(newAppointment);

    return NextResponse.json(newAppointment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
