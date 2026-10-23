import { NextResponse } from "next/server";
import { db, getRequestClinicId } from "@/server/mock-db";

export async function GET(request: Request) {
  const clinicId = getRequestClinicId(request);

  const payments = (db.payments || []).filter(
    (p) => p.clinic_id === clinicId || (!p.clinic_id && clinicId === "clinic-1")
  );

  const appointments = (db.appointments || []).filter(
    (a) => a.clinic_id === clinicId || (!a.clinic_id && clinicId === "clinic-1")
  );

  const visits = (db.visits || []).filter(
    (v) => v.clinic_id === clinicId || (!v.clinic_id && clinicId === "clinic-1")
  );

  // Cash vs Card vs Bank Transfer
  const cashTotal = payments.filter((p) => p.payment_method === "cash").reduce((s, p) => s + p.amount, 0);
  const cardTotal = payments.filter((p) => p.payment_method === "card").reduce((s, p) => s + p.amount, 0);
  const transferTotal = payments.filter((p) => p.payment_method === "bank_transfer").reduce((s, p) => s + p.amount, 0);
  const grandTotal = cashTotal + cardTotal + transferTotal;

  // Breakdown by service
  const serviceStats: Record<string, { count: number; revenue: number }> = {};
  appointments.forEach((apt) => {
    const sName = apt.service_name || "كشف واستشارة";
    if (!serviceStats[sName]) {
      serviceStats[sName] = { count: 0, revenue: 0 };
    }
    serviceStats[sName].count += 1;
  });

  const clinic = db.clinics?.find((c) => c.id === clinicId) || db.clinics?.[0];

  return NextResponse.json({
    clinic_id: clinicId,
    clinic_name: clinic?.name || "العيادة الطبية",
    doctor_name: clinic?.doctor_name || "الطبيب المشرف",
    date: new Date().toISOString().slice(0, 10),
    currency: "IQD",
    totals: {
      cash: cashTotal,
      card: cardTotal,
      transfer: transferTotal,
      grandTotal,
    },
    counts: {
      transactions: payments.length,
      appointments: appointments.length,
      visits: visits.length,
      averageTicket: payments.length > 0 ? Math.round(grandTotal / payments.length) : 0,
    },
    paymentsList: payments.slice(0, 20),
    serviceBreakdown: Object.entries(serviceStats).map(([name, stat]) => ({
      name,
      count: stat.count,
    })),
  });
}
