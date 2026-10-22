"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { MessageCircle, Send, Bot, User, CheckCheck, RefreshCw, Zap } from "lucide-react";

export default function WhatsAppPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<any[]>([
    {
      id: "msg-001",
      direction: "inbound",
      sender_phone: "+9647711112222",
      content: "مرحبا دكتور، أريد أحجز موعد كشف باچر",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "msg-002",
      direction: "outbound",
      sender_phone: "+9647700000001",
      content:
        "أهلاً بك في عيادة النور التخصصية! تم تأكيد حجزك بنجاح غداً الساعة 10:00 صباحاً. الخدمة: كشف عام واستشارة. ننتظر تشريفك!",
      created_at: new Date(Date.now() - 3600000 + 5000).toISOString(),
    },
  ]);
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
      // Dispatch to real Webhook Route Handler
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: patientPhone,
          text: userText,
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("navWhatsApp")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              منصة محادثات الواتساب الرسمية ومحاكي الحجز التلقائي الذكي
            </p>
          </div>
          <Badge variant="warning" className="w-fit gap-1.5 py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>نمط محاكاة التطوير نشط (Development Mock Provider)</span>
          </Badge>
        </div>

        {/* Integration Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                حالة الاتصال بـ Meta Cloud API
              </CardTitle>
              <Zap className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-emerald-600">جاهز ومفعل (Mock)</div>
              <p className="text-xs text-muted-foreground mt-1">
                الويب هوك يستقبل الرسائل ويتحقق من التوقيع
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المساعد الذكي (Bot Engine)
              </CardTitle>
              <Bot className="w-4 h-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">قواعد + فحص التوفر الفوري</div>
              <p className="text-xs text-muted-foreground mt-1">
                يدعم اللهجة العراقية والعربية الفصحى
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                رقم العيادة المعتمد
              </CardTitle>
              <MessageCircle className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold font-mono" dir="ltr">
                +964 770 000 0001
              </div>
              <p className="text-xs text-muted-foreground mt-1">Al-Noor Clinic Official</p>
            </CardContent>
          </Card>
        </div>

        {/* Live WhatsApp Simulator Console */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="border-b bg-emerald-950/10 py-3 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  محاكي رسائل الواتساب التفاعلي
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  جرب إرسال رسائل مريض حقيقية للتحقق من الرد الآلي وتثبيت الحجز في قاعدة البيانات
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">رقم هاتف المريض:</span>
              <Input
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-40 h-8 font-mono text-xs"
                dir="ltr"
              />
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Quick Test Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">رسائل سريعة للاختبار:</span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSendPrompt("أريد أحجز موعد باچر")}
              >
                أريد أحجز موعد باچر
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSendPrompt("شنو الخدمات المتوفرة وكم سعرها؟")}
              >
                شنو الخدمات المتوفرة؟
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSendPrompt("أريد ألغي موعدي")}
              >
                أريد ألغي موعدي
              </Button>
            </div>

            {/* Chat Messages Feed */}
            <div className="h-80 overflow-y-auto rounded-xl bg-secondary/30 p-4 space-y-3 border flex flex-col">
              {messages.map((msg) => {
                const isInbound = msg.direction === "inbound";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      isInbound ? "self-start items-start" : "self-end items-end"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                      {isInbound ? (
                        <>
                          <User className="w-3 h-3" />
                          <span>المريض ({msg.sender_phone})</span>
                        </>
                      ) : (
                        <>
                          <span>عيادة النور (المساعد الآلي)</span>
                          <Bot className="w-3 h-3 text-emerald-600" />
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
                      <span>{new Date(msg.created_at).toLocaleTimeString("ar-IQ", { timeStyle: "short" })}</span>
                      {!isInbound && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="اكتب رسالة من المريض (مثال: أريد أحجز موعد كشف أو استفسر عن الأسعار)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700">
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
