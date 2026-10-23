import { describe, it, expect } from "vitest";
import { db } from "../src/server/mock-db";
import { GET as getPrescriptions, POST as postPrescription } from "../src/app/api/prescriptions/route";
import { GET as getQueue, POST as postQueue } from "../src/app/api/queue/route";
import { GET as getAttachments, POST as postAttachment, DELETE as deleteAttachment } from "../src/app/api/attachments/route";
import { GET as getClosingReport } from "../src/app/api/reports/closing/route";

describe("Clinical Suite Engine & Multi-Tenant Isolation", () => {
  describe("1. E-Prescriptions & Medication Management", () => {
    it("should retrieve prescriptions filtered by clinic_id", async () => {
      const req = new Request("http://localhost:3000/api/prescriptions", {
        headers: { "x-clinic-id": "clinic-1" },
      });
      const res = await getPrescriptions(req as any);
      const json = await res.json();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.clinic_id).toBe("clinic-1");
      expect(json.data.every((rx: any) => rx.clinic_id === "clinic-1")).toBe(true);
    });

    it("should create a new prescription and generate formatted WhatsApp Rx text", async () => {
      const patient = db.patients.find((p) => p.clinic_id === "clinic-1");
      expect(patient).toBeDefined();

      const newRx = {
        patient_id: patient!.id,
        diagnosis: "التهاب البلعوم الحاد مع حمى خفيفة",
        items: [
          {
            medication_name: "Amoxicillin / Clavulanic Acid 1g",
            dosage: "قرص واحد",
            frequency: "مرتين يومياً بعد الأكل",
            duration: "7 أيام",
            instructions: "إكمال الكورس العلاجي بالكامل",
          },
        ],
        general_advice: "شرب سوائل دافئة والراحة التامة",
        send_whatsapp: true,
      };

      const req = new Request("http://localhost:3000/api/prescriptions", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-1", "Content-Type": "application/json" },
        body: JSON.stringify(newRx),
      });

      const res = await postPrescription(req as any);
      const created = await res.json();

      expect(created.id).toBeDefined();
      expect(created.clinic_id).toBe("clinic-1");
      expect(created.items.length).toBe(1);

      // Verify that the WhatsApp message was dispatched to the mock WhatsApp DB
      const sentMsg = db.messages.find(
        (m) => m.receiver_phone === patient!.phone && m.content.includes("وصفة طبية إلكترونية")
      );
      expect(sentMsg).toBeDefined();
      expect(sentMsg?.content).toContain("Amoxicillin");
    });
  });

  describe("2. Live Waiting Room Queue Management", () => {
    it("should fetch queue items isolated by clinic_id", async () => {
      const req = new Request("http://localhost:3000/api/queue", {
        headers: { "x-clinic-id": "clinic-1" },
      });
      const res = await getQueue(req as any);
      const json = await res.json();

      expect(Array.isArray(json.data)).toBe(true);
      expect(json.clinic_id).toBe("clinic-1");
      expect(json.data.every((q: any) => q.clinic_id === "clinic-1")).toBe(true);
    });

    it("should add a walk-in patient to queue and call next", async () => {
      const patient = db.patients.find((p) => p.clinic_id === "clinic-1");
      expect(patient).toBeDefined();

      const addReq = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_walkin",
          patient_id: patient!.id,
          service_name: "مراجعة طارئة",
        }),
      });

      const addRes = await postQueue(addReq as any);
      const added = await addRes.json();
      expect(added.queue_number).toBeGreaterThan(0);
      expect(added.patient_id).toBe(patient!.id);
      expect(added.status).toBe("waiting");

      // Call Next
      const callReq = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-1", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "call_next" }),
      });
      const callRes = await postQueue(callReq as any);
      const callData = await callRes.json();
      expect(callData.called).toBeDefined();
      expect(callData.called.status).toBe("in_consultation");
    });

    it("should allow check-in only on appointment date and reject non-today appointments", async () => {
      // Find today's appointment
      const today = new Date().toISOString().slice(0, 10);
      const todayApt = db.appointments.find(
        (a) => a.clinic_id === "clinic-1" && a.start_time.startsWith(today)
      );
      expect(todayApt).toBeDefined();

      // Check-in today's appointment
      const validReq = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkin_appointment",
          appointment_id: todayApt!.id,
        }),
      });
      const validRes = await postQueue(validReq as any);
      // It should either be created (201) or already checked in (400)
      expect([201, 400]).toContain(validRes.status);

      // Create a future appointment (tomorrow)
      const futureApt = {
        id: `apt-future-${Date.now()}`,
        clinic_id: "clinic-1",
        patient_id: "pat-001",
        patient_name: "مريض موعد غداً",
        patient_phone: "07701234567",
        service_id: "srv-001",
        service_name: "كشف استشاري",
        start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
        end_time: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString(),
        duration_minutes: 30,
        status: "confirmed" as const,
        booking_source: "whatsapp" as const,
      };
      db.appointments.push(futureApt);

      // Attempt check-in for tomorrow's appointment
      const invalidReq = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkin_appointment",
          appointment_id: futureApt.id,
        }),
      });
      const invalidRes = await postQueue(invalidReq as any);
      expect(invalidRes.status).toBe(400);
      const invalidJson = await invalidRes.json();
      expect(invalidJson.error).toContain("لا يمكن إدخال المريض في صالة الانتظار اليوم");
    });

    it("should allow direct manual registration of new walk-in patient without prior booking", async () => {
      const walkinReq = new Request("http://localhost:3000/api/queue", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_walkin",
          is_new_patient: true,
          full_name: "مريض مباشر وصل الآن",
          phone: "+9647799887766",
          gender: "male",
          service_name: "كشف طارئ",
          priority: "urgent",
          send_whatsapp: true,
        }),
      });

      const res = await postQueue(walkinReq as any);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.patient_name).toBe("مريض مباشر وصل الآن");
      expect(data.priority).toBe("urgent");
      expect(data.is_walk_in).toBe(true);

      // Verify patient was also added to db.patients
      const pat = db.patients.find((p) => p.phone === "+9647799887766");
      expect(pat).toBeDefined();
      expect(pat?.full_name).toBe("مريض مباشر وصل الآن");
    });
  });

  describe("3. Medical Media & Attachments Vault", () => {
    it("should upload and fetch medical attachments per patient", async () => {
      const patient = db.patients.find((p) => p.clinic_id === "clinic-1");
      expect(patient).toBeDefined();

      const newAttachment = {
        patient_id: patient!.id,
        file_name: "تحليل سكر تراكمي HbA1c",
        file_type: "pdf",
        category: "lab_result",
        file_url: "https://images.unsplash.com/photo-lab.jpg",
        notes: "النتيجة: 6.2%",
      };

      const uploadReq = new Request("http://localhost:3000/api/attachments", {
        method: "POST",
        headers: { "x-clinic-id": "clinic-1", "Content-Type": "application/json" },
        body: JSON.stringify(newAttachment),
      });

      const uploadRes = await postAttachment(uploadReq as any);
      const created = await uploadRes.json();
      expect(created.id).toBeDefined();
      expect(created.patient_id).toBe(patient!.id);

      // Fetch
      const getReq = new Request(`http://localhost:3000/api/attachments?patient_id=${patient!.id}`, {
        headers: { "x-clinic-id": "clinic-1" },
      });
      const getRes = await getAttachments(getReq as any);
      const json = await getRes.json();
      expect(json.data.some((a: any) => a.id === created.id)).toBe(true);

      // Delete
      const delReq = new Request(`http://localhost:3000/api/attachments?id=${created.id}`, {
        method: "DELETE",
        headers: { "x-clinic-id": "clinic-1" },
      });
      const delRes = await deleteAttachment(delReq as any);
      const delData = await delRes.json();
      expect(delData.status).toBe("success");
    });
  });

  describe("4. End-of-Day Financial Closing & Reconciliation", () => {
    it("should calculate revenue breakdown by payment method and cash audit", async () => {
      const req = new Request("http://localhost:3000/api/reports/closing", {
        headers: { "x-clinic-id": "clinic-1" },
      });
      const res = await getClosingReport(req as any);
      const report = await res.json();

      expect(report.clinic_name).toBeDefined();
      expect(report.currency).toBe("IQD");
      expect(typeof report.totals.grandTotal).toBe("number");
      expect(typeof report.totals.cash).toBe("number");
      expect(typeof report.totals.card).toBe("number");
      expect(Array.isArray(report.paymentsList)).toBe(true);
    });
  });
});
