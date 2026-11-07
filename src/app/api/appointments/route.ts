import { NextResponse } from "next/server";
import { db, Appointment, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);

  // Strict tenant isolation: only return appointments belonging to this clinic
  const clinicAppointments = (db.appointments || []).filter(
    (a) => a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1")
  );

  return NextResponse.json({
    data: clinicAppointments,
    total: clinicAppointments.length,
    clinic_id: clinicId,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clinicId = body.clinic_id || getRequestClinicId(request);
    const { patient_id, service_id, start_time, notes, booking_source } = body;

    if (!patient_id || !service_id || !start_time) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    const patient = db.patients.find(
      (p) => p.id === patient_id && (p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1"))
    ) || db.patients.find((p) => p.id === patient_id);

    const service = db.services.find(
      (s) => s.id === service_id && (s.clinic_id === clinicId || (!s.clinic_id && clinicId === "clinic-1"))
    ) || db.services.find((s) => s.id === service_id);

    if (!patient || !service) {
      return NextResponse.json({ error: "Invalid patient or service for this clinic" }, { status: 404 });
    }

    const effectiveClinicId = service.clinic_id || clinicId;

    const startDate = new Date(start_time);
    const duration = service.duration_minutes || 30;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    // Business rule: Prevent overlapping appointments within THIS clinic only
    const hasOverlap = db.appointments.some((apt) => {
      const belongsToThisClinic = apt.clinic_id === effectiveClinicId || (!apt.clinic_id && effectiveClinicId === "clinic-1");
      if (!belongsToThisClinic) return false;
      if (apt.status === "cancelled") return false;

      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      const newStart = startDate.getTime();
      const newEnd = endDate.getTime();

      return newStart < aptEnd && newEnd > aptStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: "Slot conflict: An appointment already exists at this time in your clinic schedule." },
        { status: 409 }
      );
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      clinic_id: effectiveClinicId,
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
    const clinicId = body.clinic_id || getRequestClinicId(request);
    const { id, status, start_time, service_id, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الموعد مطلوب" }, { status: 400 });
    }

    const aptIndex = db.appointments.findIndex(
      (a) => a.id === id && (a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1"))
    );
    const targetApt = aptIndex !== -1 ? db.appointments[aptIndex] : db.appointments.find((a) => a.id === id);

    if (!targetApt) {
      return NextResponse.json({ error: "الموعد غير موجود في جدول عيادتك" }, { status: 404 });
    }

    const existingApt = targetApt;

    // If rescheduling (changing time or service)
    if (start_time || service_id) {
      const newService = service_id ? db.services.find((s) => s.id === service_id) : db.services.find((s) => s.id === existingApt.service_id);
      const newDuration = newService?.duration_minutes || existingApt.duration_minutes || 30;
      const newStartDate = start_time ? new Date(start_time) : new Date(existingApt.start_time);
      const newEndDate = new Date(newStartDate.getTime() + newDuration * 60000);

      // Conflict check against other appointments in THIS clinic
      const hasConflict = db.appointments.some((a) => {
        const belongsToClinic = a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1");
        if (!belongsToClinic) return false;
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
    const clinicId = getRequestClinicId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الموعد مطلوب" }, { status: 400 });
    }

    const index = db.appointments.findIndex(
      (a) => a.id === id && (a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1"))
    );
    if (index === -1) {
      return NextResponse.json({ error: "الموعد غير موجود في هذه العيادة" }, { status: 404 });
    }

    db.appointments.splice(index, 1);
    return NextResponse.json({ status: "success", message: "تم حذف الموعد بنجاح" });
  } catch {
    return NextResponse.json({ error: "فشل حذف الموعد" }, { status: 500 });
  }
}
