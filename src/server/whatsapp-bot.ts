import { db, Patient, Appointment, WhatsAppMessage, ConversationSession } from "@/server/mock-db";

/**
 * Intelligent WhatsApp Conversational Bot for MediFlow Clinic
 * Understands Iraqi Arabic, Modern Standard Arabic, and English.
 * Maintains multi-turn conversation state per sender phone.
 */

export async function processConversationalMessage(
  senderPhone: string,
  messageText: string
): Promise<string> {
  const text = messageText.trim();
  const lower = text.toLowerCase();

  // 1. Get or create multi-turn conversation session
  if (!db.sessions) {
    db.sessions = {};
  }

  let session: ConversationSession = db.sessions[senderPhone] || {
    phone: senderPhone,
    step: "idle",
    lastInteraction: new Date().toISOString(),
  };

  // 2. Identify or lookup existing patient in the clinic
  let patient = db.patients.find((p) => p.phone.replace(/\D/g, "").includes(senderPhone.replace(/\D/g, "").slice(-8)));

  // 3. Intent Detection & Entity Extraction

  // Check if patient wants human agent
  if (
    lower.includes("موظف") ||
    lower.includes("سكرتير") ||
    lower.includes("سكرتيرة") ||
    lower.includes("بشري") ||
    lower.includes("اتصل") ||
    lower.includes("مساعدة") ||
    lower.includes("human") ||
    lower.includes("agent")
  ) {
    session.step = "idle";
    db.sessions[senderPhone] = session;
    return (
      "تدلل عيني! 🩺\n" +
      "تم تحويل محادثتك لموظف الاستقبال بالعيادة، وسيقوم بالرد عليك مباشرة خلال لحظات.\n" +
      "يمكنك أيضاً الاتصال بنا مباشرة على هاتف العيادة: 07700000001."
    );
  }

  // Check if asking about clinic location / address / directions
  if (
    lower.includes("مكان") ||
    lower.includes("وين") ||
    lower.includes("عنوان") ||
    lower.includes("موقع") ||
    lower.includes("لوكيشن") ||
    lower.includes("location") ||
    lower.includes("address")
  ) {
    return (
      "أهلاً وسهلاً بك في عيادة النور التخصصية 📍\n" +
      "العنوان: بغداد - المنصور - شارع 14 رمضان (قرب ساحة الرواد).\n" +
      "أوقات الدوام: من الأحد إلى الخميس (9:00 صباحاً - 6:00 مساءً)، والسبت (10:00 صباحاً - 3:00 مساءً).\n\n" +
      "تحب تحجز موعد لكشف أو استشارة طبية؟"
    );
  }

  // Check if asking about doctors or availability
  if (
    lower.includes("دكتور أحمد") ||
    lower.includes("دكتورة سارة") ||
    lower.includes("اطباء") ||
    lower.includes("أطباء") ||
    lower.includes("طبيب") ||
    lower.includes("doctor")
  ) {
    return (
      "حياك الله عيني 👋\n" +
      "الأطباء المتواجدون في العيادة:\n" +
      "• د. أحمد الراوي (استشاري الأمراض الباطنية والكشف العام) — متواجد يومياً من 10 ص إلى 5 م.\n" +
      "• د. سارة العبيدي (أخصائية السونار والأشعة التشخيصية) — متواجدة أيام الأحد والثلاثاء والخميس.\n\n" +
      "تحب نحجز لك موعد مع أي منهم؟"
    );
  }

  // Check if asking about services and prices
  if (
    (lower.includes("خدمات") || lower.includes("سعر") || lower.includes("اسعار") || lower.includes("بيش") || lower.includes("تكلفة") || lower.includes("price")) &&
    session.step !== "awaiting_confirmation"
  ) {
    const list = db.services
      .filter((s) => s.is_active)
      .map((s, idx) => `• ${s.name_ar}: ${s.price.toLocaleString()} د.ع (${s.duration_minutes} دقيقة)`)
      .join("\n");

    return (
      "أهلاً بك عيني! قائمة الخدمات والأسعار المعتمدة بالعيادة:\n\n" +
      list +
      "\n\nلحجز أي خدمة، اكتب لي: (أريد أحجز كشف باچر) أو اذكر الخدمة والوقت المناسب إلك."
    );
  }

  // Check if patient wants to CANCEL an appointment
  if (
    lower.includes("الغاء") ||
    lower.includes("إلغاء") ||
    lower.includes("الغي") ||
    lower.includes("ألغي") ||
    lower.includes("كنسل") ||
    lower.includes("cancel")
  ) {
    if (patient) {
      const activeApt = db.appointments.find((a) => a.patient_id === patient?.id && a.status === "confirmed");
      if (activeApt) {
        activeApt.status = "cancelled";
        session.step = "idle";
        db.sessions[senderPhone] = session;
        return (
          `تم إلغاء موعدك المحدد بتاريخ (${new Date(activeApt.start_time).toLocaleDateString("ar-IQ")}) بنجاح يا ${patient.full_name} 🩺\n` +
          "سلامتك وما تشوف شر إن شاء الله. في حال رغبت بحجز موعد جديد في أي وقت، تواصل معنا فوراً!"
        );
      }
    }
    session.step = "idle";
    db.sessions[senderPhone] = session;
    return "تم استلام طلب الإلغاء. لم نعثر على حجز مؤكد مرتبط بهذا الرقم. إذا كنت مسجلاً باسم آخر، اذكر اسمك ورقم الحجز وسنقوم بمساعدتك فوراً.";
  }

  // Check if patient wants to RESCHEDULE / Change time
  if (
    lower.includes("اغير") ||
    lower.includes("أغير") ||
    lower.includes("تعديل") ||
    lower.includes("أجل") ||
    lower.includes("قدم") ||
    lower.includes("أخر") ||
    lower.includes("reschedule")
  ) {
    const targetApt = patient
      ? db.appointments.find((a) => a.patient_id === patient?.id && a.status !== "cancelled")
      : null;

    // Detect requested new time (e.g. 11, 4, عصر, باجر)
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 1);
    if (lower.includes("عصر") || lower.includes("5") || lower.includes("خمسة")) {
      newDate.setHours(17, 0, 0, 0);
    } else if (lower.includes("11") || lower.includes("دعش")) {
      newDate.setHours(11, 0, 0, 0);
    } else {
      newDate.setHours(12, 0, 0, 0);
    }

    if (targetApt) {
      targetApt.start_time = newDate.toISOString();
      targetApt.end_time = new Date(newDate.getTime() + targetApt.duration_minutes * 60000).toISOString();
      targetApt.status = "confirmed";
      session.step = "idle";
      db.sessions[senderPhone] = session;

      return (
        `تدلل يا ${patient?.full_name}! تم تعديل موعدك بنجاح ✅\n` +
        `📅 الموعد الجديد: ${newDate.toLocaleDateString("ar-IQ")} الساعة ${newDate.toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })}\n` +
        `🩺 الخدمة: ${targetApt.service_name}\n\n` +
        "سنرسل لك تذكيراً قبل الموعد. حياك الله دائماً!"
      );
    } else {
      session.step = "awaiting_time";
      db.sessions[senderPhone] = session;
      return "تدلل عيني! ما هو الوقت أو اليوم الجديد الذي يناسبك لتعديل الموعد إليه؟ (مثلاً: باچر الساعة 11:00 صباحاً أو 4:30 عصراً).";
    }
  }

  // Multi-Turn Flow Step Handling:

  // STEP: Awaiting Confirmation
  if (
    session.step === "awaiting_confirmation" &&
    (lower.includes("نعم") ||
      lower.includes("اي") ||
      lower.includes("أي") ||
      lower.includes("تمام") ||
      lower.includes("ماشي") ||
      lower.includes("اوكي") ||
      lower.includes("أكد") ||
      lower.includes("اكيد") ||
      lower.includes("yes") ||
      lower.includes("ok"))
  ) {
    // Finalize booking
    const finalPatient = patient || {
      id: `pat-wa-${Date.now()}`,
      patient_number: `P-${1000 + db.patients.length + 1}`,
      full_name: session.patientName || "مريض واتساب",
      phone: senderPhone,
      email: "",
      date_of_birth: "",
      gender: "male" as const,
      preferred_language: "ar" as const,
      whatsapp_consent: true,
      admin_notes: session.notes || "حجز تفاعلي من الواتساب",
      created_at: new Date().toISOString(),
    };

    if (!patient) {
      db.patients.push(finalPatient);
    }

    const srv = db.services.find((s) => s.id === session.selectedServiceId) || db.services[0];
    const aptTime = session.proposedTime ? new Date(session.proposedTime) : new Date(Date.now() + 86400000);

    const newApt: Appointment = {
      id: `apt-wa-${Date.now()}`,
      patient_id: finalPatient.id,
      patient_name: finalPatient.full_name,
      patient_phone: senderPhone,
      service_id: srv.id,
      service_name: srv.name_ar,
      start_time: aptTime.toISOString(),
      end_time: new Date(aptTime.getTime() + srv.duration_minutes * 60000).toISOString(),
      duration_minutes: srv.duration_minutes,
      status: "confirmed",
      booking_source: "whatsapp",
      notes: session.notes || "حجز تلقائي مؤكد عبر محادثة الواتساب",
    };

    db.appointments.unshift(newApt);
    session.step = "idle";
    db.sessions[senderPhone] = session;

    return (
      `تم تثبيت حجزك بنجاح في عيادة النور! ✨\n\n` +
      `👤 اسم المريض: ${finalPatient.full_name}\n` +
      `🩺 الخدمة: ${srv.name_ar}\n` +
      `📅 الموعد: ${aptTime.toLocaleDateString("ar-IQ")} الساعة ${aptTime.toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })}\n` +
      `📍 الموقع: بغداد - المنصور - شارع 14 رمضان\n` +
      `💵 التكلفة: ${srv.price.toLocaleString()} د.ع\n\n` +
      `سنرسل لك تذكيراً تلقائياً قبل الموعد. نتمنى لك دوام الصحة والعافية!`
    );
  }

  // STEP: Awaiting Patient Name
  if (session.step === "awaiting_name") {
    const cleanName = text.replace(/أني|اني|اسمي|اسم|انا|هو/g, "").trim();
    if (cleanName.length > 2) {
      session.patientName = cleanName;
      session.step = "awaiting_confirmation";
      db.sessions[senderPhone] = session;

      const srvName = session.selectedServiceName || "كشف عام واستشارة";
      const timeStr = session.proposedTime
        ? new Date(session.proposedTime).toLocaleString("ar-IQ", { dateStyle: "short", timeStyle: "short" })
        : "غداً الساعة 10:30 صباحاً";

      return (
        `أهلاً وسهلاً بك أخ ${cleanName}، تشرفنا بيك 🩺\n\n` +
        `تفاصيل الحجز المقترح:\n` +
        `• الخدمة: ${srvName}\n` +
        `• الموعد: ${timeStr}\n\n` +
        `هل يناسبك الموعد لنقوم بتأكيد الحجز فورياً؟ (اكتب: نعم أو تمام)`
      );
    }
  }

  // Natural Booking Request Detection (Symptoms or Direct Booking Request)
  const isBookingOrSymptom =
    lower.includes("حجز") ||
    lower.includes("أحجز") ||
    lower.includes("احجز") ||
    lower.includes("موعد") ||
    lower.includes("وجع") ||
    lower.includes("ألم") ||
    lower.includes("مريض") ||
    lower.includes("كشف") ||
    lower.includes("فحص") ||
    lower.includes("سونار") ||
    lower.includes("أسنان") ||
    lower.includes("اسنان") ||
    lower.includes("سن") ||
    lower.includes("book") ||
    lower.includes("appointment");

  if (isBookingOrSymptom) {
    // 1. Identify Service by symptoms / keywords
    let matchedService = db.services[0]; // Default general consultation
    if (lower.includes("سن") || lower.includes("أسنان") || lower.includes("اسنان") || lower.includes("تنظيف")) {
      matchedService = db.services.find((s) => s.id === "srv-004") || matchedService;
    } else if (lower.includes("سونار") || lower.includes("بطن") || lower.includes("تلفزيون") || lower.includes("أشعة")) {
      matchedService = db.services.find((s) => s.id === "srv-003") || matchedService;
    } else if (lower.includes("متابعة") || lower.includes("مراجعة") || lower.includes("تحليل")) {
      matchedService = db.services.find((s) => s.id === "srv-002") || matchedService;
    }

    session.selectedServiceId = matchedService.id;
    session.selectedServiceName = matchedService.name_ar;

    // 2. Identify proposed Date & Time from message
    const targetDate = new Date();
    if (lower.includes("اليوم")) {
      targetDate.setHours(targetDate.getHours() + 2, 0, 0, 0);
    } else {
      // Default to tomorrow
      targetDate.setDate(targetDate.getDate() + 1);
      if (lower.includes("عصر") || lower.includes("5") || lower.includes("مساء")) {
        targetDate.setHours(16, 30, 0, 0);
      } else if (lower.includes("ظهر") || lower.includes("12")) {
        targetDate.setHours(12, 0, 0, 0);
      } else {
        targetDate.setHours(10, 30, 0, 0);
      }
    }

    session.proposedTime = targetDate.toISOString();
    session.notes = `حجز ${matchedService.name_ar} عبر الواتساب`;

    const formattedTime = targetDate.toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" });
    const formattedDay = lower.includes("اليوم") ? "اليوم" : "غداً";

    // If patient already registered in clinic database:
    if (patient) {
      session.patientName = patient.full_name;
      session.step = "awaiting_confirmation";
      db.sessions[senderPhone] = session;

      return (
        `يا هلا بيك دكتور/أخ ${patient.full_name} في عيادة النور! سلامتك وما تشوف شر إن شاء الله 🩺\n\n` +
        `لقينا لك موعد متاح لـ (${matchedService.name_ar}):\n` +
        `📅 ${formattedDay} الساعة ${formattedTime}\n` +
        `💵 الكشفية: ${matchedService.price.toLocaleString()} د.ع\n\n` +
        `إذا يناسبك الموعد، فقط رد بـ (نعم) أو (تمام) لتأكيد الحجز فورياً!`
      );
    } else {
      // Ask for name to create their patient profile
      session.step = "awaiting_name";
      db.sessions[senderPhone] = session;

      return (
        `أهلاً وسهلاً بك في عيادة النور التخصصية! سلامتك وما تشوف شر 🩺\n\n` +
        `الخدمة المقترحة: ${matchedService.name_ar} (السعر: ${matchedService.price.toLocaleString()} د.ع)\n` +
        `التوقيت المقترح: ${formattedDay} الساعة ${formattedTime}\n\n` +
        `لطفاً، شنو الاسم الكامل لحضرتك حتى نثبت الحجز ونفتح لك ملف بالعيادة؟`
      );
    }
  }

  // Friendly Fallback with context
  session.step = "idle";
  db.sessions[senderPhone] = session;

  return (
    "أهلاً وسهلاً بك في عيادة النور الطبية التخصصية 👋\n" +
    "أنا المساعد الآلي التفاعلي للعيادة، كيف أقدر أساعدك اليوم؟\n\n" +
    "• لحجز موعد أو استشارة: اكتب ما تعاني منه أو اذكر التوقيت الذي تريده (مثلاً: أريد كشف باچر الصبح).\n" +
    "• للأسعار والخدمات: اكتب (الخدمات والأسعار).\n" +
    "• للعنوان وساعات العمل: اكتب (وين مكانكم).\n" +
    "• للتحدث مع موظف الاستقبال: اكتب (مساعدة بشرية)."
  );
}
