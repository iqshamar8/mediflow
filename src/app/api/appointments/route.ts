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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, start_time, service_id, notes, cancellation_reason } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الموعد مطلوب" }, { status: 400 });
    }

    const aptIndex = db.appointments.findIndex((a) => a.id === id);
    if (aptIndex === -1) {
      return NextResponse.json({ error: "الموعد غير موجود" }, { status: 404 });
    }

    const existingApt = db.appointments[aptIndex];

    // If rescheduling (changing time or service)
    if (start_time || service_id) {
      const newService = service_id ? db.services.find((s) => s.id === service_id) : db.services.find((s) => s.id === existingApt.service_id);
      const newDuration = newService?.duration_minutes || existingApt.duration_minutes || 30;
      const newStartDate = start_time ? new Date(start_time) : new Date(existingApt.start_time);
      const newEndDate = new Date(newStartDate.getTime() + newDuration * 60000);

      // Conflict check against other appointments
      const hasConflict = db.appointments.some((a) => {
        if (a.id === id || a.status === "cancelled") return false;
        const aStart = new Date(a.start_time).getTime();
        const aEnd = new Date(a.end_time).getTime();
        return newStartDate.getTime() < aEnd && newEndDate.getTime() > aStart;
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: "يوجد تعارض زمني: يوجد موعد آخر محجوز في هذا التوقيت." },
          { status: 409 }
        );
      }

      existingApt.start_time = newStartDate.toISOString();
      existingApt.end_time = newEndDate.toISOString();
      existingApt.duration_minutes = newDuration;
      if (newService) {
        existingApt.service_id = newService.id;
        existingApt.service_name = newService.name_ar;
      }
    }

    if (status) {
      existingApt.status = status;
    }

    if (notes !== undefined) {
      existingApt.notes = notes;
    }

    return NextResponse.json({ status: "success", appointment: existingApt });
  } catch {
    return NextResponse.json({ error: "فشل تحديث بيانات الموعد" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الموعد مطلوب" }, { status: 400 });
    }

    const index = db.appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "الموعد غير موجود" }, { status: 404 });
    }

    db.appointments.splice(index, 1);
    return NextResponse.json({ status: "success", message: "تم حذف الموعد بنجاح" });
  } catch {
    return NextResponse.json({ error: "فشل حذف الموعد" }, { status: 500 });
  }
}
