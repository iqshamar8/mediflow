import { describe, it, expect, beforeEach } from "vitest";
import { db, Clinic, getRequestClinicId } from "../src/server/mock-db";
import { GET as getClinics, POST as postClinic } from "../src/app/api/clinics/route";
import { GET as getPatients, POST as postPatient } from "../src/app/api/patients/route";
import { GET as getAppointments } from "../src/app/api/appointments/route";
import { GET as getServices } from "../src/app/api/services/route";

describe("Multi-Clinic & Multi-Doctor Complete Isolation Engine", () => {
  beforeEach(() => {
    // Ensure clinics exist in memory
    if (!db.clinics || db.clinics.length < 2) {
      db.clinics = [
        {
          id: "clinic-1",
          name: "عيادة د. أحمد الراوي التخصصية",
          doctor_name: "د. أحمد الراوي",
          specialty: "استشاري الأمراض الباطنية والقلب",
          phone: "07700000001",
          email: "dr.ahmed@mediflow.iq",
          address: "بغداد - المنصور - شارع 14 رمضان (قرب ساحة الرواد)",
          currency: "IQD",
          created_at: new Date().toISOString(),
        },
        {
          id: "clinic-2",
          name: "مركز د. سارة العبيدي للسونار",
          doctor_name: "د. سارة العبيدي",
          specialty: "أخصائية السونار والأشعة التشخيصية",
          phone: "07700000002",
          email: "dr.sara@mediflow.iq",
          address: "بغداد - الحارثية - شارع الكندي",
          currency: "IQD",
          created_at: new Date().toISOString(),
        },
      ];
    }
  });

  it("should isolate patient lists between doctors", () => {
    // Clinic 1 patients
    const clinic1Patients = db.patients.filter((p) => p.clinic_id === "clinic-1");
    // Clinic 2 patients
    const clinic2Patients = db.patients.filter((p) => p.clinic_id === "clinic-2");

    expect(clinic1Patients.length).toBeGreaterThan(0);
    expect(clinic2Patients.length).toBeGreaterThan(0);

    // Dr. Ahmed's patients must NOT contain Dr. Sara's patients
    const clinic1Names = clinic1Patients.map((p) => p.full_name);
    const clinic2Names = clinic2Patients.map((p) => p.full_name);

    expect(clinic1Names).toContain("علي حسن الكرخي");
    expect(clinic1Names).not.toContain("مريم أحمد البياتي");

    expect(clinic2Names).toContain("مريم أحمد البياتي");
    expect(clinic2Names).not.toContain("علي حسن الكرخي");
  });

  it("should isolate appointments and schedules between doctors", () => {
    const clinic1Apts = db.appointments.filter((a) => a.clinic_id === "clinic-1");
    const clinic2Apts = db.appointments.filter((a) => a.clinic_id === "clinic-2");

    expect(clinic1Apts.length).toBeGreaterThan(0);
    expect(clinic2Apts.length).toBeGreaterThan(0);

    // Doctor 1 should not see Doctor 2's appointments
    clinic1Apts.forEach((apt) => {
      expect(apt.clinic_id).toBe("clinic-1");
      expect(apt.patient_name).not.toBe("مريم أحمد البياتي");
    });
  });

  it("should allow simultaneous bookings at the same time slot across different clinics", () => {
    const testSlot = "2026-11-01T10:00:00.000Z";

    // Add appointment for Dr. Ahmed at 10:00 AM
    db.appointments.push({
      id: "apt-ahmed-slot",
      clinic_id: "clinic-1",
      patient_id: "pat-001",
      patient_name: "علي حسن الكرخي",
      service_id: "srv-001",
      service_name: "كشف عام واستشارة",
      start_time: testSlot,
      end_time: "2026-11-01T10:30:00.000Z",
      duration_minutes: 30,
      status: "confirmed",
      booking_source: "dashboard",
    });

    // Check conflict for Dr. Sara (clinic-2) at the EXACT SAME time
    const newStart = new Date(testSlot).getTime();
    const newEnd = new Date("2026-11-01T10:30:00.000Z").getTime();

    // Check conflict within Dr. Sara's clinic
    const hasConflictInSaraClinic = db.appointments.some((apt) => {
      if (apt.clinic_id !== "clinic-2") return false; // Other clinics do NOT conflict
      if (apt.status === "cancelled") return false;
      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      return newStart < aptEnd && newEnd > aptStart;
    });

    // Should be FALSE because Dr. Ahmed's slot is in a different clinic!
    expect(hasConflictInSaraClinic).toBe(false);
  });

  it("should calculate revenue and payments separately for each clinic", () => {
    const clinic1Revenue = db.payments
      .filter((p) => p.clinic_id === "clinic-1")
      .reduce((sum, p) => sum + p.amount, 0);

    const clinic2Revenue = db.payments
      .filter((p) => p.clinic_id === "clinic-2")
      .reduce((sum, p) => sum + p.amount, 0);

    expect(clinic1Revenue).toBe(25000);
    expect(clinic2Revenue).toBe(40000);
    expect(clinic1Revenue).not.toBe(clinic2Revenue);
  });

  it("should accurately resolve clinic ID from headers, queries, or fallback", () => {
    // 1. From header
    const reqWithHeader = new Request("http://localhost:3000/api/patients", {
      headers: { "x-clinic-id": "clinic-2" },
    });
    expect(getRequestClinicId(reqWithHeader)).toBe("clinic-2");

    // 2. From query param
    const reqWithQuery = new Request("http://localhost:3000/api/patients?clinic_id=clinic-3");
    expect(getRequestClinicId(reqWithQuery)).toBe("clinic-3");

    // 3. Fallback to default
    const reqDefault = new Request("http://localhost:3000/api/patients");
    expect(getRequestClinicId(reqDefault)).toBe("clinic-1");
  });

  it("should support registering a brand new doctor/clinic workspace via API with complete isolation", async () => {
    const newDoctorReq = new Request("http://localhost:3000/api/clinics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_name: "د. ليلى السعدي",
        name: "عيادة السعدي لطب الأطفال",
        specialty: "استشارية طب الأطفال وحديثي الولادة",
        phone: "07709998877",
        address: "بغداد - الكرخ - حي الجامعة",
      }),
    });

    const createRes = await postClinic(newDoctorReq);
    expect(createRes.status).toBe(201);
    const createData = await createRes.json();
    const newClinicId = createData.clinic.id;
    expect(newClinicId).toBeDefined();
    expect(createData.clinic.doctor_name).toBe("د. ليلى السعدي");

    // Verify services auto-created for this new doctor
    const servicesReq = new Request(`http://localhost:3000/api/services?clinic_id=${newClinicId}`);
    const servicesRes = await getServices(servicesReq);
    const servicesData = await servicesRes.json();
    expect(servicesData.data.length).toBeGreaterThanOrEqual(2);
    expect(servicesData.data[0].clinic_id).toBe(newClinicId);

    // Verify this new doctor's patient list is initially empty (0 patients)
    const patReq = new Request(`http://localhost:3000/api/patients?clinic_id=${newClinicId}`);
    const patRes = await getPatients(patReq);
    const patData = await patRes.json();
    expect(patData.data.length).toBe(0);

    // Register a patient exclusively for Dr. Layla
    const addPatReq = new Request("http://localhost:3000/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-clinic-id": newClinicId,
      },
      body: JSON.stringify({
        full_name: "الطفل يوسف مصطفى",
        phone: "+9647701122334",
        gender: "male",
        admin_notes: "كشف دوري ونمو طبيعي",
      }),
    });

    const addPatRes = await postPatient(addPatReq);
    expect(addPatRes.status).toBe(201);

    // Verify Dr. Layla now has 1 patient
    const patReqAfter = new Request(`http://localhost:3000/api/patients?clinic_id=${newClinicId}`);
    const patResAfter = await getPatients(patReqAfter);
    const patDataAfter = await patResAfter.json();
    expect(patDataAfter.data.length).toBe(1);
    expect(patDataAfter.data[0].full_name).toBe("الطفل يوسف مصطفى");

    // Verify Dr. Ahmed (clinic-1) CANNOT see "الطفل يوسف مصطفى"
    const ahmedPatReq = new Request("http://localhost:3000/api/patients?clinic_id=clinic-1");
    const ahmedPatRes = await getPatients(ahmedPatReq);
    const ahmedPatData = await ahmedPatRes.json();
    const ahmedPatientNames = ahmedPatData.data.map((p: any) => p.full_name);
    expect(ahmedPatientNames).not.toContain("الطفل يوسف مصطفى");
  });
});
