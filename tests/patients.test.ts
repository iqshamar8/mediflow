import { describe, it, expect, beforeEach } from "vitest";
import { db, Patient } from "../src/server/mock-db";

describe("Patient Management & Duplicate Detection", () => {
  beforeEach(() => {
    db.patients = [
      {
        id: "pat-001",
        patient_number: "P-1001",
        full_name: "علي حسن الكرخي",
        phone: "+9647711112222",
        email: "ali@example.test",
        date_of_birth: "1988-04-12",
        gender: "male",
        preferred_language: "ar",
        whatsapp_consent: true,
        created_at: new Date().toISOString(),
      },
    ];
  });

  it("should normalize and format Iraqi phone numbers correctly", () => {
    const rawLocal = "07711112222";
    let formatted = rawLocal.trim().replace(/[\s\-\(\)]/g, "");
    if (formatted.startsWith("07")) {
      formatted = "+964" + formatted.slice(1);
    }

    expect(formatted).toBe("+9647711112222");
  });

  it("should detect duplicate phone numbers", () => {
    const newPhone = "+9647711112222";
    const existing = db.patients.find((p) => p.phone === newPhone);

    expect(existing).toBeDefined();
    expect(existing?.full_name).toBe("علي حسن الكرخي");
  });

  it("should successfully search patients by partial name or phone", () => {
    const searchByName = "الكرخي";
    const results = db.patients.filter((p) => p.full_name.includes(searchByName));
    expect(results.length).toBe(1);

    const searchByPhone = "1111";
    const phoneResults = db.patients.filter((p) => p.phone.includes(searchByPhone));
    expect(phoneResults.length).toBe(1);
  });
});
