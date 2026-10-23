import { NextResponse } from "next/server";
import { db, Patient, getRequestClinicId } from "@/server/mock-db";

export interface ImportPatientRow {
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: "male" | "female";
  whatsapp_consent?: boolean;
  admin_notes?: string;
}

export async function POST(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const rows: ImportPatientRow[] = body.patients;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "لا توجد بيانات مرضى في الملف المرسل" }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ row: number; name: string; phone: string; reason: string }> = [];
    const addedPatients: Patient[] = [];

    // Track existing phones strictly within THIS clinic
    const existingPhones = new Set(
      (db.patients || [])
        .filter((p) => p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1"))
        .map((p) => p.phone.replace(/[\s\-\(\)]/g, ""))
    );

    let nextNumberIndex = (db.patients?.length || 0) + 1001;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      const name = (row.full_name || "").trim();
      let phone = (row.phone ? String(row.phone) : "").trim().replace(/[\s\-\(\)]/g, "");

      if (!name) {
        skippedCount++;
        errors.push({ row: rowNum, name: name || "غير محدد", phone, reason: "اسم المريض فارغ" });
        continue;
      }

      if (!phone) {
        skippedCount++;
        errors.push({ row: rowNum, name, phone: "غير محدد", reason: "رقم الهاتف فارغ" });
        continue;
      }

      // Format phone if it starts with 07 or 77 without international code
      if (phone.startsWith("07")) {
        phone = "+964" + phone.slice(1);
      } else if (phone.startsWith("7") && phone.length === 10) {
        phone = "+964" + phone;
      }

      // Check if phone already registered in this clinic
      if (existingPhones.has(phone)) {
        skippedCount++;
        errors.push({ row: rowNum, name, phone, reason: "رقم الهاتف مسجل مسبقاً في عيادتك (مكرر)" });
        continue;
      }

      // Normalize gender
      let gender: "male" | "female" = "male";
      const gRaw = (row.gender || "").toLowerCase().trim();
      if (gRaw === "female" || gRaw === "أنثى" || gRaw === "انثى" || gRaw === "f") {
        gender = "female";
      }

      const newPatient: Patient = {
        id: `pat-import-${Date.now()}-${i}`,
        clinic_id: clinicId,
        patient_number: `P-${nextNumberIndex++}`,
        full_name: name,
        phone,
        email: (row.email || "").trim(),
        date_of_birth: (row.date_of_birth || "").trim(),
        gender,
        preferred_language: "ar",
        whatsapp_consent: row.whatsapp_consent !== false,
        admin_notes: (row.admin_notes || "مستورد من ملف سابق").trim(),
        created_at: new Date().toISOString(),
      };

      existingPhones.add(phone);
      db.patients.unshift(newPatient);
      addedPatients.push(newPatient);
      importedCount++;
    }

    return NextResponse.json({
      status: "success",
      clinic_id: clinicId,
      totalProcessed: rows.length,
      importedCount,
      skippedCount,
      errors,
      addedPatients,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "فشل استيراد الملف ومعالجة البيانات: " + (err?.message || "خطأ غير معروف") },
      { status: 500 }
    );
  }
}
