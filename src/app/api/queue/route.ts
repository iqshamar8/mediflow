import { NextResponse } from "next/server";
import { db, QueueItem, Patient, Appointment, WhatsAppMessage, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);
  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  if (!db.queue) {
    db.queue = [];
  }

  // Filter queue items for this clinic and date
  const clinicQueue = db.queue.filter(
    (q) =>
      (q.clinic_id === clinicId || (!q.clinic_id && clinicId === "clinic-1")) &&
      (!q.date || q.date === targetDate)
  );

  // Fetch appointments scheduled for targetDate (only today's appointments appear in today's queue eligibility)
  const targetAppointments = (db.appointments || [])
    .filter((a) => {
      const matchClinic = a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1");
      if (!matchClinic) return false;
      if (a.status === "cancelled") return false;
      const aptDate = new Date(a.start_time).toISOString().slice(0, 10);
      return aptDate === targetDate;
    })
    .map((a) => {
      const queueMatch = clinicQueue.find((q) => q.appointment_id === a.id);
      return {
        ...a,
        is_in_queue: !!queueMatch,
        queue_number: queueMatch?.queue_number,
        queue_status: queueMatch?.status,
      };
    });

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
    targetAppointments,
    date: targetDate,
    clinic_id: clinicId,
  });
}

export async function POST(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const { action } = body;
    const today = new Date().toISOString().slice(0, 10);

    if (!db.queue) {
      db.queue = [];
    }

    const clinicQueue = db.queue.filter(
      (q) =>
        (q.clinic_id === clinicId || (!q.clinic_id && clinicId === "clinic-1")) &&
        (!q.date || q.date === today)
    );

    const clinic = db.clinics?.find((c) => c.id === clinicId) || db.clinics?.[0];

    // ACTION 1: CALL NEXT PATIENT IN LINE
    if (action === "call_next") {
      const current = clinicQueue.find((q) => q.status === "in_consultation");
      if (current) {
        current.status = "completed";
        current.completed_at = new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
      }

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
    if (action === "complete" && body.queue_id) {
      const item = clinicQueue.find((q) => q.id === body.queue_id);
      if (item) {
        item.status = "completed";
        item.completed_at = new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
      }
      return NextResponse.json({ status: "success", item });
    }

    // ACTION 3: CHECK-IN APPOINTMENT (Only allowed on appointment date)
    if (action === "checkin_appointment" && body.appointment_id) {
      const apt = (db.appointments || []).find(
        (a) => a.id === body.appointment_id && (a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1"))
      );

      if (!apt) {
        return NextResponse.json({ error: "الموعد غير موجود في سجل هذه العيادة" }, { status: 404 });
      }

      const aptDate = new Date(apt.start_time).toISOString().slice(0, 10);
      if (aptDate !== today) {
        return NextResponse.json(
          {
            error: `لا يمكن إدخال المريض في صالة الانتظار اليوم. موعد المريض مسجل بتاريخ (${aptDate}) وليس اليوم (${today}). يتم إدراج المرضى فقط في يوم موعدهم.`,
          },
          { status: 400 }
        );
      }

      // Check if already in today's queue
      const existingInQueue = clinicQueue.find(
        (q) => q.appointment_id === apt.id && q.status !== "cancelled"
      );
      if (existingInQueue) {
        return NextResponse.json(
          { error: `المريض مسجل مسبقاً في قائمة انتظار اليوم ويحمل رقم الدور #${existingInQueue.queue_number}` },
          { status: 400 }
        );
      }

      const nextNum = clinicQueue.length > 0 ? Math.max(...clinicQueue.map((q) => q.queue_number)) + 1 : 1;

      const newQueueItem: QueueItem = {
        id: `q-${Date.now()}`,
        clinic_id: clinicId,
        queue_number: nextNum,
        appointment_id: apt.id,
        patient_id: apt.patient_id,
        patient_name: apt.patient_name || "مريض",
        patient_phone: apt.patient_phone || "",
        service_name: apt.service_name || "كشف واستشارة طبية",
        doctor_name: clinic?.doctor_name || "الطبيب المشرف",
        status: "waiting",
        arrival_time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
        date: today,
        is_walk_in: false,
        priority: "normal",
      };

      db.queue.push(newQueueItem);
      apt.status = "confirmed";

      return NextResponse.json(newQueueItem, { status: 201 });
    }

    // ACTION 4: ADD WALKIN PATIENT (Direct clinic visit without online booking)
    if (action === "add_walkin") {
      const nextNum = clinicQueue.length > 0 ? Math.max(...clinicQueue.map((q) => q.queue_number)) + 1 : 1;
      let patientId = body.patient_id;
      let patientName = "";
      let patientPhone = "";

      // Sub-case 4A: Brand new walk-in patient (registered directly on arrival)
      if (body.is_new_patient || (!patientId && body.full_name)) {
        if (!body.full_name || !body.phone) {
          return NextResponse.json({ error: "اسم المريض ورقم الهاتف مطلوبان للتسجيل الفوري" }, { status: 400 });
        }

        const newPatient: Patient = {
          id: `pat-${Date.now()}`,
          clinic_id: clinicId,
          patient_number: `P-${1000 + db.patients.length + 1}`,
          full_name: body.full_name.trim(),
          phone: body.phone.trim(),
          email: body.email || "",
          gender: body.gender || "male",
          date_of_birth: body.date_of_birth || "1995-01-01",
          preferred_language: "ar",
          whatsapp_consent: true,
          admin_notes: body.notes ? `حالة مباشرة (Walk-in): ${body.notes}` : "حالة مباشرة بالعيادة",
          created_at: new Date().toISOString(),
        };

        db.patients.push(newPatient);
        patientId = newPatient.id;
        patientName = newPatient.full_name;
        patientPhone = newPatient.phone;
      } else {
        // Sub-case 4B: Existing patient in database
        const existingPatient = db.patients.find(
          (p) => p.id === patientId && (p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1"))
        );
        if (!existingPatient) {
          return NextResponse.json({ error: "المريض غير موجود في هذه العيادة" }, { status: 404 });
        }
        patientName = existingPatient.full_name;
        patientPhone = existingPatient.phone;
      }

      // Record a walk-in appointment in clinic schedule for auditing
      const nowIso = new Date().toISOString();
      const serviceName = body.service_name || "كشف واستشارة طبية مباشرة";
      const walkinApt: Appointment = {
        id: `apt-walkin-${Date.now()}`,
        clinic_id: clinicId,
        patient_id: patientId,
        patient_name: patientName,
        patient_phone: patientPhone,
        service_id: body.service_id || "srv-001",
        service_name: serviceName,
        start_time: nowIso,
        end_time: new Date(Date.now() + 1800000).toISOString(),
        duration_minutes: 30,
        status: "confirmed",
        booking_source: "walk_in",
        notes: body.notes ? `زيارة مباشرة: ${body.notes}` : "حالة مباشرة بدون حجز مسبق",
      };
      db.appointments.push(walkinApt);

      const newQueueItem: QueueItem = {
        id: `q-${Date.now()}`,
        clinic_id: clinicId,
        queue_number: nextNum,
        appointment_id: walkinApt.id,
        patient_id: patientId,
        patient_name: patientName,
        patient_phone: patientPhone,
        service_name: serviceName,
        doctor_name: clinic?.doctor_name || "الطبيب المشرف",
        status: "waiting",
        arrival_time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
        date: today,
        is_walk_in: true,
        priority: body.priority === "urgent" ? "urgent" : "normal",
        notes: body.notes || "",
      };

      db.queue.push(newQueueItem);

      // Optional WhatsApp Ticket Dispatch
      if (body.send_whatsapp && patientPhone) {
        const waMsg: WhatsAppMessage = {
          id: `msg-ticket-${Date.now()}`,
          clinic_id: clinicId,
          direction: "outbound",
          sender_phone: clinic?.phone || "+9647700000001",
          receiver_phone: patientPhone,
          content:
            `🎫 *تذكرة دور - صالة الانتظار*\n` +
            `🏥 ${clinic?.name || "العيادة الطبية"}\n\n` +
            `👤 المريض: ${patientName}\n` +
            `🔢 رقم الدور: *#${newQueueItem.queue_number}*\n` +
            `🩺 الخدمة: ${serviceName}\n` +
            `⏰ وقت الوصول: ${newQueueItem.arrival_time}\n\n` +
            `يرجى التواجد في صالة الانتظار، وسيتم الإعلان عن رقمك عبر الشاشة والنظام الصوتي تلقائياً. 🩺`,
          status: "delivered",
          created_at: new Date().toISOString(),
        };
        db.messages.push(waMsg);
      }

      return NextResponse.json(newQueueItem, { status: 201 });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "فشل تنفيذ إجراء قائمة الانتظار" }, { status: 500 });
  }
}
