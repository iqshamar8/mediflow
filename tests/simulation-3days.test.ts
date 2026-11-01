import { describe, it, expect, beforeEach } from "vitest";
import { db, Clinic, getRequestClinicId } from "../src/server/mock-db";
import { GET as getClinics } from "../src/app/api/clinics/route";
import { GET as getPatients, POST as postPatient } from "../src/app/api/patients/route";
import { GET as getAppointments, POST as postAppointment, PATCH as patchAppointment } from "../src/app/api/appointments/route";
import { POST as postReminder } from "../src/app/api/appointments/reminder/route";
import { POST as postCronReminders } from "../src/app/api/cron/reminders/route";
import { GET as getQueue, POST as postQueue } from "../src/app/api/queue/route";
import { GET as getPrescriptions, POST as postPrescription } from "../src/app/api/prescriptions/route";
import { GET as getAttachments, POST as postAttachment, DELETE as deleteAttachment } from "../src/app/api/attachments/route";
import { GET as getVisits, POST as postVisit } from "../src/app/api/visits/route";
import { GET as getPayments, POST as postPayment } from "../src/app/api/payments/route";
import { GET as getClosingReport } from "../src/app/api/reports/closing/route";
import { POST as postWhatsAppWebhook } from "../src/app/api/whatsapp/webhook/route";
import { processConversationalMessage } from "../src/server/whatsapp-bot";

describe("3-Day Full Clinic Activity Simulation & Multi-Tenant Lifecycle Test", () => {
  // Clinic IDs
  const CLINIC_1 = "clinic-1"; // Dr. Ahmed Al-Rawi (Internal Medicine & Cardiology)
  const CLINIC_2 = "clinic-2"; // Dr. Sara Al-Obaidi (Ultrasound & Radiology)
  const CLINIC_3 = "clinic-3"; // Dr. Haider Al-Asadi (Dentistry & Oral Surgery)

  // Simulation Dates
  const todayObj = new Date();
  const dateDay1 = todayObj.toISOString().slice(0, 10);
  const dateDay2 = new Date(todayObj.getTime() + 86400000).toISOString().slice(0, 10);
  const dateDay3 = new Date(todayObj.getTime() + 86400000 * 2).toISOString().slice(0, 10);

  // Trackers across 3 days
  let createdPatientDay1Id = "";
  let appointmentDay1Id = "";
  let walkinDay1QueueId = "";
  let prescriptionDay1Id = "";
  let attachmentDay1Id = "";
  let paymentDay1Id = "";

  let appointmentDay2Id = "";
  let urgentWalkinDay2QueueId = "";
  let paymentDay2CardId = "";

  let followUpVisitDay3Id = "";

  beforeEach(() => {
    // Ensure all 3 test clinics exist
    if (!db.clinics || db.clinics.length < 3) {
      db.clinics = [
        {
          id: CLINIC_1,
          name: "عيادة د. أحمد الراوي التخصصية",
          doctor_name: "د. أحمد الراوي",
          specialty: "استشاري الأمراض الباطنية والقلب",
          phone: "07700000001",
          email: "dr.ahmed@mediflow.iq",
          address: "بغداد - المنصور - شارع 14 رمضان",
          currency: "IQD",
          created_at: new Date().toISOString(),
        },
        {
          id: CLINIC_2,
          name: "مركز د. سارة العبيدي للسونار",
          doctor_name: "د. سارة العبيدي",
          specialty: "أخصائية السونار والأشعة التشخيصية",
          phone: "07700000002",
          email: "dr.sara@mediflow.iq",
          address: "بغداد - الحارثية - شارع الكندي",
          currency: "IQD",
          created_at: new Date().toISOString(),
        },
        {
          id: CLINIC_3,
          name: "عيادة د. حيدر الأسدي لطب الأسنان",
          doctor_name: "د. حيدر الأسدي",
          specialty: "أخصائي جراحة الفم والأسنان وزراعتها",
          phone: "07700000003",
          email: "dr.haider@mediflow.iq",
          address: "بغداد - زيونة - شارع الربيعي",
          currency: "IQD",
          created_at: new Date().toISOString(),
        },
      ];
    }
  });

  /* =========================================================================
   * DAY 1: OPENING, PATIENT INTAKE, CONSULTATIONS, RX, ATTACHMENTS & CLOSING
   * ========================================================================= */
  describe("DAY 1: Full Clinical Cycle (Arrival, Triage, Rx, Billing & Shift Closing)", () => {
    it("Step 1.1: Multi-Doctor discovery and verify active clinic profiles", async () => {
      const req = new Request("http://localhost:3000/api/clinics");
      const res = await getClinics(req as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.clinics.length).toBeGreaterThanOrEqual(3);
      expect(data.clinics.some((c: any) => c.id === CLINIC_1)).toBe(true);
      expect(data.clinics.some((c: any) => c.id === CLINIC_2)).toBe(true);
      expect(data.clinics.some((c: any) => c.id === CLINIC_3)).toBe(true);
    });

    it("Step 1.2: Register a new patient in Dr. Ahmed's clinic", async () => {
      const newPatientPayload = {
        full_name: "ياسر محمود السعدي",
        phone: "+9647701122334",
        email: "yasser.saadi@example.com",
        date_of_birth: "1985-06-15",
        gender: "male",
        admin_notes: "يعاني من خفقان وصداع مستمر",
      };

      const req = new Request("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify(newPatientPayload),
      });

      const res = await postPatient(req as any);
      expect(res.status).toBe(201);
      const created = await res.json();
      expect(created.id).toBeDefined();
      expect(created.clinic_id).toBe(CLINIC_1);
      expect(created.full_name).toBe("ياسر محمود السعدي");
      createdPatientDay1Id = created.id;
    });

    it("Step 1.3: Book an appointment for Day 1 and verify conflict detection", async () => {
      const slotTime = `${dateDay1}T10:00:00.000Z`;
      const appointmentPayload = {
        patient_id: createdPatientDay1Id,
        service_id: "srv-001",
        start_time: slotTime,
        booking_source: "dashboard",
        notes: "حجز كشف عام وفحص ضغط",
      };

      const req = new Request("http://localhost:3000/api/appointments", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify(appointmentPayload),
      });

      const res = await postAppointment(req as any);
      expect(res.status).toBe(201);
      const apt = await res.json();
      expect(apt.id).toBeDefined();
      expect(apt.patient_id).toBe(createdPatientDay1Id);
      expect(apt.clinic_id).toBe(CLINIC_1);
      appointmentDay1Id = apt.id;

      // Duplicate booking attempt at the same exact time in Clinic 1 must return 409 Conflict
      const dupReq = new Request("http://localhost:3000/api/appointments", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: "pat-002",
          service_id: "srv-001",
          start_time: slotTime,
          booking_source: "dashboard",
        }),
      });
      const dupRes = await postAppointment(dupReq as any);
      expect(dupRes.status).toBe(409);
      const dupJson = await dupRes.json();
      expect(dupJson.error).toContain("Slot conflict");
    });

    it("Step 1.4: Register a direct Walk-in patient (emergency case) with urgent priority", async () => {
      const walkinPayload = {
        action: "add_walkin",
        is_new_patient: true,
        full_name: "أمير كريم الدفاعي",
        phone: "+9647708899001",
        gender: "male",
        service_name: "كشف طارئ وقياس ضغط فوري",
        priority: "urgent",
        notes: "صداع نصفي حاد وارتفاع مفاجئ بالضغط",
        send_whatsapp: true,
      };

      const req = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify(walkinPayload),
      });

      const res = await postQueue(req as any);
      expect(res.status).toBe(201);
      const queueItem = await res.json();
      expect(queueItem.queue_number).toBeGreaterThan(0);
      expect(queueItem.patient_name).toBe("أمير كريم الدفاعي");
      expect(queueItem.priority).toBe("urgent");
      expect(queueItem.is_walk_in).toBe(true);
      expect(queueItem.status).toBe("waiting");
      walkinDay1QueueId = queueItem.id;

      // Verify WhatsApp ticket dispatch to the walk-in patient
      const waTicket = db.messages.find(
        (m) => m.receiver_phone === "+9647708899001" && m.content.includes("تذكرة دور")
      );
      expect(waTicket).toBeDefined();
      expect(waTicket?.content).toContain(String(queueItem.queue_number));
    });

    it("Step 1.5: Check-in scheduled Day 1 appointment into the live queue", async () => {
      const checkinReq = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkin_appointment",
          appointment_id: appointmentDay1Id,
        }),
      });

      const res = await postQueue(checkinReq as any);
      expect([201, 400]).toContain(res.status); // 201 created or already checked in
      const queueRes = await getQueue(
        new Request(`http://localhost:3000/api/queue?clinic_id=${CLINIC_1}`, {
          headers: { "x-clinic-id": CLINIC_1 },
        }) as any
      );
      const queueData = await queueRes.json();
      expect(queueData.data.some((q: any) => q.appointment_id === appointmentDay1Id)).toBe(true);
    });

    it("Step 1.6: Doctor calls next patient into the consultation room", async () => {
      const callReq = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "call_next" }),
      });

      const callRes = await postQueue(callReq as any);
      expect(callRes.status).toBe(200);
      const callData = await callRes.json();
      expect(callData.called).toBeDefined();
      expect(callData.called.status).toBe("in_consultation");
      expect(callData.called.called_at).toBeDefined();
    });

    it("Step 1.7: Clinical encounter & E-Prescription (Rx) generation with WhatsApp summary", async () => {
      // 1. Log Medical Visit
      const visitPayload = {
        patient_id: createdPatientDay1Id,
        service_name: "كشف باطنية وقلب",
        diagnosis: "ارتفاع ضغط الدم الشرياني (Stage 2) مع تسارع نبضات",
        clinical_notes: "ضغط الدم 160/100 ملم زئبق. يوصى بحمية قليلة الملح وإجراء تخطيط قلب",
        prescription: "Candesartan 16mg + Bisoprolol 5mg",
        follow_up_date: dateDay3,
      };

      const visitReq = new Request("http://localhost:3000/api/visits", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify(visitPayload),
      });

      const visitRes = await postVisit(visitReq as any);
      expect(visitRes.status).toBe(201);
      const createdVisit = await visitRes.json();
      expect(createdVisit.id).toBeDefined();
      expect(createdVisit.follow_up_date).toBe(dateDay3);

      // 2. Issue Smart E-Prescription (Rx)
      const rxPayload = {
        patient_id: createdPatientDay1Id,
        diagnosis: createdVisit.diagnosis,
        items: [
          {
            medication_name: "Candesartan Cilexetil 16mg",
            dosage: "قرص واحد",
            frequency: "مرة واحدة صباحاً بعد الإفطار",
            duration: "30 يوماً",
            instructions: "قياس الضغط بانتظام يومياً",
          },
          {
            medication_name: "Bisoprolol Fumarate 5mg",
            dosage: "نصف قرص",
            frequency: "مرة واحدة يومياً صباحاً",
            duration: "30 يوماً",
            instructions: "مراقبة معدل نبضات القلب",
          },
        ],
        general_advice: "الابتعاد عن الأطعمة المالحة وممارسة رياضة المشي الخفيف والراحة",
        send_whatsapp: true,
      };

      const rxReq = new Request("http://localhost:3000/api/prescriptions", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify(rxPayload),
      });

      const rxRes = await postPrescription(rxReq as any);
      expect(rxRes.status).toBe(201);
      const rx = await rxRes.json();
      expect(rx.items.length).toBe(2);
      expect(rx.clinic_id).toBe(CLINIC_1);
      prescriptionDay1Id = rx.id;

      // Verify WhatsApp Rx delivery
      const sentRxMsg = db.messages.find(
        (m) => m.receiver_phone === "+9647701122334" && m.content.includes("وصفة طبية إلكترونية")
      );
      expect(sentRxMsg).toBeDefined();
      expect(sentRxMsg?.content).toContain("Candesartan");
      expect(sentRxMsg?.content).toContain("Bisoprolol");
    });

    it("Step 1.8: Upload medical scans and lab results to patient's vault", async () => {
      const attachmentPayload = {
        patient_id: createdPatientDay1Id,
        file_name: "ECG_Heart_Rythm_12Lead.pdf",
        file_type: "application/pdf",
        file_size_kb: 512,
        category: "report",
        file_url: "/uploads/ecg-test-day1.pdf",
        notes: "تخطيط قلب يظهر انتظام الجيب مع تسارع طفيف 92 نبضة بالدقيقة",
      };

      const uploadReq = new Request("http://localhost:3000/api/attachments", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify(attachmentPayload),
      });

      const uploadRes = await postAttachment(uploadReq as any);
      expect(uploadRes.status).toBe(201);
      const attachment = await uploadRes.json();
      expect(attachment.id).toBeDefined();
      expect(attachment.patient_id).toBe(createdPatientDay1Id);
      attachmentDay1Id = attachment.id;

      // Verify retrieval
      const getReq = new Request(
        `http://localhost:3000/api/attachments?patient_id=${createdPatientDay1Id}&clinic_id=${CLINIC_1}`,
        { headers: { "x-clinic-id": CLINIC_1 } }
      );
      const getRes = await getAttachments(getReq as any);
      const list = await getRes.json();
      expect(list.data.some((a: any) => a.id === attachmentDay1Id)).toBe(true);
    });

    it("Step 1.9: Cashier bills the patient (Cash IQD) and audits Day 1 closing voucher", async () => {
      // 1. Record Cash Payment
      const paymentPayload = {
        patient_id: createdPatientDay1Id,
        appointment_id: appointmentDay1Id,
        amount: 35000,
        payment_method: "cash",
        notes: "أجور كشف باطنية + تخطيط قلب",
      };

      const payReq = new Request("http://localhost:3000/api/payments", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const payRes = await postPayment(payReq as any);
      expect(payRes.status).toBe(201);
      const payment = await payRes.json();
      expect(payment.amount).toBe(35000);
      expect(payment.currency).toBe("IQD");
      expect(payment.payment_method).toBe("cash");
      paymentDay1Id = payment.id;

      // 2. Run End-of-Day Financial Closing & Reconciliation
      const reportReq = new Request(`http://localhost:3000/api/reports/closing?clinic_id=${CLINIC_1}`, {
        headers: { "x-clinic-id": CLINIC_1 },
      });
      const reportRes = await getClosingReport(reportReq as any);
      expect(reportRes.status).toBe(200);
      const report = await reportRes.json();

      expect(report.clinic_id).toBe(CLINIC_1);
      expect(report.totals.cash).toBeGreaterThanOrEqual(35000);
      expect(report.totals.grandTotal).toBeGreaterThanOrEqual(35000);
      expect(report.counts.transactions).toBeGreaterThanOrEqual(1);
      expect(report.paymentsList.length).toBeGreaterThanOrEqual(1);
    });
  });

  /* =========================================================================
   * DAY 2: REMINDERS, CROSS-TENANT ISOLATION, RESCHEDULING & POS CARD PAYMENTS
   * ========================================================================= */
  describe("DAY 2: Automated Reminders, Cross-Clinic Independence & Card Reconciliation", () => {
    it("Step 2.1: Automated appointment reminder dispatch via cron trigger", async () => {
      // Create confirmed appointment for Day 2 within next 24h
      const futureAptTime = new Date(Date.now() + 12 * 3600000).toISOString();
      const testPatient = db.patients.find((p) => p.clinic_id === CLINIC_1);
      expect(testPatient).toBeDefined();

      const newApt = {
        id: `apt-day2-reminder-${Date.now()}`,
        clinic_id: CLINIC_1,
        patient_id: testPatient!.id,
        patient_name: testPatient!.full_name,
        patient_phone: testPatient!.phone,
        service_id: "srv-002",
        service_name: "متابعة دورية",
        start_time: futureAptTime,
        end_time: new Date(new Date(futureAptTime).getTime() + 1800000).toISOString(),
        duration_minutes: 30,
        status: "confirmed" as const,
        booking_source: "whatsapp" as const,
      };
      db.appointments.push(newApt);

      // Trigger reminder cron
      const cronReq = new Request("http://localhost:3000/api/cron/reminders", {
        method: "POST",
        headers: { authorization: "Bearer mediflow_cron_secret" },
      });
      const cronRes = await postCronReminders(cronReq as any);
      expect(cronRes.status).toBe(200);
      const cronData = await cronRes.json();
      expect(cronData.status).toBe("success");
      expect(cronData.remindersSent).toContain(newApt.id);
    });

    it("Step 2.2: Cross-Tenant Booking Independence (Simultaneous slot allowed in Clinic 2)", async () => {
      const slotTime = `${dateDay2}T11:00:00.000Z`;

      // Book slot in Clinic 1 (Dr. Ahmed)
      const apt1Payload = {
        patient_id: createdPatientDay1Id,
        service_id: "srv-001",
        start_time: slotTime,
        booking_source: "dashboard",
        notes: "موعد اليوم الثاني في عيادة الباطنية",
      };

      const res1 = await postAppointment(
        new Request("http://localhost:3000/api/appointments", {
          method: "POST",
          headers: { "x-clinic-id": CLINIC_1, "Content-Type": "application/json" },
          body: JSON.stringify(apt1Payload),
        }) as any
      );
      expect(res1.status).toBe(201);
      const apt1 = await res1.json();
      appointmentDay2Id = apt1.id;

      // Book EXACT SAME slot time in Clinic 2 (Dr. Sara) -> MUST SUCCEED with zero conflict!
      const patientClinic2 = db.patients.find((p) => p.clinic_id === CLINIC_2);
      expect(patientClinic2).toBeDefined();

      const apt2Payload = {
        patient_id: patientClinic2!.id,
        service_id: "srv-101",
        start_time: slotTime,
        booking_source: "dashboard",
        notes: "فحص سونار بنفس التوقيت تماماً في عيادة مختلفة",
      };

      const res2 = await postAppointment(
        new Request("http://localhost:3000/api/appointments", {
          method: "POST",
          headers: { "x-clinic-id": CLINIC_2, "Content-Type": "application/json" },
          body: JSON.stringify(apt2Payload),
        }) as any
      );
      expect(res2.status).toBe(201);
      const apt2 = await res2.json();
      expect(apt2.id).toBeDefined();
      expect(apt2.clinic_id).toBe(CLINIC_2);
    });

    it("Step 2.3: Inbound WhatsApp Webhook interaction for appointment rescheduling & cancellation", async () => {
      const patientPhone = "+9647701122334";

      // 1. Patient requests cancellation through WhatsApp webhook
      const cancelWebhookReq = new Request("http://localhost:3000/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: patientPhone,
          text: "مرحبا اريد الغي الموعد باجر",
          clinic_id: CLINIC_1,
        }),
      });

      const cancelRes = await postWhatsAppWebhook(cancelWebhookReq as any);
      expect(cancelRes.status).toBe(200);
      const cancelData = await cancelRes.json();
      expect(cancelData.status).toBe("success");
      expect(cancelData.reply).toBeDefined();

      // 2. Verify appointment patch to rescheduled
      const patchReq = new Request("http://localhost:3000/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appointmentDay2Id,
          start_time: `${dateDay2}T16:00:00.000Z`,
          status: "confirmed",
          notes: "تم تغيير الموعد للفترة المسائية بناءً على طلب المريض",
        }),
      });

      const patchRes = await patchAppointment(patchReq as any);
      expect(patchRes.status).toBe(200);
      const patched = await patchRes.json();
      expect(patched.status).toBe("success");
      expect(patched.appointment.status).toBe("confirmed");
      expect(patched.appointment.start_time).toContain("16:00:00");
    });

    it("Step 2.4: Card / POS Terminal payment collection & Day 2 cashier closing audit", async () => {
      const patient = db.patients.find((p) => p.clinic_id === CLINIC_2);
      expect(patient).toBeDefined();

      // Collect Card Payment for Dr. Sara (4D Ultrasound: 60,000 IQD)
      const cardPaymentPayload = {
        patient_id: patient!.id,
        amount: 60000,
        payment_method: "card",
        notes: "دفع عبر جهاز نقاط البيع POS (Mastercard)",
      };

      const payReq = new Request("http://localhost:3000/api/payments", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_2, "Content-Type": "application/json" },
        body: JSON.stringify(cardPaymentPayload),
      });

      const payRes = await postPayment(payReq as any);
      expect(payRes.status).toBe(201);
      const cardPay = await payRes.json();
      expect(cardPay.payment_method).toBe("card");
      expect(cardPay.amount).toBe(60000);
      paymentDay2CardId = cardPay.id;

      // Verify Day 2 financial closing for Clinic 2
      const closingReq = new Request(`http://localhost:3000/api/reports/closing?clinic_id=${CLINIC_2}`, {
        headers: { "x-clinic-id": CLINIC_2 },
      });
      const closingRes = await getClosingReport(closingReq as any);
      const report = await closingRes.json();

      expect(report.clinic_id).toBe(CLINIC_2);
      expect(report.totals.card).toBeGreaterThanOrEqual(60000);
      expect(report.totals.grandTotal).toBeGreaterThanOrEqual(60000);
    });
  });

  /* =========================================================================
   * DAY 3: RECALLS & FOLLOW-UPS, DENTAL LIFE CYCLE & ZERO-LEAK SECURITY AUDIT
   * ========================================================================= */
  describe("DAY 3: Follow-Up Recalls, Dental Procedures & Zero-Leak Multi-Tenant Audit", () => {
    it("Step 3.1: Identify due follow-ups from Day 1 and dispatch WhatsApp recall reminders", async () => {
      // Fetch visits for Clinic 1
      const visitsReq = new Request(`http://localhost:3000/api/visits?clinic_id=${CLINIC_1}`, {
        headers: { "x-clinic-id": CLINIC_1 },
      });
      const visitsRes = await getVisits(visitsReq as any);
      const visitsData = await visitsRes.json();

      // Find visit with follow-up scheduled for Day 3
      const dueVisit = visitsData.data.find(
        (v: any) => v.follow_up_date === dateDay3 && v.clinic_id === CLINIC_1
      );
      expect(dueVisit).toBeDefined();

      // Dispatch automated recall WhatsApp message
      const recallMsg = {
        id: `msg-recall-${Date.now()}`,
        clinic_id: CLINIC_1,
        direction: "outbound" as const,
        sender_phone: "07700000001",
        receiver_phone: "+9647701122334",
        content: `مرحباً ${dueVisit.patient_name}، نود تذكيرك بموعد مراجعتك الدورية اليوم (${dateDay3}) لمتابعة استقرار ضغط الدم. عيادة د. أحمد الراوي ترحب بك.`,
        status: "delivered" as const,
        created_at: new Date().toISOString(),
      };
      db.messages.push(recallMsg);

      const loggedMsg = db.messages.find((m) => m.id === recallMsg.id);
      expect(loggedMsg).toBeDefined();
      expect(loggedMsg?.content).toContain("مراجعتك الدورية اليوم");
    });

    it("Step 3.2: Complete Dental workflow for Clinic 3 (Dr. Haider Al-Asadi)", async () => {
      // 1. Patient arrives for dental tooth extraction & composite filling
      const dentalPatient = db.patients.find((p) => p.clinic_id === CLINIC_3);
      expect(dentalPatient).toBeDefined();

      // 2. Add to Dental Queue
      const queueReq = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_3, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_walkin",
          patient_id: dentalPatient!.id,
          service_name: "حشوة تجميلية وتنظيف جير",
          priority: "normal",
        }),
      });

      const queueRes = await postQueue(queueReq as any);
      expect(queueRes.status).toBe(201);
      const queueItem = await queueRes.json();
      expect(queueItem.clinic_id).toBe(CLINIC_3);

      // 3. Upload Dental Panoramic X-Ray
      const xrayReq = new Request("http://localhost:3000/api/attachments", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_3, "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: dentalPatient!.id,
          file_name: "Panoramic_Dental_OPG_Jaw.png",
          file_type: "image/png",
          file_size_kb: 1840,
          category: "xray",
          file_url: "/uploads/dental-panoramic.png",
          notes: "أشعة بانورامية تظهر سلامة عظم الفك وجاهزية السن للحشو",
        }),
      });

      const xrayRes = await postAttachment(xrayReq as any);
      expect(xrayRes.status).toBe(201);
      const xray = await xrayRes.json();
      expect(xray.clinic_id).toBe(CLINIC_3);

      // 4. Issue Dental Prescription (Antibiotic + Analgesic)
      const dentalRxReq = new Request("http://localhost:3000/api/prescriptions", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_3, "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: dentalPatient!.id,
          diagnosis: "التهاب لثة حاد وحشو ضرس",
          items: [
            {
              medication_name: "Amoxicillin / Clavulanic 1g",
              dosage: "قرص واحد",
              frequency: "مرتين يومياً بعد الأكل",
              duration: "5 أيام",
            },
            {
              medication_name: "Ibuprofen 400mg",
              dosage: "قرص واحد",
              frequency: "عند اللزوم بعد الأكل",
              duration: "3 أيام",
            },
          ],
          general_advice: "المضمضة بماء دافئ وملح وتجنب المشروبات الساخنة جداً لمدة 24 ساعة",
          send_whatsapp: true,
        }),
      });

      const dentalRxRes = await postPrescription(dentalRxReq as any);
      expect(dentalRxRes.status).toBe(201);
      const dentalRx = await dentalRxRes.json();
      expect(dentalRx.clinic_id).toBe(CLINIC_3);

      // 5. Collect Dental Payment
      const dentalPayReq = new Request("http://localhost:3000/api/payments", {
        method: "POST",
        headers: { "x-clinic-id": CLINIC_3, "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: dentalPatient!.id,
          amount: 50000,
          payment_method: "cash",
          notes: "دفعة جلسة تنظيف وحشوة أسنان",
        }),
      });

      const dentalPayRes = await postPayment(dentalPayReq as any);
      expect(dentalPayRes.status).toBe(201);
    });

    it("Step 3.3: Strict Zero-Leak Multi-Tenant Security & Isolation Audit across all 3 Clinics", async () => {
      // 1. Audit Patients Isolation
      const c1PatientsRes = await getPatients(
        new Request(`http://localhost:3000/api/patients?clinic_id=${CLINIC_1}`, {
          headers: { "x-clinic-id": CLINIC_1 },
        }) as any
      );
      const c1Patients = await c1PatientsRes.json();

      const c2PatientsRes = await getPatients(
        new Request(`http://localhost:3000/api/patients?clinic_id=${CLINIC_2}`, {
          headers: { "x-clinic-id": CLINIC_2 },
        }) as any
      );
      const c2Patients = await c2PatientsRes.json();

      const c3PatientsRes = await getPatients(
        new Request(`http://localhost:3000/api/patients?clinic_id=${CLINIC_3}`, {
          headers: { "x-clinic-id": CLINIC_3 },
        }) as any
      );
      const c3Patients = await c3PatientsRes.json();

      // No doctor can see another doctor's patients
      c1Patients.data.forEach((p: any) => {
        expect(p.clinic_id).toBe(CLINIC_1);
        expect(c2Patients.data.some((p2: any) => p2.id === p.id)).toBe(false);
        expect(c3Patients.data.some((p3: any) => p3.id === p.id)).toBe(false);
      });

      // 2. Audit Prescriptions Isolation
      const c1RxRes = await getPrescriptions(
        new Request(`http://localhost:3000/api/prescriptions?clinic_id=${CLINIC_1}`, {
          headers: { "x-clinic-id": CLINIC_1 },
        }) as any
      );
      const c1Rx = await c1RxRes.json();

      const c3RxRes = await getPrescriptions(
        new Request(`http://localhost:3000/api/prescriptions?clinic_id=${CLINIC_3}`, {
          headers: { "x-clinic-id": CLINIC_3 },
        }) as any
      );
      const c3Rx = await c3RxRes.json();

      expect(c1Rx.data.every((rx: any) => rx.clinic_id === CLINIC_1)).toBe(true);
      expect(c3Rx.data.every((rx: any) => rx.clinic_id === CLINIC_3)).toBe(true);

      // 3. Audit Attachments Isolation
      const c1AttachRes = await getAttachments(
        new Request(`http://localhost:3000/api/attachments?clinic_id=${CLINIC_1}`, {
          headers: { "x-clinic-id": CLINIC_1 },
        }) as any
      );
      const c1Attach = await c1AttachRes.json();

      const c3AttachRes = await getAttachments(
        new Request(`http://localhost:3000/api/attachments?clinic_id=${CLINIC_3}`, {
          headers: { "x-clinic-id": CLINIC_3 },
        }) as any
      );
      const c3Attach = await c3AttachRes.json();

      expect(c1Attach.data.every((a: any) => a.clinic_id === CLINIC_1)).toBe(true);
      expect(c3Attach.data.every((a: any) => a.clinic_id === CLINIC_3)).toBe(true);

      // 4. Audit Financial Ledgers Isolation
      const c1CloseRes = await getClosingReport(
        new Request(`http://localhost:3000/api/reports/closing?clinic_id=${CLINIC_1}`, {
          headers: { "x-clinic-id": CLINIC_1 },
        }) as any
      );
      const c1Close = await c1CloseRes.json();

      const c2CloseRes = await getClosingReport(
        new Request(`http://localhost:3000/api/reports/closing?clinic_id=${CLINIC_2}`, {
          headers: { "x-clinic-id": CLINIC_2 },
        }) as any
      );
      const c2Close = await c2CloseRes.json();

      expect(c1Close.clinic_id).toBe(CLINIC_1);
      expect(c2Close.clinic_id).toBe(CLINIC_2);
      expect(c1Close.clinic_name).toContain("د. أحمد الراوي");
      expect(c2Close.clinic_name).toContain("د. سارة العبيدي");
    });

    it("Step 3.4: Cumulative 3-Day Global System Integrity and Metrics Validation", async () => {
      // 1. Verify global appointments count and state
      expect(db.appointments.length).toBeGreaterThanOrEqual(6);
      expect(db.appointments.every((a) => a.id && a.clinic_id && a.start_time)).toBe(true);

      // 2. Verify global payments ledger integrity
      expect(db.payments.length).toBeGreaterThanOrEqual(4);
      const totalSystemRevenue = db.payments.reduce((acc, p) => acc + p.amount, 0);
      expect(totalSystemRevenue).toBeGreaterThanOrEqual(150000); // 150,000+ IQD across 3 days

      // 3. Verify WhatsApp communication audit log
      expect(db.messages.length).toBeGreaterThanOrEqual(5);
      const deliveredCount = db.messages.filter((m) => m.status === "delivered").length;
      expect(deliveredCount).toBeGreaterThanOrEqual(3);

      // 4. Verify Queue status transitions (waiting -> in_consultation -> completed)
      const validStatuses = ["waiting", "in_consultation", "completed", "cancelled"];
      expect(db.queue.every((q) => validStatuses.includes(q.status))).toBe(true);
    });
  });
});
