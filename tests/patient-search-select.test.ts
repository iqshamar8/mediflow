import { describe, it, expect } from "vitest";

interface PatientOption {
  id: string;
  patient_number?: string;
  full_name: string;
  phone: string;
}

function filterPatients(patients: PatientOption[], query: string): PatientOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return patients;

  const cleanQ = q.replace(/[\s\-\(\)\+]/g, "");
  const localQ = cleanQ.startsWith("07") ? cleanQ.slice(1) : cleanQ;

  return patients.filter((p) => {
    const nameMatch = p.full_name.toLowerCase().includes(q);
    const numberMatch = p.patient_number?.toLowerCase().includes(q);

    const cleanPhone = p.phone.replace(/[\s\-\(\)\+]/g, "");
    const phoneMatch =
      cleanPhone.includes(cleanQ) ||
      cleanPhone.includes(localQ) ||
      p.phone.toLowerCase().includes(q);

    return Boolean(nameMatch || numberMatch || phoneMatch);
  });
}

describe("Searchable Patient Dropdown & Instant Suggestions Engine", () => {
  const mockPatients: PatientOption[] = [
    {
      id: "pat-1",
      patient_number: "P-1001",
      full_name: "علي حسن الكرخي",
      phone: "+9647711112222",
    },
    {
      id: "pat-2",
      patient_number: "P-1002",
      full_name: "مصطفى جاسم الجبوري",
      phone: "+9647711113333",
    },
    {
      id: "pat-3",
      patient_number: "P-1003",
      full_name: "مريم أحمد البياتي",
      phone: "+9647722223333",
    },
  ];

  it("should return all patients when query is empty or whitespace", () => {
    expect(filterPatients(mockPatients, "").length).toBe(3);
    expect(filterPatients(mockPatients, "   ").length).toBe(3);
  });

  it("should match patient by Arabic first name or last name", () => {
    const aliResults = filterPatients(mockPatients, "علي");
    expect(aliResults.length).toBe(1);
    expect(aliResults[0].full_name).toBe("علي حسن الكرخي");

    const bayatiResults = filterPatients(mockPatients, "البياتي");
    expect(bayatiResults.length).toBe(1);
    expect(bayatiResults[0].full_name).toBe("مريم أحمد البياتي");
  });

  it("should match patient by phone number with local or international format", () => {
    // Search by 4 digits
    const res1 = filterPatients(mockPatients, "2222");
    expect(res1.length).toBe(2); // Ali (7711112222) and Maryam (7722223333)

    // Search by local phone snippet
    const res2 = filterPatients(mockPatients, "0771");
    expect(res2.length).toBe(2); // Ali and Mustafa

    // Search with spaces/dashes
    const res3 = filterPatients(mockPatients, "7711-112");
    expect(res3.length).toBe(1);
    expect(res3[0].full_name).toBe("علي حسن الكرخي");
  });

  it("should match patient by file number (patient_number)", () => {
    const res1 = filterPatients(mockPatients, "P-1002");
    expect(res1.length).toBe(1);
    expect(res1[0].full_name).toBe("مصطفى جاسم الجبوري");

    const res2 = filterPatients(mockPatients, "1003");
    expect(res2.length).toBe(1);
    expect(res2[0].full_name).toBe("مريم أحمد البياتي");
  });

  it("should return empty array when no matching name or phone exists", () => {
    const res = filterPatients(mockPatients, "اسم غير موجود 99999");
    expect(res.length).toBe(0);
  });
});
