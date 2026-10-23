import { NextResponse } from "next/server";
import { db, Clinic, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  try {
    const activeClinicId = getRequestClinicId(request);
    const clinics = db.clinics || [];

    const activeClinic = clinics.find((c) => c.id === activeClinicId) || clinics[0];

    return NextResponse.json({
      clinics,
      activeClinic,
      total: clinics.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch clinics" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, doctor_name, specialty, phone, email, address, currency } = body;

    if (!doctor_name?.trim() || !name?.trim()) {
      return NextResponse.json(
        { error: "اسم الطبيب واسم العيادة مطلوبان لتسجيل الحساب الجديد" },
        { status: 400 }
      );
    }

    const newClinicId = `clinic-${Date.now()}`;
    const newClinic: Clinic = {
      id: newClinicId,
      name: name.trim(),
      doctor_name: doctor_name.trim(),
      specialty: specialty?.trim() || "طب عام واستشارات",
      phone: phone?.trim() || "+9647700000000",
      email: email?.trim() || "",
      address: address?.trim() || "العراق - بغداد",
      currency: currency || "IQD",
      created_at: new Date().toISOString(),
    };

    if (!db.clinics) {
      db.clinics = [];
    }
    db.clinics.push(newClinic);

    // Initialize baseline starter services for the new clinic/doctor
    const starterServices = [
      {
        id: `srv-${Date.now()}-1`,
        clinic_id: newClinicId,
        name_ar: `كشف واستشارة طبية (${newClinic.specialty})`,
        name_en: "Initial Consultation",
        duration_minutes: 30,
        price: 30000,
        currency: "IQD",
        is_active: true,
      },
      {
        id: `srv-${Date.now()}-2`,
        clinic_id: newClinicId,
        name_ar: "مراجعة واستشارة متابعة",
        name_en: "Follow-up Consultation",
        duration_minutes: 20,
        price: 15000,
        currency: "IQD",
        is_active: true,
      },
    ];

    db.services.push(...starterServices);

    return NextResponse.json(
      {
        message: "تم إنشاء نظام العيادة الجديد بنجاح",
        clinic: newClinic,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "فشل إنشاء العيادة الجديدة" }, { status: 500 });
  }
}
