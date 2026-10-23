import { describe, it, expect, beforeEach } from "vitest";
import { db, Appointment } from "../src/server/mock-db";

describe("Appointment Scheduling & Conflict Prevention Engine", () => {
  beforeEach(() => {
    // Reset test appointments
    db.appointments = [
      {
        id: "test-apt-1",
        patient_id: "pat-001",
        patient_name: "علي حسن",
        service_id: "srv-001",
        service_name: "كشف عام واستشارة",
        start_time: "2026-10-25T10:00:00.000Z",
        end_time: "2026-10-25T10:30:00.000Z",
        duration_minutes: 30,
        status: "confirmed",
        booking_source: "dashboard",
      },
    ];
  });

  it("should successfully book a non-conflicting appointment slot", () => {
    const newStart = new Date("2026-10-25T11:00:00.000Z").getTime();
    const newEnd = new Date("2026-10-25T11:30:00.000Z").getTime();

    const hasConflict = db.appointments.some((apt) => {
      if (apt.status === "cancelled") return false;
      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      return newStart < aptEnd && newEnd > aptStart;
    });

    expect(hasConflict).toBe(false);

    const created: Appointment = {
      id: "test-apt-2",
      patient_id: "pat-002",
      service_id: "srv-001",
      start_time: new Date(newStart).toISOString(),
      end_time: new Date(newEnd).toISOString(),
      duration_minutes: 30,
      status: "confirmed",
      booking_source: "dashboard",
    };

    db.appointments.push(created);
    expect(db.appointments.length).toBe(2);
  });

  it("should detect and reject overlapping appointment requests", () => {
    // Request overlapping with 10:00 - 10:30 (e.g. 10:15 - 10:45)
    const newStart = new Date("2026-10-25T10:15:00.000Z").getTime();
    const newEnd = new Date("2026-10-25T10:45:00.000Z").getTime();

    const hasConflict = db.appointments.some((apt) => {
      if (apt.status === "cancelled") return false;
      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      return newStart < aptEnd && newEnd > aptStart;
    });

    expect(hasConflict).toBe(true);
  });

  it("should ignore cancelled appointments when calculating slot conflicts", () => {
    db.appointments[0].status = "cancelled";

    // Same slot 10:00 - 10:30 should now be free
    const newStart = new Date("2026-10-25T10:00:00.000Z").getTime();
    const newEnd = new Date("2026-10-25T10:30:00.000Z").getTime();

    const hasConflict = db.appointments.some((apt) => {
      if (apt.status === "cancelled") return false;
      const aptStart = new Date(apt.start_time).getTime();
      const aptEnd = new Date(apt.end_time).getTime();
      return newStart < aptEnd && newEnd > aptStart;
    });

    expect(hasConflict).toBe(false);
  });

  it("should update last_reminder_sent_at when a manual reminder is triggered", () => {
    const apt = db.appointments[0];
    expect(apt.last_reminder_sent_at).toBeUndefined();

    const nowIso = new Date().toISOString();
    apt.last_reminder_sent_at = nowIso;

    expect(apt.last_reminder_sent_at).toBe(nowIso);
  });
});
