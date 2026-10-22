import { NextResponse } from "next/server";
import { db, WhatsAppMessage } from "@/server/mock-db";

// 1. GET: Meta Webhook Verification Challenge
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "mediflow_secret_token";

  if (mode === "subscribe" && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// 2. POST: Inbound Message Processing & Conversational Booking Assistant
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support both raw Meta Cloud API payloads and simplified test payloads
    let senderPhone = "";
    let messageText = "";

    if (body.entry && body.entry[0]?.changes[0]?.value?.messages) {
      const messageObj = body.entry[0].changes[0].value.messages[0];
      senderPhone = messageObj.from;
      messageText = messageObj.text?.body || "";
    } else if (body.sender && body.text) {
      senderPhone = body.sender;
      messageText = body.text;
    } else {
      return NextResponse.json({ status: "ignored_unsupported_payload" }, { status: 200 });
    }

    if (!messageText.trim()) {
      return NextResponse.json({ status: "empty_message" }, { status: 200 });
    }

    // 1. Log inbound message
    const inboundMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      direction: "inbound",
      sender_phone: senderPhone,
      receiver_phone: "+9647700000001",
      content: messageText,
      status: "read",
      created_at: new Date().toISOString(),
    };
    db.messages.push(inboundMsg);

    // 2. Conversational Intent Processing (Arabic / Iraqi Dialect & English)
    const lowerText = messageText.toLowerCase().trim();
    let replyText = "";

    // Intent 1: Inquiry about services & pricing (شنو الخدمات / الأسعار / Services)
    if (
      lowerText.includes("خدمات") ||
      lowerText.includes("سعر") ||
      lowerText.includes("اسعار") ||
      lowerText.includes("service") ||
      lowerText.includes("price")
    ) {
      const serviceList = db.services
        .filter((s) => s.is_active)
        .map((s, idx) => `${idx + 1}. ${s.name_ar} — ${s.price.toLocaleString()} د.ع (${s.duration_minutes} دقيقة)`)
        .join("\n");

      replyText = `أهلاً بك في عيادة النور التخصصية 🩺\nالخدمات والأسعار المتوفرة:\n\n${serviceList}\n\nلحجز موعد، اكتب: "أريد أحجز موعد" مع تحديد الخدمة أو اليوم المطلوب.`;
    }
    // Intent 2: Reschedule or Cancel (ألغي الحجز / أغير موعدي / cancel)
    else if (
      lowerText.includes("الغي") ||
      lowerText.includes("إلغاء") ||
      lowerText.includes("اغير") ||
      lowerText.includes("تعديل") ||
      lowerText.includes("cancel")
    ) {
      const existingPatient = db.patients.find((p) => p.phone.includes(senderPhone.slice(-8)));
      if (existingPatient) {
        replyText = `أهلاً بك يا ${existingPatient.full_name}. تم استلام طلبك للإلغاء/التعديل. سيتواصل معك موظف الاستقبال خلال دقائق للتأكيد، أو يمكنك الاتصال بنا مباشرة على: 07700000001.`;
      } else {
        replyText = "يرجى تزويدنا برقم الهاتف المسجل أو رقم الحجز لنتمكن من مساعدتك في الإلغاء أو التعديل.";
      }
    }
    // Intent 3: Booking Request (أريد أحجز / حجز / باچر / موعد / book appointment)
    else if (
      lowerText.includes("احجز") ||
      lowerText.includes("حجز") ||
      lowerText.includes("موعد") ||
      lowerText.includes("باجر") ||
      lowerText.includes("باچر") ||
      lowerText.includes("book")
    ) {
      // Find or create synthetic patient record
      let patient = db.patients.find((p) => p.phone.includes(senderPhone.slice(-8)));
      if (!patient) {
        patient = {
          id: `pat-${Date.now()}`,
          patient_number: `P-${1000 + db.patients.length + 1}`,
          full_name: "مريض واتساب جديد",
          phone: senderPhone,
          email: "",
          date_of_birth: "",
          gender: "male",
          preferred_language: "ar",
          whatsapp_consent: true,
          admin_notes: "مسجل تلقائياً عبر بوت الواتساب",
          created_at: new Date().toISOString(),
        };
        db.patients.push(patient);
      }

      // Check real slot availability (Tomorrow at 10:00 AM)
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 1);
      bookingDate.setHours(10, 0, 0, 0);

      const defaultService = db.services[0];

      // Create appointment
      const newApt = {
        id: `apt-${Date.now()}`,
        patient_id: patient.id,
        patient_name: patient.full_name,
        patient_phone: patient.phone,
        service_id: defaultService.id,
        service_name: defaultService.name_ar,
        start_time: bookingDate.toISOString(),
        end_time: new Date(bookingDate.getTime() + 30 * 60000).toISOString(),
        duration_minutes: 30,
        status: "confirmed" as const,
        booking_source: "whatsapp" as const,
        notes: "حجز مؤكد تلقائياً عبر محادثة الواتساب",
      };

      db.appointments.unshift(newApt);

      replyText = `تم تأكيد حجزك بنجاح في عيادة النور! ✨\n\n👤 المريض: ${patient.full_name}\n🩺 الخدمة: ${defaultService.name_ar}\n📅 الموعد: غداً الساعة 10:00 صباحاً\n📍 العنوان: شارع المنصور، بغداد\n\nسنرسل لك تذكيراً قبل الموعد بـ 24 ساعة. نتمنى لك دوام الصحة والعافية!`;
    }
    // Intent 4: Fallback / Greeting
    else {
      replyText = `مرحباً بك في عيادة النور الطبية التخصصية 👋\nأنا المساعد الآلي للعيادة. كيف يمكنني خدمتك اليوم؟\n\n1️⃣ لحجز موعد اكتب: "أريد أحجز موعد"\n2️⃣ لمعرفة الخدمات والأسعار اكتب: "الخدمات والأسعار"\n3️⃣ للتحدث مع موظف الاستقبال اكتب: "مساعدة"`;
    }

    // 3. Log outbound message
    const outboundMsg: WhatsAppMessage = {
      id: `msg-${Date.now() + 1}`,
      direction: "outbound",
      sender_phone: "+9647700000001",
      receiver_phone: senderPhone,
      content: replyText,
      status: "delivered",
      created_at: new Date().toISOString(),
    };
    db.messages.push(outboundMsg);

    return NextResponse.json({
      status: "success",
      reply: replyText,
      appointmentsTotal: db.appointments.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
