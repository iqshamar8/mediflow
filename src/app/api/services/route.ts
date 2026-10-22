import { NextResponse } from "next/server";
import { db, Service } from "@/server/mock-db";

export async function GET() {
  return NextResponse.json({
    data: db.services,
    total: db.services.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name_ar, name_en, duration_minutes, price } = body;

    if (!name_ar || !price) {
      return NextResponse.json({ error: "Service name and price are required" }, { status: 400 });
    }

    const newService: Service = {
      id: `srv-${Date.now()}`,
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
