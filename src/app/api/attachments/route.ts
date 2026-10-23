import { NextResponse } from "next/server";
import { db, MedicalAttachment, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");

  if (!db.attachments) {
    db.attachments = [];
  }

  let list = db.attachments.filter(
    (a) => a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1")
  );

  if (patientId) {
    list = list.filter((a) => a.patient_id === patientId);
  }

  return NextResponse.json({
    data: list,
    total: list.length,
    clinic_id: clinicId,
  });
}

export async function POST(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const { patient_id, file_name, file_type, file_size_kb, category, file_url, notes } = body;

    if (!patient_id || !file_name) {
      return NextResponse.json({ error: "المريض واسم الملف مطلوبان" }, { status: 400 });
    }

    const patient = db.patients.find(
      (p) => p.id === patient_id && (p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1"))
    );
    if (!patient) {
      return NextResponse.json({ error: "المريض غير موجود في هذه العيادة" }, { status: 404 });
    }

    const newAttachment: MedicalAttachment = {
      id: `att-${Date.now()}`,
      clinic_id: clinicId,
      patient_id,
      patient_name: patient.full_name,
      file_name: file_name.trim(),
      file_type: file_type || "image/png",
      file_size_kb: Number(file_size_kb) || 350,
      category: category || "report",
      file_url: file_url || "/placeholder-medical-scan.png",
      notes: notes || "",
      uploaded_at: new Date().toISOString(),
    };

    if (!db.attachments) {
      db.attachments = [];
    }
    db.attachments.unshift(newAttachment);

    return NextResponse.json(newAttachment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل حفظ المرفق الطبي" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف المرفق مطلوب" }, { status: 400 });
    }

    const index = (db.attachments || []).findIndex(
      (a) => a.id === id && (a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1"))
    );
    if (index === -1) {
      return NextResponse.json({ error: "المرفق غير موجود" }, { status: 404 });
    }

    db.attachments.splice(index, 1);
    return NextResponse.json({ status: "success", message: "تم حذف المرفق الطبي بنجاح" });
  } catch {
    return NextResponse.json({ error: "فشل حذف المرفق" }, { status: 500 });
  }
}
