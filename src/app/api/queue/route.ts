import { NextResponse } from "next/server";
import { db, QueueItem, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);

  if (!db.queue) {
    db.queue = [];
  }

  const clinicQueue = db.queue.filter(
    (q) => q.clinic_id === clinicId || (!q.clinic_id && clinicId === "clinic-1")
  );

  // Stats
  const currentlyIn = clinicQueue.find((q) => q.status === "in_consultation");
  const waitingList = clinicQueue.filter((q) => q.status === "waiting");
  const nextInLine = waitingList[0] || null;
  const completedToday = clinicQueue.filter((q) => q.status === "completed").length;

  return NextResponse.json({
    data: clinicQueue,
    currentlyIn,
    nextInLine,
    waitingCount: waitingList.length,
    completedCount: completedToday,
    total: clinicQueue.length,
    clinic_id: clinicId,
  });
}

export async function POST(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const { action, queue_id, patient_id, service_name } = body;

    if (!db.queue) {
      db.queue = [];
    }

    const clinicQueue = db.queue.filter(
      (q) => q.clinic_id === clinicId || (!q.clinic_id && clinicId === "clinic-1")
    );

    // ACTION 1: CALL NEXT PATIENT IN LINE
    if (action === "call_next") {
      // Complete currently in consultation if any
      const current = clinicQueue.find((q) => q.status === "in_consultation");
      if (current) {
        current.status = "completed";
        current.completed_at = new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
      }

      // Find next waiting patient
      const next = clinicQueue.find((q) => q.status === "waiting");
      if (!next) {
        return NextResponse.json({ message: "لا يوجد مرضى في قائمة الانتظار حالياً", called: null });
      }

      next.status = "in_consultation";
      next.called_at = new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });

      return NextResponse.json({
        message: `تم استدعاء المريض رقم ${next.queue_number} (${next.patient_name})`,
        called: next,
      });
    }

    // ACTION 2: COMPLETE SPECIFIC VISIT
    if (action === "complete" && queue_id) {
      const item = clinicQueue.find((q) => q.id === queue_id);
      if (item) {
        item.status = "completed";
        item.completed_at = new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
      }
      return NextResponse.json({ status: "success", item });
    }

    // ACTION 3: ADD WALKIN PATIENT TO QUEUE
    if (action === "add_walkin" && patient_id) {
      const patient = db.patients.find(
        (p) => p.id === patient_id && (p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1"))
      );
      if (!patient) {
        return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
      }

      const nextNum = clinicQueue.length > 0 ? Math.max(...clinicQueue.map((q) => q.queue_number)) + 1 : 1;
      const clinic = db.clinics?.find((c) => c.id === clinicId) || db.clinics?.[0];

      const newQueueItem: QueueItem = {
        id: `q-${Date.now()}`,
        clinic_id: clinicId,
        queue_number: nextNum,
        patient_id,
        patient_name: patient.full_name,
        patient_phone: patient.phone,
        service_name: service_name || "كشف واستشارة طبية",
        doctor_name: clinic?.doctor_name || "الطبيب المشرف",
        status: "waiting",
        arrival_time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
      };

      db.queue.push(newQueueItem);
      return NextResponse.json(newQueueItem, { status: 201 });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "فشل تنفيذ إجراء قائمة الانتظار" }, { status: 500 });
  }
}
