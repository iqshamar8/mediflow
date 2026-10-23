import { describe, it, expect, beforeEach } from "vitest";
import { processConversationalMessage } from "../src/server/whatsapp-bot";
import { db } from "../src/server/mock-db";

describe("WhatsApp Intelligent Bot & Iraqi Dialect Comprehension", () => {
  const testPhone = "+9647755554444";

  beforeEach(() => {
    if (!db.sessions) db.sessions = {};
    delete db.sessions[testPhone];
  });

  it("should answer location and directions questions accurately", async () => {
    const reply = await processConversationalMessage(testPhone, "وين مكان العيادة بالضبط؟");
    expect(reply).toContain("المنصور");
    expect(reply).toContain("شارع 14 رمضان");
  });

  it("should provide service pricing on inquiry", async () => {
    const reply = await processConversationalMessage(testPhone, "كم سعر الكشف والسونار؟");
    expect(reply).toContain("كشف عام واستشارة");
    expect(reply).toContain("فحص موجات فوق صوتية");
    expect(reply).toContain("د.ع");
  });

  it("should recommend dental service when patient complains of toothache", async () => {
    const reply = await processConversationalMessage(testPhone, "سلام عليكم، أسناني توجعني كلش ومحتاج فحص باچر");
    expect(reply).toContain("تنظيف أسنان");
    expect(reply).toContain("غداً");
  });

  it("should transfer to human agent when requested", async () => {
    const reply = await processConversationalMessage(testPhone, "أريد أحجي وية موظف الاستقبال أو سكرتيرة");
    expect(reply).toContain("موظف الاستقبال");
    expect(reply).toContain("07700000001");
  });
});
