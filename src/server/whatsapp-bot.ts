import { db, Patient, Appointment, WhatsAppMessage, ConversationSession } from "@/server/mock-db";

/**
 * Intelligent WhatsApp Conversational Bot for MediFlow Clinics
 * Understands Iraqi Arabic, Modern Standard Arabic, and English.
 * Maintains multi-turn conversation state per sender phone and isolates by clinic.
 */

export async function processConversationalMessage(
  senderPhone: string,
  messageText: string,
  clinicId?: string
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

  const activeClinicId = clinicId || session.clinic_id || "clinic-1";
  session.clinic_id = activeClinicId;

  const currentClinic = db.clinics?.find((c) => c.id === activeClinicId) || db.clinics?.[0] || {
    name: "عيادة د. أحمد الراوي التخصصية",
    doctor_name: "د. أحمد الراوي",
    phone: "+9647711110000",
    address: "بغداد - الحارثية - مجمع الكندي الطبي",
  };

  // 2. Identify or lookup existing patient in this specific clinic
  let patient = db.patients.find(
    (p) =>
      (p.clinic_id === activeClinicId || (!p.clinic_id && activeClinicId === "clinic-1")) &&
      p.phone.replace(/\D/g, "").includes(senderPhone.replace(/\D/g, "").slice(-8))
  );

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
      `تم تحويل محادثتك لموظف الاستقبال في ${currentClinic.name}، وسيقوم بالرد عليك مباشرة خلال لحظات.\n` +
      `يمكنك أيضاً الاتصال بنا مباشرة على هاتف العيادة: ${currentClinic.phone}.`
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
      `أهلاً وسهلاً بك في ${currentClinic.name} 📍\n` +
      `العنوان: ${currentClinic.address}.\n` +
      "أوقات الدوام: من الأحد إلى الخميس (9:00 صباحاً - 6:00 مساءً)، والسبت (10:00 صباحاً - 3:00 مساءً).\n\n" +
      "تحب تحجز موعد لكشف أو استشارة طبية؟"
    );
  }

  // Check if asking about doctors or availability
  if (
    lower.includes("دكتور") ||
    lower.includes("دكتورة") ||
    lower.includes("اطباء") ||
    lower.includes("أطباء") ||
    lower.includes("طبيب") ||
    lower.includes("doctor")
  ) {
    return (
      `حياك الله عيني 👋\n` +
      `الطبيب المشرف في ${currentClinic.name}:\n` +
      `• ${currentClinic.doctor_name} (${(currentClinic as any).specialty || "استشاري"})\n` +
      `أوقات الاستقبال: يومياً من 10:00 صباحاً إلى 5:00 مساءً.\n\n` +
      `تحب نحجز لك موعد كشف أو استشارة؟`
    );
  }

  // Check if asking about services and prices
  if (
    (lower.includes("خدمات") || lower.includes("سعر") || lower.includes("اسعار") || lower.includes("بيش") || lower.includes("تكلفة") || lower.includes("price")) &&
    session.step !== "awaiting_confirmation"
  ) {
    const clinicServices = db.services.filter(
      (s) => s.is_active && (s.clinic_id === activeClinicId || (!s.clinic_id && activeClinicId === "clinic-1"))
    );
    const servicesToShow = clinicServices.length > 0 ? clinicServices : db.services.filter((s) => s.is_active);

    const list = servicesToShow
      .map((s) => `• ${s.name_ar}: ${s.price.toLocaleString()} د.ع (${s.duration_minutes} دقيقة)`)
      .join("\n");

    return (
      `أهلاً بك عيني! قائمة الخدمات والأسعار المعتمدة بالعيادة:\n\n` +
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
      const activeApt = db.appointments.find(
        (a) =>
          a.patient_id === patient?.id &&
          (a.clinic_id === activeClinicId || (!a.clinic_id && activeClinicId === "clinic-1")) &&
          a.status === "confirmed"
      );
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
    return "تم استلام طلب الإلغاء. لم نعثر على حجز مؤكد مرتبط بهذا الرقم في هذه العيادة. إذا كنت مسجلاً باسم آخر، اذكر اسمك وسنقوم بمساعدتك فوراً.";
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
      ? db.appointments.find(
          (a) =>
            a.patient_id === patient?.id &&
            (a.clinic_id === activeClinicId || (!a.clinic_id && activeClinicId === "clinic-1")) &&
            a.status !== "cancelled"
        )
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
      clinic_id: activeClinicId,
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

    const srv =
      db.services.find(
        (s) =>
          s.id === session.selectedServiceId &&
          (s.clinic_id === activeClinicId || (!s.clinic_id && activeClinicId === "clinic-1"))
      ) ||
      db.services.find((s) => s.clinic_id === activeClinicId) ||
      db.services[0];

    const aptTime = session.proposedTime ? new Date(session.proposedTime) : new Date(Date.now() + 86400000);

    const newApt: Appointment = {
      id: `apt-wa-${Date.now()}`,
      clinic_id: activeClinicId,
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
      `تم تثبيت حجزك بنجاح في ${currentClinic.name}! ✨\n\n` +
      `👤 اسم المريض: ${finalPatient.full_name}\n` +
      `🩺 الخدمة: ${srv.name_ar}\n` +
      `📅 الموعد: ${aptTime.toLocaleDateString("ar-IQ")} الساعة ${aptTime.toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })}\n` +
      `📍 الموقع: ${currentClinic.address}\n` +
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
    const availableServices = db.services.filter(
      (s) => s.is_active && (s.clinic_id === activeClinicId || (!s.clinic_id && activeClinicId === "clinic-1"))
    );
    const pool = availableServices.length > 0 ? availableServices : db.services;

    let matchedService = pool[0]; // Default consultation
    if (lower.includes("سن") || lower.includes("أسنان") || lower.includes("اسنان") || lower.includes("تنظيف")) {
      matchedService =
        pool.find((s) => s.name_ar.includes("أسنان") || s.id === "srv-201" || s.id === "srv-004") ||
        db.services.find((s) => s.name_ar.includes("أسنان")) ||
        matchedService;
    } else if (lower.includes("سونار") || lower.includes("بطن") || lower.includes("تلفزيون") || lower.includes("أشعة")) {
      matchedService =
        pool.find((s) => s.name_ar.includes("سونار") || s.name_ar.includes("موجات") || s.id === "srv-003" || s.id === "srv-101") ||
        matchedService;
    } else if (lower.includes("متابعة") || lower.includes("مراجعة") || lower.includes("تحليل")) {
      matchedService = pool.find((s) => s.name_ar.includes("متابعة") || s.id === "srv-002") || matchedService;
    }

    session.selectedServiceId = matchedService.id;
    session.selectedServiceName = matchedService.name_ar;

    // 2. Identify proposed Date & Time from message
    const targetDate = new Date();
    if (lower.includes("عقبه") || lower.includes("بعد غد")) {
      targetDate.setDate(targetDate.getDate() + 2);
    } else {
      // Default to tomorrow (باچر)
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Time detection
    if (lower.includes("عصر") || lower.includes("مساء") || lower.includes("4") || lower.includes("أربعة")) {
      targetDate.setHours(16, 30, 0, 0);
    } else if (lower.includes("ظهر") || lower.includes("12") || lower.includes("اثنعش")) {
      targetDate.setHours(12, 0, 0, 0);
    } else {
      targetDate.setHours(10, 30, 0, 0); // Default morning
    }

    session.proposedTime = targetDate.toISOString();
    session.notes = `طلب حجز ذكي عبر الواتساب: "${text}"`;

    if (patient) {
      // Patient already known, go directly to confirmation
      session.patientName = patient.full_name;
      session.step = "awaiting_confirmation";
      db.sessions[senderPhone] = session;

      return (
        `أهلاً وسهلاً بك يا ${patient.full_name}! سلامتك وما تشوف شر 🩺\n\n` +
        `الخدمة المقترحة: ${matchedService.name_ar} (السعر: ${matchedService.price.toLocaleString()} د.ع)\n` +
        `التوقيت المقترح: ${lower.includes("عقبه") ? "بعد غد" : "غداً"} الساعة ${targetDate.toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })}\n\n` +
        `هل يناسبك هذا التوقيت لتأكيد الحجز؟ (أجب: نعم لتثبيت الحجز)`
      );
    } else {
      // New patient, request their name
      session.step = "awaiting_name";
      db.sessions[senderPhone] = session;

      return (
        `أهلاً وسهلاً بك في ${currentClinic.name}! سلامتك وما تشوف شر 🩺\n\n` +
        `الخدمة المقترحة: ${matchedService.name_ar} (السعر: ${matchedService.price.toLocaleString()} د.ع)\n` +
        `التوقيت المقترح: ${lower.includes("عقبه") ? "بعد غد" : "غداً"} الساعة ${targetDate.toLocaleTimeString("ar-IQ", { hour: "numeric", minute: "2-digit" })}\n\n` +
        `لطفاً، شنو الاسم الكامل لحضرتك حتى نثبت الحجز ونفتح لك ملف بالعيادة؟`
      );
    }
  }

  // Greeting / General Fallback
  return (
    `أهلاً وسهلاً بك في ${currentClinic.name} 👋\n` +
    `أنا المساعد الذكي الخاص بالطبيب (${currentClinic.doctor_name}).\n\n` +
    `كيف أستطيع مساعدتك اليوم؟ يمكنك:\n` +
    `• حجز موعد جديد (مثال: أريد أحجز كشف باچر الساعة 10 الصبح)\n` +
    `• الاستفسار عن الخدمات والأسعار\n` +
    `• معرفة عنوان العيادة وأوقات الدوام\n` +
    `• تعديل أو إلغاء موعدك السابق`
  );
}
