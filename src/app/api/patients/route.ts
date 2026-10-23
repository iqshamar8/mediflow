import { NextResponse } from "next/server";
import { db, Patient } from "@/server/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || "";

  let results = db.patients;
  if (search) {
    results = results.filter(
      (p) =>
        p.full_name.toLowerCase().includes(search) ||
        p.phone.includes(search) ||
        p.patient_number.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    data: results,
    total: results.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, phone, email, date_of_birth, gender, preferred_language, whatsapp_consent, admin_notes } = body;

    if (!full_name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    // Check duplicate by phone
    const existing = db.patients.find((p) => p.phone === phone);
    if (existing) {
      return NextResponse.json(
        { error: "A patient with this phone number already exists", existingId: existing.id },
        { status: 409 }
      );
    }

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      patient_number: `P-${1000 + db.patients.length + 1}`,
      full_name,
      phone,
      email: email || "",
      date_of_birth: date_of_birth || "",
      gender: gender || "male",
      preferred_language: preferred_language || "ar",
      whatsapp_consent: whatsapp_consent !== false,
      admin_notes: admin_notes || "",
      created_at: new Date().toISOString(),
    };

    db.patients.unshift(newPatient);

    return NextResponse.json(newPatient, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, full_name, phone, email, date_of_birth, gender, whatsapp_consent, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف المريض مطلوب" }, { status: 400 });
    }

    const patient = db.patients.find((p) => p.id === id);
    if (!patient) {
      return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
    }

    // Check if phone changed and is taken by another patient
    if (phone && phone !== patient.phone) {
      const duplicate = db.patients.find((p) => p.id !== id && p.phone === phone);
      if (duplicate) {
        return NextResponse.json({ error: "رقم الهاتف مستخدم بالفعل لمريض آخر" }, { status: 409 });
      }
      patient.phone = phone;
    }

    if (full_name) patient.full_name = full_name;
    if (email !== undefined) patient.email = email;
    if (date_of_birth !== undefined) patient.date_of_birth = date_of_birth;
    if (gender !== undefined) patient.gender = gender;
    if (whatsapp_consent !== undefined) patient.whatsapp_consent = Boolean(whatsapp_consent);
    if (admin_notes !== undefined) patient.admin_notes = admin_notes;

    return NextResponse.json({ status: "success", patient });
  } catch {
    return NextResponse.json({ error: "فشل تحديث بيانات المريض" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف المريض مطلوب" }, { status: 400 });
    }

    const index = db.patients.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
    }

    db.patients.splice(index, 1);
    return NextResponse.json({ status: "success", message: "تم حذف سجل المريض بنجاح" });
  } catch {
    return NextResponse.json({ error: "فشل حذف المريض" }, { status: 500 });
  }
}
