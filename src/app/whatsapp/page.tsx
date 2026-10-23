"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  CheckCheck,
  RefreshCw,
  Zap,
  Sparkles,
  PhoneCall,
  Clock,
  MapPin,
  Stethoscope,
} from "lucide-react";

import { useClinic } from "@/lib/clinic/context";

export default function WhatsAppPage() {
  const { t } = useI18n();
  const { currentClinic } = useClinic();
  const [messages, setMessages] = useState<any[]>([]);

  // Update initial message when clinic changes
  React.useEffect(() => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        direction: "outbound",
        sender_phone: currentClinic?.phone || "+9647700000001",
        content: `أهلاً وسهلاً بك في ${currentClinic?.name || "العيادة الطبية"}! 👋\nأنا المساعد الآلي الذكي الخاص بالطبيب (${currentClinic?.doctor_name || "الطبيب المشرف"}).\nكيف أقدر أساعدك اليوم؟ تقدر تكتب لي استفسارك أو أعراضك (مثلاً: أريد أحجز كشف باچر، كم سعر الخدمات، أو وين مكانكم).`,
        created_at: new Date().toISOString(),
      },
    ]);
  }, [currentClinic?.id, currentClinic?.name, currentClinic?.doctor_name, currentClinic?.phone]);

  const [inputMessage, setInputMessage] = useState("");
  const [patientPhone, setPatientPhone] = useState("+9647711112222");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;
    setInputMessage("");

    // Add immediate user message to UI
    const tempInbound = {
      id: `local-in-${Date.now()}`,
      direction: "inbound",
      sender_phone: patientPhone,
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempInbound]);
    setIsLoading(true);

    try {
      // Dispatch to real Webhook Route Handler for this active clinic
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentClinic?.id ? { "x-clinic-id": currentClinic.id } : {}),
        },
        body: JSON.stringify({
          sender: patientPhone,
          text: userText,
          clinic_id: currentClinic?.id,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-out-${Date.now()}`,
            direction: "outbound",
            sender_phone: "+9647700000001",
            content: data.reply,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  }

  function handleSendPrompt(promptText: string) {
    setInputMessage(promptText);
  }

  function handleClearChat() {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        direction: "outbound",
        sender_phone: "+9647700000001",
        content:
          "أهلاً وسهلاً بك في عيادة النور التخصصية! 👋 كيف أقدر أساعدك اليوم؟",
        created_at: new Date().toISOString(),
      },
    ]);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{t("navWhatsApp")}</h1>
              <Badge variant="success" className="gap-1 text-xs">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>مساعد تفاعلي ذكي</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              مساعد محادثة ذكي يفهم اللهجة العراقية والطلبات الطبيعية ويتفاعل مباشرة مع المواعيد
            </p>
          </div>
          <Badge variant="warning" className="w-fit gap-1.5 py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>نمط التطوير التفاعلي نشط (Interactive Mode)</span>
          </Badge>
        </div>

        {/* Integration Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                محرك فهم اللغة (NLP Engine)
              </CardTitle>
              <Bot className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold text-foreground">
                تفاعلي متعدد الأدوار (Multi-turn)
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                يفهم الأعراض، التوقيت، الأسعار، والإلغاء
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                حالة الربط بقاعدة البيانات
              </CardTitle>
              <Zap className="w-4 h-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold text-teal-600">
                مزامنة فورية (Live Sync)
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                يثبت ويعدل المواعيد في جدول العيادة مباشرة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                رقم الواتساب الرسمي
              </CardTitle>
              <MessageCircle className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold font-mono" dir="ltr">
                {currentClinic?.phone || "+964 770 000 0001"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{currentClinic?.name || "عيادة د. أحمد الراوي"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Live WhatsApp Simulator Console */}
        <Card className="border-primary/20 shadow-xl overflow-hidden">
          <CardHeader className="border-b bg-emerald-950/10 py-3 px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>محاكي محادثات الواتساب — {currentClinic?.name || "العيادة"}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  المساعد الآلي للطبيب ({currentClinic?.doctor_name || "الطبيب المشرف"}) — يفهم اللهجة العراقية ويحجز المواعيد تلقائياً في عيادتك فقط
                </p>
              </div>
            </div>

            {/* Patient Phone and Preset Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground shrink-0">رقم المريض:</span>
              <Input
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-36 h-8 font-mono text-xs"
                dir="ltr"
              />
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] h-8"
                onClick={() =>
                  setPatientPhone(
                    patientPhone === "+9647711112222" ? "+9647788889999" : "+9647711112222"
                  )
                }
              >
                {patientPhone === "+9647711112222" ? "تبديل لمريض جديد" : "تبديل لمريض مسجل"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
                title="إعادة ضبط المحادثة"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Quick Interactive Prompt Chips */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground block">
                جرّب إرسال طلبات حقيقية من المرضى:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:border-primary"
                  onClick={() => handleSendPrompt("سلام عليكم دكتور، أسناني دتوجعني ومحتاج كشف باچر العصر")}
                >
                  أسناني توجعني ومحتاج كشف باچر العصر
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:border-primary"
                  onClick={() => handleSendPrompt("وين مكان العيادة بالضبط وشوكت تفتحون؟")}
                >
                  وين مكان العيادة وشوكت تفتحون؟
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:border-primary"
                  onClick={() => handleSendPrompt("دكتور أحمد الراوي موجود باچر؟")}
                >
                  دكتور أحمد الراوي موجود؟
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:border-primary"
                  onClick={() => handleSendPrompt("كم سعر السونار أو الكشف؟")}
                >
                  كم سعر السونار؟
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:border-primary"
                  onClick={() => handleSendPrompt("أريد أقدم موعدي للـ 11 الصبح")}
                >
                  أريد أقدم موعدي للـ 11
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:border-primary"
                  onClick={() => handleSendPrompt("أريد ألغي الموعد")}
                >
                  أريد ألغي الموعد
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 hover:border-primary"
                  onClick={() => handleSendPrompt("أريد أحجي وية موظف الاستقبال")}
                >
                  تحويل لموظف بشري
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 text-emerald-700 dark:text-emerald-400 border-emerald-600/30 hover:bg-emerald-500/10"
                  onClick={() => handleSendPrompt("نعم تمام أكد الحجز")}
                >
                  نعم تمام أكد الحجز ✅
                </Button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="h-96 overflow-y-auto rounded-2xl bg-secondary/30 p-4 space-y-3 border flex flex-col">
              {messages.map((msg) => {
                const isInbound = msg.direction === "inbound";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isInbound ? "self-start items-start" : "self-end items-end"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                      {isInbound ? (
                        <>
                          <User className="w-3 h-3 text-primary" />
                          <span>المريض ({msg.sender_phone})</span>
                        </>
                      ) : (
                        <>
                          <span>المساعد الذكي (عيادة النور)</span>
                          <Bot className="w-3.5 h-3.5 text-emerald-600" />
                        </>
                      )}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                        isInbound
                          ? "bg-card text-foreground rounded-ts-none border"
                          : "bg-emerald-600 text-white rounded-te-none"
                      }`}
                    >
                      {msg.content}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString("ar-IQ", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {!isInbound && <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="اكتب رسالة من المريض (مثلاً: أسناني توجعني، كم الكشف، أريد موعد باچر)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="h-10"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700 h-10 px-5"
              >
                <Send className="w-4 h-4" />
                <span>إرسال</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
