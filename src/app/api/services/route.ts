import { NextResponse } from "next/server";
import { db, Service, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);

  // Strict tenant isolation: return services for this clinic
  const services = (db.services || []).filter(
    (s) => s.clinic_id === clinicId || (!s.clinic_id && clinicId === "clinic-1")
  );

  return NextResponse.json({
    data: services,
    total: services.length,
    clinic_id: clinicId,
  });
}

export async function POST(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const { name_ar, name_en, duration_minutes, price } = body;

    if (!name_ar || !price) {
      return NextResponse.json({ error: "Service name and price are required" }, { status: 400 });
    }

    const newService: Service = {
      id: `srv-${Date.now()}`,
      clinic_id: clinicId,
      name_ar,
      name_en: name_en || name_ar,
      duration_minutes: Number(duration_minutes) || 30,
      price: Number(price),
      currency: "IQD",
      is_active: true,
    };

    db.services.push(newService);

    return NextResponse.json(newService, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const body = await request.json();
    const { id, name_ar, name_en, duration_minutes, price, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الخدمة مطلوب" }, { status: 400 });
    }

    const srv = db.services.find(
      (s) => s.id === id && (s.clinic_id === clinicId || (!s.clinic_id && clinicId === "clinic-1"))
    );
    if (!srv) {
      return NextResponse.json({ error: "الخدمة غير موجودة في هذه العيادة" }, { status: 404 });
    }

    if (name_ar) srv.name_ar = name_ar;
    if (name_en !== undefined) srv.name_en = name_en;
    if (duration_minutes !== undefined) srv.duration_minutes = Number(duration_minutes);
    if (price !== undefined) srv.price = Number(price);
    if (is_active !== undefined) srv.is_active = Boolean(is_active);

    return NextResponse.json({ status: "success", service: srv });
  } catch {
    return NextResponse.json({ error: "فشل تحديث بيانات الخدمة" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const clinicId = getRequestClinicId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الخدمة مطلوب" }, { status: 400 });
    }

    const index = db.services.findIndex(
      (s) => s.id === id && (s.clinic_id === clinicId || (!s.clinic_id && clinicId === "clinic-1"))
    );
    if (index === -1) {
      return NextResponse.json({ error: "الخدمة غير موجودة في هذه العيادة" }, { status: 404 });
    }

    db.services.splice(index, 1);
    return NextResponse.json({ status: "success", message: "تم حذف الخدمة بنجاح" });
  } catch {
    return NextResponse.json({ error: "فشل حذف الخدمة" }, { status: 500 });
  }
}
