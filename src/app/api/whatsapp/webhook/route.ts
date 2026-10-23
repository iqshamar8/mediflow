import { NextResponse } from "next/server";
import { db, WhatsAppMessage, getRequestClinicId } from "@/server/mock-db";
import { processConversationalMessage } from "@/server/whatsapp-bot";

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
    const clinicId = getRequestClinicId(request);
    const body = await request.json();

    const targetClinicId = body.clinic_id || clinicId;

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
      clinic_id: targetClinicId,
      direction: "inbound",
      sender_phone: senderPhone,
      receiver_phone: "+9647700000001",
      content: messageText,
      status: "read",
      created_at: new Date().toISOString(),
    };
    db.messages.push(inboundMsg);

    // 2. Conversational Multi-turn Response via WhatsApp Bot Engine for THIS clinic
    const replyText = await processConversationalMessage(senderPhone, messageText, targetClinicId);

    // 3. Log outbound message
    const outboundMsg: WhatsAppMessage = {
      id: `msg-${Date.now() + 1}`,
      clinic_id: targetClinicId,
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
      clinic_id: targetClinicId,
      reply: replyText,
      appointmentsTotal: db.appointments.filter(a => a.clinic_id === targetClinicId).length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
